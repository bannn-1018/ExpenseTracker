# Technical Plan: Dashboard (Tổng quan)

**Feature Branch**: `002-dashboard`  
**Created**: December 17, 2025  
**Tech Stack**: Next.js 14+ (App Router), Vercel Postgres, Chart.js  
**Estimated Effort**: 4-6 days

## Architecture Overview

### Tech Stack Components
- **Frontend**: Next.js 14+ with App Router, React Server Components
- **Database**: Vercel Postgres (PostgreSQL)
- **Charts**: Chart.js / Recharts (React-friendly)
- **UI Components**: Tailwind CSS, shadcn/ui
- **Data Fetching**: React Server Components + Server Actions
- **Caching**: Next.js unstable_cache
- **Mobile**: Responsive design with pull-to-refresh

### Database Schema

```sql
-- Transactions table (shared across features)
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  amount DECIMAL(12, 2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  name VARCHAR(255) NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  color VARCHAR(7) NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0
);

-- Indexes for dashboard queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_categories_user_type ON categories(user_id, type);

-- Materialized view for dashboard summary (optional, for performance)
CREATE MATERIALIZED VIEW dashboard_summary AS
SELECT 
  user_id,
  DATE_TRUNC('day', date) as period,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
FROM transactions
GROUP BY user_id, DATE_TRUNC('day', date);

CREATE INDEX idx_dashboard_summary ON dashboard_summary(user_id, period);
```

## Implementation Plan

### Phase 1: Data Layer & Utilities (Day 1)

#### 1.1 Database Helper Functions
**File**: `lib/db/dashboard.ts`
```typescript
import { sql } from "@vercel/postgres"
import { unstable_cache } from "next/cache"

export type TimeFilter = "day" | "week" | "month" | "year"

function getDateRange(filter: TimeFilter) {
  const now = new Date()
  let startDate: Date
  
  switch (filter) {
    case "day":
      startDate = new Date(now.setHours(0, 0, 0, 0))
      break
    case "week":
      const dayOfWeek = now.getDay()
      startDate = new Date(now.setDate(now.getDate() - dayOfWeek))
      startDate.setHours(0, 0, 0, 0)
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
  }
  
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  }
}

export async function getDashboardSummary(
  userId: number,
  filter: TimeFilter = "month"
) {
  const { startDate, endDate } = getDateRange(filter)
  
  const result = await sql`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
    FROM transactions
    WHERE user_id = ${userId}
      AND date >= ${startDate}
      AND date <= ${endDate}
  `
  
  const row = result.rows[0]
  const totalIncome = parseFloat(row.total_income)
  const totalExpense = parseFloat(row.total_expense)
  
  return {
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense
  }
}

export async function getCategoryBreakdown(
  userId: number,
  filter: TimeFilter = "month"
) {
  const { startDate, endDate } = getDateRange(filter)
  
  const result = await sql`
    SELECT 
      c.id,
      c.name,
      c.icon,
      c.color,
      COALESCE(SUM(t.amount), 0) as total,
      COUNT(t.id) as transaction_count
    FROM categories c
    LEFT JOIN transactions t ON c.id = t.category_id 
      AND t.user_id = ${userId}
      AND t.type = 'expense'
      AND t.date >= ${startDate}
      AND t.date <= ${endDate}
    WHERE c.user_id = ${userId} OR c.is_system = true
    GROUP BY c.id, c.name, c.icon, c.color
    HAVING COALESCE(SUM(t.amount), 0) > 0
    ORDER BY total DESC
  `
  
  const totalExpense = result.rows.reduce(
    (sum, row) => sum + parseFloat(row.total), 
    0
  )
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    amount: parseFloat(row.total),
    percentage: totalExpense > 0 
      ? (parseFloat(row.total) / totalExpense) * 100 
      : 0,
    transactionCount: parseInt(row.transaction_count)
  }))
}

export async function getRecentTransactions(
  userId: number,
  limit: number = 5
) {
  const result = await sql`
    SELECT 
      t.id,
      t.name,
      t.amount,
      t.type,
      t.date,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ${userId}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT ${limit}
  `
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    amount: parseFloat(row.amount),
    type: row.type,
    date: row.date,
    category: {
      name: row.category_name,
      icon: row.category_icon,
      color: row.category_color
    }
  }))
}

// Cached versions for better performance
export const getCachedDashboardSummary = unstable_cache(
  getDashboardSummary,
  ["dashboard-summary"],
  { revalidate: 60, tags: ["transactions"] }
)

export const getCachedCategoryBreakdown = unstable_cache(
  getCategoryBreakdown,
  ["category-breakdown"],
  { revalidate: 60, tags: ["transactions"] }
)

export const getCachedRecentTransactions = unstable_cache(
  getRecentTransactions,
  ["recent-transactions"],
  { revalidate: 30, tags: ["transactions"] }
)
```

