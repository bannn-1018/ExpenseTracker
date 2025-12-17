# Tasks: Add/Edit Transaction (Thêm/Sửa Giao dịch)

**Feature Branch**: `004-add-edit-transaction`  
**Estimated Effort**: 3-4 days

## Phase 1: Form Setup & Validation (Day 1)

### 1.1 Validation Schema
- [ ] Create `/lib/validations/transaction.ts`
- [ ] Install Zod if not already: `npm install zod`
- [ ] Define `transactionSchema` with fields:
  - [ ] amount: number, positive, max 10 billion
  - [ ] type: enum ["income", "expense"]
  - [ ] categoryId: number, positive, required
  - [ ] date: string, ISO format (YYYY-MM-DD)
  - [ ] name: string, min 1, max 255 characters
  - [ ] note: string, max 200 characters, optional
- [ ] Add Vietnamese error messages for each validation
- [ ] Export `TransactionFormData` type
- [ ] Test schema with valid and invalid data

### 1.2 Server Actions - Create Transaction
- [ ] Create `/app/actions/transaction-form.ts`
- [ ] Implement `createTransactionAction(prevState, formData)`
  - [ ] Get authenticated user from session
  - [ ] Return error if not authenticated
  - [ ] Parse form data to object
  - [ ] Validate with transactionSchema
  - [ ] Return validation errors if invalid
  - [ ] Insert transaction into database
  - [ ] Handle database errors
  - [ ] Revalidate "transactions" cache tag
  - [ ] Redirect to /transactions on success
- [ ] Add proper error handling and logging
- [ ] Test with valid and invalid data

### 1.3 Server Actions - Update Transaction
- [ ] Implement `updateTransactionAction(transactionId, prevState, formData)`
  - [ ] Get authenticated user from session
  - [ ] Verify user owns the transaction
  - [ ] Parse and validate form data
  - [ ] Update transaction in database
  - [ ] Update `updated_at` timestamp
  - [ ] Revalidate cache
  - [ ] Redirect to /transactions
- [ ] Handle ownership errors (403 Forbidden)
- [ ] Test update flow

### 1.4 Server Actions - Get Transaction
- [ ] Implement `getTransaction(transactionId)`
  - [ ] Verify authentication
  - [ ] Query transaction by ID and user ID
  - [ ] Return null if not found
  - [ ] Return formatted transaction object
- [ ] Test retrieval with valid/invalid IDs

## Phase 2: Add Transaction Page (Day 2)

### 2.1 Categories Data Helper
- [ ] Create `/lib/db/categories.ts` (if not exists)
- [ ] Implement `getCategories(userId, type?)`
  - [ ] Query user categories + system categories
  - [ ] Filter by type if provided
  - [ ] Order by display_order, name
- [ ] Implement `getCategoriesByType(userId)`
  - [ ] Return object: { income: [], expense: [] }
  - [ ] Separate categories by type
- [ ] Test category retrieval

### 2.2 Add Transaction Page
- [ ] Create `/app/(dashboard)/transactions/add/page.tsx`
- [ ] Add authentication check
- [ ] Fetch categories using `getCategoriesByType()`
- [ ] Set page metadata (title: "Thêm giao dịch")
- [ ] Render TransactionForm component
- [ ] Pass categories and mode="create"
- [ ] Test page rendering

### 2.3 Transaction Form Component - Structure
- [ ] Create `/components/transactions/transaction-form.tsx` (client component)
- [ ] Accept props: mode ("create" | "edit"), categories, initialData (optional)
- [ ] Use `useFormState` hook with appropriate action
- [ ] Create form with action prop
- [ ] Add form sections:
  - [ ] Amount input
  - [ ] Type selector (Income/Expense)
  - [ ] Category selector
  - [ ] Date picker
  - [ ] Name input
  - [ ] Note textarea
  - [ ] Submit button
- [ ] Add loading state management
- [ ] Style with Tailwind CSS

### 2.4 Amount Input Component
- [ ] Create `/components/transactions/amount-input.tsx`
- [ ] Add large, prominent input field
- [ ] Add currency symbol (₫)
- [ ] Format number with thousands separators
- [ ] Allow only numeric input
- [ ] Set input mode to "decimal" for mobile
- [ ] Add min/max validation feedback
- [ ] Auto-focus on mount
- [ ] Test with various amounts

