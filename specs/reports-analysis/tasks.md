# Tasks: Reports & Analysis (Báo cáo & Phân tích)

**Feature Branch**: `005-reports-analysis`  
**Estimated Effort**: 4-5 days

## Phase 1: Data Aggregation Layer (Day 1)

### 1.1 Analytics Database Functions Setup
- [ ] Create `/lib/db/analytics.ts`
- [ ] Define TypeScript interfaces:
  - [ ] `MonthlyTrend` interface
  - [ ] `CategoryAnalysis` interface
  - [ ] `SpendingForecast` interface
  - [ ] `PeriodComparison` interface

### 1.2 Monthly Trends Function
- [ ] Implement `getMonthlyTrends(userId, months)`
  - [ ] Query transactions grouped by month
  - [ ] Calculate total income per month
  - [ ] Calculate total expense per month
  - [ ] Calculate net balance per month
  - [ ] Sort by year and month
  - [ ] Limit to specified number of months (default 6)
  - [ ] Return array in chronological order
- [ ] Test with various month ranges
- [ ] Verify data accuracy

### 1.3 Category Analysis Function
- [ ] Implement `getCategoryAnalysis(userId, startDate, endDate)`
  - [ ] Join categories with transactions
  - [ ] Filter by date range and expense type
  - [ ] Group by category
  - [ ] Calculate total amount per category
  - [ ] Calculate percentage of total expenses
  - [ ] Count transactions per category
  - [ ] Calculate trend (up/down/stable) vs previous period
  - [ ] Sort by total amount descending
- [ ] Implement previous period comparison logic
- [ ] Test with various date ranges

### 1.4 Spending Forecast Function
- [ ] Implement `getSpendingForecast(userId)`
  - [ ] Get current month start and end dates
  - [ ] Calculate days passed in month
  - [ ] Return null if less than 3 days of data
  - [ ] Query income and expenses for current month
  - [ ] Calculate daily average expense
  - [ ] Project end-of-month expense
  - [ ] Calculate projected balance
  - [ ] Determine confidence level (high/medium/low)
  - [ ] Set warning flag if projected balance is negative
- [ ] Test with various days in month
- [ ] Verify projection accuracy

### 1.5 Period Comparison Function
- [ ] Implement `getPeriodComparison(userId, currentStart, currentEnd)`
  - [ ] Calculate previous period dates (same duration)
  - [ ] Query current period income and expenses
  - [ ] Query previous period income and expenses
  - [ ] Calculate net balances for both periods
  - [ ] Calculate percentage changes
  - [ ] Return comparison object with all metrics
- [ ] Test with various period lengths
- [ ] Handle edge cases (zero values)

## Phase 2: Charts Setup (Day 2)

### 2.1 Chart Library Installation
- [ ] Install Recharts: `npm install recharts`
- [ ] Verify compatibility with Next.js 14
- [ ] Test basic chart rendering
- [ ] Configure responsive container

### 2.2 Monthly Trend Line Chart
- [ ] Create `/components/reports/monthly-trend-chart.tsx`
- [ ] Import LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
- [ ] Accept `data` prop (MonthlyTrend[])
- [ ] Configure X axis with month labels
- [ ] Configure Y axis with formatted currency
- [ ] Add two lines: Income (green) and Expense (red)
- [ ] Add third line: Net Balance (blue)
- [ ] Configure responsive container
- [ ] Add custom tooltip with formatted values
- [ ] Style grid and axes
- [ ] Test with various data ranges
- [ ] Make mobile-responsive

### 2.3 Category Bar Chart
- [ ] Create `/components/reports/category-bar-chart.tsx`
- [ ] Import BarChart, Bar, XAxis, YAxis, Tooltip
- [ ] Accept `data` prop (CategoryAnalysis[])
- [ ] Configure X axis with category names
- [ ] Configure Y axis with amounts
- [ ] Use category colors for bars
- [ ] Add custom tooltip
- [ ] Limit to top 10 categories
- [ ] Handle long category names (truncate/rotate)
- [ ] Test with various datasets

### 2.4 Spending Forecast Gauge
- [ ] Create `/components/reports/forecast-gauge.tsx`
- [ ] Use RadialBarChart or custom circular progress
- [ ] Accept `forecast` prop (SpendingForecast)
- [ ] Show projected balance as percentage
- [ ] Color code: green (positive), red (negative), yellow (warning)
- [ ] Display confidence level
- [ ] Add warning indicator if needed
- [ ] Style for clarity
- [ ] Test with various projections

### 2.5 Comparison Card
- [ ] Create `/components/reports/comparison-card.tsx`
- [ ] Accept `comparison` prop (PeriodComparison)
- [ ] Display current vs previous metrics
- [ ] Show percentage change with arrows (↑ ↓)
- [ ] Color code changes (green for improvement, red for decline)
- [ ] Format all currency values
- [ ] Add labels in Vietnamese
- [ ] Make responsive
- [ ] Test with various comparisons