#### 1.2 Currency Formatter Utility
**File**: `lib/utils/currency.ts`
```typescript
export function formatCurrency(amount: number, currency: string = "VND"): string {
  if (currency === "VND") {
    return `₫${amount.toLocaleString("vi-VN", { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`
  }
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency
  }).format(amount)
}

export function getAmountColor(amount: number, type: "income" | "expense" | "balance"): string {
  if (type === "income") return "text-green-600"
  if (type === "expense") return "text-red-600"
  return amount >= 0 ? "text-green-600" : "text-red-600"
}
```

### Phase 2: Dashboard Page & Layout (Day 2)

#### 2.1 Dashboard Page
**File**: `app/(dashboard)/dashboard/page.tsx`
```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BalanceCards } from "@/components/dashboard/balance-cards"
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { TimeFilterTabs } from "@/components/dashboard/time-filter-tabs"
import { PullToRefresh } from "@/components/dashboard/pull-to-refresh"

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { filter?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  const filter = (searchParams.filter || "month") as TimeFilter
  
  return (
    <PullToRefresh>
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-white border-b px-4 py-4">
          <h1 className="text-2xl font-bold">Tổng quan</h1>
        </header>
        
        <div className="p-4 space-y-6">
          <TimeFilterTabs currentFilter={filter} />
          
          <BalanceCards userId={parseInt(session.user.id)} filter={filter} />
          
          <CategoryPieChart userId={parseInt(session.user.id)} filter={filter} />
          
          <RecentTransactions userId={parseInt(session.user.id)} />
        </div>
      </div>
    </PullToRefresh>
  )
}
```

#### 2.2 Time Filter Component
**File**: `components/dashboard/time-filter-tabs.tsx`
```typescript
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const FILTERS = [
  { label: "Ngày", value: "day" },
  { label: "Tuần", value: "week" },
  { label: "Tháng", value: "month" },
  { label: "Năm", value: "year" }
]

export function TimeFilterTabs({ currentFilter }: { currentFilter: string }) {
  const router = useRouter()
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => router.push(`/dashboard?filter=${filter.value}`)}
          className={cn(
            "px-4 py-2 rounded-full min-h-[44px] whitespace-nowrap transition-colors",
            "min-w-[80px] touch-manipulation",
            currentFilter === filter.value
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
```

### Phase 3: Balance Cards Component (Day 2)

**File**: `components/dashboard/balance-cards.tsx`
```typescript
import { getCachedDashboardSummary } from "@/lib/db/dashboard"
import { formatCurrency, getAmountColor } from "@/lib/utils/currency"
import { ArrowUpIcon, ArrowDownIcon, WalletIcon } from "lucide-react"

export async function BalanceCards({
  userId,
  filter
}: {
  userId: number
  filter: TimeFilter
}) {
  const summary = await getCachedDashboardSummary(userId, filter)
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <WalletIcon className="w-5 h-5" />
          <span className="text-sm opacity-90">Tổng số dư</span>
        </div>
        <p className={cn(
          "text-3xl font-bold",
          summary.totalBalance < 0 && "text-red-200"
        )}>
          {formatCurrency(summary.totalBalance)}
        </p>
      </div>
      
      {/* Income & Expense Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 rounded">
              <ArrowDownIcon className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Tổng Thu</span>
          </div>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>
        
        {/* Expense Card */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-100 rounded">
              <ArrowUpIcon className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Tổng Chi</span>
          </div>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Phase 4: Category Pie Chart (Day 3)

#### 4.1 Server Component
**File**: `components/dashboard/category-pie-chart.tsx`
```typescript
import { getCachedCategoryBreakdown } from "@/lib/db/dashboard"
import { PieChartClient } from "./pie-chart-client"

export async function CategoryPieChart({
  userId,
  filter
}: {
  userId: number
  filter: TimeFilter
}) {
  const categories = await getCachedCategoryBreakdown(userId, filter)
  
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Chi tiêu theo danh mục</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có chi tiêu trong khoảng thời gian này</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg p-6 border">
      <h2 className="text-lg font-semibold mb-4">Chi tiêu theo danh mục</h2>
      <PieChartClient data={categories} />
    </div>
  )
}
```

#### 4.2 Client Component with Chart.js
**File**: `components/dashboard/pie-chart-client.tsx`
```typescript
"use client"

import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"
import { formatCurrency } from "@/lib/utils/currency"

ChartJS.register(ArcElement, Tooltip, Legend)

export function PieChartClient({ data }: { data: CategoryBreakdown[] }) {
  // Group small categories (< 5%) into "Khác"
  const threshold = 5
  let mainCategories = data.filter(cat => cat.percentage >= threshold)
  const otherCategories = data.filter(cat => cat.percentage < threshold)
  
  if (otherCategories.length > 0) {
    const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.amount, 0)
    const otherPercentage = otherCategories.reduce((sum, cat) => sum + cat.percentage, 0)
    
    mainCategories.push({
      id: -1,
      name: "Khác",
      icon: "more",
      color: "#9CA3AF",
      amount: otherTotal,
      percentage: otherPercentage,
      transactionCount: otherCategories.length
    })
  }
  
  const chartData = {
    labels: mainCategories.map(cat => cat.name),
    datasets: [{
      data: mainCategories.map(cat => cat.percentage),
      backgroundColor: mainCategories.map(cat => cat.color),
      borderWidth: 2,
      borderColor: "#fff"
    }]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const category = mainCategories[context.dataIndex]
            return [
              `${category.name}: ${category.percentage.toFixed(1)}%`,
              formatCurrency(category.amount)
            ]
          }
        }
      }
    }
  }
  
  return (
    <div className="max-w-md mx-auto">
      <Pie data={chartData} options={options} />
      
      {/* Category List */}
      <div className="mt-6 space-y-2">
        {mainCategories.map((category) => (
          <div 
            key={category.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm">{category.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatCurrency(category.amount)}
              </p>
              <p className="text-xs text-gray-500">
                {category.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Phase 5: Recent Transactions (Day 3)

**File**: `components/dashboard/recent-transactions.tsx`
```typescript
import { getCachedRecentTransactions } from "@/lib/db/dashboard"
import { formatCurrency } from "@/lib/utils/currency"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export async function RecentTransactions({ userId }: { userId: number }) {
  const transactions = await getCachedRecentTransactions(userId, 5)
  
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Giao dịch gần đây</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có giao dịch nào</p>
          <Link 
            href="/transactions/add"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg min-h-[44px]"
          >
            Thêm giao dịch
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Giao dịch gần đây</h2>
        <Link 
          href="/transactions"
          className="text-sm text-blue-600 hover:underline min-h-[44px] flex items-center"
        >
          Xem tất cả
        </Link>
      </div>
      
      <div className="space-y-1">
        {transactions.map((transaction) => (
          <Link
            key={transaction.id}
            href={`/transactions/${transaction.id}`}
            className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded min-h-[44px]"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: `${transaction.category.color}20` }}
              >
                {transaction.category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{transaction.name}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(transaction.date), "dd MMM", { locale: vi })}
                </p>
              </div>
            </div>
            <p className={cn(
              "font-semibold ml-2 flex-shrink-0",
              transaction.type === "income" ? "text-green-600" : "text-red-600"
            )}>
              {transaction.type === "expense" && "-"}
              {formatCurrency(transaction.amount)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### Phase 6: Pull-to-Refresh & Loading States (Day 4)

#### 6.1 Pull-to-Refresh Component
**File**: `components/dashboard/pull-to-refresh.tsx`
```typescript
"use client"

import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const threshold = 80
  
  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].pageY
    }
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (startY.current === 0) return
    
    const currentY = e.touches[0].pageY
    const distance = currentY - startY.current
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, threshold * 1.5))
      if (distance > threshold) {
        setIsPulling(true)
      }
    }
  }
  
  const handleTouchEnd = () => {
    if (isPulling) {
      router.refresh()
      setTimeout(() => {
        setIsPulling(false)
        setPullDistance(0)
      }, 1000)
    } else {
      setPullDistance(0)
    }
    startY.current = 0
  }
  
  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)
    
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isPulling])
  
  return (
    <>
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 flex justify-center items-center z-50"
          style={{ height: pullDistance }}
        >
          <div className={cn(
            "w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full",
            isPulling && "animate-spin"
          )} />
        </div>
      )}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </>
  )
}
```

#### 6.2 Loading Skeletons
**File**: `components/dashboard/loading-skeleton.tsx`
```typescript
export function BalanceCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 animate-pulse">
      <div className="bg-gray-200 rounded-lg h-32" />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-200 rounded-lg h-24" />
        <div className="bg-gray-200 rounded-lg h-24" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
      <div className="w-64 h-64 mx-auto bg-gray-200 rounded-full" />
    </div>
  )
}
```

**File**: `app/(dashboard)/dashboard/loading.tsx`
```typescript
import { BalanceCardsSkeleton, ChartSkeleton } from "@/components/dashboard/loading-skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-6">
        <BalanceCardsSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}
