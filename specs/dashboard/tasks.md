# Tasks: Dashboard (Tổng quan)

**Feature Branch**: `002-dashboard`  
**Estimated Effort**: 4-6 days

## Phase 1: Data Layer & Utilities (Day 1)

### 1.1 Database Setup
- [ ] Verify `transactions` table exists with proper schema
- [ ] Verify `categories` table exists with proper schema
- [ ] Create index on `transactions(user_id, date DESC)`
- [ ] Create index on `transactions(user_id, type)`
- [ ] Create index on `transactions(user_id, category_id)`
- [ ] Create index on `categories(user_id, type)`
- [ ] Test index performance with sample data
- [ ] (Optional) Create materialized view `dashboard_summary` for performance
- [ ] (Optional) Create refresh function for materialized view

### 1.2 Seed Data for Categories
- [ ] Create `/scripts/seed-categories.ts`
- [ ] Define system categories for expenses (Ăn uống, Di chuyển, Mua sắm, etc.)
- [ ] Define system categories for income (Lương, Thưởng, Đầu tư, etc.)
- [ ] Assign icons and colors to each category
- [ ] Create seed function to insert system categories
- [ ] Run seed script to populate database
- [ ] Verify categories in database

### 1.3 Database Query Functions
- [ ] Create `/lib/db/dashboard.ts`
- [ ] Implement `getDateRange(filter: TimeFilter)` helper
  - [ ] Handle "day" filter (today 00:00 to now)
  - [ ] Handle "week" filter (start of week to now)
  - [ ] Handle "month" filter (start of month to now)
  - [ ] Handle "year" filter (start of year to now)
- [ ] Implement `getDashboardSummary(userId, filter)`
  - [ ] Query total income for period
  - [ ] Query total expense for period
  - [ ] Calculate total balance
  - [ ] Return formatted numbers
- [ ] Implement `getCategoryBreakdown(userId, filter)`
  - [ ] Join categories with transactions
  - [ ] Filter by expense type only
  - [ ] Group by category
  - [ ] Calculate totals and percentages
  - [ ] Sort by amount descending
- [ ] Implement `getRecentTransactions(userId, limit)`
  - [ ] Query latest transactions with category info
  - [ ] Limit to specified number
  - [ ] Order by date DESC, created_at DESC
  - [ ] Format response with category details
- [ ] Test all query functions with mock data

### 1.4 Utility Functions
- [ ] Create `/lib/utils/currency.ts`
- [ ] Implement `formatCurrency(amount)` - format VND with separators
- [ ] Implement `formatCompactCurrency(amount)` - use K, M, B notation
- [ ] Create `/lib/utils/date.ts`
- [ ] Implement `formatRelativeDate(date)` - "Hôm nay", "Hôm qua", etc.
- [ ] Implement `getFilterLabel(filter)` - Vietnamese labels
- [ ] Test utility functions

## Phase 2: Summary Cards Component (Day 2)

### 2.1 Summary Card Component
- [ ] Create `/components/dashboard/summary-card.tsx`
- [ ] Add props: title, amount, type, trend (optional), loading
- [ ] Display title with icon
- [ ] Display formatted amount with color (green/red based on type)
- [ ] Add trend indicator (↑ +5% from last period)
- [ ] Add loading skeleton state
- [ ] Style with Tailwind CSS (card, padding, shadows)
- [ ] Make responsive (adjust font sizes)

### 2.2 Summary Cards Container
- [ ] Create `/components/dashboard/summary-cards.tsx`
- [ ] Accept `summary` data prop (totalIncome, totalExpense, totalBalance)
- [ ] Create grid layout (3 cards on desktop, 1 on mobile)
- [ ] Render 3 cards:
  - [ ] Total Income card (green, trending up icon)
  - [ ] Total Expense card (red, trending down icon)
  - [ ] Balance card (blue/gray, balance icon)
- [ ] Add loading state for all cards
- [ ] Style grid with responsive gap and padding
- [ ] Test with various data values

### 2.3 Time Filter Component
- [ ] Create `/components/dashboard/time-filter.tsx`
- [ ] Create tab/button group for: Ngày, Tuần, Tháng, Năm
- [ ] Implement active state styling
- [ ] Use URL search params for filter state
- [ ] Update URL on filter change (useRouter, usePathname)
- [ ] Highlight active filter
- [ ] Make mobile-friendly (horizontal scroll or dropdown)
- [ ] Test filter switching

