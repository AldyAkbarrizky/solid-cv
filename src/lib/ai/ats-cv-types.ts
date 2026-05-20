import { z } from "zod";

const optionalString = z
  .string()
  .nullish()
  .transform((value) => value ?? "");

export const ATSCVResultSchema = z.object({
  candidateName: z.string().min(1),
  contact: z
    .object({
      email: optionalString,
      phone: optionalString,
      location: optionalString,
      links: z.array(z.string()).default([]),
    })
    .default({ email: "", phone: "", location: "", links: [] }),
  headline: optionalString,
  summary: z.string().min(1),
  skills: z
    .array(
      z.object({
        category: z.string().min(1),
        items: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  experiences: z
    .array(
      z.object({
        title: z.string().min(1),
        company: optionalString,
        location: optionalString,
        period: optionalString,
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().min(1),
        description: optionalString,
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        institution: z.string().min(1),
        degree: optionalString,
        period: optionalString,
        details: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  certifications: z.array(z.string()).default([]),
  additionalSections: z
    .array(
      z.object({
        title: z.string().min(1),
        items: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  dataUseChecklist: z.array(z.string()).default([]),
});

export type ATSCVResult = z.infer<typeof ATSCVResultSchema>;