```

### Phase 7: Seed Default Categories (Day 4)

**File**: `lib/db/seed-categories.ts`
```typescript
import { sql } from "@vercel/postgres"

export async function seedDefaultCategories(userId: number) {
  const expenseCategories = [
    { name: "Ăn uống", icon: "🍽️", color: "#EF4444" },
    { name: "Di chuyển", icon: "🚗", color: "#F59E0B" },
    { name: "Mua sắm", icon: "🛍️", color: "#8B5CF6" },
    { name: "Giải trí", icon: "🎮", color: "#EC4899" },
    { name: "Nhà ở", icon: "🏠", color: "#3B82F6" },
    { name: "Sức khỏe", icon: "⚕️", color: "#10B981" },
    { name: "Giáo dục", icon: "📚", color: "#6366F1" },
    { name: "Khác", icon: "📝", color: "#6B7280" }
  ]
  
  const incomeCategories = [
    { name: "Lương", icon: "💰", color: "#10B981" },
    { name: "Thưởng", icon: "🎁", color: "#059669" },
    { name: "Đầu tư", icon: "📈", color: "#34D399" },
    { name: "Bán hàng", icon: "💵", color: "#10B981" },
    { name: "Khác", icon: "💸", color: "#6B7280" }
  ]
  
  for (const cat of expenseCategories) {
    await sql`
      INSERT INTO categories (user_id, name, icon, type, color, is_system)
      VALUES (${userId}, ${cat.name}, ${cat.icon}, 'expense', ${cat.color}, true)
      ON CONFLICT DO NOTHING
    `
  }
  
  for (const cat of incomeCategories) {
    await sql`
      INSERT INTO categories (user_id, name, icon, type, color, is_system)
      VALUES (${userId}, ${cat.name}, ${cat.icon}, 'income', ${cat.color}, true)
      ON CONFLICT DO NOTHING
    `
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/dashboard.test.ts
import { getDashboardSummary, getCategoryBreakdown } from "@/lib/db/dashboard"

describe("Dashboard Data", () => {
  test("calculates balance correctly", async () => {
    const summary = await getDashboardSummary(1, "month")
    expect(summary.totalBalance).toBe(
      summary.totalIncome - summary.totalExpense
    )
  })
  
  test("category percentages sum to 100", async () => {
    const breakdown = await getCategoryBreakdown(1, "month")
    const total = breakdown.reduce((sum, cat) => sum + cat.percentage, 0)
    expect(total).toBeCloseTo(100, 1)
  })
})
```

### E2E Tests
```typescript
// e2e/dashboard.spec.ts
import { test, expect } from "@playwright/test"

test("dashboard displays balance cards", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page.getByText("Tổng số dư")).toBeVisible()
  await expect(page.getByText("Tổng Thu")).toBeVisible()
  await expect(page.getByText("Tổng Chi")).toBeVisible()
})

