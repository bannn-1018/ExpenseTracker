import RegisterForm from '@/components/auth/register-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký - Expense Tracker',
}

export default function RegisterPage() {
  return <RegisterForm />
}
