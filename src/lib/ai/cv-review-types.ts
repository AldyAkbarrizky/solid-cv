import { z } from "zod";

export const CVReviewResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  sectionScores: z.object({
    structure: z.number().min(0).max(100),
    clarity: z.number().min(0).max(100),
    roleRelevance: z.number().min(0).max(100),
    atsReadability: z.number().min(0).max(100),
    achievementImpact: z.number().min(0).max(100),
  }),
  recommendations: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      title: z.string().min(1),
      explanation: z.string().min(1),
      exampleRewrite: z.string().optional(),
    }),
  ),
  missingKeywords: z.array(z.string()).default([]),
  redFlags: z.array(z.string()).default([]),
  nextActions: z.array(z.string()).default([]),
});

export type CVReviewResult = z.infer<typeof CVReviewResultSchema>;
