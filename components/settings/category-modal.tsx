'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useState } from 'react'
import type { Category } from '@/lib/db/types'
import { createCategoryAction, updateCategoryAction } from '@/app/actions/settings'
import type { SettingsFormState } from '@/app/actions/settings'

interface CategoryModalProps {
  category?: Category
  type: 'income' | 'expense'
  onClose: () => void
}

const ICONS = ['💰', '💵', '💸', '🍔', '🛒', '🏠', '🚗', '⛽', '🏥', '📚', '🎮', '🎬', '✈️', '🎁', '💼', '📱', '👕', '🎯']
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#06b6d4', '#14b8a6']

const initialState: SettingsFormState = {}

export function CategoryModal({ category, type, onClose }: CategoryModalProps) {
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || ICONS[0])
  const [selectedColor, setSelectedColor] = useState(category?.color || COLORS[0])
  const [name, setName] = useState(category?.name || '')

  const formAction = category
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction

  const [state, dispatch] = useFormState(formAction, initialState)

  useEffect(() => {
    if (state.success) {
      onClose()
    }
  }, [state.success, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form action={dispatch} className="space-y-6">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="icon" value={selectedIcon} />
            <input type="hidden" name="color" value={selectedColor} />

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                placeholder="Nhập tên danh mục"
                required
              />
            </div>

            {/* Icon Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn icon
              </label>
              <div className="grid grid-cols-9 gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg border-2 transition-all ${
                      selectedIcon === icon
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn màu
              </label>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-gray-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xem trước
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${selectedColor}20` }}
                >
                  {selectedIcon}
                </div>
                <span className="font-medium text-gray-900">
                  {name || 'Tên danh mục'}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {state.errors?._form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{state.errors._form[0]}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Đang lưu...' : 'Lưu'}
    </button>
  )
}
