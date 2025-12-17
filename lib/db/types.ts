import { sql } from '@vercel/postgres'

export interface User {
  id: number
  email: string
  password_hash: string
  created_at: Date
  last_login_at: Date | null
  email_verified: boolean
}

export interface Session {
  id: number
  session_token: string
  user_id: number
  expires: Date
}

export interface Category {
  id: number
  user_id: number | null
  name: string
  icon: string | null
  type: 'income' | 'expense'
  color: string | null
  is_system: boolean
  display_order: number
  created_at: Date
}

export interface Transaction {
  id: number
  user_id: number
  category_id: number
  amount: number
  type: 'income' | 'expense'
  date: string
  name: string
  note: string | null
  created_at: Date
  updated_at: Date
}

export interface UserSettings {
  id: number
  user_id: number
  currency: string
  theme: string
  language: string
  date_format: string
  notification_enabled: boolean
  notification_time: string
  created_at: Date
  updated_at: Date
}

export { sql }
