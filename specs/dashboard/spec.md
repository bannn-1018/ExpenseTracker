# Feature Specification: Dashboard (Tổng quan)

**Feature Branch**: `002-dashboard`  
**Created**: December 17, 2025  
**Status**: Draft  
**Input**: User description: "Màn hình Dashboard - Hiển thị tình trạng tài chính hiện tại với Thẻ số dư, Biểu đồ chi tiêu, Danh sách giao dịch gần đây, và Bộ lọc thời gian"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Financial Status (Priority: P1)

As a user, I want to see my current financial status (balance, income, expenses) immediately when I open the app so that I can quickly understand my financial situation.

**Why this priority**: This is the core value proposition of the app - giving users instant visibility into their finances. This is what users will see most frequently.

**Independent Test**: Can be fully tested by logging in and verifying that balance cards display correct totals for current month, delivering immediate value even without other features.

**Acceptance Scenarios**:

1. **Given** I have transactions in the current month, **When** I open the dashboard, **Then** I see three cards showing "Tổng số dư", "Tổng Thu", and "Tổng Chi" with correct calculations
2. **Given** I have no transactions, **When** I open the dashboard, **Then** I see balance cards showing ₫0 with helpful message "Bắt đầu thêm giao dịch đầu tiên"
3. **Given** I am on mobile device (320px width), **When** I view the dashboard, **Then** balance cards stack vertically and remain readable
4. **Given** I have large amounts (>999,999,999), **When** viewing balance cards, **Then** numbers are formatted with proper thousand separators (e.g., ₫1.234.567)
5. **Given** I have negative balance, **When** viewing total balance, **Then** the amount is displayed in red color

---

### User Story 2 - View Spending by Category (Priority: P1)

As a user, I want to see a visual breakdown of my spending by category so that I can understand where my money is going.

**Why this priority**: This provides the key insight users need to manage their spending. Visual representation is core to the value proposition.

**Independent Test**: Can be tested by adding expenses in different categories and verifying pie chart displays correct proportions and percentages.

**Acceptance Scenarios**:

1. **Given** I have expenses in multiple categories for the current month, **When** I view the dashboard, **Then** I see a pie chart showing the percentage distribution of spending across categories
2. **Given** I tap on a category segment in the pie chart (mobile), **When** the segment is selected, **Then** I see the exact amount and percentage for that category
3. **Given** I have only income and no expenses, **When** I view the dashboard, **Then** the chart shows empty state with message "Chưa có chi tiêu trong tháng này"
4. **Given** I am on mobile device, **When** I view the pie chart, **Then** it is responsive and maintains readability with proper legend placement
5. **Given** I have expenses in more than 5 categories, **When** viewing the chart on mobile, **Then** smaller categories are grouped as "Khác" to maintain clarity

---

### User Story 3 - View Recent Transactions (Priority: P2)

As a user, I want to see my 3-5 most recent transactions on the dashboard so that I can quickly verify my latest activities without navigating away.

**Why this priority**: Important for quick verification but not critical for initial financial overview. Users can access full list via transactions page.

**Independent Test**: Can be tested by creating transactions and verifying the most recent ones appear on dashboard with correct details.

**Acceptance Scenarios**:

1. **Given** I have at least 5 transactions, **When** I view the dashboard, **Then** I see a list of my 5 most recent transactions with icon, name, and amount
2. **Given** I tap on a recent transaction (mobile), **When** selected, **Then** I am taken to the transaction detail/edit screen
3. **Given** recent transactions include both income and expenses, **When** viewing the list, **Then** income amounts are shown in green and expense amounts in red
4. **Given** I have no transactions, **When** I view the dashboard, **Then** I see empty state "Chưa có giao dịch nào" with button "Thêm giao dịch"
5. **Given** I am on mobile device, **When** viewing recent transactions, **Then** each transaction row is touch-friendly with min 44px height

---

### User Story 4 - Filter by Time Period (Priority: P2)

As a user, I want to quickly switch between different time periods (Day/Week/Month/Year) so that I can see my financial data for different timeframes.

**Why this priority**: Useful for trend analysis but not critical for basic functionality. Default monthly view provides primary value.

