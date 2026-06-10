import { z } from 'zod'

export const FinanceEntryCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(300).optional().nullable(),
  itemName: z.string().max(80).optional().nullable(),
  amount: z.coerce.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  type: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
  date: z.string().min(1, 'Date is required'),
  userId: z.string().optional(), // admin only
})

export const FinanceEntryUpdateSchema = FinanceEntryCreateSchema.partial()

export type FinanceEntryCreate = z.infer<typeof FinanceEntryCreateSchema>
export type FinanceEntryUpdate = z.infer<typeof FinanceEntryUpdateSchema>
