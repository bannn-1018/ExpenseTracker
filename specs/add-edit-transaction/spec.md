# Feature Specification: Add/Edit Transaction (Thêm/Sửa Giao dịch)

**Feature Branch**: `004-add-edit-transaction`  
**Created**: December 17, 2025  
**Status**: Draft  
**Input**: User description: "Màn hình Thêm/Sửa Giao dịch - Bàn phím số tích hợp, Toggle switch Thu/Chi, Chọn Danh mục, Chọn Ngày, Ghi chú"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Add Expense (Priority: P1)

As a user, I want to quickly add an expense transaction with minimal taps so that I can record my spending immediately.

**Why this priority**: This is the most frequent user action. Fast transaction entry is critical for user engagement and data accuracy.

**Independent Test**: Can be fully tested by adding an expense and verifying it appears in the transaction list with correct details, delivering immediate value.

**Acceptance Scenarios**:

1. **Given** I tap the "Add Transaction" floating action button, **When** the form opens, **Then** I see a number pad, amount input, category grid, and date selector defaulting to today
2. **Given** I am on the add transaction screen, **When** I enter amount using number pad, **Then** the amount displays in real-time with proper formatting (₫1.234.567)
3. **Given** I select "Chi tiền" (default), **When** I choose a category and enter amount, **Then** I can save the transaction with 2-3 taps total
4. **Given** I save a transaction, **When** save is successful, **Then** I see success message "Đã thêm giao dịch" and return to previous screen
5. **Given** I am on mobile device, **When** I use the form, **Then** all controls are touch-friendly (min 44x44px) and keyboard doesn't obscure inputs
6. **Given** I tap outside the form on mobile, **When** bottom sheet is dismissible, **Then** I see confirmation "Hủy bỏ giao dịch chưa lưu?"

---

### User Story 2 - Add Income Transaction (Priority: P1)

As a user, I want to record income transactions so that I can track both sides of my finances.

**Why this priority**: Essential for accurate financial tracking. Income tracking is equally important as expense tracking.

**Independent Test**: Can be tested by toggling to income mode, adding an income transaction, and verifying it appears correctly in green.

**Acceptance Scenarios**:

1. **Given** I am on the add transaction screen, **When** I toggle from "Chi tiền" to "Thu nhập", **Then** the category grid updates to show income categories (Lương, Thưởng, Đầu tư, etc.)
2. **Given** I select "Thu nhập", **When** I save the transaction, **Then** it appears in the transaction list with amount in green
3. **Given** I toggle between types, **When** I switch, **Then** my entered amount is preserved but category selection is cleared
4. **Given** I am on mobile, **When** I use the toggle switch, **Then** it provides clear visual feedback and is easy to tap

---

### User Story 3 - Select Category with Icons (Priority: P1)

As a user, I want to select a transaction category from a visual grid of icons so that I can quickly categorize my transactions.

**Why this priority**: Categories are essential for meaningful financial insights. Visual icons enable fast selection.

**Independent Test**: Can be tested by selecting various categories and verifying they are saved correctly with the transaction.

**Acceptance Scenarios**:

1. **Given** I am adding an expense, **When** I view category options, **Then** I see a grid of icons representing categories (Ăn uống, Di chuyển, Mua sắm, Giải trí, Nhà ở, Sức khỏe, etc.)
2. **Given** I tap a category icon, **When** selected, **Then** it highlights with visual feedback (border, background color)
3. **Given** categories don't fit on screen, **When** I view the grid on mobile, **Then** I can scroll horizontally or see "More" button
4. **Given** I am on mobile device, **When** I view category icons, **Then** each icon is at least 56x56px for easy tapping
5. **Given** I try to save without selecting category, **When** I tap save, **Then** I see validation error "Vui lòng chọn danh mục"

---

### User Story 4 - Select Custom Date (Priority: P2)

As a user, I want to select a custom date for transactions so that I can record past transactions or future planned expenses.

**Why this priority**: Important for recording forgotten transactions but defaults to today which covers most cases.

**Independent Test**: Can be tested by selecting various dates and verifying transactions are saved with correct date values.

**Acceptance Scenarios**:

1. **Given** I am adding a transaction, **When** I tap the date field, **Then** a mobile-friendly date picker opens with today pre-selected
2. **Given** the date picker is open, **When** I select a past date, **Then** the selected date displays in the date field
3. **Given** I select a future date, **When** I save, **Then** the transaction is saved with the future date (for planned expenses)
4. **Given** I am on mobile, **When** I use the date picker, **Then** it uses native mobile date picker for best UX
5. **Given** date defaults to today, **When** I don't change it, **Then** transaction is saved with today's date

---

### User Story 5 - Add Optional Note (Priority: P2)

As a user, I want to add an optional note to transactions so that I can remember context or details later.

**Why this priority**: Useful for context but not required for basic transaction tracking.

**Independent Test**: Can be tested by adding transactions with and without notes and verifying notes are saved and displayed.

**Acceptance Scenarios**:

1. **Given** I am adding a transaction, **When** I tap the note field, **Then** keyboard opens for text input
2. **Given** I enter a note, **When** I save the transaction, **Then** the note is saved and visible in transaction details
3. **Given** I don't enter a note, **When** I save the transaction, **Then** transaction is saved successfully without note
4. **Given** I enter a very long note (>200 characters), **When** I try to save, **Then** I see message "Ghi chú tối đa 200 ký tự"
5. **Given** I am on mobile, **When** keyboard appears for note, **Then** the form scrolls to keep note field visible

---

### User Story 6 - Edit Existing Transaction (Priority: P2)

As a user, I want to edit existing transactions so that I can correct mistakes or update details.

**Why this priority**: Important for data accuracy but less frequent than adding new transactions.

