import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getCategoriesByType } from '@/lib/db/categories'
import TransactionForm from '@/components/transactions/transaction-form'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thêm giao dịch - Expense Tracker',
}

export default async function AddTransactionPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = parseInt(session.user.id)
  const categories = await getCategoriesByType(userId)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/transactions"
          className="text-gray-600 hover:text-gray-900"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Thêm giao dịch mới</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TransactionForm
          mode="create"
          categories={categories}
        />
      </div>
    </div>
  )
}
