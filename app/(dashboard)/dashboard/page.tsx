import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getDashboardSummary, getCategoryBreakdown, getRecentTransactions } from '@/lib/db/dashboard'
import type { TimeFilter } from '@/lib/utils/date'
import SummaryCards from '@/components/dashboard/summary-cards'
import TimeFilterComponent from '@/components/dashboard/time-filter'
import CategoryBreakdownChart from '@/components/dashboard/category-breakdown-chart'
import RecentTransactions from '@/components/dashboard/recent-transactions'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tổng quan - Expense Tracker',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const filter = (searchParams.filter as TimeFilter) || 'month'
  const userId = parseInt(session.user.id)

  const [summary, breakdown, recentTransactions] = await Promise.all([
    getDashboardSummary(userId, filter),
    getCategoryBreakdown(userId, filter),
    getRecentTransactions(userId, 10),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tổng quan</h1>
      </div>

      <TimeFilterComponent />

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownChart data={breakdown} />
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  )
}
