'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { Category } from '@/lib/db/types'
import { cn } from '@/lib/utils'

interface FilterModalProps {
  categories: Category[]
}

export default function FilterModal({ categories }: FilterModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentType = searchParams.get('type') || 'all'
  const currentCategoryId = searchParams.get('categoryId')
  const currentStartDate = searchParams.get('startDate') || ''
  const currentEndDate = searchParams.get('endDate') || ''

  const [type, setType] = useState(currentType)
  const [categoryId, setCategoryId] = useState(currentCategoryId || '')
  const [startDate, setStartDate] = useState(currentStartDate)
  const [endDate, setEndDate] = useState(currentEndDate)

  const activeFiltersCount = [
    currentType !== 'all',
    currentCategoryId,
    currentStartDate,
    currentEndDate,
  ].filter(Boolean).length

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (type !== 'all') {
      params.set('type', type)
    } else {
      params.delete('type')
    }
    
    if (categoryId) {
      params.set('categoryId', categoryId)
    } else {
      params.delete('categoryId')
    }
    
    if (startDate) {
      params.set('startDate', startDate)
    } else {
      params.delete('startDate')
    }
    
    if (endDate) {
      params.set('endDate', endDate)
    } else {
      params.delete('endDate')
    }
    
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  const handleReset = () => {
    setType('all')
    setCategoryId('')
    setStartDate('')
    setEndDate('')
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete('type')
    params.delete('categoryId')
    params.delete('startDate')
    params.delete('endDate')
    params.set('page', '1')
    
    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  const filteredCategories = type === 'all' 
    ? categories 
    : categories.filter(c => c.type === type)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg
          className="h-5 w-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="font-medium">Lọc</span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-lg md:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Bộ lọc</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại giao dịch
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'income', 'expense'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setType(t)
                        setCategoryId('') // Reset category when changing type
                      }}
                      className={cn(
                        'py-2 px-3 rounded-lg border-2 font-medium transition-colors',
                        type === t
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {t === 'all' ? 'Tất cả' : t === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  id="categoryFilter"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng thời gian
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Đặt lại
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
