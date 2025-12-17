# Technical Plan: Settings & Category Management (Cài đặt & Quản lý Danh mục)

**Feature Branch**: `006-settings-categories`  
**Created**: December 17, 2025  
**Tech Stack**: Next.js 14+ (App Router), Vercel Postgres, Web Push API  
**Estimated Effort**: 4-5 days

## Architecture Overview

### Tech Stack Components
- **Frontend**: Next.js 14+ with App Router, React Server Components
- **Database**: Vercel Postgres (PostgreSQL)
- **Notifications**: Web Push API / OneSignal
- **UI Components**: Tailwind CSS, shadcn/ui
- **Theme**: next-themes
- **Icons**: Emoji Mart or custom icon set
- **Storage**: Vercel Blob (for data export)

### Database Schema Updates

```sql
-- Add user settings table
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) DEFAULT 'VND',
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'vi',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  notification_enabled BOOLEAN DEFAULT FALSE,
  notification_time TIME DEFAULT '21:00:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table already exists, add unique constraint
ALTER TABLE categories ADD CONSTRAINT unique_user_category_name 
  UNIQUE (user_id, name, type);

-- Add indexes
CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
```

## Implementation Plan

### Phase 1: Settings Infrastructure (Day 1)

#### 1.1 Settings Database Functions
**File**: `lib/db/settings.ts`
```typescript
import { sql } from "@vercel/postgres"

export interface UserSettings {
  currency: string
  theme: string
  language: string
  dateFormat: string
  notificationEnabled: boolean
  notificationTime: string
}

export async function getUserSettings(userId: number): Promise<UserSettings> {
  const result = await sql`
    SELECT * FROM user_settings WHERE user_id = ${userId}
  `
  
  if (result.rows.length === 0) {
    // Create default settings
    await sql`
      INSERT INTO user_settings (user_id)
      VALUES (${userId})
    `
    
    return {
      currency: "VND",
      theme: "system",
      language: "vi",
      dateFormat: "DD/MM/YYYY",
      notificationEnabled: false,
      notificationTime: "21:00:00"
    }
  }
  
  const row = result.rows[0]
  return {
    currency: row.currency,
    theme: row.theme,
    language: row.language,
    dateFormat: row.date_format,
    notificationEnabled: row.notification_enabled,
    notificationTime: row.notification_time
  }
}

export async function updateUserSettings(
  userId: number,
  settings: Partial<UserSettings>
) {
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1
  
  Object.entries(settings).forEach(([key, value]) => {
    const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
    updates.push(`${dbKey} = $${paramIndex}`)
    values.push(value)
    paramIndex++
  })
  
  values.push(userId)
  
  await sql.query(
    `UPDATE user_settings 
     SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $${paramIndex}`,
    values
  )
}
```

