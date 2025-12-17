import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getTransactions, groupTransactionsByDate } from '@/lib/db/transactions'
import { getCategories } from '@/lib/db/categories'
import TransactionList from '@/components/transactions/transaction-list'
import SearchBar from '@/components/transactions/search-bar'
import FilterModal from '@/components/transactions/filter-modal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giao dịch - Expense Tracker',
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: {
    page?: string
    search?: string
    startDate?: string
    endDate?: string
    type?: 'income' | 'expense' | 'all'
    categoryId?: string
  }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = parseInt(session.user.id)
  const page = parseInt(searchParams.page || '1')
  
  const [transactionsResult, categories] = await Promise.all([
    getTransactions(
      userId,
      page,
      20,
      {
        search: searchParams.search,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        type: searchParams.type,
        categoryId: searchParams.categoryId ? parseInt(searchParams.categoryId) : undefined,
      }
    ),
    getCategories(userId),
  ])

  const { transactions, totalCount, hasMore } = transactionsResult
  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Giao dịch</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1">
          <SearchBar />
        </div>
        <FilterModal categories={categories} />
      </div>

      <TransactionList groupedTransactions={groupedTransactions} />

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between mt-6">
          {page > 1 ? (
            <a
              href={`?page=${page - 1}`}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
            >
              ← Trang trước
            </a>
          ) : (
            <div></div>
          )}
          
          <span className="text-sm text-gray-600">
            Trang {page}
          </span>
          
          {hasMore ? (
            <a
              href={`?page=${page + 1}`}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
            >
              Trang sau →
            </a>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  )
}
