import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { 
  getMonthlyTrends, 
  getCategoryAnalysis, 
  getSpendingForecast,
  getPeriodComparison 
} from '@/lib/db/analytics'
import MonthlyTrendChart from '@/components/reports/monthly-trend-chart'
import CategoryAnalysisChart from '@/components/reports/category-analysis-chart'
import SpendingForecastCard from '@/components/reports/spending-forecast-card'
import PeriodComparisonCard from '@/components/reports/period-comparison-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Báo cáo & Phân tích - Expense Tracker',
}

export default async function ReportsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = parseInt(session.user.id)
  
  // Get current month dates
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [monthlyTrends, categoryAnalysis, forecast, periodComparison] = await Promise.all([
    getMonthlyTrends(userId, 6),
    getCategoryAnalysis(
      userId,
      startOfMonth.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    ),
    getSpendingForecast(userId),
    getPeriodComparison(
      userId,
      startOfMonth.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    ),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Báo cáo & Phân tích</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi xu hướng và phân tích thói quen chi tiêu của bạn
        </p>
      </div>

      {/* Top Row: Forecast and Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingForecastCard forecast={forecast} />
        <PeriodComparisonCard comparison={periodComparison} />
      </div>

      {/* Monthly Trend Chart */}
      <MonthlyTrendChart data={monthlyTrends} />

      {/* Category Analysis */}
      <CategoryAnalysisChart data={categoryAnalysis} />

      {/* Insights */}
      {categoryAnalysis.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">💡 Nhận xét</h3>
          <div className="space-y-3">
            {categoryAnalysis.slice(0, 3).map((category, index) => (
              <div key={category.categoryId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{category.categoryIcon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {category.categoryName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Chiếm {category.percentage.toFixed(1)}% tổng chi tiêu với {category.transactionCount} giao dịch.
                    {category.trend === 'up' && (
                      <span className="text-red-600 ml-1">
                        Tăng {category.trendPercentage.toFixed(1)}% so với kỳ trước.
                      </span>
                    )}
                    {category.trend === 'down' && (
                      <span className="text-green-600 ml-1">
                        Giảm {category.trendPercentage.toFixed(1)}% so với kỳ trước.
                      </span>
                    )}
                    {category.trend === 'stable' && (
                      <span className="text-gray-600 ml-1">
                        Ổn định so với kỳ trước.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
