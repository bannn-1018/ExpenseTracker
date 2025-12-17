import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z
    .number({
      required_error: 'Số tiền là bắt buộc',
      invalid_type_error: 'Số tiền phải là số',
    })
    .positive('Số tiền phải lớn hơn 0')
    .max(10000000000, 'Số tiền không được vượt quá 10 tỷ'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Loại giao dịch là bắt buộc',
  }),
  categoryId: z
    .number({
      required_error: 'Danh mục là bắt buộc',
      invalid_type_error: 'Danh mục không hợp lệ',
    })
    .positive('Danh mục không hợp lệ'),
  date: z
    .string({
      required_error: 'Ngày là bắt buộc',
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)'),
  name: z
    .string({
      required_error: 'Tên giao dịch là bắt buộc',
    })
    .min(1, 'Tên giao dịch không được để trống')
    .max(255, 'Tên giao dịch không được vượt quá 255 ký tự'),
  note: z
    .string()
    .max(200, 'Ghi chú không được vượt quá 200 ký tự')
    .optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
