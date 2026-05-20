import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { captureWarning } from "@/lib/observability";
import {
  buildCVReviewSystemPrompt,
  buildCVReviewUserPrompt,
} from "./prompts/cv-review-prompt";
import {
  buildATSCVSystemPrompt,
  buildATSCVUserPrompt,
} from "./prompts/ats-cv-prompt";
import { CVReviewResult, CVReviewResultSchema } from "./cv-review-types";
import { ATSCVResult, ATSCVResultSchema } from "./ats-cv-types";

type AIProvider = "groq";

type GenerateCVReviewParams = {
  cvText: string;
  targetRole: string;
  jobRequirement?: string;
  notes?: string;
};

type GenerateCVReviewResponse = {
  provider: AIProvider;
  model: string;
  result: CVReviewResult;
  inputTokens?: number;
  outputTokens?: number;
};

type GenerateATSCVParams = {
  cvText: string;
  targetRole: string;
  jobRequirement?: string;
  reviewResult: CVReviewResult;
};

type GenerateATSCVResponse = {
  provider: AIProvider;
  model: string;
  result: ATSCVResult;
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
  const directObject = tryParseJsonObject(candidate);

  if (directObject) {
    return directObject;
  }

  const extracted = extractFirstJsonObject(candidate);
  if (!extracted) {
    throw new AIResponseFormatError("AI tidak mengembalikan objek JSON.");
  }

  const parsed = tryParseJsonObject(extracted);
  if (parsed) {
    return parsed;
  }

  throw new AIResponseFormatError("JSON dari AI tidak valid.");
}

function tryParseJsonObject(text: string) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function extractFirstJsonObject(input: string) {
  const start = input.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return input.slice(start, i + 1);
      }
    }
  }

  return null;
}

function validateAIResult(content: string): CVReviewResult {
  const parsedJson = parseJSONFromAI(content);
  const validated = CVReviewResultSchema.safeParse(parsedJson);

  if (!validated.success) {
    captureWarning("CV_AI_SCHEMA_MISMATCH", {
      issues: validated.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
      rawContentSnippet: content.slice(0, 500),
    });
    throw new AIResponseFormatError(
      "Struktur JSON dari AI tidak sesuai schema.",
    );
  }

  return validated.data;
}

