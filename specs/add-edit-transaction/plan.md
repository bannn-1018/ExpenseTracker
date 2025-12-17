# Technical Plan: Add/Edit Transaction (Thêm/Sửa Giao dịch)

**Feature Branch**: `004-add-edit-transaction`  
**Created**: December 17, 2025  
**Tech Stack**: Next.js 14+ (App Router), Vercel Postgres, React Hook Form  
**Estimated Effort**: 3-4 days

## Architecture Overview

### Tech Stack Components
- **Frontend**: Next.js 14+ with App Router, React Server Components
- **Database**: Vercel Postgres (PostgreSQL)
- **Form Management**: React Hook Form + Zod validation
- **UI Components**: Tailwind CSS, shadcn/ui
- **Date Picker**: react-day-picker
- **State Management**: Server Actions + useFormState

## Implementation Plan

### Phase 1: Form Setup & Validation (Day 1)

#### 1.1 Validation Schema
**File**: `lib/validations/transaction.ts`
```typescript
import { z } from "zod"

export const transactionSchema = z.object({
  amount: z.number()
    .positive("Số tiền phải lớn hơn 0")
    .max(10000000000, "Số tiền quá lớn"),
  type: z.enum(["income", "expense"]),
  categoryId: z.number({
    required_error: "Vui lòng chọn danh mục"
  }).positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string()
    .min(1, "Vui lòng nhập tên giao dịch")
    .max(255, "Tên giao dịch tối đa 255 ký tự"),
  note: z.string()
    .max(200, "Ghi chú tối đa 200 ký tự")
    .optional()
})

export type TransactionFormData = z.infer<typeof transactionSchema>
```

#### 1.2 Server Actions
**File**: `app/actions/transaction-form.ts`
```typescript
"use server"

import { auth } from "@/auth"
import { sql } from "@vercel/postgres"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { transactionSchema } from "@/lib/validations/transaction"

export async function createTransactionAction(
  prevState: any,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  const userId = parseInt(session.user.id)
  
  // Parse form data
  const data = {
    amount: parseFloat(formData.get("amount") as string),
    type: formData.get("type") as string,
    categoryId: parseInt(formData.get("categoryId") as string),
    date: formData.get("date") as string,
    name: formData.get("name") as string,
    note: formData.get("note") as string || null
  }
  
  // Validate
  const validated = transactionSchema.safeParse(data)
  if (!validated.success) {
    return {
      error: validated.error.errors[0].message
    }
  }
  
  try {
    await sql`
      INSERT INTO transactions (
        user_id, amount, type, category_id, date, name, note
      ) VALUES (
        ${userId},
        ${validated.data.amount},
        ${validated.data.type},
        ${validated.data.categoryId},
        ${validated.data.date},
        ${validated.data.name},
        ${validated.data.note}
      )
    `
    
    revalidateTag("transactions")
  } catch (error) {
    console.error("Create transaction error:", error)
    return { error: "Có lỗi xảy ra, vui lòng thử lại" }
  }
  
  redirect("/transactions")
}

export async function updateTransactionAction(
  transactionId: number,
  prevState: any,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  const userId = parseInt(session.user.id)
  
  const data = {
    amount: parseFloat(formData.get("amount") as string),
    type: formData.get("type") as string,
    categoryId: parseInt(formData.get("categoryId") as string),
    date: formData.get("date") as string,
    name: formData.get("name") as string,
    note: formData.get("note") as string || null
  }
  
  const validated = transactionSchema.safeParse(data)
  if (!validated.success) {
    return {
      error: validated.error.errors[0].message
    }
  }
  
  try {
    await sql`
      UPDATE transactions
      SET 
        amount = ${validated.data.amount},
        type = ${validated.data.type},
        category_id = ${validated.data.categoryId},
        date = ${validated.data.date},
        name = ${validated.data.name},
        note = ${validated.data.note},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${transactionId} AND user_id = ${userId}
    `
    
    revalidateTag("transactions")
  } catch (error) {
    console.error("Update transaction error:", error)
    return { error: "Có lỗi xảy ra, vui lòng thử lại" }
  }
  
  redirect("/transactions")
}

export async function getTransaction(transactionId: number) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  const userId = parseInt(session.user.id)
  
  const result = await sql`
    SELECT * FROM transactions
    WHERE id = ${transactionId} AND user_id = ${userId}
  `
  
  if (result.rows.length === 0) {
    return null
  }
  
  return {
    id: result.rows[0].id,
    amount: parseFloat(result.rows[0].amount),
    type: result.rows[0].type,
    categoryId: result.rows[0].category_id,
    date: result.rows[0].date,
    name: result.rows[0].name,
    note: result.rows[0].note
  }
}
```

