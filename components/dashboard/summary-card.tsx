import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  title: string
  amount: number
  type: 'income' | 'expense' | 'balance'
  loading?: boolean
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

export default function SummaryCard({
  title,
  amount,
  type,
  loading = false,
  trend,
}: SummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  const getTypeColor = () => {
    switch (type) {
      case 'income':
        return 'text-income'
      case 'expense':
        return 'text-expense'
      case 'balance':
        return amount >= 0 ? 'text-primary-600' : 'text-expense'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'income':
        return (
          <svg className="h-6 w-6 text-income" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
      case 'expense':
        return (
          <svg className="h-6 w-6 text-expense" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        )
      case 'balance':
        return (
          <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {getIcon()}
      </div>
      <p className={cn('text-2xl font-bold', getTypeColor())}>
        {formatCurrency(amount)}
      </p>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          {trend.direction === 'up' ? (
            <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
          <span className="text-gray-500 ml-1">so với kỳ trước</span>
        </div>
      )}
    </div>
  )
}
