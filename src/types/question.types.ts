import { z } from "zod"

export const questionSchema = z.object({
  intention: z.enum(["need", "provide"]).optional(),
  type: z.enum(["short_answer", "multiple_choice", "multi_select"]),
  question: z.string(),
  options: z.array(z.string()).optional(),
  optional: z.boolean().optional(),
})

export type Question = z.infer<typeof questionSchema>

export type QnaType = { question: Question; answer: string[] }[]
