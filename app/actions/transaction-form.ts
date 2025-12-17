'use server'

import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
import { sql } from '@vercel/postgres'
import { auth } from '@/auth'
import { transactionSchema } from '@/lib/validations/transaction'

export interface TransactionFormState {
  errors?: {
    amount?: string[]
    type?: string[]
    categoryId?: string[]
    date?: string[]
    name?: string[]
    note?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createTransactionAction(
  prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const session = await auth()

  if (!session?.user) {
    return {
      errors: {
        _form: ['Bạn cần đăng nhập để thực hiện thao tác này'],
      },
    }
  }

  const validatedFields = transactionSchema.safeParse({
    amount: parseFloat(formData.get('amount') as string),
    type: formData.get('type'),
    categoryId: parseInt(formData.get('categoryId') as string),
    date: formData.get('date'),
    name: formData.get('name'),
    note: formData.get('note') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { amount, type, categoryId, date, name, note } = validatedFields.data
  const userId = parseInt(session.user.id)

  try {
    await sql`
      INSERT INTO transactions (user_id, category_id, amount, type, date, name, note)
      VALUES (${userId}, ${categoryId}, ${amount}, ${type}, ${date}, ${name}, ${note || null})
    `

    revalidateTag('transactions')
  } catch (error) {
    console.error('Create transaction error:', error)
    return {
      errors: {
        _form: ['Đã có lỗi xảy ra. Vui lòng thử lại.'],
      },
    }
  }

  redirect('/transactions')
}

export async function updateTransactionAction(
  transactionId: number,
  prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const session = await auth()

  if (!session?.user) {
    return {
      errors: {
        _form: ['Bạn cần đăng nhập để thực hiện thao tác này'],
      },
    }
  }

  const userId = parseInt(session.user.id)

  // Verify ownership
  const { rows } = await sql`
    SELECT id FROM transactions
    WHERE id = ${transactionId} AND user_id = ${userId}
  `

  if (rows.length === 0) {
    return {
      errors: {
        _form: ['Bạn không có quyền chỉnh sửa giao dịch này'],
      },
    }
  }

  const validatedFields = transactionSchema.safeParse({
    amount: parseFloat(formData.get('amount') as string),
    type: formData.get('type'),
    categoryId: parseInt(formData.get('categoryId') as string),
    date: formData.get('date'),
    name: formData.get('name'),
    note: formData.get('note') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { amount, type, categoryId, date, name, note } = validatedFields.data

  try {
    await sql`
      UPDATE transactions
      SET
        category_id = ${categoryId},
        amount = ${amount},
        type = ${type},
        date = ${date},
        name = ${name},
        note = ${note || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${transactionId} AND user_id = ${userId}
    `

    revalidateTag('transactions')
  } catch (error) {
    console.error('Update transaction error:', error)
    return {
      errors: {
        _form: ['Đã có lỗi xảy ra. Vui lòng thử lại.'],
      },
    }
  }

  redirect('/transactions')
}

export async function deleteTransactionAction(transactionId: number): Promise<void> {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const userId = parseInt(session.user.id)

  await sql`
    DELETE FROM transactions
    WHERE id = ${transactionId} AND user_id = ${userId}
  `

  revalidateTag('transactions')
  redirect('/transactions')
}
