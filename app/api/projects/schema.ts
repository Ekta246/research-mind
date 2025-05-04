import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable()
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const projectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string()
})

export type ProjectResponse = z.infer<typeof projectResponseSchema> 