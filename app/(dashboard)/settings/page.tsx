import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUserSettings } from '@/lib/db/settings'
import { getCategoriesByUserId } from '@/lib/db/categories'
import { getCategoryUsageCount } from '@/lib/db/category-management'
import type { Category } from '@/lib/db/types'
import { AccountSettingsForm } from '@/components/settings/account-settings-form'
import { CategoryList } from '@/components/settings/category-list'
import { DataManagement } from '@/components/settings/data-management'

export const metadata = {
  title: 'Cài đặt - Expense Tracker',
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const userId = parseInt(session.user.id)

  // Fetch data in parallel
  const [settings, categories] = await Promise.all([
    getUserSettings(userId),
    getCategoriesByUserId(userId),
  ])

  // Get usage counts for all categories
  const usageCounts: Record<number, number> = {}
  await Promise.all(
    categories.map(async (category: Category) => {
      const count = await getCategoryUsageCount(userId, category.id)
      usageCounts[category.id] = count
    })
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý tài khoản và tùy chỉnh ứng dụng
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Account Settings Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Cài đặt tài khoản</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tùy chỉnh hiển thị và thông báo
            </p>
          </div>
          <div className="p-6">
            <AccountSettingsForm settings={settings} />
          </div>
        </section>

        {/* Category Management Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quản lý danh mục</h2>
            <p className="text-sm text-gray-600 mt-1">
              Thêm, chỉnh sửa hoặc xóa danh mục thu chi
            </p>
          </div>
          <div className="p-6">
            <CategoryList categories={categories} usageCounts={usageCounts} />
          </div>
        </section>

        {/* Data Management Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quản lý dữ liệu</h2>
            <p className="text-sm text-gray-600 mt-1">
              Xuất dữ liệu hoặc xóa tài khoản
            </p>
          </div>
          <div className="p-6">
            <DataManagement />
          </div>
        </section>

        {/* Profile Information (Read-only) */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin tài khoản</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{session.user.email}</p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                💡 Để thay đổi thông tin tài khoản, vui lòng liên hệ bộ phận hỗ trợ
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
