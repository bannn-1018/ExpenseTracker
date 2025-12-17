import ResetPasswordForm from '@/components/auth/reset-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quên mật khẩu - Expense Tracker',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