## Phase 3: Reports Page UI (Day 3)

### 3.1 Reports Page Setup
- [ ] Create `/app/(dashboard)/reports/page.tsx`
- [ ] Add authentication check
- [ ] Set page metadata (title: "Báo cáo & Phân tích")
- [ ] Define default time period (last 6 months)
- [ ] Parse URL params for custom date range

### 3.2 Time Period Selector
- [ ] Create `/components/reports/period-selector.tsx`
- [ ] Add preset buttons:
  - [ ] Last 3 months
  - [ ] Last 6 months
  - [ ] Last 12 months
  - [ ] This year
  - [ ] Custom range
- [ ] Add date range picker for custom
- [ ] Update URL params on selection
- [ ] Highlight active period
- [ ] Make responsive
- [ ] Test period switching

### 3.3 Data Fetching
- [ ] Fetch monthly trends data
- [ ] Fetch category analysis data
- [ ] Fetch spending forecast data
- [ ] Fetch period comparison data
- [ ] Use Promise.all() for parallel fetching
- [ ] Add caching with appropriate tags
- [ ] Handle errors gracefully
- [ ] Test with various date ranges

### 3.4 Reports Page Layout
- [ ] Create responsive grid layout
- [ ] Add PeriodSelector at top
- [ ] Add summary cards section:
  - [ ] Current period income/expense/balance
  - [ ] Comparison with previous period
- [ ] Add MonthlyTrendChart section (full width)
- [ ] Add CategoryBarChart section
- [ ] Add SpendingForecast section
- [ ] Add proper spacing and margins
- [ ] Test on mobile, tablet, desktop

### 3.5 Loading States
- [ ] Create `/app/(dashboard)/reports/loading.tsx`
- [ ] Add skeleton for period selector
- [ ] Add skeleton for summary cards
- [ ] Add skeleton for charts
- [ ] Match actual layout
- [ ] Test loading state

### 3.6 Error States
- [ ] Create `/app/(dashboard)/reports/error.tsx`
- [ ] Display friendly error message
- [ ] Add "Try Again" button
- [ ] Handle insufficient data (< 3 days)
- [ ] Test error scenarios

## Phase 4: Export & Download (Day 4)

### 4.1 PDF Export Setup
- [ ] Install jsPDF: `npm install jspdf`
- [ ] Install html2canvas: `npm install html2canvas`
- [ ] Verify compatibility
- [ ] Test basic PDF generation

### 4.2 PDF Template Component
- [ ] Create `/components/reports/pdf-template.tsx`
- [ ] Design printable report layout
- [ ] Include header with logo and date
- [ ] Include summary section
- [ ] Include charts (as images)
- [ ] Include category breakdown table
- [ ] Add footer with generation timestamp
- [ ] Style for print media
- [ ] Test PDF output quality

### 4.3 PDF Export Function
- [ ] Create `/lib/utils/pdf-export.ts`
- [ ] Implement `generateReportPDF(data, filename)`
- [ ] Capture chart elements as images
- [ ] Generate PDF with jsPDF
- [ ] Add text content
- [ ] Add images
- [ ] Format tables
- [ ] Trigger download
- [ ] Test PDF generation

### 4.4 Export Button Component
- [ ] Create `/components/reports/export-button.tsx`
- [ ] Add dropdown with export options:
  - [ ] Export as PDF
  - [ ] Export as CSV (raw data)
  - [ ] Export as Image (charts only)
- [ ] Add loading state during export
- [ ] Show success notification
- [ ] Handle errors (timeout, memory)
- [ ] Test all export formats

### 4.5 CSV Data Export
- [ ] Install papaparse if not already
- [ ] Implement CSV export for:
  - [ ] Monthly trends data
  - [ ] Category analysis data
- [ ] Format data properly
- [ ] Add Vietnamese column headers
- [ ] Trigger download
- [ ] Test CSV output

### 4.6 Chart Image Export
- [ ] Implement chart screenshot using html2canvas
- [ ] Export individual charts or all together
- [ ] Set appropriate image quality
- [ ] Trigger download as PNG
- [ ] Test image quality

## Phase 5: Advanced Analytics (Day 5)

### 5.1 Spending Patterns Analysis
- [ ] Create `/lib/db/spending-patterns.ts`
- [ ] Implement `getSpendingByDayOfWeek(userId, dateRange)`
  - [ ] Group expenses by day of week
  - [ ] Calculate average per day
  - [ ] Identify highest spending day
- [ ] Implement `getSpendingByTimeOfDay(userId, dateRange)`
  - [ ] Group by morning/afternoon/evening/night
  - [ ] Calculate totals per period