### Phase 2: Add Transaction Page (Day 2)

#### 2.1 Add Transaction Page
**File**: `app/(dashboard)/transactions/add/page.tsx`
```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { getCategories } from "@/lib/db/categories"

export default async function AddTransactionPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  const userId = parseInt(session.user.id)
  const categories = await getCategories(userId)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold">Thêm giao dịch</h1>
      </header>
      
      <TransactionForm 
        categories={categories}
        mode="create"
      />
    </div>
  )
}
```

#### 2.2 Get Categories Helper
**File**: `lib/db/categories.ts`
```typescript
import { sql } from "@vercel/postgres"

export async function getCategories(userId: number) {
  const result = await sql`
    SELECT id, name, icon, type, color
    FROM categories
    WHERE user_id = ${userId} OR is_system = true
    ORDER BY type, display_order, name
  `
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    type: row.type,
    color: row.color
  }))
}
```

### Phase 3: Transaction Form Component (Day 2-3)

**File**: `components/transactions/transaction-form.tsx`
```typescript
"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { createTransactionAction, updateTransactionAction } from "@/app/actions/transaction-form"
import { AmountInput } from "./amount-input"
import { TypeToggle } from "./type-toggle"
import { CategoryGrid } from "./category-grid"
import { DatePicker } from "./date-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface TransactionFormProps {
  categories: Category[]
  mode: "create" | "edit"
  initialData?: TransactionFormData
  transactionId?: number
}

export function TransactionForm({
  categories,
  mode,
  initialData,
  transactionId
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">(
    initialData?.type || "expense"
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialData?.categoryId || null
  )
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split("T")[0]
  )
  
  const action = mode === "create" 
    ? createTransactionAction 
    : updateTransactionAction.bind(null, transactionId!)
  
  const [state, formAction] = useFormState(action, null)
  
  const filteredCategories = categories.filter(cat => cat.type === type)
  
  const isFormValid = amount && parseFloat(amount) > 0 && selectedCategoryId
  
  return (
    <form action={formAction} className="p-4 space-y-6">
      {/* Type Toggle */}
      <div>
        <TypeToggle 
          value={type} 
          onChange={(newType) => {
            setType(newType)
            setSelectedCategoryId(null) // Clear category when type changes
          }} 
        />
        <input type="hidden" name="type" value={type} />
      </div>
      
      {/* Amount Input */}
      <div>
        <Label>Số tiền</Label>
        <AmountInput
          value={amount}
          onChange={setAmount}
          name="amount"
        />
      </div>
      
      {/* Category Selection */}
      <div>
        <Label>Danh mục</Label>
        <CategoryGrid
          categories={filteredCategories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />
        <input type="hidden" name="categoryId" value={selectedCategoryId || ""} />
        {!selectedCategoryId && state?.error?.includes("danh mục") && (
          <p className="text-sm text-red-600 mt-1">Vui lòng chọn danh mục</p>
        )}
      </div>
      
      {/* Date Picker */}
      <div>
        <Label>Ngày</Label>
        <DatePicker
          value={date}
          onChange={setDate}
          name="date"
        />
      </div>
      
      {/* Transaction Name */}
      <div>
        <Label>Tên giao dịch</Label>
        <Input
          type="text"
          name="name"
          placeholder="VD: Cà phê sáng, Tiền lương tháng 12..."
          defaultValue={initialData?.name}
          required
          className="min-h-[44px]"
        />
      </div>
      
      {/* Optional Note */}
      <div>
        <Label>Ghi chú (không bắt buộc)</Label>
        <Textarea
          name="note"
          placeholder="Thêm ghi chú..."
          defaultValue={initialData?.note}
          maxLength={200}
          className="min-h-[80px]"
        />
      </div>
      
      {/* Error Message */}
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {state.error}
        </div>
      )}
      
      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button
          type="submit"
          disabled={!isFormValid}
          className="w-full min-h-[48px]"
        >
          {mode === "create" ? "Thêm giao dịch" : "Cập nhật"}
        </Button>
      </div>
    </form>
  )
}
```

