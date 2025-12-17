import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getCategoriesByType } from '@/lib/db/categories'
import { getTransactionById } from '@/lib/db/transactions'
import TransactionForm from '@/components/transactions/transaction-form'
import Link from 'next/link'
import DeleteTransactionButton from '@/components/transactions/delete-transaction-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chỉnh sửa giao dịch - Expense Tracker',
}

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = parseInt(session.user.id)
  const transactionId = parseInt(params.id)

  const [categories, transaction] = await Promise.all([
    getCategoriesByType(userId),
    getTransactionById(userId, transactionId),
  ])

  if (!transaction) {
    redirect('/transactions')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/transactions"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa giao dịch</h1>
        </div>

        <DeleteTransactionButton transactionId={transactionId} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TransactionForm
          mode="edit"
          categories={categories}
          initialData={{
            id: transaction.id,
            amount: transaction.amount,
            type: transaction.type,
            categoryId: transaction.category_id,
            date: transaction.date,
            name: transaction.name,
            note: transaction.note,
          }}
        />
      </div>
    </div>
  )
}
