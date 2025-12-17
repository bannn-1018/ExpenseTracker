# Tasks: Transactions List (Danh sách Giao dịch)

**Feature Branch**: `003-transactions-list`  
**Estimated Effort**: 4-5 days

## Phase 1: Base List Component (Day 1)

### 1.1 Database Query Functions
- [ ] Create `/lib/db/transactions.ts`
- [ ] Define `TransactionFilters` interface
  - [ ] startDate, endDate (optional)
  - [ ] type: "income" | "expense" | "all"
  - [ ] categoryId (optional)
  - [ ] search (optional)
- [ ] Implement `getTransactions(userId, page, limit, filters)`
  - [ ] Build dynamic WHERE clause based on filters
  - [ ] Add date range filtering
  - [ ] Add type filtering
  - [ ] Add category filtering
  - [ ] Add accent-insensitive search (Vietnamese support)
  - [ ] Include total count with `COUNT(*) OVER()`
  - [ ] Join with categories table
  - [ ] Order by date DESC, created_at DESC
  - [ ] Add pagination with OFFSET and LIMIT
  - [ ] Return transactions, totalCount, hasMore
- [ ] Implement `deleteTransaction(userId, transactionId)`
  - [ ] Delete transaction with user ownership check
  - [ ] Revalidate cache tag "transactions"
- [ ] Implement `groupTransactionsByDate(transactions)`
  - [ ] Group by "Hôm nay", "Hôm qua", or date string
  - [ ] Return object with date labels as keys
- [ ] Test query functions with various filters

### 1.2 Transaction List Page
- [ ] Create `/app/(dashboard)/transactions/page.tsx`
- [ ] Add authentication check
- [ ] Parse search params (page, search, startDate, endDate, type, categoryId)
- [ ] Fetch transactions with filters and pagination
- [ ] Group transactions by date
- [ ] Pass data to client components
- [ ] Set page metadata

### 1.3 Transaction Item Component
- [ ] Create `/components/transactions/transaction-item.tsx` (client component)
- [ ] Display category icon with background color
- [ ] Display transaction name (bold)
- [ ] Display transaction date (relative or formatted)
- [ ] Display amount (green for income, red for expense)
- [ ] Add note preview (if exists, truncated)
- [ ] Make item clickable (navigate to edit page)
- [ ] Add swipe gesture support (reveal delete button)
- [ ] Style with proper spacing and hover effects
- [ ] Test on mobile and desktop

### 1.4 Transaction List Component
- [ ] Create `/components/transactions/transaction-list.tsx`
- [ ] Accept grouped transactions prop
- [ ] Render date group headers
- [ ] Render TransactionItem for each transaction
- [ ] Add loading skeleton state
- [ ] Add empty state ("Không có giao dịch nào")
- [ ] Style with proper spacing
- [ ] Test with various data sets

## Phase 2: Search & Filter UI (Day 2)

### 2.1 Search Bar Component
- [ ] Create `/components/transactions/search-bar.tsx` (client component)
- [ ] Add search input with debouncing (500ms)
- [ ] Add search icon
- [ ] Add clear button when input has value
- [ ] Update URL search params on input change
- [ ] Use `useRouter` and `usePathname`
- [ ] Preserve other search params
- [ ] Add loading indicator during search
- [ ] Style for mobile and desktop
- [ ] Test Vietnamese text search

### 2.2 Filter Modal Component
- [ ] Create `/components/transactions/filter-modal.tsx`
- [ ] Create trigger button ("Lọc" with icon)
- [ ] Use shadcn/ui Dialog or Sheet component
- [ ] Add filter sections:
  - [ ] Transaction type (All, Income, Expense)
  - [ ] Date range picker (start and end date)
  - [ ] Category selector (multi-select or single)
- [ ] Add "Apply Filters" button
- [ ] Add "Reset Filters" button
- [ ] Update URL search params on apply
- [ ] Show active filter count badge on trigger button
- [ ] Make mobile-friendly (bottom sheet on mobile)
- [ ] Test filter application

### 2.3 Date Range Picker
- [ ] Install `react-day-picker`: `npm install react-day-picker date-fns`
- [ ] Create `/components/ui/date-range-picker.tsx`
- [ ] Configure Vietnamese locale
- [ ] Add range selection mode
- [ ] Add preset buttons (This week, This month, Last 30 days)
- [ ] Format selected dates for display
- [ ] Return ISO date strings
- [ ] Style with Tailwind CSS
- [ ] Test date selection

