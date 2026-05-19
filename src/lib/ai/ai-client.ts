import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import {
  buildCVReviewSystemPrompt,
  buildCVReviewUserPrompt,
} from "./prompts/cv-review-prompt";
import { CVReviewResult, CVReviewResultSchema } from "./cv-review-types";

type AIProvider = "groq";

type GenerateCVReviewParams = {
  cvText: string;
  targetRole: string;
  notes?: string;
};

type GenerateCVReviewResponse = {
  provider: AIProvider;
  model: string;
  result: CVReviewResult;
  inputTokens?: number;
  outputTokens?: number;
};

type AICompletionResult = {
  content: string;
  inputTokens?: number;
  outputTokens?: number;
};

class AIResponseFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIResponseFormatError";
  }
}

function createGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY belum diisi.");
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  });

  return {
    provider: "groq" as const,
    model,
    client,
  };
}

function parseJSONFromAI(content: string) {
  const trimmed = content.trim();

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() || trimmed;

  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new AIResponseFormatError("AI tidak mengembalikan objek JSON.");
  }

  const jsonText = candidate.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonText);
  } catch {
    throw new AIResponseFormatError("JSON dari AI tidak valid.");
  }
}

function validateAIResult(content: string): CVReviewResult {
  const parsedJson = parseJSONFromAI(content);
  const validated = CVReviewResultSchema.safeParse(parsedJson);

  if (!validated.success) {
    throw new AIResponseFormatError(
      "Struktur JSON dari AI tidak sesuai schema.",
    );
  }

  return validated.data;
}

function buildInitialMessages(
  params: GenerateCVReviewParams,
): ChatCompletionMessageParam[] {
  return [
    {
      role: "system",
      content: buildCVReviewSystemPrompt(),
    },
    {
      role: "user",
      content: buildCVReviewUserPrompt(params),
    },
  ];
}

function buildRetryMessages(
  params: GenerateCVReviewParams,
): ChatCompletionMessageParam[] {
  return [
    {
      role: "system",
      content: `
${buildCVReviewSystemPrompt()}

Instruksi tambahan untuk retry:
- Output sebelumnya gagal diproses oleh sistem.
- Kembalikan hanya JSON object valid.
- Jangan gunakan markdown.
- Jangan tambahkan penjelasan sebelum atau sesudah JSON.
- Pastikan semua key wajib ada.
- Pastikan semua score berupa number 0 sampai 100.
- Pastikan array berisi item string terpisah, bukan satu string panjang bernomor.
`.trim(),
    },
    {
      role: "user",
      content: buildCVReviewUserPrompt(params),
    },
  ];
}

async function requestAICompletion({
  client,
  model,
  messages,
}: {
  client: OpenAI;
  model: string;
  messages: ChatCompletionMessageParam[];
}): Promise<AICompletionResult> {
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new AIResponseFormatError("AI tidak mengembalikan content.");
  }

  return {
    content,
    inputTokens: completion.usage?.prompt_tokens,
    outputTokens: completion.usage?.completion_tokens,
  };
}

export async function generateCVReview(
  params: GenerateCVReviewParams,
): Promise<GenerateCVReviewResponse> {
  const { provider, model, client } = createGroqClient();

  const firstAttempt = await requestAICompletion({
    client,
    model,
    messages: buildInitialMessages(params),
  });

  try {
    const result = validateAIResult(firstAttempt.content);

    return {
      provider,
      model,
      result,
      inputTokens: firstAttempt.inputTokens,
      outputTokens: firstAttempt.outputTokens,
    };
  } catch (error) {
    if (!(error instanceof AIResponseFormatError)) {
      throw error;
    }
  }

  const retryAttempt = await requestAICompletion({
    client,
    model,
    messages: buildRetryMessages(params),
  });

  const retryResult = validateAIResult(retryAttempt.content);

  return {
    provider,
    model,
    result: retryResult,
    inputTokens:
      (firstAttempt.inputTokens || 0) + (retryAttempt.inputTokens || 0),
    outputTokens:
      (firstAttempt.outputTokens || 0) + (retryAttempt.outputTokens || 0),
  };
}
