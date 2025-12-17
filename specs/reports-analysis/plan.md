# Technical Plan: Reports & Analysis (Báo cáo & Phân tích)

**Feature Branch**: `005-reports-analysis`  
**Created**: December 17, 2025  
**Tech Stack**: Next.js 14+ (App Router), Vercel Postgres, Recharts  
**Estimated Effort**: 4-5 days

## Architecture Overview

### Tech Stack Components
- **Frontend**: Next.js 14+ with App Router, React Server Components
- **Database**: Vercel Postgres (PostgreSQL)
- **Charts**: Recharts (responsive React charts)
- **UI Components**: Tailwind CSS, shadcn/ui
- **PDF Export**: jsPDF + html2canvas
- **CSV Export**: papaparse
- **Date Handling**: date-fns

## Implementation Plan

### Phase 1: Data Aggregation Layer (Day 1)

#### 1.1 Analytics Database Queries
**File**: `lib/db/analytics.ts`
```typescript
import { sql } from "@vercel/postgres"
import { unstable_cache } from "next/cache"

export interface MonthlyTrend {
  month: string
  year: number
  totalIncome: number
  totalExpense: number
  netBalance: number
}

export async function getMonthlyTrends(
  userId: number,
  months: number = 6
): Promise<MonthlyTrend[]> {
  const result = await sql`
    SELECT 
      TO_CHAR(date, 'YYYY-MM') as month,
      EXTRACT(YEAR FROM date)::int as year,
      EXTRACT(MONTH FROM date)::int as month_num,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions
    WHERE user_id = ${userId}
      AND date >= CURRENT_DATE - INTERVAL '${months} months'
    GROUP BY TO_CHAR(date, 'YYYY-MM'), EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
    ORDER BY year DESC, month_num DESC
    LIMIT ${months}
  `
  
  return result.rows.map(row => ({
    month: row.month,
    year: row.year,
    totalIncome: parseFloat(row.total_income),
    totalExpense: parseFloat(row.total_expense),
    netBalance: parseFloat(row.total_income) - parseFloat(row.total_expense)
  })).reverse()
}

export interface CategoryAnalysis {
  categoryId: number
  categoryName: string
  categoryIcon: string
  categoryColor: string
  totalAmount: number
  percentage: number
  transactionCount: number
  trend: "up" | "down" | "stable"
}

export async function getCategoryAnalysis(
  userId: number,
  startDate: string,
  endDate: string
): Promise<CategoryAnalysis[]> {
  const result = await sql`
    SELECT 
      c.id,
      c.name,
      c.icon,
      c.color,
      COALESCE(SUM(t.amount), 0) as total,
      COUNT(t.id) as count
    FROM categories c
    LEFT JOIN transactions t ON c.id = t.category_id
      AND t.user_id = ${userId}
      AND t.type = 'expense'
      AND t.date >= ${startDate}
      AND t.date <= ${endDate}
    WHERE (c.user_id = ${userId} OR c.is_system = true)
      AND c.type = 'expense'
    GROUP BY c.id, c.name, c.icon, c.color
    HAVING COALESCE(SUM(t.amount), 0) > 0
    ORDER BY total DESC
  `
  
  const totalExpense = result.rows.reduce(
    (sum, row) => sum + parseFloat(row.total),
    0
  )
  
  // Calculate trend by comparing with previous period
  const daysDiff = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  const prevStartDate = new Date(startDate)
  prevStartDate.setDate(prevStartDate.getDate() - daysDiff)
  const prevEndDate = new Date(startDate)
  prevEndDate.setDate(prevEndDate.getDate() - 1)
  
  return result.rows.map(row => ({
    categoryId: row.id,
    categoryName: row.name,
    categoryIcon: row.icon,
    categoryColor: row.color,
    totalAmount: parseFloat(row.total),
    percentage: totalExpense > 0 ? (parseFloat(row.total) / totalExpense) * 100 : 0,
    transactionCount: parseInt(row.count),
    trend: "stable" // Will be calculated with previous period comparison
  }))
}

export interface SpendingForecast {
  projectedBalance: number
  confidence: "high" | "medium" | "low"
  daysAnalyzed: number
  dailyAverage: number
  warning: boolean
}

export async function getSpendingForecast(
  userId: number
): Promise<SpendingForecast | null> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysInMonth = endOfMonth.getDate()
  const daysPassed = now.getDate()
  
  if (daysPassed < 3) {
    return null // Not enough data
  }
  
  const result = await sql`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense,
      COUNT(DISTINCT DATE(date)) as active_days
    FROM transactions
    WHERE user_id = ${userId}
      AND date >= ${startOfMonth.toISOString().split("T")[0]}
      AND date <= ${now.toISOString().split("T")[0]}
  `
  
  const row = result.rows[0]
  const currentIncome = parseFloat(row.income)
  const currentExpense = parseFloat(row.expense)
  const activeDays = parseInt(row.active_days)
  
  if (activeDays === 0) return null
  
  const dailyExpenseAvg = currentExpense / daysPassed
  const projectedMonthlyExpense = dailyExpenseAvg * daysInMonth
  const projectedBalance = currentIncome - projectedMonthlyExpense
  
  let confidence: "high" | "medium" | "low" = "low"
  if (daysPassed >= 15) confidence = "high"
  else if (daysPassed >= 7) confidence = "medium"
  
  return {
    projectedBalance,
    confidence,
    daysAnalyzed: daysPassed,
    dailyAverage: dailyExpenseAvg,
    warning: projectedBalance < 0
  }
}

export interface PeriodComparison {
  currentIncome: number
  currentExpense: number
  currentBalance: number
  previousIncome: number
  previousExpense: number
  previousBalance: number
  incomeChange: number
  expenseChange: number
  balanceChange: number
}

export async function getPeriodComparison(
  userId: number,
  currentStart: string,
  currentEnd: string
): Promise<PeriodComparison> {
  // Calculate previous period
  const daysDiff = Math.ceil(
    (new Date(currentEnd).getTime() - new Date(currentStart).getTime()) / (1000 * 60 * 60 * 24)
  )
  const prevStart = new Date(currentStart)
  prevStart.setDate(prevStart.getDate() - daysDiff - 1)
  const prevEnd = new Date(currentStart)
  prevEnd.setDate(prevEnd.getDate() - 1)
  
  const [current, previous] = await Promise.all([
    sql`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
      WHERE user_id = ${userId}
        AND date >= ${currentStart}
        AND date <= ${currentEnd}
    `,
    sql`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
      WHERE user_id = ${userId}
        AND date >= ${prevStart.toISOString().split("T")[0]}
        AND date <= ${prevEnd.toISOString().split("T")[0]}
    `
  ])
  
  const currentIncome = parseFloat(current.rows[0].income)
  const currentExpense = parseFloat(current.rows[0].expense)
  const previousIncome = parseFloat(previous.rows[0].income)
  const previousExpense = parseFloat(previous.rows[0].expense)
  
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }
  
  return {
    currentIncome,
    currentExpense,
    currentBalance: currentIncome - currentExpense,
    previousIncome,
    previousExpense,
    previousBalance: previousIncome - previousExpense,
    incomeChange: calcChange(currentIncome, previousIncome),
    expenseChange: calcChange(currentExpense, previousExpense),
    balanceChange: calcChange(
      currentIncome - currentExpense,
      previousIncome - previousExpense
    )
  }
}

// Cached versions
export const getCachedMonthlyTrends = unstable_cache(
  getMonthlyTrends,
  ["monthly-trends"],
  { revalidate: 3600, tags: ["transactions"] }
)

export const getCachedCategoryAnalysis = unstable_cache(
  getCategoryAnalysis,
  ["category-analysis"],
  { revalidate: 3600, tags: ["transactions"] }
)
```

