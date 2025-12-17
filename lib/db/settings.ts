import { sql } from '@vercel/postgres'
import { revalidateTag } from 'next/cache'
import type { UserSettings } from './types'

export async function getUserSettings(userId: number): Promise<UserSettings> {
  const { rows } = await sql<UserSettings>`
    SELECT * FROM user_settings WHERE user_id = ${userId}
  `

  if (rows.length === 0) {
    // Create default settings
    const { rows: newRows } = await sql<UserSettings>`
      INSERT INTO user_settings (user_id)
      VALUES (${userId})
      RETURNING *
    `
    return newRows[0]
  }

  return rows[0]
}

export async function updateUserSettings(
  userId: number,
  settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const updates: string[] = []
  const values: any[] = []
  let paramCount = 1

  if (settings.currency !== undefined) {
    updates.push(`currency = $${paramCount++}`)
    values.push(settings.currency)
  }
  if (settings.theme !== undefined) {
    updates.push(`theme = $${paramCount++}`)
    values.push(settings.theme)
  }
  if (settings.language !== undefined) {
    updates.push(`language = $${paramCount++}`)
    values.push(settings.language)
  }
  if (settings.date_format !== undefined) {
    updates.push(`date_format = $${paramCount++}`)
    values.push(settings.date_format)
  }
  if (settings.notification_enabled !== undefined) {
    updates.push(`notification_enabled = $${paramCount++}`)
    values.push(settings.notification_enabled)
  }
  if (settings.notification_time !== undefined) {
    updates.push(`notification_time = $${paramCount++}`)
    values.push(settings.notification_time)
  }

  if (updates.length === 0) return

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(userId)

  await sql.query(`
    UPDATE user_settings 
    SET ${updates.join(', ')}
    WHERE user_id = $${paramCount}
  `, values)

  revalidateTag('settings')
}
