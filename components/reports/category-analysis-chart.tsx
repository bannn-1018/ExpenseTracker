'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/currency'
import type { CategoryAnalysis } from '@/lib/db/analytics'

interface CategoryAnalysisChartProps {
  data: CategoryAnalysis[]
}

export default function CategoryAnalysisChart({ data }: CategoryAnalysisChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Phân tích theo danh mục</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Chưa có dữ liệu
        </div>
      </div>
    )
  }

  const topCategories = data.slice(0, 10)
  const chartData = topCategories.map(item => ({
    name: item.categoryName,
    amount: item.total,
    icon: item.categoryIcon,
    color: item.categoryColor || '#6b7280',
    count: item.transactionCount,
    trend: item.trend,
    trendPercentage: item.trendPercentage,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium flex items-center gap-2 mb-2">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-sm text-gray-700">
            Tổng: {formatCurrency(data.amount)}
          </p>
          <p className="text-sm text-gray-600">
            {data.count} giao dịch
          </p>
          {data.trendPercentage > 0 && (
            <p className={`text-sm mt-1 ${
              data.trend === 'up' ? 'text-red-600' : data.trend === 'down' ? 'text-green-600' : 'text-gray-600'
            }`}>
              {data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'}
              {' '}{data.trendPercentage.toFixed(1)}% so với kỳ trước
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Phân tích theo danh mục (Top 10)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12 }}
            stroke="#666"
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#666"
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="amount" 
            fill="#ef4444"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
