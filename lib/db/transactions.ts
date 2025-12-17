import { sql } from '@vercel/postgres'
import { revalidateTag } from 'next/cache'
import type { Transaction } from './types'

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  type?: 'income' | 'expense' | 'all'
  categoryId?: number
  search?: string
}

export interface TransactionsResult {
  transactions: (Transaction & {
    category_name: string
    category_icon: string | null
    category_color: string | null
  })[]
  totalCount: number
  hasMore: boolean
}

export async function getTransactions(
  userId: number,
  page: number = 1,
  limit: number = 20,
  filters: TransactionFilters = {}
): Promise<TransactionsResult> {
  const offset = (page - 1) * limit
  const { startDate, endDate, type, categoryId, search } = filters

  let whereConditions = [`t.user_id = ${userId}`]
  
  if (startDate) {
    whereConditions.push(`t.date >= '${startDate}'`)
  }
  
  if (endDate) {
    whereConditions.push(`t.date <= '${endDate}'`)
  }
  
  if (type && type !== 'all') {
    whereConditions.push(`t.type = '${type}'`)
  }
  
  if (categoryId) {
    whereConditions.push(`t.category_id = ${categoryId}`)
  }
  
  if (search) {
    whereConditions.push(`(LOWER(t.name) LIKE LOWER('%${search}%') OR LOWER(t.note) LIKE LOWER('%${search}%'))`)
  }

  const whereClause = whereConditions.join(' AND ')

  const { rows } = await sql.query(`
    SELECT
      t.*,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color,
      COUNT(*) OVER() as total_count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE ${whereClause}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `)

  const totalCount = rows.length > 0 ? parseInt(rows[0].total_count) : 0

  return {
    transactions: rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      category_id: row.category_id,
      amount: parseFloat(row.amount),
      type: row.type,
      date: row.date instanceof Date ? row.date.toISOString() : row.date,
      name: row.name,
      note: row.note,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_name: row.category_name,
      category_icon: row.category_icon,
      category_color: row.category_color,
    })),
    totalCount,
    hasMore: totalCount > offset + limit,
  }
}

export async function getTransactionById(
  userId: number,
  transactionId: number
): Promise<Transaction | null> {
  const { rows } = await sql<Transaction>`
    SELECT * FROM transactions
    WHERE id = ${transactionId} AND user_id = ${userId}
  `

  if (rows.length === 0) {
    return null
  }

  return {
    ...rows[0],
    amount: parseFloat(rows[0].amount as any),
  }
}

export async function deleteTransaction(
  userId: number,
  transactionId: number
): Promise<void> {
  await sql`
    DELETE FROM transactions
    WHERE id = ${transactionId} AND user_id = ${userId}
  `
  
  revalidateTag('transactions')
}

export function groupTransactionsByDate(
  transactions: (Transaction & {
    category_name: string
    category_icon: string | null
    category_color: string | null
  })[]
): Record<string, typeof transactions> {
  const grouped: Record<string, typeof transactions> = {}
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  for (const transaction of transactions) {
    let dateLabel: string
    
    if (transaction.date === today) {
      dateLabel = 'Hôm nay'
    } else if (transaction.date === yesterday) {
      dateLabel = 'Hôm qua'
    } else {
      const date = new Date(transaction.date)
      dateLabel = date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    if (!grouped[dateLabel]) {
      grouped[dateLabel] = []
    }
    grouped[dateLabel].push(transaction)
  }

  return grouped
}