**Independent Test**: Can be tested by switching between time filters and verifying all dashboard data updates correctly for selected period.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I tap the time filter buttons (Ngày/Tuần/Tháng/Năm), **Then** all dashboard data (balance cards, chart, recent transactions) updates to show data for selected period
2. **Given** I select "Ngày" filter, **When** viewing the dashboard, **Then** I see today's transactions and balance changes
3. **Given** I select "Năm" filter, **When** viewing the pie chart, **Then** I see annual spending breakdown
4. **Given** I am on mobile device, **When** viewing time filters, **Then** filter buttons are horizontally scrollable if needed and maintain touch-friendly sizing
5. **Given** I switch between time periods, **When** data is loading, **Then** I see skeleton loading states to prevent layout shift

---

### User Story 5 - Pull to Refresh on Mobile (Priority: P3)

As a mobile user, I want to pull down on the dashboard to refresh my data so that I can see the latest information.

**Why this priority**: Nice to have for mobile UX but not essential. Data can be refreshed by navigating away and back.

**Independent Test**: Can be tested by adding a transaction in another session and pull-to-refresh to see it appear.

**Acceptance Scenarios**:

1. **Given** I am on mobile device, **When** I pull down on the dashboard, **Then** I see a refresh indicator and data is reloaded
2. **Given** data is being refreshed, **When** pull-to-refresh is in progress, **Then** I see loading spinner and cannot trigger another refresh
3. **Given** new transactions were added elsewhere, **When** I complete pull-to-refresh, **Then** I see the updated data

---

### Edge Cases

- What happens when user has exactly ₫0 balance? (Display ₫0, neutral color)
- How does dashboard handle very long category names on mobile? (Truncate with ellipsis)
- What happens when loading dashboard data fails? (Show error state with retry button)
- How does system handle timezone differences? (Use user's local timezone for "today" filter)
- What happens when user rapidly switches between time filters? (Debounce requests, show loading state)
- How does pie chart display with only one category? (Show full circle with single color)
- What happens on landscape mode mobile devices? (Adjust layout to use horizontal space efficiently)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display total balance calculated as (total income - total expenses) for selected time period
- **FR-002**: System MUST display total income sum for selected time period  
- **FR-003**: System MUST display total expenses sum for selected time period
- **FR-004**: System MUST format currency amounts with VND symbol (₫) and thousand separators
- **FR-005**: System MUST display pie chart showing expense distribution by category as percentages
- **FR-006**: System MUST show color-coded categories in pie chart with corresponding legend
- **FR-007**: System MUST display 5 most recent transactions with category icon, name, date, and amount
- **FR-008**: System MUST provide time filter buttons for Day/Week/Month/Year views
- **FR-009**: System MUST default to "Month" view on first load
- **FR-010**: System MUST update all dashboard components when time filter changes
- **FR-011**: System MUST show income amounts in green and expense amounts in red
- **FR-012**: System MUST show negative balance in red color
- **FR-013**: System MUST display empty states when no data exists for selected period
- **FR-014**: System MUST be fully responsive on mobile devices (320px - 428px width)
- **FR-015**: System MUST stack balance cards vertically on mobile screens
- **FR-016**: System MUST make pie chart interactive on mobile (tap to see details)
- **FR-017**: System MUST implement pull-to-refresh on mobile devices
- **FR-018**: System MUST show loading states (skeleton screens) while data is loading
- **FR-019**: System MUST show error states with retry option when data loading fails
- **FR-020**: All interactive elements MUST meet minimum 44x44px touch target size
- **FR-021**: System MUST calculate balance in real-time as transactions are added/modified
- **FR-022**: Dashboard MUST load within 2 seconds on mobile 4G connection

### Key Entities

- **DashboardSummary**: Aggregated data containing total balance, total income, total expenses for a time period
- **CategoryBreakdown**: Category name, total amount, percentage of total expenses, color code
- **RecentTransaction**: Transaction ID, category, name, amount, date, type (income/expense)
- **TimeFilter**: Enum of Day/Week/Month/Year with corresponding date range calculations

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dashboard loads and displays data within 2 seconds on mobile 4G (90th percentile)
- **SC-002**: Balance calculations are 100% accurate (automated testing)
- **SC-003**: Dashboard achieves 90+ Lighthouse performance score on mobile
- **SC-004**: Pie chart renders correctly on all mobile device sizes (320px - 428px)
- **SC-005**: Users can understand their financial status within 5 seconds of opening the app (user testing)
- **SC-006**: Touch targets meet WCAG 2.1 AA standards (100% compliance)
- **SC-007**: Pull-to-refresh works smoothly on all mobile browsers (95%+ success rate)
- **SC-008**: Time filter switching updates data within 1 second
- **SC-009**: Layout maintains visual stability with CLS < 0.1
- **SC-010**: Dashboard is fully functional at 320px viewport width
