import { sql } from '@vercel/postgres'

export interface MonthlyTrend {
  month: string
  year: number
  totalIncome: number
  totalExpense: number
  netBalance: number
}

export interface CategoryAnalysis {
  categoryId: number
  categoryName: string
  categoryIcon: string | null
  categoryColor: string | null
  total: number
  percentage: number
  transactionCount: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface SpendingForecast {
  currentMonthSpent: number
  daysInMonth: number
  daysPassed: number
  dailyAverage: number
  projectedEndOfMonth: number
  projectedBalance: number
  confidence: 'high' | 'medium' | 'low'
  warning: boolean
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

export async function getMonthlyTrends(
  userId: number,
  months: number = 6
): Promise<MonthlyTrend[]> {
  // Calculate start date
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { rows } = await sql`
    SELECT
      TO_CHAR(date, 'Mon') as month,
      EXTRACT(YEAR FROM date) as year,
      EXTRACT(MONTH FROM date) as month_num,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions
    WHERE user_id = ${userId}
      AND date >= ${startDateStr}
    GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date), TO_CHAR(date, 'Mon')
    ORDER BY year, month_num
  `

  return rows.map(row => ({
    month: row.month,
    year: parseInt(row.year),
    totalIncome: parseFloat(row.total_income),
    totalExpense: parseFloat(row.total_expense),
    netBalance: parseFloat(row.total_income) - parseFloat(row.total_expense),
  }))
}

export async function getCategoryAnalysis(
  userId: number,
  startDate: string,
  endDate: string
): Promise<CategoryAnalysis[]> {
  // Current period
  const { rows: currentRows } = await sql`
    SELECT
      c.id as category_id,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color,
      SUM(t.amount) as total,
      COUNT(t.id) as count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ${userId}
      AND t.type = 'expense'
      AND t.date >= ${startDate}
      AND t.date <= ${endDate}
    GROUP BY c.id, c.name, c.icon, c.color
  `

  const totalExpense = currentRows.reduce((sum, row) => sum + parseFloat(row.total), 0)

  // Previous period for trend calculation
  const daysDiff = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  const prevStartDate = new Date(new Date(startDate).getTime() - daysDiff * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const prevEndDate = startDate

  const { rows: prevRows } = await sql`
    SELECT
      c.id as category_id,
      SUM(t.amount) as total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ${userId}
      AND t.type = 'expense'
      AND t.date >= ${prevStartDate}
      AND t.date < ${prevEndDate}
    GROUP BY c.id
  `

  const prevTotals = new Map(prevRows.map(row => [row.category_id, parseFloat(row.total)]))

  return currentRows.map(row => {
    const currentTotal = parseFloat(row.total)
    const prevTotal = prevTotals.get(row.category_id) || 0
    const change = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0

    return {
      categoryId: row.category_id,
      categoryName: row.category_name,
      categoryIcon: row.category_icon,
      categoryColor: row.category_color,
      total: currentTotal,
      percentage: totalExpense > 0 ? (currentTotal / totalExpense) * 100 : 0,
      transactionCount: parseInt(row.count),
      trend: (change > 5 ? 'up' : change < -5 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      trendPercentage: Math.abs(change),
    }
  }).sort((a, b) => b.total - a.total)
}

export async function getSpendingForecast(userId: number): Promise<SpendingForecast | null> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysInMonth = endOfMonth.getDate()
  const daysPassed = now.getDate()

  // Need at least 3 days of data
  if (daysPassed < 3) {
    return null
  }

  const { rows } = await sql`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions
    WHERE user_id = ${userId}
      AND date >= ${startOfMonth.toISOString().split('T')[0]}
      AND date <= ${now.toISOString().split('T')[0]}
  `

  const currentIncome = parseFloat(rows[0]?.total_income || '0')
  const currentExpense = parseFloat(rows[0]?.total_expense || '0')
  const dailyAverage = currentExpense / daysPassed
  const projectedExpense = dailyAverage * daysInMonth
  const projectedBalance = currentIncome - projectedExpense

  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (daysPassed >= 20) confidence = 'high'
  else if (daysPassed >= 10) confidence = 'medium'

  return {
    currentMonthSpent: currentExpense,
    daysInMonth,
    daysPassed,
    dailyAverage,
    projectedEndOfMonth: projectedExpense,
    projectedBalance,
    confidence,
    warning: projectedBalance < 0,
  }
}

export async function getPeriodComparison(
  userId: number,
  currentStart: string,
  currentEnd: string
): Promise<PeriodComparison> {
  const daysDiff = Math.floor((new Date(currentEnd).getTime() - new Date(currentStart).getTime()) / (1000 * 60 * 60 * 24))
  const prevStart = new Date(new Date(currentStart).getTime() - (daysDiff + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const prevEnd = new Date(new Date(currentStart).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [current, previous] = await Promise.all([
    sql`
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE user_id = ${userId}
        AND date >= ${currentStart}
        AND date <= ${currentEnd}
    `,
    sql`
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE user_id = ${userId}
        AND date >= ${prevStart}
        AND date <= ${prevEnd}
    `,
  ])

  const currentIncome = parseFloat(current.rows[0]?.total_income || '0')
  const currentExpense = parseFloat(current.rows[0]?.total_expense || '0')
  const previousIncome = parseFloat(previous.rows[0]?.total_income || '0')
  const previousExpense = parseFloat(previous.rows[0]?.total_expense || '0')

  const calcChange = (current: number, previous: number) =>
    previous > 0 ? ((current - previous) / previous) * 100 : 0

  return {
    currentIncome,
    currentExpense,
    currentBalance: currentIncome - currentExpense,
    previousIncome,
    previousExpense,
    previousBalance: previousIncome - previousExpense,
    incomeChange: calcChange(currentIncome, previousIncome),
    expenseChange: calcChange(currentExpense, previousExpense),
    balanceChange: calcChange(currentIncome - currentExpense, previousIncome - previousExpense),
  }
}