### 2.4 Category Filter
- [ ] Fetch user categories (income + expense)
- [ ] Create category selector component
- [ ] Display categories with icons and colors
- [ ] Allow single or multiple selection
- [ ] Update filter state on selection
- [ ] Show selected count
- [ ] Test with many categories

## Phase 3: Swipe Actions & Delete (Day 3)

### 3.1 Swipe Gesture Implementation
- [ ] Install `react-swipeable`: `npm install react-swipeable`
- [ ] Update TransactionItem component
- [ ] Add swipe left gesture handler
- [ ] Reveal delete button on swipe
- [ ] Add swipe right to close
- [ ] Add visual feedback during swipe
- [ ] Limit swipe distance
- [ ] Auto-close other open swipes
- [ ] Test on touch devices

### 3.2 Delete Confirmation
- [ ] Create `/components/transactions/delete-dialog.tsx`
- [ ] Use shadcn/ui AlertDialog
- [ ] Show transaction details in confirmation
- [ ] Add "Cancel" and "Delete" buttons
- [ ] Style delete button as destructive
- [ ] Add loading state during deletion
- [ ] Test confirmation flow

### 3.3 Delete Action
- [ ] Create `/app/actions/transactions.ts`
- [ ] Implement `deleteTransactionAction(transactionId)`
- [ ] Verify user ownership
- [ ] Delete from database
- [ ] Revalidate "transactions" cache tag
- [ ] Return success/error response
- [ ] Handle errors gracefully

### 3.4 Delete Integration
- [ ] Connect swipe delete button to dialog
- [ ] Call delete action on confirmation
- [ ] Show loading state during deletion
- [ ] Update UI after successful deletion (remove item)
- [ ] Show toast/snackbar notification
- [ ] Handle errors (show error message)
- [ ] Add undo functionality (optional, advanced)
- [ ] Test complete delete flow

## Phase 4: Infinite Scroll & Pagination (Day 4)

### 4.1 Infinite Scroll Setup
- [ ] Create `/components/transactions/infinite-scroll.tsx`
- [ ] Use Intersection Observer API
- [ ] Create sentinel element at list bottom
- [ ] Detect when sentinel enters viewport
- [ ] Trigger page increment
- [ ] Prevent multiple simultaneous loads
- [ ] Add loading spinner at bottom
- [ ] Handle end of list (no more data)

### 4.2 Load More Implementation
- [ ] Update TransactionList to accept `hasMore` prop
- [ ] Create "Load More" button as fallback
- [ ] Implement client-side page state
- [ ] Fetch next page data on trigger
- [ ] Append new transactions to existing list
- [ ] Update URL with new page number
- [ ] Preserve filters during pagination
- [ ] Test with 100+ transactions

### 4.3 Scroll Position Restoration
- [ ] Save scroll position before navigation
- [ ] Restore scroll position on back navigation
- [ ] Use browser's built-in scroll restoration
- [ ] Test navigation to detail and back
- [ ] Test with deep scrolling

### 4.4 Performance Optimization
- [ ] Add virtual scrolling for very long lists (optional)
- [ ] Implement list item virtualization with `react-window`
- [ ] Optimize re-renders with React.memo
- [ ] Test with 1000+ transactions
- [ ] Measure scroll performance

## Phase 5: Export Functionality (Day 5)

### 5.1 CSV Export Setup
- [ ] Install `papaparse`: `npm install papaparse @types/papaparse`
- [ ] Create `/lib/utils/export.ts`
- [ ] Implement `exportToCSV(transactions, filename)`
- [ ] Define CSV column headers (Vietnamese)
- [ ] Map transaction data to CSV rows
- [ ] Include: Date, Name, Category, Type, Amount, Note
- [ ] Format amounts and dates properly
- [ ] Trigger browser download

### 5.2 Export Button Component
- [ ] Create `/components/transactions/export-button.tsx`
- [ ] Add export icon button
- [ ] Show dropdown with export options:
  - [ ] Export all (current filters)
  - [ ] Export selected (if selection mode)
  - [ ] Export date range
- [ ] Add loading state during export
- [ ] Show success notification
- [ ] Handle large datasets (potential timeout)
- [ ] Test export with various filters

### 5.3 Bulk Selection Mode (Optional)
- [ ] Add checkbox mode toggle button
- [ ] Show checkboxes on transaction items
- [ ] Track selected transaction IDs
- [ ] Add "Select All" option
- [ ] Add "Deselect All" option
- [ ] Show selected count in header
- [ ] Enable export/delete for selected items
- [ ] Test selection state management