## Phase 3: Category Breakdown Chart (Day 3)

### 3.1 Chart Library Setup
- [ ] Install Recharts: `npm install recharts`
- [ ] Verify Recharts compatibility with Next.js 14
- [ ] Create test chart to ensure rendering

### 3.2 Pie Chart Component
- [ ] Create `/components/dashboard/category-pie-chart.tsx`
- [ ] Import PieChart, Pie, Cell from Recharts
- [ ] Accept `data` prop (array of categories with amount, percentage, color)
- [ ] Configure chart dimensions (responsive)
- [ ] Add custom colors from category data
- [ ] Add percentage labels on segments
- [ ] Add legend with category names
- [ ] Handle empty data state (show message)
- [ ] Add tooltip on hover
- [ ] Make responsive for mobile
- [ ] Test with various datasets

### 3.3 Category List Component
- [ ] Create `/components/dashboard/category-list.tsx`
- [ ] Display list of categories with breakdown
- [ ] Each item shows:
  - [ ] Category icon and name
  - [ ] Amount spent (formatted)
  - [ ] Percentage bar visualization
  - [ ] Number of transactions
- [ ] Sort by amount descending
- [ ] Limit to top 5 categories by default
- [ ] Add "View All" button to expand
- [ ] Add loading skeleton state
- [ ] Style with proper spacing and colors
- [ ] Test with various category counts

### 3.4 Category Breakdown Section
- [ ] Create `/components/dashboard/category-breakdown.tsx`
- [ ] Combine pie chart and category list
- [ ] Add section title "Chi tiêu theo danh mục"
- [ ] Add empty state when no expense data
- [ ] Make responsive (chart above list on mobile, side-by-side on desktop)
- [ ] Add loading state
- [ ] Test layout on different screen sizes

## Phase 4: Recent Transactions List (Day 4)

### 4.1 Transaction Item Component
- [ ] Create `/components/dashboard/transaction-item.tsx`
- [ ] Display category icon with background color
- [ ] Display transaction name and date
- [ ] Display amount (green for income, red for expense)
- [ ] Add proper spacing and alignment
- [ ] Make clickable (link to transaction detail)
- [ ] Add hover effect
- [ ] Style for mobile and desktop

### 4.2 Recent Transactions List
- [ ] Create `/components/dashboard/recent-transactions.tsx`
- [ ] Accept `transactions` array prop
- [ ] Render list of TransactionItem components
- [ ] Add section title "Giao dịch gần đây"
- [ ] Add "Xem tất cả" link to transactions page
- [ ] Handle empty state (no transactions message)
- [ ] Add loading skeleton (5 items)
- [ ] Limit to 5 most recent by default
- [ ] Test with various transaction counts

## Phase 5: Main Dashboard Page (Day 5)

### 5.1 Dashboard Page Setup
- [ ] Create `/app/(dashboard)/dashboard/page.tsx`
- [ ] Add authentication check with `auth()`
- [ ] Redirect to login if not authenticated
- [ ] Set up metadata (title, description)

### 5.2 Data Fetching
- [ ] Get user ID from session
- [ ] Get time filter from URL search params (default: "month")
- [ ] Fetch dashboard summary data
- [ ] Fetch category breakdown data
- [ ] Fetch recent transactions data
- [ ] Use Promise.all() for parallel fetching
- [ ] Handle errors gracefully
- [ ] Add cache tags for revalidation

### 5.3 Dashboard Layout
- [ ] Create responsive grid layout
- [ ] Add TimeFilter component at top
- [ ] Add SummaryCards section
- [ ] Add CategoryBreakdown section (full width)
- [ ] Add RecentTransactions section
- [ ] Add proper spacing between sections
- [ ] Test on mobile (stacked layout)
- [ ] Test on tablet (2-column hybrid)
- [ ] Test on desktop (full layout)

### 5.4 Pull-to-Refresh (Mobile)
- [ ] Create `/components/dashboard/pull-to-refresh.tsx` client component
- [ ] Implement touch event listeners (touchstart, touchmove, touchend)
- [ ] Calculate pull distance and show indicator
- [ ] Trigger refresh action on release
- [ ] Call `router.refresh()` to reload server data
- [ ] Add loading animation during refresh
- [ ] Test on mobile devices
- [ ] Ensure it doesn't interfere with scroll

