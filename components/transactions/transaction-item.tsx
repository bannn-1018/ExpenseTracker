'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currency'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TransactionItemProps {
  id: number
  name: string
  amount: number
  type: 'income' | 'expense'
  date: string
  note: string | null
  categoryName: string
  categoryIcon: string | null
  categoryColor: string | null
}

export default function TransactionItem({
  id,
  name,
  amount,
  type,
  date,
  note,
  categoryName,
  categoryIcon,
  categoryColor,
}: TransactionItemProps) {
  return (
    <Link
      href={`/transactions/${id}/edit`}
      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: (categoryColor || '#6b7280') + '20' }}
      >
        {categoryIcon || '📦'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-sm text-gray-500">{categoryName}</p>
          </div>
          <p
            className={cn(
              'font-bold text-lg whitespace-nowrap',
              type === 'income' ? 'text-income' : 'text-expense'
            )}
          >
            {type === 'income' ? '+' : '-'}
            {formatCurrency(amount)}
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-400">
            {format(parseISO(date), 'dd/MM/yyyy', { locale: vi })}
          </p>
          {note && (
            <>
              <span className="text-xs text-gray-300">•</span>
              <p className="text-xs text-gray-500 truncate">{note}</p>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