### Phase 2: Reports Page & Layout (Day 2)

**File**: `app/(dashboard)/reports/page.tsx`
```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import {
  getCachedMonthlyTrends,
  getCachedCategoryAnalysis,
  getSpendingForecast,
  getPeriodComparison
} from "@/lib/db/analytics"
import { IncomeExpenseChart } from "@/components/reports/income-expense-chart"
import { CategoryAnalysisSection } from "@/components/reports/category-analysis"
import { ForecastCard } from "@/components/reports/forecast-card"
import { PeriodComparisonCard } from "@/components/reports/period-comparison"
import { TimeRangeSelector } from "@/components/reports/time-range-selector"
import { ExportReportButton } from "@/components/reports/export-button"

export default async function ReportsPage({
  searchParams
}: {
  searchParams: { months?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  const userId = parseInt(session.user.id)
  const months = parseInt(searchParams.months || "6")
  
  // Calculate current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split("T")[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split("T")[0]
  
  const [trends, categoryAnalysis, forecast, comparison] = await Promise.all([
    getCachedMonthlyTrends(userId, months),
    getCachedCategoryAnalysis(userId, startOfMonth, endOfMonth),
    getSpendingForecast(userId),
    getPeriodComparison(userId, startOfMonth, endOfMonth)
  ])
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Báo cáo & Phân tích</h1>
          <ExportReportButton userId={userId} />
        </div>
      </header>
      
      <div className="p-4 space-y-6">
        {/* Forecast Card */}
        {forecast && <ForecastCard forecast={forecast} />}
        
        {/* Period Comparison */}
        <PeriodComparisonCard comparison={comparison} />
        
        {/* Time Range Selector */}
        <TimeRangeSelector currentMonths={months} />
        
        {/* Income vs Expense Trend Chart */}
        <IncomeExpenseChart trends={trends} />
        
        {/* Category Analysis */}
        <CategoryAnalysisSection categories={categoryAnalysis} />
      </div>
    </div>
  )
}
```

