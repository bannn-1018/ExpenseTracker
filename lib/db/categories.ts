import { sql } from '@vercel/postgres'
import type { Category } from './types'

export async function getCategories(
  userId: number,
  type?: 'income' | 'expense'
): Promise<Category[]> {
  const query = type
    ? sql`
        SELECT * FROM categories
        WHERE (user_id = ${userId} OR user_id IS NULL)
          AND type = ${type}
        ORDER BY display_order, name
      `
    : sql`
        SELECT * FROM categories
        WHERE (user_id = ${userId} OR user_id IS NULL)
        ORDER BY type, display_order, name
      `

  const { rows } = await query
  return rows as Category[]
}

export async function getCategoriesByType(userId: number): Promise<{
  income: Category[]
  expense: Category[]
}> {
  const { rows } = await sql<Category>`
    SELECT * FROM categories
    WHERE (user_id = ${userId} OR user_id IS NULL)
    ORDER BY type, display_order, name
  `

  const income = rows.filter(c => c.type === 'income')
  const expense = rows.filter(c => c.type === 'expense')

  return { income, expense }
}

export async function getCategoriesByUserId(userId: number): Promise<Category[]> {
  const { rows } = await sql<Category>`
    SELECT * FROM categories
    WHERE (user_id = ${userId} OR user_id IS NULL)
    ORDER BY type, display_order, name
  `
  return rows
}

export async function getCategoryById(
  userId: number,
  categoryId: number
): Promise<Category | null> {
  const { rows } = await sql<Category>`
    SELECT * FROM categories
    WHERE id = ${categoryId}
      AND (user_id = ${userId} OR user_id IS NULL)
  `

  return rows[0] || null
}
