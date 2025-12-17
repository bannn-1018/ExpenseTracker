# Feature Specification: Reports & Analysis (Báo cáo & Phân tích)

**Feature Branch**: `005-reports-analysis`  
**Created**: December 17, 2025  
**Status**: Draft  
**Input**: User description: "Màn hình Báo cáo & Phân tích - Biểu đồ cột so sánh Thu vs Chi, Phân tích danh mục, Dự báo số dư"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Income vs Expense Trends (Priority: P1)

As a user, I want to see a bar chart comparing my income and expenses over multiple months so that I can understand my financial trends over time.

**Why this priority**: This provides the key insight for long-term financial planning. Visual trend analysis is core value.

**Independent Test**: Can be fully tested by creating transactions across multiple months and verifying bar chart displays correct income vs expense comparison.

**Acceptance Scenarios**:

1. **Given** I have transactions across multiple months, **When** I view the reports screen, **Then** I see a bar chart showing income (green bars) vs expenses (red bars) for the last 6 months
2. **Given** I view the chart, **When** bars are displayed, **Then** each bar shows the amount label on top
3. **Given** I tap on a month bar (mobile), **When** selected, **Then** I see detailed breakdown for that month
4. **Given** I have months with no transactions, **When** viewing the chart, **Then** those months show ₫0 bars with appropriate indication
5. **Given** I am on mobile device, **When** viewing the chart, **Then** it is responsive and maintains readability (can scroll horizontally if needed)
6. **Given** I switch time range (3/6/12 months), **When** range changes, **Then** chart updates to show selected period

---

### User Story 2 - Analyze Spending by Category (Priority: P1)

As a user, I want to see a ranked list of my spending by category with percentages so that I can identify my biggest expense areas.

**Why this priority**: This is the actionable insight users need to improve their spending habits. Essential for financial awareness.

**Independent Test**: Can be tested by creating expenses in various categories and verifying ranked list shows correct amounts and percentages.

**Acceptance Scenarios**:

1. **Given** I have expenses in multiple categories for the selected period, **When** I view category analysis, **Then** I see a list ranked from highest to lowest spending
2. **Given** I view the category list, **When** displayed, **Then** each row shows category icon, name, amount spent, and percentage of total expenses
3. **Given** I view a category, **When** percentage is calculated, **Then** I see insight text like "Bạn đã chi 40% cho Ăn uống"
4. **Given** I tap on a category (mobile), **When** selected, **Then** I see a detailed view with all transactions in that category
5. **Given** I am on mobile device, **When** viewing the list, **Then** each category row is touch-friendly with min 44px height
6. **Given** I have only one category, **When** viewing analysis, **Then** it shows 100% without errors

---

### User Story 3 - View Spending Forecast (Priority: P2)

As a user, I want to see a forecast of my end-of-month balance based on current spending rate so that I can adjust my spending if needed.

**Why this priority**: Valuable for proactive financial management but requires sufficient transaction history to be accurate.

**Independent Test**: Can be tested by creating consistent spending pattern and verifying forecast calculation is reasonable.

**Acceptance Scenarios**:

1. **Given** I am halfway through the month with consistent spending, **When** I view forecast, **Then** I see projected end-of-month balance with confidence indicator
2. **Given** forecast is displayed, **When** I view the details, **Then** I see "Dựa trên tốc độ chi tiêu hiện tại, số dư cuối tháng ước tính: ₫X"
3. **Given** my forecast shows negative balance, **When** displayed, **Then** I see warning message in red "Cảnh báo: Có thể vượt ngân sách"
4. **Given** I don't have enough transaction history (less than 3 days), **When** viewing forecast, **Then** I see "Chưa đủ dữ liệu để dự báo"
5. **Given** I am on mobile device, **When** viewing forecast, **Then** the card is prominently displayed and easy to understand

---

### User Story 4 - Compare Periods (Priority: P3)

As a user, I want to compare my current month with previous month so that I can see if I'm improving my financial habits.

**Why this priority**: Useful for tracking progress but not essential for basic financial awareness.

**Independent Test**: Can be tested by comparing data across two months and verifying percentage changes are calculated correctly.

**Acceptance Scenarios**:

1. **Given** I have data for current and previous month, **When** I view comparison, **Then** I see percentage change indicators (↑ 15% higher spending, ↓ 10% lower spending)
2. **Given** comparison is displayed, **When** I view metrics, **Then** I see side-by-side comparison of total income, total expenses, and balance
3. **Given** spending increased significantly (>20%), **When** viewing comparison, **Then** I see insight "Chi tiêu tăng 25% so với tháng trước"
4. **Given** I am on mobile device, **When** viewing comparison, **Then** data is presented in compact, scrollable format

