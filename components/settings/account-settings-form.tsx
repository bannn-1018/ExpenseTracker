'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import type { UserSettings } from '@/lib/db/types'
import { updateSettingsAction } from '@/app/actions/settings'
import type { SettingsFormState } from '@/app/actions/settings'

interface AccountSettingsFormProps {
  settings: UserSettings
}

const initialState: SettingsFormState = {}

export function AccountSettingsForm({ settings }: AccountSettingsFormProps) {
  const [state, dispatch] = useFormState(updateSettingsAction, initialState)

  useEffect(() => {
    if (state.success) {
      // Could show a success toast here
      console.log('Settings updated successfully')
    }
  }, [state.success])

  return (
    <form action={dispatch} className="space-y-6">
      {/* Currency */}
      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
          Đơn vị tiền tệ
        </label>
        <select
          id="currency"
          name="currency"
          defaultValue={settings.currency}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="VND">VND - Việt Nam Đồng</option>
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
        </select>
      </div>

      {/* Theme */}
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
          Giao diện
        </label>
        <select
          id="theme"
          name="theme"
          defaultValue={settings.theme}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="light">Sáng</option>
          <option value="dark">Tối</option>
          <option value="auto">Tự động</option>
        </select>
      </div>

      {/* Language */}
      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
          Ngôn ngữ
        </label>
        <select
          id="language"
          name="language"
          defaultValue={settings.language}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Date Format */}
      <div>
        <label htmlFor="date_format" className="block text-sm font-medium text-gray-700 mb-2">
          Định dạng ngày tháng
        </label>
        <select
          id="date_format"
          name="date_format"
          defaultValue={settings.date_format}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
        </select>
      </div>

      {/* Notification Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo</h3>

        <div className="space-y-4">
          {/* Notification Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="notification_enabled" className="block text-sm font-medium text-gray-700">
                Bật thông báo nhắc nhở
              </label>
              <p className="text-sm text-gray-500">Nhận nhắc nhở hàng ngày để ghi chép chi tiêu</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="notification_enabled"
                name="notification_enabled"
                defaultChecked={settings.notification_enabled}
                value="true"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Notification Time */}
          <div>
            <label htmlFor="notification_time" className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian nhắc nhở
            </label>
            <input
              type="time"
              id="notification_time"
              name="notification_time"
              defaultValue={settings.notification_time}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {state.errors?._form && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{state.errors._form[0]}</p>
        </div>
      )}

      {/* Success Message */}
      {state.success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">✓ Đã lưu cài đặt thành công</p>
        </div>
      )}

      {/* Submit Button */}
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Đang lưu...' : 'Lưu thay đổi'}
    </button>
  )
}
