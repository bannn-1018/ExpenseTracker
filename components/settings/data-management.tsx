'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'

export function DataManagement() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleExportData = () => {
    startTransition(() => {
      // In a real app, this would trigger a download of user's data
      alert('Chức năng xuất dữ liệu đang được phát triển')
    })
  }

  const handleDeleteAccount = () => {
    startTransition(async () => {
      // In a real app, this would call an API to delete the account
      alert('Chức năng xóa tài khoản đang được phát triển')
      setShowDeleteConfirm(false)
      // After successful deletion, sign out
      // await signOut({ callbackUrl: '/' })
    })
  }

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Xuất dữ liệu</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tải xuống toàn bộ dữ liệu giao dịch của bạn dưới định dạng CSV
        </p>
        <button
          onClick={handleExportData}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
        >
          {isPending ? 'Đang xuất...' : 'Xuất dữ liệu'}
        </button>
      </div>

      {/* Delete Account */}
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Xóa tài khoản</h3>
        <p className="text-sm text-red-600 mb-4">
          Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn. Hành động này không thể hoàn tác.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          Xóa tài khoản
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Xác nhận xóa tài khoản
                  </h3>
                  <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  Bạn có chắc chắn muốn xóa tài khoản? Toàn bộ dữ liệu sau sẽ bị xóa vĩnh viễn:
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    Tất cả giao dịch
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    Danh mục tùy chỉnh
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    Cài đặt cá nhân
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    Thông tin tài khoản
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Đang xóa...' : 'Xóa tài khoản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
