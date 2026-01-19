import { z } from "zod";

export const questionSchema = z.object({
  type: z.enum(["short_answer", "multiple_choice", "multi_select"]),
  question: z.string(),
  options: z.array(z.string()).optional(),
});

export type Question = z.infer<typeof questionSchema>;