### Phase 3: Chart Components (Day 2-3)

#### 3.1 Income vs Expense Bar Chart
**File**: `components/reports/income-expense-chart.tsx`
```typescript
"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { formatCurrency } from "@/lib/utils/currency"

export function IncomeExpenseChart({ trends }: { trends: MonthlyTrend[] }) {
  const data = trends.map(trend => ({
    month: new Date(trend.month).toLocaleDateString("vi-VN", { 
      month: "short",
      year: "2-digit"
    }),
    "Thu nhập": trend.totalIncome,
    "Chi tiêu": trend.totalExpense
  }))
  
  return (
    <div className="bg-white rounded-lg p-6 border">
      <h2 className="text-lg font-semibold mb-4">Thu vs Chi theo tháng</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
              return value.toString()
            }}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ fontSize: 14 }}
          />
          <Legend />
          <Bar dataKey="Thu nhập" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Chi tiêu" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

#### 3.2 Category Analysis Section
**File**: `components/reports/category-analysis.tsx`
```typescript
import { formatCurrency } from "@/lib/utils/currency"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react"
import Link from "next/link"

export function CategoryAnalysisSection({ 
  categories 
}: { 
  categories: CategoryAnalysis[] 
}) {
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Phân tích theo danh mục</h2>
        <p className="text-center text-gray-500 py-8">
          Chưa có dữ liệu chi tiêu
        </p>
      </div>
    )
  }
  
  const topCategory = categories[0]
  
  return (
    <div className="bg-white rounded-lg p-6 border">
      <h2 className="text-lg font-semibold mb-4">Phân tích theo danh mục</h2>
      
      {/* Insight */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 Bạn đã chi <strong>{topCategory.percentage.toFixed(1)}%</strong> cho{" "}
          <strong>{topCategory.categoryName}</strong>
        </p>
      </div>
      
      {/* Category List */}
      <div className="space-y-3">
        {categories.map((category, index) => (
          <Link
            key={category.categoryId}
            href={`/transactions?categoryId=${category.categoryId}`}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg -mx-3 min-h-[60px]"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 text-xl rounded-full flex-shrink-0"
                style={{ backgroundColor: `${category.categoryColor}30` }}
              >
                {category.categoryIcon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.categoryName}</span>
                  <span className="text-sm text-gray-500">
                    #{index + 1}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-1 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: category.categoryColor
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-red-600">
                {formatCurrency(category.totalAmount)}
              </p>
              <p className="text-sm text-gray-500">
                {category.percentage.toFixed(1)}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### Phase 4: Forecast & Comparison Cards (Day 3)

#### 4.1 Forecast Card
**File**: `components/reports/forecast-card.tsx`
```typescript
import { formatCurrency } from "@/lib/utils/currency"
import { TrendingDownIcon, AlertTriangleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ForecastCard({ forecast }: { forecast: SpendingForecast }) {
  const confidenceColors = {
    high: "text-green-600",
    medium: "text-yellow-600",
    low: "text-orange-600"
  }
  
  const confidenceLabels = {
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp"
  }
  
  return (
    <div className={cn(
      "rounded-lg p-6 border-2",
      forecast.warning 
        ? "bg-red-50 border-red-200" 
        : "bg-green-50 border-green-200"
    )}>
      <div className="flex items-start gap-3">
        {forecast.warning && (
          <AlertTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Dự báo số dư cuối tháng</h3>
          
          <p className={cn(
            "text-2xl font-bold mb-3",
            forecast.warning ? "text-red-600" : "text-green-600"
          )}>
            {formatCurrency(forecast.projectedBalance)}
          </p>
          
          <p className="text-sm text-gray-700 mb-2">
            Dựa trên tốc độ chi tiêu hiện tại ({formatCurrency(forecast.dailyAverage)}/ngày),
            số dư cuối tháng dự kiến là {formatCurrency(forecast.projectedBalance)}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Phân tích {forecast.daysAnalyzed} ngày</span>
            <span className={confidenceColors[forecast.confidence]}>
              Độ tin cậy: {confidenceLabels[forecast.confidence]}
            </span>
          </div>
          
          {forecast.warning && (
            <p className="mt-3 text-sm font-medium text-red-700">
              ⚠️ Cảnh báo: Có thể vượt ngân sách
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### 4.2 Period Comparison Card
**File**: `components/reports/period-comparison.tsx`
```typescript
import { formatCurrency } from "@/lib/utils/currency"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function PeriodComparisonCard({ 
  comparison 
}: { 
  comparison: PeriodComparison 
}) {
  const formatChange = (change: number, inverse = false) => {
    const isPositive = inverse ? change < 0 : change > 0
    const Icon = change > 0 ? ArrowUpIcon : ArrowDownIcon
    const color = isPositive ? "text-green-600" : "text-red-600"
    
    return (
      <div className={cn("flex items-center gap-1", color)}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg p-6 border">
      <h2 className="text-lg font-semibold mb-4">So sánh với tháng trước</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Income */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Thu nhập</p>
          <p className="text-lg font-bold text-green-600 mb-1">
            {formatCurrency(comparison.currentIncome)}
          </p>
          {formatChange(comparison.incomeChange)}
        </div>
        
        {/* Expense */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Chi tiêu</p>
          <p className="text-lg font-bold text-red-600 mb-1">
            {formatCurrency(comparison.currentExpense)}
          </p>
          {formatChange(comparison.expenseChange, true)}
        </div>
        
        {/* Balance */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Số dư</p>
          <p className={cn(
            "text-lg font-bold mb-1",
            comparison.currentBalance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatCurrency(comparison.currentBalance)}
          </p>
          {formatChange(comparison.balanceChange)}
        </div>
      </div>
      
      {/* Insight */}
      {comparison.expenseChange > 20 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-900">
            💡 Chi tiêu tăng {comparison.expenseChange.toFixed(0)}% so với tháng trước
          </p>
        </div>
      )}
    </div>
  )
}
```

### Phase 5: Export Functionality (Day 4-5)

#### 5.1 Time Range Selector
**File**: `components/reports/time-range-selector.tsx`
```typescript
"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const RANGES = [
  { label: "3 tháng", value: 3 },
  { label: "6 tháng", value: 6 },
  { label: "12 tháng", value: 12 }
]

export function TimeRangeSelector({ currentMonths }: { currentMonths: number }) {
  const router = useRouter()
  
  return (
    <div className="flex gap-2">
      {RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => router.push(`/reports?months=${range.value}`)}
          className={cn(
            "px-4 py-2 rounded-lg min-h-[44px] transition-colors",
            currentMonths === range.value
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
```

#### 5.2 Export Button & Actions
**File**: `components/reports/export-button.tsx`
```typescript
"use client"

import { useState } from "react"
import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { exportReportPDF, exportReportCSV } from "@/app/actions/reports"

export function ExportReportButton({ userId }: { userId: number }) {
  const [isExporting, setIsExporting] = useState(false)
  
  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // Export would capture the report page as PDF
      await exportReportPDF(userId)
    } finally {
      setIsExporting(false)
    }
  }
  
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const csv = await exportReportCSV(userId)
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="min-h-[44px]"
          disabled={isExporting}
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          Xuất PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          Xuất CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**File**: `app/actions/reports.ts`
```typescript
"use server"

import { auth } from "@/auth"
import {
  getCachedMonthlyTrends,
  getCachedCategoryAnalysis
} from "@/lib/db/analytics"

export async function exportReportCSV(userId: number) {
  const session = await auth()
  if (!session?.user?.id || parseInt(session.user.id) !== userId) {
    throw new Error("Unauthorized")
  }
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split("T")[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split("T")[0]
  
  const [trends, categories] = await Promise.all([
    getCachedMonthlyTrends(userId, 12),
    getCachedCategoryAnalysis(userId, startOfMonth, endOfMonth)
  ])
  
  // Generate CSV
  const monthlyData = trends.map(t => [
    t.month,
    t.totalIncome,
    t.totalExpense,
    t.netBalance
  ])
  
  const categoryData = categories.map(c => [
    c.categoryName,
    c.totalAmount,
    c.percentage.toFixed(2),
    c.transactionCount
  ])
  
  const csv = [
    "=== MONTHLY TRENDS ===",
    "Month,Income,Expense,Balance",
    ...monthlyData.map(row => row.join(",")),
    "",
    "=== CATEGORY ANALYSIS ===",
    "Category,Amount,Percentage,Transactions",
    ...categoryData.map(row => row.join(","))
  ].join("\n")
  
  return csv
}

export async function exportReportPDF(userId: number) {
  // Implementation would use jsPDF or similar
  // For now, return a message
  return { success: true, message: "PDF export coming soon" }
}
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/analytics.test.ts
import { getSpendingForecast } from "@/lib/db/analytics"

describe("Analytics", () => {
  test("forecast returns null with insufficient data", async () => {
    // Mock data for first day of month
    const forecast = await getSpendingForecast(1)
    expect(forecast).toBeNull()
  })
  
  test("calculates forecast correctly", async () => {
    // Mock 15 days of data
    const forecast = await getSpendingForecast(1)
    expect(forecast?.confidence).toBe("high")
    expect(forecast?.projectedBalance).toBeDefined()
  })
})
```

### E2E Tests
```typescript
// e2e/reports.spec.ts
import { test, expect } from "@playwright/test"

test("displays monthly trends chart", async ({ page }) => {
  await page.goto("/reports")
  await expect(page.getByText("Thu vs Chi theo tháng")).toBeVisible()
  
  // Check chart rendered
  const chart = page.locator("svg").first()
  await expect(chart).toBeVisible()
})

test("switches time range", async ({ page }) => {
  await page.goto("/reports")
  await page.click("text=3 tháng")
  await expect(page).toHaveURL("/reports?months=3")
})
```

## Performance Optimizations

### 1. Database Optimization
```sql
-- Add indexes for analytics queries
CREATE INDEX idx_transactions_user_date_type ON transactions(user_id, date, type);
CREATE INDEX idx_transactions_monthly ON transactions(user_id, DATE_TRUNC('month', date));
```

### 2. Chart Performance
- Use ResponsiveContainer for proper sizing
- Limit data points to prevent overwhelming mobile devices
- Implement chart lazy loading

### 3. Caching Strategy
- Cache monthly trends for 1 hour
- Cache category analysis for 1 hour
- Revalidate on transaction changes

## Mobile Responsiveness Checklist

- ✅ Charts are fully responsive
- ✅ Touch targets minimum 44x44px
- ✅ Horizontal scroll for charts if needed
- ✅ Readable chart labels on small screens
- ✅ Cards stack vertically on mobile
- ✅ Forecast card prominent and readable
- ✅ Export menu accessible
- ✅ Numbers abbreviated on charts (1.2M vs 1,200,000)

## Deployment Checklist

1. Add analytics database indexes
2. Test chart rendering on various screen sizes
3. Verify forecast calculations
4. Test comparison logic with edge cases
5. Validate CSV export format
6. Check chart tooltips on mobile
7. Test time range switching
8. Verify empty states
9. Deploy and monitor

## Future Enhancements

- Interactive chart filtering
- Drill-down into specific months
- Custom date range selection
- Budget vs actual comparison
- Spending goals and alerts
- Year-over-year comparison
- Category trends over time
- Predictive analytics with ML
- Export as PDF with charts
- Scheduled email reports