- [ ] Test pattern analysis

### 5.2 Budget vs Actual Comparison
- [ ] Fetch user budget settings (if feature exists)
- [ ] Compare actual spending to budget per category
- [ ] Calculate over/under budget amounts
- [ ] Calculate percentage of budget used
- [ ] Identify categories over budget
- [ ] Create visualization component
- [ ] Test comparison logic

### 5.3 Income vs Expense Timeline
- [ ] Create `/components/reports/income-expense-timeline.tsx`
- [ ] Use AreaChart from Recharts
- [ ] Show daily or weekly data points
- [ ] Stack income and expense areas
- [ ] Add reference line for break-even
- [ ] Color code areas
- [ ] Add interactive tooltip
- [ ] Make responsive
- [ ] Test with various timelines

### 5.4 Top Spending Categories Widget
- [ ] Create `/components/reports/top-categories.tsx`
- [ ] Display top 5 expense categories
- [ ] Show icon, name, amount, percentage
- [ ] Add mini bar chart for each
- [ ] Add trend indicator (vs previous period)
- [ ] Make compact and scannable
- [ ] Test with various data

### 5.5 Financial Health Score
- [ ] Create `/lib/utils/financial-health.ts`
- [ ] Implement score calculation algorithm:
  - [ ] Income/expense ratio (40%)
  - [ ] Saving rate (30%)
  - [ ] Spending consistency (20%)
  - [ ] Debt ratio (10%) - if applicable
- [ ] Return score 0-100
- [ ] Return grade (A-F) and color
- [ ] Return improvement suggestions
- [ ] Create score display component
- [ ] Test scoring algorithm

### 5.6 Insights & Recommendations
- [ ] Create `/components/reports/insights.tsx`
- [ ] Implement insight generation:
  - [ ] Detect unusual spending patterns
  - [ ] Identify categories with sharp increases
  - [ ] Detect potential savings opportunities
  - [ ] Generate personalized tips
- [ ] Display as card list
- [ ] Add icons for each insight type
- [ ] Make actionable (link to related features)
- [ ] Test insight generation

## Phase 6: Testing & Polish (Final Day)

### 6.1 Data Accuracy Testing
- [ ] Verify all calculations are correct
- [ ] Test with edge cases (zero values, negative)
- [ ] Test with single transaction
- [ ] Test with thousands of transactions
- [ ] Compare manual calculations with queries
- [ ] Verify date range filtering

### 6.2 Chart Rendering Testing
- [ ] Test charts with empty data
- [ ] Test charts with single data point
- [ ] Test charts with maximum data
- [ ] Test chart responsiveness
- [ ] Test chart interactions (hover, click)
- [ ] Test chart legends

### 6.3 Performance Testing
- [ ] Test with 1 year of data
- [ ] Test with 5 years of data
- [ ] Measure query performance
- [ ] Optimize slow queries
- [ ] Add query caching
- [ ] Test export with large datasets

### 6.4 Responsive Testing
- [ ] Test on mobile (320px - 428px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px+)
- [ ] Test charts on small screens
- [ ] Test export on mobile
- [ ] Verify touch interactions

### 6.5 Accessibility Testing
- [ ] Add ARIA labels for charts
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Provide text alternatives for charts
- [ ] Verify color contrast
- [ ] Add focus indicators
- [ ] Test with reduced motion

### 6.6 Cross-browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile browsers
- [ ] Test PDF export on all browsers

### 6.7 Integration Testing
- [ ] Test navigation from dashboard
- [ ] Test with fresh account (no data)
- [ ] Test with mature account (lots of data)
- [ ] Test data sync after adding transactions
- [ ] Test cache invalidation

### 6.8 Error Handling
- [ ] Test network errors
- [ ] Test database errors
- [ ] Test insufficient data scenarios
- [ ] Test export failures
- [ ] Verify error messages are clear
- [ ] Test error recovery

### 6.9 Documentation
- [ ] Document analytics functions
- [ ] Document chart components
- [ ] Add code comments
- [ ] Document export functionality
- [ ] Create user guide for reports
- [ ] Document performance considerations

---

## Acceptance Criteria

- ✅ Monthly trend chart displays income/expense over time
- ✅ Category analysis shows expense breakdown with percentages
- ✅ Spending forecast predicts end-of-month balance
- ✅ Period comparison shows changes vs previous period
- ✅ Users can select different time periods
- ✅ Reports can be exported as PDF
- ✅ Data can be exported as CSV
- ✅ Charts can be exported as images
- ✅ All calculations are accurate
- ✅ Charts are responsive on all devices
- ✅ Empty states and error states are handled
- ✅ Loading states provide feedback
- ✅ Performance is good with large datasets
- ✅ Reports are accessible via keyboard and screen reader
- ✅ Charts provide text alternatives for accessibility
