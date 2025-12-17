import { formatCurrency } from '@/lib/utils/currency'
import type { RecentTransaction } from '@/lib/db/dashboard'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: RecentTransaction[]
  loading?: boolean
}

export default function RecentTransactions({ transactions, loading = false }: RecentTransactionsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Giao dịch gần đây</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          Chưa có giao dịch nào
        </div>
        <div className="text-center mt-4">
          <Link
            href="/transactions/add"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm giao dịch đầu tiên
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Giao dịch gần đây</h3>
        <Link
          href="/transactions"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Link
            key={transaction.id}
            href={`/transactions/${transaction.id}/edit`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: transaction.categoryColor + '20' }}
            >
              {transaction.categoryIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{transaction.name}</p>
              <p className="text-sm text-gray-500">
                {format(parseISO(transaction.date), 'dd MMM yyyy', { locale: vi })}
              </p>
            </div>
            <p
              className={cn(
                'font-semibold',
                transaction.type === 'income' ? 'text-income' : 'text-expense'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
