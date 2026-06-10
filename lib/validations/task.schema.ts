import { z } from 'zod'

export const TaskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Max 120 characters'),
  description: z.string().max(500).optional(),
  dueDate: z.string().optional().nullable(),
  dueTime: z.string().optional().nullable(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  tags: z.array(z.string()).default([]),
  userId: z.string().optional(), // admin can set
})

export const TaskUpdateSchema = TaskCreateSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  completedAt: z.string().optional().nullable(),
})

export type TaskCreate = z.infer<typeof TaskCreateSchema>
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>