test("time filter updates data", async ({ page }) => {
  await page.goto("/dashboard")
  await page.click("text=Tuần")
  await expect(page).toHaveURL("/dashboard?filter=week")
})
```

## Performance Optimization

### 1. Database Optimization
- Use indexes on frequently queried columns
- Consider materialized views for complex aggregations
- Implement query result caching

### 2. Next.js Caching
```typescript
// Use unstable_cache for expensive operations
export const revalidate = 60 // Revalidate every 60 seconds
```

### 3. Chart Performance
- Limit data points for large datasets
- Use canvas rendering (Chart.js) instead of SVG
- Implement lazy loading for charts

## Mobile Responsiveness Checklist

- ✅ All touch targets minimum 44x44px
- ✅ Cards stack vertically on mobile
- ✅ Horizontal scroll for time filters
- ✅ Pull-to-refresh gesture
- ✅ Responsive typography
- ✅ Safe area padding for notch devices
- ✅ Optimized chart size for small screens

## Deployment Checklist

1. Run database migrations
2. Seed default categories for existing users
3. Test all time filter combinations
4. Verify pull-to-refresh on mobile devices
5. Check chart rendering on various screen sizes
6. Validate currency formatting
7. Test loading states and error boundaries
8. Deploy and monitor performance metrics

## Future Enhancements

- Real-time updates with WebSockets
- Comparison with previous period
- Budget tracking and alerts
- Customizable dashboard widgets
- Export dashboard as PDF report
