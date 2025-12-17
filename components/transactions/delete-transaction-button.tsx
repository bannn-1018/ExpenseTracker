'use client'

import { deleteTransactionAction } from '@/app/actions/transaction-form'
import { useState } from 'react'

interface DeleteTransactionButtonProps {
  transactionId: number
}

export default function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      return
    }

    setIsDeleting(true)
    const formData = new FormData()
    await deleteTransactionAction(transactionId, formData)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {isDeleting ? 'Đang xóa...' : 'Xóa'}
    </button>
  )
}