#### 1.2 Category Management Functions
**File**: `lib/db/category-management.ts`
```typescript
import { sql } from "@vercel/postgres"
import { revalidateTag } from "next/cache"

export async function createCategory(
  userId: number,
  name: string,
  icon: string,
  type: "income" | "expense",
  color: string
) {
  const result = await sql`
    INSERT INTO categories (user_id, name, icon, type, color, is_system)
    VALUES (${userId}, ${name}, ${icon}, ${type}, ${color}, false)
    RETURNING id
  `
  
  revalidateTag("categories")
  return result.rows[0].id
}

export async function updateCategory(
  userId: number,
  categoryId: number,
  updates: { name?: string; icon?: string; color?: string }
) {
  const setClauses: string[] = []
  const values: any[] = []
  let paramIndex = 1
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      setClauses.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })
  
  values.push(categoryId, userId)
  
  await sql.query(
    `UPDATE categories 
     SET ${setClauses.join(", ")}
     WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} AND is_system = false`,
    values
  )
  
  revalidateTag("categories")
}

export async function deleteCategory(userId: number, categoryId: number) {
  // Get default "Other" category
  const otherCategory = await sql`
    SELECT id FROM categories
    WHERE user_id = ${userId} AND name = 'Khác' AND is_system = true
  `
  
  if (otherCategory.rows.length === 0) {
    throw new Error("Default category not found")
  }
  
  const otherId = otherCategory.rows[0].id
  
  // Reassign transactions
  await sql`
    UPDATE transactions
    SET category_id = ${otherId}
    WHERE category_id = ${categoryId} AND user_id = ${userId}
  `
  
  // Delete category
  await sql`
    DELETE FROM categories
    WHERE id = ${categoryId} AND user_id = ${userId} AND is_system = false
  `
  
  revalidateTag("categories")
  revalidateTag("transactions")
}

export async function getCategoryUsageCount(
  userId: number,
  categoryId: number
): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM transactions
    WHERE user_id = ${userId} AND category_id = ${categoryId}
  `
  
  return parseInt(result.rows[0].count)
}
```

### Phase 2: Settings Page Layout (Day 2)

**File**: `app/(dashboard)/settings/page.tsx`
```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUserSettings } from "@/lib/db/settings"
import { getCategories } from "@/lib/db/categories"
import { SettingsSection } from "@/components/settings/settings-section"
import { CategoryManagementSection } from "@/components/settings/category-management"
import { AccountSection } from "@/components/settings/account-section"
import { DataManagementSection } from "@/components/settings/data-management"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  const userId = parseInt(session.user.id)
  const [settings, categories] = await Promise.all([
    getUserSettings(userId),
    getCategories(userId)
  ])
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-4 py-4">
        <h1 className="text-2xl font-bold">Cài đặt</h1>
      </header>
      
      <div className="p-4 space-y-6">
        {/* Category Management */}
        <CategoryManagementSection 
          categories={categories}
          userId={userId}
        />
        
        {/* App Settings */}
        <SettingsSection settings={settings} userId={userId} />
        
        {/* Account Settings */}
        <AccountSection user={session.user} />
        
        {/* Data Management */}
        <DataManagementSection userId={userId} />
      </div>
    </div>
  )
}
```

### Phase 3: Category Management (Day 2-3)

**File**: `components/settings/category-management.tsx`
```typescript
"use client"

import { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryDialog } from "./category-dialog"
import { deleteCategoryAction } from "@/app/actions/categories"
import { useRouter } from "next/navigation"

export function CategoryManagementSection({
  categories,
  userId
}: {
  categories: Category[]
  userId: number
}) {
  const router = useRouter()
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  
  const expenseCategories = categories.filter(c => c.type === "expense")
  const incomeCategories = categories.filter(c => c.type === "income")
  
  const handleDelete = async (categoryId: number, isSystem: boolean) => {
    if (isSystem) {
      alert("Không thể xóa danh mục mặc định")
      return
    }
    
    if (!confirm("Xóa danh mục này? Các giao dịch sẽ được chuyển sang 'Khác'")) {
      return
    }
    
    await deleteCategoryAction(userId, categoryId)
    router.refresh()
  }
  
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Quản lý danh mục</h2>
        <Button
          onClick={() => {
            setSelectedCategory(null)
            setDialogMode("create")
          }}
          size="sm"
          className="min-h-[40px]"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>
      
      {/* Expense Categories */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Chi tiêu</h3>
        <div className="space-y-2">
          {expenseCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onEdit={() => {
                setSelectedCategory(category)
                setDialogMode("edit")
              }}
              onDelete={() => handleDelete(category.id, category.isSystem)}
            />
          ))}
        </div>
      </div>
      
      {/* Income Categories */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Thu nhập</h3>
        <div className="space-y-2">
          {incomeCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onEdit={() => {
                setSelectedCategory(category)
                setDialogMode("edit")
              }}
              onDelete={() => handleDelete(category.id, category.isSystem)}
            />
          ))}
        </div>
      </div>
      
      <CategoryDialog
        mode={dialogMode}
        category={selectedCategory}
        userId={userId}
        onClose={() => {
          setDialogMode(null)
          setSelectedCategory(null)
        }}
      />
    </div>
  )
}