function validateATSCVResult(content: string): ATSCVResult {
  const parsedJson = parseJSONFromAI(content);
  const validated = ATSCVResultSchema.safeParse(parsedJson);

  if (!validated.success) {
    captureWarning("CV_ATS_AI_SCHEMA_MISMATCH", {
      issues: validated.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
      rawContentSnippet: content.slice(0, 500),
    });
    throw new AIResponseFormatError(
      "Struktur JSON ATS CV dari AI tidak sesuai schema.",
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
  forceJsonObject = false,
  maxTokens = 4096,
}: {
  client: OpenAI;
  model: string;
  messages: ChatCompletionMessageParam[];
  forceJsonObject?: boolean;
  maxTokens?: number;
}): Promise<AICompletionResult> {
  const basePayload = {
    model,
    temperature: 0.2,
    max_tokens: maxTokens,
    messages,
  };

  const completion = forceJsonObject
    ? await requestWithJsonModeFallback(client, basePayload)
    : await client.chat.completions.create(basePayload);

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

async function requestWithJsonModeFallback(
  client: OpenAI,
  payload: {
    model: string;
    temperature: number;
    max_tokens: number;
    messages: ChatCompletionMessageParam[];
  },
) {
  try {
    return await client.chat.completions.create({
      ...payload,
      response_format: { type: "json_object" },
    });
  } catch {
    return client.chat.completions.create(payload);
  }
}

async function repairJsonOutput({
  client,
  model,
  invalidOutput,
}: {
  client: OpenAI;
  model: string;
  invalidOutput: string;
}) {
  const repairMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
Anda adalah alat perapih JSON.
Tugas Anda:
- Terima teks output model yang JSON-nya rusak.
- Perbaiki agar menjadi SATU objek JSON valid.
- Jangan menambah komentar atau markdown.
- Jangan menambah narasi sebelum/sesudah JSON.
`.trim(),
    },
    {
      role: "user",
      content: `
Perbaiki output berikut agar valid JSON object:

${invalidOutput}
`.trim(),
    },
  ];

  return requestAICompletion({
    client,
    model,
    messages: repairMessages,
    forceJsonObject: true,
    maxTokens: 6144,
  });
}

export async function generateCVReview(
  params: GenerateCVReviewParams,
): Promise<GenerateCVReviewResponse> {
  const { provider, model, client } = createGroqClient();

  let firstInputTokens = 0;
  let firstOutputTokens = 0;

  try {
    const firstAttempt = await requestAICompletion({
      client,
      model,
      messages: buildInitialMessages(params),
    });

    firstInputTokens = firstAttempt.inputTokens || 0;
    firstOutputTokens = firstAttempt.outputTokens || 0;

    const result = validateAIResult(firstAttempt.content);

    return {
      provider,
      model,
      result,
      inputTokens: firstInputTokens,
      outputTokens: firstOutputTokens,
    };
  } catch (error) {
    if (!(error instanceof AIResponseFormatError)) {
      throw error;
    }
    captureWarning("CV_AI_FIRST_ATTEMPT_FAILED", { message: error.message });
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
    inputTokens: firstInputTokens + (retryAttempt.inputTokens || 0),
    outputTokens: firstOutputTokens + (retryAttempt.outputTokens || 0),
  };
}

export async function generateATSCV(
  params: GenerateATSCVParams,
): Promise<GenerateATSCVResponse> {
  const { provider, model, client } = createGroqClient();

  let firstInputTokens = 0;
  let firstOutputTokens = 0;

  const initialMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildATSCVSystemPrompt(),
    },
    {
      role: "user",
      content: buildATSCVUserPrompt(params),
    },
  ];

  const retryMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
${buildATSCVSystemPrompt()}

Instruksi tambahan untuk retry:
- Output sebelumnya gagal diproses oleh sistem.
- Kembalikan hanya JSON object valid.
- Jangan gunakan markdown code block.
- Jangan menambahkan narasi di luar JSON.
`.trim(),
    },
    {
      role: "user",
      content: buildATSCVUserPrompt(params),
    },
  ];

  try {
    const firstAttempt = await requestAICompletion({
      client,
      model,
      messages: initialMessages,
    });

    firstInputTokens = firstAttempt.inputTokens || 0;
    firstOutputTokens = firstAttempt.outputTokens || 0;

    const result = validateATSCVResult(firstAttempt.content);

    return {
      provider,
      model,
      result,
      inputTokens: firstInputTokens,
      outputTokens: firstOutputTokens,
    };
  } catch (error) {
    if (!(error instanceof AIResponseFormatError)) {
      throw error;
    }
  }

  const retryAttempt = await requestAICompletion({
    client,
    model,
    messages: retryMessages,
    forceJsonObject: true,
    maxTokens: 6144,
  });

  try {
    const retryResult = validateATSCVResult(retryAttempt.content);

    return {
      provider,
      model,
      result: retryResult,
      inputTokens: firstInputTokens + (retryAttempt.inputTokens || 0),
      outputTokens: firstOutputTokens + (retryAttempt.outputTokens || 0),
    };
  } catch (error) {
    if (!(error instanceof AIResponseFormatError)) {
      throw error;
    }

    captureWarning("CV_ATS_AI_RETRY_INVALID_JSON", {
      message: error.message,
    });
  }

  const repairedAttempt = await repairJsonOutput({
    client,
    model,
    invalidOutput: retryAttempt.content.slice(0, 24_000),
  });
  const repairedResult = validateATSCVResult(repairedAttempt.content);

  return {
    provider,
    model,
    result: repairedResult,
    inputTokens:
      firstInputTokens +
      (retryAttempt.inputTokens || 0) +
      (repairedAttempt.inputTokens || 0),
    outputTokens:
      firstOutputTokens +
      (retryAttempt.outputTokens || 0) +
      (repairedAttempt.outputTokens || 0),
  };
}
