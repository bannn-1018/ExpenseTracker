'use client'

import { useState } from 'react'
import type { Category } from '@/lib/db/types'
import { CategoryModal } from './category-modal'
import { DeleteCategoryModal } from './delete-category-modal'

interface CategoryListProps {
  categories: Category[]
  usageCounts: Record<number, number>
}

export function CategoryList({ categories, usageCounts }: CategoryListProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<'income' | 'expense'>('expense')

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <>
      <div className="space-y-8">
        {/* Income Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Danh mục Thu nhập</h3>
            <button
              onClick={() => {
                setAddType('income')
                setShowAddModal(true)
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-income rounded-lg hover:bg-income/90 transition-colors"
            >
              + Thêm danh mục
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                usageCount={usageCounts[category.id] || 0}
                onEdit={() => setEditingCategory(category)}
                onDelete={() => setDeletingCategory(category)}
              />
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Danh mục Chi tiêu</h3>
            <button
              onClick={() => {
                setAddType('expense')
                setShowAddModal(true)
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-expense rounded-lg hover:bg-expense/90 transition-colors"
            >
              + Thêm danh mục
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                usageCount={usageCounts[category.id] || 0}
                onEdit={() => setEditingCategory(category)}
                onDelete={() => setDeletingCategory(category)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <CategoryModal
          type={addType}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          type={editingCategory.type}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {/* Delete Category Modal */}
      {deletingCategory && (
        <DeleteCategoryModal
          category={deletingCategory}
          usageCount={usageCounts[deletingCategory.id] || 0}
          onClose={() => setDeletingCategory(null)}
        />
      )}
    </>
  )
}

interface CategoryCardProps {
  category: Category
  usageCount: number
  onEdit: () => void
  onDelete: () => void
}

function CategoryCard({ category, usageCount, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {category.icon}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{category.name}</h4>
            <p className="text-sm text-gray-500">
              {usageCount} giao dịch
            </p>
          </div>
        </div>
        {category.is_system && (
          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
            Mặc định
          </span>
        )}
      </div>
      {!category.is_system && (
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Xóa
          </button>
        </div>
      )}
    </div>
  )
}
