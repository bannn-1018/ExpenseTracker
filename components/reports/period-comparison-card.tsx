import { formatCurrency } from '@/lib/utils/currency'
import type { PeriodComparison } from '@/lib/db/analytics'

interface PeriodComparisonCardProps {
  comparison: PeriodComparison
}

export default function PeriodComparisonCard({ comparison }: PeriodComparisonCardProps) {
  const renderChange = (change: number, reverse: boolean = false) => {
    const isPositive = reverse ? change < 0 : change > 0
    const color = isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    const icon = change > 0 ? '↑' : change < 0 ? '↓' : '→'
    
    return (
      <span className={`${color} font-medium`}>
        {icon} {Math.abs(change).toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">So sánh với kỳ trước</h3>
      
      <div className="space-y-4">
        {/* Income */}
        <div className="p-4 bg-income-light rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Thu nhập</span>
            {renderChange(comparison.incomeChange)}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-income">
              {formatCurrency(comparison.currentIncome)}
            </p>
            <p className="text-sm text-gray-500">
              (Trước: {formatCurrency(comparison.previousIncome)})
            </p>
          </div>
        </div>

        {/* Expense */}
        <div className="p-4 bg-expense-light rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Chi tiêu</span>
            {renderChange(comparison.expenseChange, true)}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-expense">
              {formatCurrency(comparison.currentExpense)}
            </p>
            <p className="text-sm text-gray-500">
              (Trước: {formatCurrency(comparison.previousExpense)})
            </p>
          </div>
        </div>

        {/* Balance */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Số dư</span>
            {renderChange(comparison.balanceChange)}
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${
              comparison.currentBalance >= 0 ? 'text-primary-600' : 'text-expense'
            }`}>
              {formatCurrency(comparison.currentBalance)}
            </p>
            <p className="text-sm text-gray-500">
              (Trước: {formatCurrency(comparison.previousBalance)})
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
