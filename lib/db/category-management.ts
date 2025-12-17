import { sql } from '@vercel/postgres'
import { revalidateTag } from 'next/cache'
import type { Category } from './types'

export async function createCategory(
  userId: number,
  name: string,
  icon: string,
  type: 'income' | 'expense',
  color: string
): Promise<number> {
  const { rows } = await sql<{ id: number }>`
    INSERT INTO categories (user_id, name, icon, type, color, is_system)
    VALUES (${userId}, ${name}, ${icon}, ${type}, ${color}, false)
    RETURNING id
  `

  revalidateTag('categories')
  return rows[0].id
}

export async function updateCategory(
  userId: number,
  categoryId: number,
  updates: {
    name?: string
    icon?: string
    color?: string
  }
): Promise<void> {
  // Check if category is owned by user and not system
  const { rows } = await sql<Category>`
    SELECT * FROM categories
    WHERE id = ${categoryId} AND user_id = ${userId} AND is_system = false
  `

  if (rows.length === 0) {
    throw new Error('Category not found or cannot be edited')
  }

  const updateFields: string[] = []
  const values: any[] = []
  let paramCount = 1

  if (updates.name !== undefined) {
    updateFields.push(`name = $${paramCount++}`)
    values.push(updates.name)
  }
  if (updates.icon !== undefined) {
    updateFields.push(`icon = $${paramCount++}`)
    values.push(updates.icon)
  }
  if (updates.color !== undefined) {
    updateFields.push(`color = $${paramCount++}`)
    values.push(updates.color)
  }

  if (updateFields.length === 0) return

  values.push(categoryId, userId)

  await sql.query(`
    UPDATE categories
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
  `, values)

  revalidateTag('categories')
}

export async function deleteCategory(
  userId: number,
  categoryId: number
): Promise<void> {
  // Check if category is owned by user and not system
  const { rows } = await sql<Category>`
    SELECT * FROM categories
    WHERE id = ${categoryId} AND user_id = ${userId} AND is_system = false
  `

  if (rows.length === 0) {
    throw new Error('Category not found or cannot be deleted')
  }

  const category = rows[0]

  // Get "Other" category of the same type
  const { rows: otherRows } = await sql<Category>`
    SELECT id FROM categories
    WHERE (user_id = ${userId} OR user_id IS NULL)
      AND type = ${category.type}
      AND name = 'Khác'
    LIMIT 1
  `

  const otherCategoryId = otherRows[0]?.id

  if (otherCategoryId) {
    // Reassign transactions to "Other" category
    await sql`
      UPDATE transactions
      SET category_id = ${otherCategoryId}
      WHERE category_id = ${categoryId} AND user_id = ${userId}
    `
  }

  // Delete category
  await sql`
    DELETE FROM categories
    WHERE id = ${categoryId} AND user_id = ${userId}
  `

  revalidateTag('categories')
  revalidateTag('transactions')
}

export async function getCategoryUsageCount(
  userId: number,
  categoryId: number
): Promise<number> {
  const { rows } = await sql<{ count: string }>`
    SELECT COUNT(*) as count
    FROM transactions
    WHERE user_id = ${userId} AND category_id = ${categoryId}
  `

  return parseInt(rows[0]?.count || '0')
}