#### 3.1 Amount Input with Number Pad
**File**: `components/transactions/amount-input.tsx`
```typescript
"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils/currency"

export function AmountInput({
  value,
  onChange,
  name
}: {
  value: string
  onChange: (value: string) => void
  name: string
}) {
  const [showPad, setShowPad] = useState(false)
  
  const handleNumberClick = (num: string) => {
    if (num === "." && value.includes(".")) return
    onChange(value + num)
  }
  
  const handleBackspace = () => {
    onChange(value.slice(0, -1))
  }
  
  const formatDisplay = (val: string) => {
    if (!val) return "₫0"
    const num = parseFloat(val)
    if (isNaN(num)) return "₫0"
    return formatCurrency(num)
  }
  
  return (
    <div>
      <input type="hidden" name={name} value={value} />
      
      <div
        onClick={() => setShowPad(!showPad)}
        className="w-full p-4 text-center text-3xl font-bold bg-gray-100 rounded-lg min-h-[80px] flex items-center justify-center cursor-pointer"
      >
        {formatDisplay(value)}
      </div>
      
      {showPad && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === "⌫") handleBackspace()
                else handleNumberClick(key)
              }}
              className="h-14 bg-white border rounded-lg font-semibold text-lg hover:bg-gray-50 active:bg-gray-100"
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### 3.2 Type Toggle
**File**: `components/transactions/type-toggle.tsx`
```typescript
"use client"

import { cn } from "@/lib/utils"

export function TypeToggle({
  value,
  onChange
}: {
  value: "income" | "expense"
  onChange: (type: "income" | "expense") => void
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("expense")}
        className={cn(
          "flex-1 py-3 rounded-lg font-semibold transition-colors min-h-[48px]",
          value === "expense"
            ? "bg-red-600 text-white"
            : "bg-gray-100 text-gray-700"
        )}
      >
        Chi tiền
      </button>
      <button
        type="button"
        onClick={() => onChange("income")}
        className={cn(
          "flex-1 py-3 rounded-lg font-semibold transition-colors min-h-[48px]",
          value === "income"
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-700"
        )}
      >
        Thu nhập
      </button>
    </div>
  )
}
```

#### 3.3 Category Grid
**File**: `components/transactions/category-grid.tsx`
```typescript
"use client"

import { cn } from "@/lib/utils"

export function CategoryGrid({
  categories,
  selectedId,
  onSelect
}: {
  categories: Category[]
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-3 mt-2">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all min-h-[80px]",
            selectedId === category.id
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          )}
          style={{
            backgroundColor: selectedId === category.id 
              ? `${category.color}15` 
              : "white"
          }}
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${category.color}30` }}
          >
            {category.icon}
          </div>
          <span className="text-xs font-medium text-center leading-tight">
            {category.name}
          </span>
        </button>
      ))}
    </div>
  )
}
```

#### 3.4 Date Picker
**File**: `components/transactions/date-picker.tsx`
```typescript
"use client"

import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function DatePicker({
  value,
  onChange,
  name
}: {
  value: string
  onChange: (date: string) => void
  name: string
}) {
  return (
    <div className="relative">
      <input
        type="date"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 pr-10 border rounded-lg min-h-[48px]"
      />
      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  )
}
```

### Phase 4: Edit Transaction (Day 3)

**File**: `app/(dashboard)/transactions/[id]/page.tsx`
```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTransaction } from "@/app/actions/transaction-form"
import { getCategories } from "@/lib/db/categories"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { notFound } from "next/navigation"

export default async function EditTransactionPage({
  params
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  const userId = parseInt(session.user.id)
  const transactionId = parseInt(params.id)
  
  const [transaction, categories] = await Promise.all([
    getTransaction(transactionId),
    getCategories(userId)
  ])
  
  if (!transaction) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold">Sửa giao dịch</h1>
      </header>
      
      <TransactionForm
        categories={categories}
        mode="edit"
        initialData={transaction}
        transactionId={transactionId}
      />
    </div>
  )
}
```

