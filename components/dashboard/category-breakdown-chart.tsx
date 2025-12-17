'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/currency'
import type { CategoryBreakdown } from '@/lib/db/dashboard'

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[]
  loading?: boolean
}

export default function CategoryBreakdownChart({ data, loading = false }: CategoryBreakdownChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Chi tiêu theo danh mục</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chưa có dữ liệu chi tiêu
        </div>
      </div>
    )
  }

  const chartData = data.slice(0, 8).map(item => ({
    name: item.categoryName,
    value: item.total,
    color: item.categoryColor || '#6b7280',
    icon: item.categoryIcon,
    percentage: item.percentage,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium flex items-center gap-2">
            <span>{payload[0].payload.icon}</span>
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-500">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate text-gray-900">{entry.payload.icon} {entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Chi tiêu theo danh mục</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percentage }) => `${percentage.toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