### 5.4 Server Action for Export
- [ ] Create `exportTransactionsAction(userId, filters)`
- [ ] Fetch all matching transactions (no pagination)
- [ ] Generate CSV server-side (for large datasets)
- [ ] Return as downloadable file or base64
- [ ] Add rate limiting (prevent abuse)
- [ ] Test with 1000+ transactions

## Phase 6: Additional Features & Polish (Final Day)

### 6.1 Quick Filters
- [ ] Create `/components/transactions/quick-filters.tsx`
- [ ] Add preset filter chips:
  - [ ] "Today" (Hôm nay)
  - [ ] "This Week" (Tuần này)
  - [ ] "This Month" (Tháng này)
  - [ ] "Income Only" (Thu nhập)
  - [ ] "Expenses Only" (Chi tiêu)
- [ ] Style as horizontal scrollable chips
- [ ] Highlight active filters
- [ ] Update URL on click
- [ ] Test on mobile

### 6.2 Sort Options
- [ ] Add sort dropdown component
- [ ] Sort options:
  - [ ] Newest first (default)
  - [ ] Oldest first
  - [ ] Highest amount
  - [ ] Lowest amount
  - [ ] Category A-Z
- [ ] Update query based on sort
- [ ] Persist sort in URL
- [ ] Test all sort options

### 6.3 Statistics Bar
- [ ] Create `/components/transactions/stats-bar.tsx`
- [ ] Show filtered results summary:
  - [ ] Total transactions count
  - [ ] Total income sum
  - [ ] Total expense sum
  - [ ] Net balance
- [ ] Calculate from current filtered dataset
- [ ] Update when filters change
- [ ] Style as sticky header or top bar
- [ ] Make responsive

### 6.4 Loading States
- [ ] Create loading.tsx for transactions page
- [ ] Add skeleton for search bar
- [ ] Add skeleton for filter button
- [ ] Add skeleton for transaction list (10 items)
- [ ] Add skeleton for stats bar
- [ ] Match actual layout
- [ ] Test loading state

### 6.5 Error States
- [ ] Create error.tsx for transactions page
- [ ] Handle network errors
- [ ] Handle database errors
- [ ] Show friendly error messages
- [ ] Add "Retry" button
- [ ] Log errors for debugging
- [ ] Test error scenarios

### 6.6 Empty States
- [ ] Design empty state for no transactions
- [ ] Add illustration or icon
- [ ] Add "Add your first transaction" CTA
- [ ] Design empty state for no search results
- [ ] Show "No results for '{query}'" message
- [ ] Add "Clear filters" button
- [ ] Test both empty states

## Phase 7: Testing & Integration

### 7.1 Responsive Testing
- [ ] Test on mobile (320px - 428px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px+)
- [ ] Test landscape mode on mobile
- [ ] Verify touch interactions
- [ ] Test swipe gestures on touch devices

### 7.2 Accessibility
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Add focus indicators
- [ ] Verify color contrast
- [ ] Test with reduced motion

### 7.3 Performance Testing
- [ ] Test with 1000+ transactions
- [ ] Measure initial load time
- [ ] Measure scroll performance
- [ ] Measure search/filter response time
- [ ] Optimize slow queries
- [ ] Add performance monitoring

### 7.4 Integration Testing
- [ ] Test navigation from dashboard
- [ ] Test navigation to add transaction
- [ ] Test navigation to edit transaction
- [ ] Test data sync after add/edit/delete
- [ ] Test cache invalidation
- [ ] Test with multiple browser tabs

### 7.5 Cross-browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile Safari (iOS)
- [ ] Test on mobile Chrome (Android)

### 7.6 Documentation
- [ ] Document component APIs
- [ ] Add code comments
- [ ] Document filter system
- [ ] Document export functionality
- [ ] Create user guide for filters

---

## Acceptance Criteria

- ✅ Transactions list displays all user transactions
- ✅ Transactions are grouped by date (Today, Yesterday, date)
- ✅ Search works with Vietnamese text
- ✅ Filters work: date range, type, category
- ✅ Active filters are visible and removable
- ✅ Swipe to delete works on mobile
- ✅ Delete confirmation prevents accidental deletion
- ✅ Infinite scroll loads more transactions smoothly
- ✅ Export to CSV includes all filtered transactions
- ✅ Page is responsive on all devices
- ✅ Loading and error states are handled
- ✅ Empty states provide clear guidance
- ✅ Performance is smooth with 1000+ transactions
- ✅ Accessible via keyboard and screen reader