---

### User Story 5 - Export Report (Priority: P3)

As a user, I want to export a summary report as PDF or CSV so that I can share it or keep offline records.

**Why this priority**: Nice to have for professional use cases but most users will use in-app views.

**Independent Test**: Can be tested by exporting report and verifying it contains all relevant charts and data.

**Acceptance Scenarios**:

1. **Given** I am viewing reports, **When** I tap "Export Report", **Then** I can choose between PDF (visual report) or CSV (data only)
2. **Given** I export as PDF, **When** file is generated, **Then** it includes charts, category breakdown, and period summary
3. **Given** I export as CSV, **When** file is generated, **Then** it includes aggregated data by category and month
4. **Given** I am on mobile device, **When** I export, **Then** I can share the file via standard share sheet

---

### Edge Cases

- What happens when user has only expenses and no income? (Show expenses-only chart, indicate ₫0 income)
- How does chart handle very large amounts that don't fit in bar? (Scale appropriately, use abbreviated numbers like "1.2M")
- What happens when comparing months with vastly different spending? (Auto-scale chart, show percentage difference)
- How does forecast work on the first few days of the month? (Show "insufficient data" message)
- What happens when user has inconsistent spending pattern? (Lower forecast confidence, indicate variability)
- How does system handle categories with no spending in selected period? (Don't show in ranked list)
- What happens on very small mobile screens? (Make chart scrollable horizontally, prioritize important data)
- How does export handle missing data? (Include disclaimer or omit incomplete sections)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display bar chart comparing income vs expenses over selectable time periods (3/6/12 months)
- **FR-002**: Chart MUST use green bars for income and red bars for expenses
- **FR-003**: Chart MUST display amount labels on each bar
- **FR-004**: Chart MUST be interactive (tap to see details on mobile)
- **FR-005**: System MUST calculate and display category spending ranked from highest to lowest
- **FR-006**: Each category MUST show icon, name, total amount, and percentage of total expenses
- **FR-007**: System MUST provide insight text for top spending categories
- **FR-008**: System MUST calculate spending forecast based on current month's daily average
- **FR-009**: Forecast MUST show projected end-of-month balance with confidence indicator
- **FR-010**: System MUST show warning when forecast indicates negative balance
- **FR-011**: System MUST require minimum 3 days of data for forecast calculation
- **FR-012**: System MUST provide month-to-month comparison showing percentage changes
- **FR-013**: Comparison MUST include total income, total expenses, and balance metrics
- **FR-014**: System MUST provide export functionality for reports (PDF and CSV)
- **FR-015**: PDF export MUST include charts rendered as images
- **FR-016**: CSV export MUST include aggregated data by category and period
- **FR-017**: Charts MUST be fully responsive on mobile devices (320px - 428px width)
- **FR-018**: Charts MUST maintain readability on small screens (use horizontal scroll if needed)
- **FR-019**: All interactive elements MUST meet minimum 44x44px touch target size
- **FR-020**: System MUST show loading states while generating charts
- **FR-021**: System MUST show appropriate empty states when no data exists
- **FR-022**: System MUST format large numbers appropriately (use K, M abbreviations on charts)
- **FR-023**: Charts MUST render within 2 seconds on mobile 4G
- **FR-024**: System MUST auto-scale chart axes based on data range

### Key Entities

- **MonthlyTrend**: Month, total income, total expenses, net balance
- **CategoryAnalysis**: Category, total amount, percentage, transaction count, trend
- **Forecast**: Projected balance, confidence level, calculation method, warning flags
- **PeriodComparison**: Current period metrics, previous period metrics, percentage changes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Charts render within 2 seconds on mobile 4G (90th percentile)
- **SC-002**: Bar chart displays correctly on all mobile device sizes (320px - 428px)
- **SC-003**: Users can understand their top spending category within 5 seconds (user testing)
- **SC-004**: Forecast accuracy within 15% of actual end-of-month balance (measured retrospectively)
- **SC-005**: Reports achieve 90+ Lighthouse performance score on mobile
- **SC-006**: Charts maintain 60fps smooth interaction on mobile
- **SC-007**: Touch targets meet WCAG 2.1 AA standards (100% compliance)
- **SC-008**: Users find category insights actionable (80%+ in user surveys)
- **SC-009**: PDF export completes within 5 seconds for 12-month reports
- **SC-010**: Charts are readable without zooming on all mobile devices (95%+ user success)
- **SC-011**: Users can identify spending trends from chart in under 10 seconds (user testing)
- **SC-012**: Zero calculation errors in percentages and totals (automated testing)
- **SC-013**: Horizontal scroll (if used) is discoverable on mobile (90%+ user success)