## Phase 6: Loading & Error States (Day 6)

### 6.1 Loading UI
- [ ] Create `/app/(dashboard)/dashboard/loading.tsx`
- [ ] Add skeleton for TimeFilter
- [ ] Add skeleton for SummaryCards (3 cards)
- [ ] Add skeleton for CategoryBreakdown
- [ ] Add skeleton for RecentTransactions (5 items)
- [ ] Match layout of actual dashboard
- [ ] Test loading state

### 6.2 Error Handling
- [ ] Create `/app/(dashboard)/dashboard/error.tsx`
- [ ] Display friendly error message in Vietnamese
- [ ] Add "Thử lại" button to reload
- [ ] Add illustration or icon
- [ ] Log error to console/monitoring
- [ ] Test by simulating database error

### 6.3 Empty States
- [ ] Add empty state for no transactions
  - [ ] "Chưa có giao dịch nào"
  - [ ] Illustration or icon
  - [ ] "Thêm giao dịch đầu tiên" button
- [ ] Add empty state for no expense categories
- [ ] Test empty states with new user

### 6.4 Suspense Boundaries
- [ ] Wrap each major section in Suspense
- [ ] Add section-specific loading fallbacks
- [ ] Test streaming with slow queries
- [ ] Verify progressive rendering

## Phase 7: Caching & Performance (Final Day)

### 7.1 Data Caching
- [ ] Wrap query functions with `unstable_cache()`
- [ ] Add cache tags: "dashboard", "transactions"
- [ ] Set appropriate cache duration (5 minutes for dashboard)
- [ ] Test cache invalidation when new transaction added
- [ ] Add revalidate tags to server actions

### 7.2 Performance Optimization
- [ ] Optimize database queries (use EXPLAIN ANALYZE)
- [ ] Add database query logging in development
- [ ] Minimize client-side JavaScript
- [ ] Optimize chart rendering (consider lazy loading)
- [ ] Test with large datasets (1000+ transactions)
- [ ] Measure and optimize Time to First Byte (TTFB)
- [ ] Measure and optimize Largest Contentful Paint (LCP)

### 7.3 Responsive Testing
- [ ] Test on iPhone SE (320px width)
- [ ] Test on iPhone 12/13/14 (390px)
- [ ] Test on iPad (768px)
- [ ] Test on desktop (1024px, 1440px, 1920px)
- [ ] Verify touch interactions on mobile
- [ ] Test landscape orientation on mobile

### 7.4 Accessibility
- [ ] Add proper heading hierarchy (h1, h2, h3)
- [ ] Add ARIA labels for charts and interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Verify color contrast ratios
- [ ] Add focus indicators
- [ ] Test with reduced motion preference

## Phase 8: Integration & Testing

### 8.1 Integration with Other Features
- [ ] Ensure links to "Add Transaction" work
- [ ] Ensure links to "Transactions List" work
- [ ] Verify data updates after adding/editing transaction
- [ ] Test category filtering navigation

### 8.2 Cross-browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile browsers (Safari iOS, Chrome Android)

### 8.3 End-to-End Testing
- [ ] Test complete user flow: login → view dashboard
- [ ] Test filter switching and data updates
- [ ] Test with different time periods
- [ ] Test with various data volumes
- [ ] Test concurrent user sessions

### 8.4 Documentation
- [ ] Document dashboard components and props
- [ ] Add comments to complex query logic
- [ ] Document caching strategy
- [ ] Add README for dashboard feature
- [ ] Document performance considerations

---

## Acceptance Criteria

- ✅ Dashboard displays summary cards with income, expense, and balance
- ✅ Time filter (day, week, month, year) works correctly
- ✅ Category breakdown shows pie chart and list
- ✅ Recent transactions list displays latest 5 transactions
- ✅ All data is filtered by selected time period
- ✅ Dashboard is responsive on mobile, tablet, and desktop
- ✅ Pull-to-refresh works on mobile
- ✅ Loading states and error states are handled gracefully
- ✅ Empty states provide clear guidance
- ✅ Dashboard loads in under 2 seconds with caching
- ✅ All interactive elements are keyboard accessible
- ✅ Color contrast meets WCAG AA standards
