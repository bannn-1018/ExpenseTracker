'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { updateUserSettings } from '@/lib/db/settings'
import { createCategory, updateCategory, deleteCategory } from '@/lib/db/category-management'

export interface SettingsFormState {
  errors?: {
    _form?: string[]
  }
  success?: boolean
}

export async function updateSettingsAction(
  prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await auth()

  if (!session?.user) {
    return {
      errors: {
        _form: ['Bạn cần đăng nhập để thực hiện thao tác này'],
      },
    }
  }

  const userId = parseInt(session.user.id)

  try {
    await updateUserSettings(userId, {
      currency: formData.get('currency') as string,
      theme: formData.get('theme') as string,
      language: formData.get('language') as string,
      date_format: formData.get('date_format') as string,
      notification_enabled: formData.get('notification_enabled') === 'true',
      notification_time: formData.get('notification_time') as string,
    })

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Update settings error:', error)
    return {
      errors: {
        _form: ['Đã có lỗi xảy ra. Vui lòng thử lại.'],
      },
    }
  }
}

export async function createCategoryAction(
  prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await auth()

  if (!session?.user) {
    return {
      errors: {
        _form: ['Bạn cần đăng nhập để thực hiện thao tác này'],
      },
    }
  }

  const userId = parseInt(session.user.id)
  const name = formData.get('name') as string
  const icon = formData.get('icon') as string
  const type = formData.get('type') as 'income' | 'expense'
  const color = formData.get('color') as string

  if (!name || !icon || !type || !color) {
    return {
      errors: {
        _form: ['Vui lòng điền đầy đủ thông tin'],
      },
    }
  }

  try {
    await createCategory(userId, name, icon, type, color)
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Create category error:', error)
    return {
      errors: {
        _form: ['Đã có lỗi xảy ra. Vui lòng thử lại.'],
      },
    }
  }
}

export async function updateCategoryAction(
  categoryId: number,
  prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await auth()

  if (!session?.user) {
    return {
      errors: {
        _form: ['Bạn cần đăng nhập để thực hiện thao tác này'],
      },
    }
  }

  const userId = parseInt(session.user.id)

  try {
    await updateCategory(userId, categoryId, {
      name: formData.get('name') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
    })

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Update category error:', error)
    return {
      errors: {
        _form: ['Đã có lỗi xảy ra. Vui lòng thử lại.'],
      },
    }
  }
}

export async function deleteCategoryAction(categoryId: number): Promise<void> {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const userId = parseInt(session.user.id)

  try {
    await deleteCategory(userId, categoryId)
    revalidatePath('/settings')
  } catch (error) {
    console.error('Delete category error:', error)
    throw error
  }
}