### 2.5 Type Selector Component
- [ ] Create `/components/transactions/type-selector.tsx`
- [ ] Create toggle/segmented control
- [ ] Two options: "Thu nhập" (Income) and "Chi tiêu" (Expense)
- [ ] Highlight active type
- [ ] Use different colors (green for income, red for expense)
- [ ] Update category list when type changes
- [ ] Make touch-friendly (min 44px height)
- [ ] Test type switching

### 2.6 Category Selector Component
- [ ] Create `/components/transactions/category-selector.tsx`
- [ ] Display as grid of category buttons
- [ ] Show icon and name for each category
- [ ] Filter categories by selected type
- [ ] Highlight selected category
- [ ] Use category colors for visual feedback
- [ ] Add "Manage Categories" link
- [ ] Make scrollable on mobile
- [ ] Handle no categories case
- [ ] Test with many categories

## Phase 3: Form Fields & Date Picker (Day 3)

### 3.1 Date Picker Component
- [ ] Install `react-day-picker` if not already
- [ ] Create `/components/transactions/date-picker.tsx`
- [ ] Use single date selection mode
- [ ] Default to today's date
- [ ] Configure Vietnamese locale
- [ ] Add max date (today - no future dates)
- [ ] Show selected date in input
- [ ] Open calendar in popover/modal
- [ ] Format display as DD/MM/YYYY
- [ ] Store value as YYYY-MM-DD
- [ ] Make mobile-friendly
- [ ] Test date selection

### 3.2 Name Input Field
- [ ] Add text input for transaction name
- [ ] Set maxLength to 255
- [ ] Add placeholder suggestions based on category (optional)
- [ ] Add character counter (X/255)
- [ ] Show validation errors inline
- [ ] Make required field clear
- [ ] Test with various lengths

### 3.3 Note Textarea
- [ ] Add textarea for optional note
- [ ] Set maxLength to 200
- [ ] Add placeholder text
- [ ] Add character counter
- [ ] Make resizable (min/max height)
- [ ] Show as optional field
- [ ] Test with long text

### 3.4 Form Validation & Error Display
- [ ] Display field-level errors from server
- [ ] Show error message below each field
- [ ] Style errors in red
- [ ] Focus first error field on submit
- [ ] Prevent multiple submissions
- [ ] Show global error at top if exists
- [ ] Test all validation scenarios

### 3.5 Submit Button
- [ ] Create large, prominent submit button
- [ ] Text: "Thêm giao dịch" or "Lưu thay đổi"
- [ ] Add loading spinner during submission
- [ ] Disable button during loading
- [ ] Style as primary action (high contrast)
- [ ] Make full-width on mobile
- [ ] Test submission states

## Phase 4: Edit Transaction Page (Day 4)

### 4.1 Edit Page Setup
- [ ] Create `/app/(dashboard)/transactions/[id]/edit/page.tsx`
- [ ] Add authentication check
- [ ] Extract transaction ID from params
- [ ] Fetch transaction data using `getTransaction(id)`
- [ ] Show 404 if transaction not found
- [ ] Fetch categories
- [ ] Set page metadata (title: "Sửa giao dịch")

### 4.2 Pre-fill Form Data
- [ ] Pass transaction data as `initialData` to TransactionForm
- [ ] Update TransactionForm to handle initial values
- [ ] Pre-select transaction type
- [ ] Pre-select category
- [ ] Set initial date
- [ ] Set initial amount (formatted)
- [ ] Set initial name
- [ ] Set initial note
- [ ] Test form pre-filling

### 4.3 Update Action Integration
- [ ] Use `updateTransactionAction` for edit mode
- [ ] Pass transaction ID to action
- [ ] Show "Lưu thay đổi" button text
- [ ] Handle update errors
- [ ] Show success message on update
- [ ] Test update flow

### 4.4 Delete Button on Edit Page
- [ ] Add "Delete Transaction" button
- [ ] Style as destructive/danger action
- [ ] Position at bottom or in menu
- [ ] Open confirmation dialog before delete
- [ ] Use delete action from transactions feature
- [ ] Redirect to list after deletion
- [ ] Test delete flow

## Phase 5: UI Polish & UX Improvements

### 5.1 Form Auto-save (Optional)
- [ ] Implement draft saving to localStorage
- [ ] Auto-save form state every 2 seconds
- [ ] Restore draft on page reload
- [ ] Clear draft after successful submit
- [ ] Show "Draft restored" notification
- [ ] Add "Discard draft" option
- [ ] Test draft functionality

