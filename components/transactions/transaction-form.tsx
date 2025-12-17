'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createTransactionAction, updateTransactionAction, type TransactionFormState } from '@/app/actions/transaction-form'
import type { Category } from '@/lib/db/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TransactionFormProps {
  mode: 'create' | 'edit'
  categories: {
    income: Category[]
    expense: Category[]
  }
  initialData?: {
    id: number
    amount: number
    type: 'income' | 'expense'
    categoryId: number
    date: string
    name: string
    note: string | null
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {pending ? 'Đang lưu...' : 'Lưu giao dịch'}
    </button>
  )
}

export default function TransactionForm({ mode, categories, initialData }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense')
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '')

  const action = mode === 'create' 
    ? createTransactionAction 
    : updateTransactionAction.bind(null, initialData!.id)

  const [state, formAction] = useFormState(action, {})

  const currentCategories = type === 'income' ? categories.income : categories.expense

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setAmount(value)
  }

  const formatCurrency = (value: string) => {
    if (!value) return ''
    return parseInt(value).toLocaleString('vi-VN')
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số tiền *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
            ₫
          </span>
          <input
            type="text"
            name="amount"
            value={formatCurrency(amount)}
            onChange={handleAmountChange}
            required
            className="w-full pl-12 pr-4 py-3 text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-left text-gray-900"
            placeholder="0"
          />
          <input type="hidden" name="amount" value={amount} />
        </div>
        {state.errors?.amount && (
          <p className="mt-1 text-sm text-red-600">{state.errors.amount[0]}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại giao dịch *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              'py-3 px-4 rounded-lg border-2 font-medium transition-colors',
              type === 'expense'
                ? 'border-expense bg-expense-light text-expense'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Chi tiêu
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              'py-3 px-4 rounded-lg border-2 font-medium transition-colors',
              type === 'income'
                ? 'border-income bg-income-light text-income'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Thu nhập
          </button>
        </div>
        <input type="hidden" name="type" value={type} />
        {state.errors?.type && (
          <p className="mt-1 text-sm text-red-600">{state.errors.type[0]}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={initialData?.categoryId}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
        >
          <option value="">Chọn danh mục</option>
          {currentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
        {state.errors?.categoryId && (
          <p className="mt-1 text-sm text-red-600">{state.errors.categoryId[0]}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Ngày *
        </label>
        <input
          type="date"
          id="date"
          name="date"
          required
          defaultValue={initialData?.date || new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
        />
        {state.errors?.date && (
          <p className="mt-1 text-sm text-red-600">{state.errors.date[0]}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Tên giao dịch *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialData?.name}
          placeholder="Ví dụ: Mua sắm tạp hóa"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
        />
        {state.errors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={initialData?.note || ''}
          placeholder="Thêm ghi chú (tùy chọn)"
          maxLength={200}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-gray-900"
        />
        {state.errors?.note && (
          <p className="mt-1 text-sm text-red-600">{state.errors.note[0]}</p>
        )}
      </div>

      {state.errors?._form && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {state.errors._form[0]}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