function CategoryItem({
  category,
  onEdit,
  onDelete
}: {
  category: Category
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg min-h-[56px]">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${category.color}30` }}
      >
        {category.icon}
      </div>
      
      <span className="flex-1 font-medium">{category.name}</span>
      
      {!category.isSystem && (
        <div className="flex gap-2">
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="min-w-[40px] min-h-[40px] p-2"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="min-w-[40px] min-h-[40px] p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {category.isSystem && (
        <span className="text-xs text-gray-400">Mặc định</span>
      )}
    </div>
  )
}
```

**File**: `components/settings/category-dialog.tsx`
```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { IconPicker } from "./icon-picker"
import { ColorPicker } from "./color-picker"
import {
  createCategoryAction,
  updateCategoryAction
} from "@/app/actions/categories"

export function CategoryDialog({
  mode,
  category,
  userId,
  onClose
}: {
  mode: "create" | "edit" | null
  category: Category | null
  userId: number
  onClose: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("📝")
  const [color, setColor] = useState("#6B7280")
  const [type, setType] = useState<"income" | "expense">("expense")
  
  useEffect(() => {
    if (mode === "edit" && category) {
      setName(category.name)
      setIcon(category.icon)
      setColor(category.color)
      setType(category.type)
    } else {
      setName("")
      setIcon("📝")
      setColor("#6B7280")
      setType("expense")
    }
  }, [mode, category])
  
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên danh mục")
      return
    }
    
    try {
      if (mode === "create") {
        await createCategoryAction(userId, name, icon, type, color)
      } else if (mode === "edit" && category) {
        await updateCategoryAction(userId, category.id, { name, icon, color })
      }
      
      router.refresh()
      onClose()
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng thử lại")
    }
  }
  
  return (
    <Dialog open={mode !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm danh mục mới" : "Sửa danh mục"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {mode === "create" && (
            <div>
              <Label>Loại</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  onClick={() => setType("expense")}
                  className="flex-1 min-h-[44px]"
                >
                  Chi tiêu
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  onClick={() => setType("income")}
                  className="flex-1 min-h-[44px]"
                >
                  Thu nhập
                </Button>
              </div>
            </div>
          )}
          
          <div>
            <Label>Tên danh mục</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cà phê, Du lịch..."
              className="mt-2 min-h-[44px]"
              maxLength={50}
            />
          </div>
          
          <div>
            <Label>Icon</Label>
            <IconPicker selected={icon} onSelect={setIcon} />
          </div>
          
          <div>
            <Label>Màu sắc</Label>
            <ColorPicker selected={color} onSelect={setColor} />
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 min-h-[44px]"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 min-h-[44px]"
          >
            {mode === "create" ? "Thêm" : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**File**: `components/settings/icon-picker.tsx`
```typescript
"use client"

const ICONS = [
  "🍽️", "🚗", "🛍️", "🎮", "🏠", "⚕️", "📚", "💰",
  "🎁", "📈", "💵", "💸", "✈️", "🎬", "🎵", "🏋️",
  "📱", "💻", "👔", "🎨", "🐕", "🌿", "☕", "🍕",
  "🚇", "⛽", "💊", "🎓", "📝", "🔧", "🎯", "🎪"
]

export function IconPicker({
  selected,
  onSelect
}: {
  selected: string
  onSelect: (icon: string) => void
}) {
  return (
    <div className="grid grid-cols-8 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
      {ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onSelect(icon)}
          className={`
            w-12 h-12 text-2xl rounded-lg hover:bg-gray-100
            ${selected === icon ? "bg-blue-100 ring-2 ring-blue-600" : ""}
          `}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
```

**File**: `components/settings/color-picker.tsx`
```typescript
"use client"

const COLORS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#6B7280", "#14B8A6", "#F97316", "#84CC16"
]

export function ColorPicker({
  selected,
  onSelect
}: {
  selected: string
  onSelect: (color: string) => void
}) {
  return (
    <div className="flex gap-2 mt-2 flex-wrap">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className={`
            w-12 h-12 rounded-lg border-2 transition-all
            ${selected === color ? "border-gray-900 scale-110" : "border-gray-200"}
          `}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}
```

### Phase 4: App Settings (Day 3)

**File**: `components/settings/settings-section.tsx`
```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CurrencySelector } from "./currency-selector"
import { updateSettingsAction } from "@/app/actions/settings"

export function SettingsSection({
  settings,
  userId
}: {
  settings: UserSettings
  userId: number
}) {
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    settings.notificationEnabled
  )
  
  const handleCurrencyChange = async (currency: string) => {
    await updateSettingsAction(userId, { currency })
    router.refresh()
  }
  
  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && "Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        alert("Vui lòng cho phép thông báo trong cài đặt trình duyệt")
        return
      }
    }
    
    setNotificationsEnabled(enabled)
    await updateSettingsAction(userId, { notificationEnabled: enabled })
    router.refresh()
  }
  
  return (
    <div className="bg-white rounded-lg border divide-y">
      {/* Currency Setting */}
      <div className="p-4">
        <Label className="block mb-2">Tiền tệ</Label>
        <CurrencySelector
          selected={settings.currency}
          onSelect={handleCurrencyChange}
        />
      </div>
      
      {/* Notification Settings */}
      <div className="p-4 flex items-center justify-between min-h-[60px]">
        <div>
          <Label>Nhắc nhở hàng ngày</Label>
          <p className="text-sm text-gray-500 mt-1">
            Nhắc nhở ghi chép chi tiêu hàng ngày
          </p>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={handleNotificationToggle}
        />
      </div>
      
      {notificationsEnabled && (
        <div className="p-4">
          <Label>Thời gian nhắc nhở</Label>
          <input
            type="time"
            defaultValue={settings.notificationTime}
            onChange={async (e) => {
              await updateSettingsAction(userId, { 
                notificationTime: e.target.value 
              })
            }}
            className="mt-2 w-full p-2 border rounded-lg min-h-[44px]"
          />
        </div>
      )}
      
      {/* Theme Setting */}
      <div className="p-4">
        <Label className="block mb-2">Giao diện</Label>
        <ThemeSelector currentTheme={settings.theme} userId={userId} />
      </div>
    </div>
  )
}
```

**File**: `components/settings/currency-selector.tsx`
```typescript
"use client"

import { useState } from "react"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const CURRENCIES = [
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" }
]

export function CurrencySelector({
  selected,
  onSelect
}: {
  selected: string
  onSelect: (currency: string) => void
}) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  
  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  
  const selectedCurrency = CURRENCIES.find(c => c.code === selected)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start min-h-[44px]">
          {selectedCurrency?.symbol} {selectedCurrency?.code} - {selectedCurrency?.name}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chọn tiền tệ</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filtered.map((currency) => (
            <button
              key={currency.code}
              onClick={() => {
                onSelect(currency.code)
                setOpen(false)
              }}
              className="w-full p-3 text-left hover:bg-gray-100 rounded-lg min-h-[48px]"
            >
              <span className="font-medium">{currency.symbol} {currency.code}</span>
              <span className="text-sm text-gray-500 ml-2">- {currency.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**File**: `components/settings/theme-selector.tsx`
```typescript
"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

const THEMES = [
  { value: "light", label: "Sáng", icon: "☀️" },
  { value: "dark", label: "Tối", icon: "🌙" },
  { value: "system", label: "Hệ thống", icon: "💻" }
]

export function ThemeSelector({ 
  currentTheme,
  userId 
}: { 
  currentTheme: string
  userId: number 
}) {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="grid grid-cols-3 gap-2">
      {THEMES.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={cn(
            "p-3 rounded-lg border-2 transition-all min-h-[60px] flex flex-col items-center gap-2",
            theme === t.value
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <span className="text-2xl">{t.icon}</span>
          <span className="text-sm font-medium">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
```

### Phase 5: Account & Data Management (Day 4-5)

**File**: `components/settings/account-section.tsx`
```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from "./change-password-dialog"
import { LogoutButton } from "@/components/auth/logout-button"

export function AccountSection({ user }: { user: any }) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Tài khoản</h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        
        <Button
          onClick={() => setShowPasswordDialog(true)}
          variant="outline"
          className="w-full min-h-[44px]"
        >
          Đổi mật khẩu
        </Button>
        
        <LogoutButton />
      </div>
      
      <ChangePasswordDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
      />
    </div>
  )
}
```

**File**: `components/settings/data-management.tsx`
```typescript
"use client"

import { Button } from "@/components/ui/button"
import { 
  exportAllDataAction, 
  deleteAccountAction 
} from "@/app/actions/settings"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function DataManagementSection({ userId }: { userId: number }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleExport = async () => {
    const data = await exportAllDataAction(userId)
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: "application/json" 
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expense-tracker-data-${new Date().toISOString()}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  const handleDeleteAccount = async () => {
    const confirmation = prompt('Nhập "DELETE" để xác nhận xóa tài khoản:')
    
    if (confirmation !== "DELETE") {
      return
    }
    
    const password = prompt("Nhập mật khẩu để xác nhận:")
    if (!password) return
    
    setIsDeleting(true)
    
    try {
      await deleteAccountAction(userId, password)
      router.push("/login")
    } catch (error) {
      alert("Mật khẩu không đúng hoặc có lỗi xảy ra")
      setIsDeleting(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Quản lý dữ liệu</h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm text-gray-700 mb-2">
            Xuất tất cả dữ liệu của bạn (giao dịch, danh mục, cài đặt)
          </p>
          <Button
            onClick={handleExport}
            variant="outline"
            className="w-full min-h-[44px]"
          >
            Xuất tất cả dữ liệu
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-red-600 mb-2 font-medium">
            ⚠️ Nguy hiểm: Hành động này không thể hoàn tác
          </p>
          <p className="text-sm text-gray-700 mb-2">
            Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn
          </p>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="w-full min-h-[44px]"
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa tài khoản"}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**File**: `app/actions/settings.ts`
```typescript
"use server"

import { auth, signOut } from "@/auth"
import { sql } from "@vercel/postgres"
import { updateUserSettings } from "@/lib/db/settings"
import bcrypt from "bcryptjs"

export async function updateSettingsAction(
  userId: number,
  settings: Partial<UserSettings>
) {
  const session = await auth()
  if (!session?.user?.id || parseInt(session.user.id) !== userId) {
    throw new Error("Unauthorized")
  }
  
  await updateUserSettings(userId, settings)
}

export async function exportAllDataAction(userId: number) {
  const session = await auth()
  if (!session?.user?.id || parseInt(session.user.id) !== userId) {
    throw new Error("Unauthorized")
  }
  
  const [transactions, categories, settings] = await Promise.all([
    sql`SELECT * FROM transactions WHERE user_id = ${userId}`,
    sql`SELECT * FROM categories WHERE user_id = ${userId}`,
    sql`SELECT * FROM user_settings WHERE user_id = ${userId}`
  ])
  
  return {
    exportDate: new Date().toISOString(),
    user: { id: userId, email: session.user.email },
    transactions: transactions.rows,
    categories: categories.rows,
    settings: settings.rows[0]
  }
}

export async function deleteAccountAction(userId: number, password: string) {
  const session = await auth()
  if (!session?.user?.id || parseInt(session.user.id) !== userId) {
    throw new Error("Unauthorized")
  }
  
  // Verify password
  const user = await sql`SELECT password_hash FROM users WHERE id = ${userId}`
  const isValid = await bcrypt.compare(password, user.rows[0].password_hash)
  
  if (!isValid) {
    throw new Error("Invalid password")
  }
  
  // Delete all data (cascades will handle related data)
  await sql`DELETE FROM users WHERE id = ${userId}`
  
  await signOut({ redirectTo: "/login" })
}

export async function changePasswordAction(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  const session = await auth()
  if (!session?.user?.id || parseInt(session.user.id) !== userId) {
    throw new Error("Unauthorized")
  }
  
  const user = await sql`SELECT password_hash FROM users WHERE id = ${userId}`
  const isValid = await bcrypt.compare(currentPassword, user.rows[0].password_hash)
  
  if (!isValid) {
    return { error: "Mật khẩu hiện tại không đúng" }
  }
  
  if (newPassword.length < 8) {
    return { error: "Mật khẩu mới phải có ít nhất 8 ký tự" }
  }
  
  const newHash = await bcrypt.hash(newPassword, 10)
  await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${userId}`
  
  return { success: true }
}
```

**File**: `app/actions/categories.ts`
```typescript
"use server"

import { auth } from "@/auth"
import { 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "@/lib/db/category-management"

export async function createCategoryAction(
  userId: number,
  name: string,
  icon: string,
  type: "income" | "expense",
  color: string
) {
  const session = await auth()
  if (!session?.user?.id || parseInt(session.user.id) !== userId) {
    throw new Error("Unauthorized")
  }
  
  return await createCategory(userId, name, icon, type, color)
}

export async function updateCategoryAction(
  userId: number,
  categoryId: number,
  updates: { name?: string; icon?: string; color?: string }
) {
  const session = await auth()
  if (!session?.user?.id || parseInt(session.user.id) !== userId) {
    throw new Error("Unauthorized")
  }
  
  await updateCategory(userId, categoryId, updates)
}

export async function deleteCategoryAction(userId: number, categoryId: number) {
  const session = await auth()
  if (!session?.user?.id || parseInt(session.user.id) !== userId) {
    throw new Error("Unauthorized")
  }
  
  await deleteCategory(userId, categoryId)
}
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/category-management.test.ts
import { createCategory, deleteCategory } from "@/lib/db/category-management"

describe("Category Management", () => {
  test("creates custom category", async () => {
    const id = await createCategory(1, "Coffee", "☕", "expense", "#8B5CF6")
    expect(id).toBeGreaterThan(0)
  })
  
  test("prevents deleting system categories", async () => {
    await expect(deleteCategory(1, 1)).rejects.toThrow()
  })
})
```

### E2E Tests
```typescript
// e2e/settings.spec.ts
import { test, expect } from "@playwright/test"

test("manage categories", async ({ page }) => {
  await page.goto("/settings")
  
  // Add category
  await page.click("text=Thêm danh mục")
  await page.fill('input[placeholder*="Cà phê"]', "Coffee Shop")
  await page.click("button:has-text('Thêm')")
  
  await expect(page.getByText("Coffee Shop")).toBeVisible()
})
```

## Mobile Responsiveness Checklist

- ✅ Touch targets minimum 44x44px
- ✅ Icon picker grid optimized for mobile
- ✅ Color picker accessible on small screens
- ✅ Toggle switches large enough to tap
- ✅ Dialogs open as bottom sheets on mobile
- ✅ Settings sections collapsible
- ✅ Currency selector with search

## Deployment Checklist

1. Create user_settings table
2. Seed default categories for existing users
3. Test category CRUD operations
4. Verify notification permissions
5. Test theme switching
6. Validate data export format
7. Test account deletion flow
8. Deploy and monitor

## Future Enhancements

- Backup to cloud storage
- Import data from CSV/JSON
- Category usage analytics
- Budget per category
- Notification customization (weekly summary)
- Multi-language support
- Custom date formats
- Biometric authentication
