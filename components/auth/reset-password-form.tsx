'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { resetPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {pending ? 'Đang xử lý...' : 'Gửi yêu cầu'}
    </button>
  )
}

export default function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPasswordAction, {})

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
        </div>

        {state.success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Yêu cầu đã được gửi!</p>
            <p className="mt-1 text-sm">
              Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.
            </p>
            <div className="mt-4">
              <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <form action={formAction} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                style={{ minHeight: '44px' }}
              />
              {state.errors?.email && (
                <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            {state.errors?._form && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {state.errors._form[0]}
              </div>
            )}

            <SubmitButton />

            <div className="text-center">
              <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
