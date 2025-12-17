'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { sql } from '@vercel/postgres'
import { registerSchema, loginSchema, resetPasswordSchema, newPasswordSchema } from '@/lib/validations/auth'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export interface FormState {
  errors?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function registerAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    // Check if user exists
    const { rows } = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (rows.length > 0) {
      return {
        errors: {
          email: ['Email đã được sử dụng'],
        },
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${passwordHash})
    `

    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      errors: {
        _form: ['Đã có lỗi xảy ra. Vui lòng thử lại.'],
      },
    }
  }
}

export async function loginAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        errors: {
          _form: ['Email hoặc mật khẩu không đúng'],
        },
      }
    }
    throw error
  }

  redirect('/dashboard')
}

export async function resetPasswordAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = resetPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data

  try {
    // Check if user exists
    const { rows } = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (rows.length === 0) {
      // Don't reveal if email exists
      return { success: true }
    }

    const userId = rows[0].id

    // Generate reset token
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 3600000) // 1 hour

    // Delete old tokens
    await sql`
      DELETE FROM password_reset_tokens WHERE user_id = ${userId}
    `

    // Create new token
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires)
      VALUES (${userId}, ${token}, ${expires.toISOString()})
    `

    // TODO: Send email with reset link
    // For now, just log the token
    console.log('Reset token:', token)

    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      errors: {
        _form: ['Đã có lỗi xảy ra. Vui lòng thử lại.'],
      },
    }
  }
}

export async function setNewPasswordAction(
  token: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = newPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data

  try {
    // Verify token
    const { rows } = await sql`
      SELECT user_id, expires FROM password_reset_tokens
      WHERE token = ${token}
    `

    if (rows.length === 0) {
      return {
        errors: {
          _form: ['Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'],
        },
      }
    }

    const resetToken = rows[0]
    if (new Date(resetToken.expires) < new Date()) {
      return {
        errors: {
          _form: ['Link đặt lại mật khẩu đã hết hạn'],
        },
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update password
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE id = ${resetToken.user_id}
    `

    // Delete token
    await sql`
      DELETE FROM password_reset_tokens WHERE token = ${token}
    `

    return { success: true }
  } catch (error) {
    console.error('Set new password error:', error)
    return {
      errors: {
        _form: ['Đã có lỗi xảy ra. Vui lòng thử lại.'],
      },
    }
  }
}
