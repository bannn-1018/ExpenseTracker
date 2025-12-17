import SummaryCard from './summary-card'
import type { DashboardSummary } from '@/lib/db/dashboard'

interface SummaryCardsProps {
  summary: DashboardSummary
  loading?: boolean
}

export default function SummaryCards({ summary, loading = false }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Tổng thu nhập"
        amount={summary.totalIncome}
        type="income"
        loading={loading}
      />
      <SummaryCard
        title="Tổng chi tiêu"
        amount={summary.totalExpense}
        type="expense"
        loading={loading}
      />
      <SummaryCard
        title="Số dư"
        amount={summary.totalBalance}
        type="balance"
        loading={loading}
      />
    </div>
  )
}