### 5.2 Quick Amount Presets
- [ ] Add quick amount buttons (50k, 100k, 200k, 500k)
- [ ] Make customizable per user (settings)
- [ ] Position above or below amount input
- [ ] Update amount input on click
- [ ] Test preset selection

### 5.3 Recent Transactions Suggestions
- [ ] Query recent transactions for suggestions
- [ ] Show below name input
- [ ] Filter by selected category
- [ ] Click to auto-fill name and amount
- [ ] Limit to 3-5 suggestions
- [ ] Make dismissable
- [ ] Test suggestions

### 5.4 Category Quick Add
- [ ] Add "+" button in category selector
- [ ] Open inline category creation form
- [ ] Fields: name, icon, color
- [ ] Create category immediately
- [ ] Auto-select new category
- [ ] Refresh category list
- [ ] Test quick add flow

### 5.5 Mobile Keyboard Optimization
- [ ] Set `inputMode="decimal"` for amount
- [ ] Set `inputMode="text"` for name
- [ ] Set appropriate `autoComplete` attributes
- [ ] Test on iOS keyboard
- [ ] Test on Android keyboard
- [ ] Ensure keyboard doesn't hide submit button

### 5.6 Form Animations
- [ ] Add smooth transitions between fields
- [ ] Animate category selection
- [ ] Animate type switch
- [ ] Add submit button press animation
- [ ] Use CSS transitions (performance)
- [ ] Test with reduced motion preference

## Phase 6: Testing & Integration

### 6.1 Form Validation Testing
- [ ] Test empty form submission
- [ ] Test invalid amount (negative, zero, too large)
- [ ] Test missing category
- [ ] Test invalid date format
- [ ] Test name too long
- [ ] Test note too long
- [ ] Test all validation error messages

### 6.2 Create Transaction Testing
- [ ] Test creating income transaction
- [ ] Test creating expense transaction
- [ ] Test with different categories
- [ ] Test with different dates
- [ ] Test with/without note
- [ ] Verify redirect after creation
- [ ] Verify transaction appears in list

### 6.3 Edit Transaction Testing
- [ ] Test editing all fields
- [ ] Test changing transaction type
- [ ] Test changing category
- [ ] Test form pre-population
- [ ] Test update success
- [ ] Verify changes in list

### 6.4 Responsive Testing
- [ ] Test on mobile (320px - 428px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px+)
- [ ] Test landscape mode
- [ ] Verify touch targets are 44px minimum
- [ ] Test form scrolling on small screens

### 6.5 Accessibility Testing
- [ ] Test keyboard navigation (Tab order)
- [ ] Test form submission with Enter key
- [ ] Add ARIA labels for all inputs
- [ ] Test with screen reader
- [ ] Ensure error messages are announced
- [ ] Verify color contrast ratios
- [ ] Add focus indicators

### 6.6 Performance Testing
- [ ] Test with slow network (form submission)
- [ ] Test with many categories (100+)
- [ ] Measure form interaction responsiveness
- [ ] Optimize re-renders
- [ ] Test memory usage
- [ ] Test on low-end devices

### 6.7 Integration Testing
- [ ] Test navigation from dashboard
- [ ] Test navigation from transactions list
- [ ] Test data sync after creation
- [ ] Test cache invalidation
- [ ] Test with multiple browser tabs
- [ ] Test back button behavior

### 6.8 Error Handling Testing
- [ ] Test network failure during submit
- [ ] Test database error during submit
- [ ] Test session expiration during form
- [ ] Test concurrent edit conflicts
- [ ] Verify error messages are clear
- [ ] Test error recovery

### 6.9 Cross-browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile Safari
- [ ] Test on mobile Chrome

### 6.10 Documentation
- [ ] Document form component props
- [ ] Document server actions
- [ ] Add code comments
- [ ] Document validation rules
- [ ] Create user guide for form

---

## Acceptance Criteria

- ✅ Users can create new transactions with all required fields
- ✅ Users can edit existing transactions
- ✅ Form validates all inputs with clear error messages
- ✅ Amount input is user-friendly with formatting
- ✅ Type selector switches between income/expense
- ✅ Category selector shows relevant categories
- ✅ Date picker allows easy date selection (no future dates)
- ✅ Form is responsive on mobile, tablet, and desktop
- ✅ Form submission shows loading state
- ✅ Successful submission redirects to transactions list
- ✅ Data updates are immediately visible in list
- ✅ Form is accessible via keyboard and screen reader
- ✅ Delete functionality works with confirmation
- ✅ All touch targets are minimum 44px
- ✅ Form works offline with appropriate error handling
