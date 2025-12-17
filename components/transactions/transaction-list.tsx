import TransactionItem from './transaction-item'
import type { Transaction } from '@/lib/db/types'

interface TransactionListProps {
  groupedTransactions: Record<string, Array<Transaction & {
    category_name: string
    category_icon: string | null
    category_color: string | null
  }>>
  loading?: boolean
}

export default function TransactionList({ groupedTransactions, loading = false }: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-4 bg-white rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const dateGroups = Object.keys(groupedTransactions)

  if (dateGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có giao dịch nào</h3>
        <p className="mt-1 text-sm text-gray-500">
          Bắt đầu bằng cách thêm giao dịch đầu tiên của bạn.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {dateGroups.map((dateLabel) => (
        <div key={dateLabel} className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {dateLabel}
          </h3>
          <div className="space-y-3">
            {groupedTransactions[dateLabel].map((transaction) => (
              <TransactionItem
                key={transaction.id}
                id={transaction.id}
                name={transaction.name}
                amount={transaction.amount}
                type={transaction.type}
                date={transaction.date}
                note={transaction.note}
                categoryName={transaction.category_name}
                categoryIcon={transaction.category_icon}
                categoryColor={transaction.category_color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
