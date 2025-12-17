import { sql } from '@vercel/postgres'
import { getDateRange, type TimeFilter } from '../utils/date'

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  totalBalance: number
}

export interface CategoryBreakdown {
  categoryId: number
  categoryName: string
  categoryIcon: string | null
  categoryColor: string | null
  total: number
  percentage: number
  count: number
}

export interface RecentTransaction {
  id: number
  amount: number
  type: 'income' | 'expense'
  date: string
  name: string
  categoryId: number
  categoryName: string
  categoryIcon: string | null
  categoryColor: string | null
}

export async function getDashboardSummary(
  userId: number,
  filter: TimeFilter
): Promise<DashboardSummary> {
  const { start, end } = getDateRange(filter)

  const { rows } = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
    FROM transactions
    WHERE user_id = ${userId}
      AND date >= ${start.toISOString().split('T')[0]}
      AND date <= ${end.toISOString().split('T')[0]}
  `

  const totalIncome = parseFloat(rows[0]?.total_income || '0')
  const totalExpense = parseFloat(rows[0]?.total_expense || '0')

  return {
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense,
  }
}

export async function getCategoryBreakdown(
  userId: number,
  filter: TimeFilter
): Promise<CategoryBreakdown[]> {
  const { start, end } = getDateRange(filter)

  const { rows } = await sql`
    SELECT
      c.id as category_id,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color,
      SUM(t.amount) as total,
      COUNT(t.id) as count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ${userId}
      AND t.type = 'expense'
      AND t.date >= ${start.toISOString().split('T')[0]}
      AND t.date <= ${end.toISOString().split('T')[0]}
    GROUP BY c.id, c.name, c.icon, c.color
    ORDER BY total DESC
  `

  const totalExpense = rows.reduce((sum, row) => sum + parseFloat(row.total), 0)

  return rows.map(row => ({
    categoryId: row.category_id,
    categoryName: row.category_name,
    categoryIcon: row.category_icon,
    categoryColor: row.category_color,
    total: parseFloat(row.total),
    percentage: totalExpense > 0 ? (parseFloat(row.total) / totalExpense) * 100 : 0,
    count: parseInt(row.count),
  }))
}

export async function getRecentTransactions(
  userId: number,
  limit: number = 10
): Promise<RecentTransaction[]> {
  const { rows } = await sql`
    SELECT
      t.id,
      t.amount,
      t.type,
      t.date,
      t.name,
      c.id as category_id,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ${userId}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT ${limit}
  `

  return rows.map(row => ({
    id: row.id,
    amount: parseFloat(row.amount),
    type: row.type,
    date: row.date instanceof Date ? row.date.toISOString() : row.date,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categoryIcon: row.category_icon,
    categoryColor: row.category_color,
  }))
}
