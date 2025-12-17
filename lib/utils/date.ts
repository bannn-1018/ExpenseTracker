export type TimeFilter = 'day' | 'week' | 'month' | 'year'

export function getDateRange(filter: TimeFilter): { start: Date; end: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (filter) {
    case 'day':
      return {
        start: today,
        end: now,
      }
    case 'week': {
      const startOfWeek = new Date(today)
      const day = startOfWeek.getDay()
      const diff = day === 0 ? 6 : day - 1 // Monday as first day
      startOfWeek.setDate(today.getDate() - diff)
      return {
        start: startOfWeek,
        end: now,
      }
    }
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      }
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
      }
  }
}

export function formatFilterLabel(filter: TimeFilter): string {
  const labels: Record<TimeFilter, string> = {
    day: 'Hôm nay',
    week: 'Tuần này',
    month: 'Tháng này',
    year: 'Năm này',
  }
  return labels[filter]
}
