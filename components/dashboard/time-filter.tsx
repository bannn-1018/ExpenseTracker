'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { formatFilterLabel, type TimeFilter } from '@/lib/utils/date'
import { cn } from '@/lib/utils'

const filters: TimeFilter[] = ['day', 'week', 'month', 'year']

export default function TimeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentFilter = (searchParams.get('filter') as TimeFilter) || 'month'

  const handleFilterChange = (filter: TimeFilter) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', filter)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => handleFilterChange(filter)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
            currentFilter === filter
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          )}
        >
          {formatFilterLabel(filter)}
        </button>
      ))}
    </div>
  )
}