**Independent Test**: Can be tested by editing transaction details and verifying changes are saved correctly.

**Acceptance Scenarios**:

1. **Given** I tap on an existing transaction, **When** edit screen opens, **Then** I see the form pre-filled with current values
2. **Given** I modify any field, **When** I save, **Then** the transaction is updated and I see "Đã cập nhật giao dịch"
3. **Given** I am editing a transaction, **When** I tap "Delete", **Then** I see confirmation dialog before deletion
4. **Given** I change the transaction type, **When** switching from expense to income, **Then** I must reselect appropriate category
5. **Given** I edit a transaction on mobile, **When** I tap back without saving, **Then** I see "Hủy bỏ thay đổi?" confirmation

---

### User Story 7 - Integrated Number Pad (Priority: P3)

As a user, I want to use an integrated number pad optimized for amount entry so that I can quickly enter transaction amounts.

**Why this priority**: Nice to have for UX optimization but mobile numeric keyboard is acceptable alternative.

**Independent Test**: Can be tested by using the number pad to enter various amounts and verifying correct input.

**Acceptance Scenarios**:

1. **Given** I am on the add transaction screen, **When** I tap amount field, **Then** I see an integrated number pad with digits 0-9, decimal point, and backspace
2. **Given** I use the number pad, **When** I tap numbers, **Then** amount updates in real-time with proper formatting
3. **Given** I enter decimal amounts, **When** I tap decimal point, **Then** I can enter cents (e.g., ₫25.500)
4. **Given** I make a mistake, **When** I tap backspace, **Then** last digit is removed
5. **Given** I am on mobile, **When** number pad is shown, **Then** it doesn't obscure other form fields

---

### Edge Cases

- What happens when user enters amount of 0? (Show validation error "Số tiền phải lớn hơn 0")
- How does form handle very large amounts (>999,999,999)? (Support up to 10 billion, show formatting)
- What happens when user tries to select future date more than 1 year ahead? (Allow but show warning)
- How does system handle rapid repeated saves? (Debounce save button, prevent duplicates)
- What happens when network fails during save? (Show error, allow retry, maintain form data)
- How does form handle switching between add/edit modes? (Clear form when switching to add mode)
- What happens when user rotates device during input? (Preserve entered data)
- How does autosave work if user navigates away accidentally? (Prompt to save or implement draft functionality)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide floating action button (FAB) to open add transaction form
- **FR-002**: Form MUST open as bottom sheet on mobile, modal on desktop
- **FR-003**: System MUST provide amount input with real-time formatting (thousand separators)
- **FR-004**: System MUST provide toggle switch between "Chi tiền" (expense) and "Thu nhập" (income)
- **FR-005**: System MUST default to "Chi tiền" mode
- **FR-006**: System MUST display category grid with icons based on selected type
- **FR-007**: System MUST provide at least 8 default expense categories with icons
- **FR-008**: System MUST provide at least 5 default income categories with icons
- **FR-009**: System MUST highlight selected category with visual feedback
- **FR-010**: System MUST provide date selector defaulting to current date
- **FR-011**: System MUST allow past and future date selection
- **FR-012**: System MUST use native mobile date picker on mobile devices
- **FR-013**: System MUST provide optional note field with 200 character limit
- **FR-014**: System MUST validate that amount is greater than 0
- **FR-015**: System MUST validate that category is selected
- **FR-016**: System MUST show clear validation error messages
- **FR-017**: System MUST provide save button that is disabled until form is valid
- **FR-018**: System MUST show success message after successful save
- **FR-019**: System MUST close form and return to previous screen after save
- **FR-020**: System MUST support editing existing transactions
- **FR-021**: Edit mode MUST pre-fill form with existing transaction data
- **FR-022**: System MUST show confirmation before discarding unsaved changes
- **FR-023**: System MUST provide delete option in edit mode
- **FR-024**: System MUST show confirmation before deleting transaction
- **FR-025**: Form MUST be fully responsive on mobile (320px - 428px width)
- **FR-026**: All touch targets MUST be minimum 44x44px
- **FR-027**: Category icons MUST be minimum 56x56px for easy tapping
- **FR-028**: Keyboard MUST not obscure form inputs on mobile
- **FR-029**: System MUST preserve entered data when keyboard appears/disappears
- **FR-030**: Form MUST be accessible via keyboard navigation on desktop
- **FR-031**: Optional: Provide integrated number pad for amount entry
- **FR-032**: Optional: Support decimal amounts (cents)
- **FR-033**: System MUST save transaction within 1 second of submission

### Key Entities

- **Transaction**: ID, user_id, amount, type (expense/income), category_id, date, note, created_at, updated_at
- **Category**: ID, name, icon, type (expense/income), color, user_id (for custom categories)
- **TransactionForm**: Amount, type, category, date, note, validation state

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a simple expense transaction in under 10 seconds (P50: 7 seconds)
- **SC-002**: Transaction save completes within 1 second (95th percentile)
- **SC-003**: Form validation provides instant feedback (<100ms)
- **SC-004**: Users successfully add transactions on first attempt 95%+ of the time
- **SC-005**: Form achieves 90+ Lighthouse accessibility score on mobile
- **SC-006**: Touch targets meet WCAG 2.1 AA standards (100% compliance)
- **SC-007**: Category selection success rate 98%+ (minimal mis-taps)
- **SC-008**: Form works correctly at 320px viewport width
- **SC-009**: Keyboard doesn't obscure inputs on 95%+ of mobile devices
- **SC-010**: Users understand expense/income toggle without help text (90% success in user testing)
- **SC-011**: Edit transactions successfully with 95%+ success rate
- **SC-012**: Zero data loss when form is accidentally dismissed (with confirmation dialog)
- **SC-013**: Form submission success rate 99%+ (handles network errors gracefully)