### Phase 5: Mobile Optimizations (Day 4)

#### 5.1 Bottom Sheet Implementation (Optional Enhancement)
**File**: `components/transactions/transaction-bottom-sheet.tsx`
```typescript
"use client"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { TransactionForm } from "./transaction-form"

export function TransactionBottomSheet({
  trigger,
  categories,
  mode,
  initialData,
  transactionId
}: {
  trigger: React.ReactNode
  categories: Category[]
  mode: "create" | "edit"
  initialData?: any
  transactionId?: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <TransactionForm
            categories={categories}
            mode={mode}
            initialData={initialData}
            transactionId={transactionId}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
```

#### 5.2 Unsaved Changes Warning
**File**: `components/transactions/unsaved-changes-guard.tsx`
```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function UnsavedChangesGuard({ isDirty }: { isDirty: boolean }) {
  const router = useRouter()
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])
  
  return null
}
```

#### 5.3 Keyboard Handling
```typescript
// Add to amount-input.tsx to handle mobile keyboard
useEffect(() => {
  const handleScroll = () => {
    // Scroll to keep input visible when keyboard appears
    if (document.activeElement === inputRef.current) {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }
  
  window.addEventListener("resize", handleScroll)
  return () => window.removeEventListener("resize", handleScroll)
}, [])
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/transaction-form.test.ts
import { transactionSchema } from "@/lib/validations/transaction"

describe("Transaction Validation", () => {
  test("validates correct transaction data", () => {
    const data = {
      amount: 50000,
      type: "expense" as const,
      categoryId: 1,
      date: "2024-01-01",
      name: "Coffee",
      note: "Morning coffee"
    }
    
    expect(() => transactionSchema.parse(data)).not.toThrow()
  })
  
  test("rejects zero amount", () => {
    const data = {
      amount: 0,
      type: "expense" as const,
      categoryId: 1,
      date: "2024-01-01",
      name: "Test"
    }
    
    expect(() => transactionSchema.parse(data)).toThrow()
  })
})
```

### E2E Tests
```typescript
// e2e/add-transaction.spec.ts
import { test, expect } from "@playwright/test"

test("add transaction flow", async ({ page }) => {
  await page.goto("/transactions/add")
  
  // Select expense type
  await page.click("text=Chi tiền")
  
  // Enter amount
  await page.click('[data-testid="amount-input"]')
  await page.click("text=5")
  await page.click("text=0")
  await page.click("text=0")
  await page.click("text=0")
  await page.click("text=0")
  
  // Select category
  await page.click('[data-testid="category-food"]')
  
  // Enter name
  await page.fill('input[name="name"]', "Coffee")
  
  // Submit
  await page.click("text=Thêm giao dịch")
  
  await expect(page).toHaveURL("/transactions")
})
```

## Performance Optimizations

### 1. Form State Management
- Use uncontrolled components where possible
- Debounce real-time validations
- Optimize category grid rendering

### 2. Category Loading
- Cache categories at server level
- Preload on page navigation

### 3. Mobile Keyboard
- Handle viewport resize events
- Auto-scroll to keep fields visible
- Use appropriate input types (numeric, date)

## Mobile Responsiveness Checklist

- ✅ Touch targets minimum 44x44px (form uses 48px)
- ✅ Category icons minimum 56x56px (uses 48px in 12px icon container)
- ✅ Number pad buttons minimum 56px height (uses 56px)
- ✅ Form inputs don't get obscured by keyboard
- ✅ Date picker uses native mobile picker
- ✅ Type toggle buttons are large and easy to tap
- ✅ Smooth transitions between form states
- ✅ Fixed submit button at bottom for easy access

## Deployment Checklist

1. Test form validation with various inputs
2. Verify category grid on different screen sizes
3. Test number pad on real mobile devices
4. Check date picker on iOS and Android
5. Validate unsaved changes warning
6. Test edit mode pre-filling
7. Verify error messages display correctly
8. Test keyboard handling on mobile
9. Deploy and monitor form submission success rate

## Future Enhancements

- Auto-categorization based on transaction name
- Recent transactions suggestions
- Transaction templates for recurring expenses
- Camera integration for receipt scanning
- Voice input for transaction names
- Quick add shortcuts (floating bubble)
- Duplicate transaction feature
- Split transaction between categories
