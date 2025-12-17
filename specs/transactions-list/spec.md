# Feature Specification: Transactions List (Danh sách Giao dịch)

**Feature Branch**: `003-transactions-list`  
**Created**: December 17, 2025  
**Status**: Draft  
**Input**: User description: "Màn hình Danh sách Giao dịch - Quản lý chi tiết lịch sử thu chi với Thanh tìm kiếm, Bộ lọc nâng cao, Danh sách cuộn, và Export CSV"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Transactions (Priority: P1)

As a user, I want to view a complete list of all my transactions so that I can review my financial history.

**Why this priority**: This is the core transaction management feature. Users must be able to see their transaction history.

**Independent Test**: Can be fully tested by creating several transactions and verifying they all appear in a scrollable list grouped by date.

**Acceptance Scenarios**:

1. **Given** I have transactions, **When** I navigate to the transactions list, **Then** I see all transactions grouped by date (Hôm nay, Hôm qua, 15/10/2023, etc.)
2. **Given** I am viewing the list, **When** transactions are displayed, **Then** each transaction shows category icon, name, amount (red for expense, green for income), and time
3. **Given** I have many transactions, **When** I scroll down, **Then** older transactions load progressively (infinite scroll or pagination)
4. **Given** I tap on a transaction (mobile), **When** selected, **Then** I am taken to the transaction detail/edit screen
5. **Given** I am on mobile device, **When** viewing the list, **Then** each transaction row is touch-friendly with minimum 44px height
6. **Given** I have no transactions, **When** I view the list, **Then** I see empty state "Chưa có giao dịch nào" with button "Thêm giao dịch đầu tiên"

---

### User Story 2 - Search Transactions (Priority: P2)

As a user, I want to search for transactions by name or note so that I can quickly find specific transactions.

**Why this priority**: Important for usability with many transactions, but users can scroll through list as a workaround.

**Independent Test**: Can be tested by searching for transaction names/notes and verifying correct results appear.

**Acceptance Scenarios**:

1. **Given** I have transactions, **When** I type in the search bar, **Then** the list filters in real-time to show only matching transactions
2. **Given** I search for "cà phê", **When** results are displayed, **Then** I see all transactions with "cà phê" in name or note
3. **Given** my search has no results, **When** I view the list, **Then** I see "Không tìm thấy giao dịch nào"
4. **Given** I am on mobile device, **When** I tap the search bar, **Then** keyboard appears with search input type
5. **Given** I clear the search, **When** search is empty, **Then** all transactions are shown again

---

### User Story 3 - Filter Transactions (Priority: P2)

As a user, I want to filter transactions by date range, type (income/expense), and category so that I can analyze specific subsets of my transactions.

**Why this priority**: Important for detailed analysis but not essential for basic transaction viewing.

**Independent Test**: Can be tested by applying various filter combinations and verifying correct transactions are displayed.

**Acceptance Scenarios**:

1. **Given** I tap the filter button, **When** filter panel opens, **Then** I see options for Date Range, Type (Thu/Chi/Tất cả), and Category
2. **Given** I select date range "01/10/2023 - 31/10/2023", **When** I apply filter, **Then** only transactions within that range are shown
3. **Given** I select type "Chi tiền", **When** I apply filter, **Then** only expense transactions are shown
4. **Given** I select category "Ăn uống", **When** I apply filter, **Then** only transactions in that category are shown
5. **Given** I apply multiple filters, **When** filters are active, **Then** I see a filter indicator showing active filters count
6. **Given** filters are applied, **When** I tap "Xóa bộ lọc", **Then** all filters are cleared and full list is shown
7. **Given** I am on mobile device, **When** I open filter panel, **Then** it opens as a bottom sheet with touch-friendly controls

---

### User Story 4 - Export Transactions to CSV (Priority: P3)

As a user, I want to export my transactions to CSV format so that I can analyze them in spreadsheet software or keep offline backups.

**Why this priority**: Useful feature but not essential for daily use. Most users will use in-app features.

**Independent Test**: Can be tested by exporting transactions and verifying the CSV file contains correct data with proper formatting.

**Acceptance Scenarios**:

1. **Given** I have transactions, **When** I tap the "Export CSV" button, **Then** a CSV file is downloaded with all visible transactions (respecting active filters)
2. **Given** I export transactions, **When** I open the CSV file, **Then** it contains columns: Date, Category, Name, Note, Amount, Type
3. **Given** I have filters active, **When** I export, **Then** only filtered transactions are included in the CSV
4. **Given** I am on mobile device, **When** I export CSV, **Then** I can choose where to save the file or share it
5. **Given** I have no transactions, **When** I attempt to export, **Then** I see message "Không có giao dịch để xuất"

---

### User Story 5 - Quick Delete Transaction (Priority: P2)

As a user, I want to quickly delete a transaction by swiping on mobile or clicking delete button so that I can remove incorrect entries.

**Why this priority**: Important for maintaining accurate records but not critical for viewing transactions.

**Independent Test**: Can be tested by deleting transactions via swipe gesture or button and verifying they are removed.

**Acceptance Scenarios**:

1. **Given** I am on mobile device, **When** I swipe left on a transaction, **Then** I see a delete button
2. **Given** delete button is shown, **When** I tap delete, **Then** I see confirmation dialog "Xóa giao dịch này?"
3. **Given** I confirm deletion, **When** transaction is deleted, **Then** it is removed from the list and I see success message "Đã xóa giao dịch"
4. **Given** I swipe left then swipe right, **When** I change my mind, **Then** the delete button is hidden
5. **Given** I am on desktop, **When** I hover over a transaction, **Then** I see a delete icon button

---

### Edge Cases

- What happens when user scrolls to the bottom of a very long list? (Implement pagination or virtual scrolling for performance)
- How does search handle special characters and Vietnamese accents? (Support accent-insensitive search)
- What happens when applying filters that result in no matches? (Show empty state with current filter info)
- How does system handle date range selection across different months/years? (Provide calendar picker)
- What happens when export contains thousands of transactions? (Show loading indicator, handle large files)
- How does swipe-to-delete work with horizontal scrolling? (Properly detect swipe direction)
- What happens when network fails during deletion? (Show error, maintain local state)
- How does list handle real-time updates from other devices? (Auto-refresh or show "New transactions available" banner)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all user transactions in reverse chronological order (newest first)
- **FR-002**: System MUST group transactions by date with headers (Hôm nay, Hôm qua, date)
- **FR-003**: Each transaction MUST display category icon, name, amount, and time
- **FR-004**: System MUST show expense amounts in red and income amounts in green
- **FR-005**: System MUST implement infinite scroll or pagination for performance with many transactions
- **FR-006**: System MUST provide search functionality filtering by transaction name or note
- **FR-007**: Search MUST be real-time (filter as user types)
- **FR-008**: Search MUST be accent-insensitive for Vietnamese text
- **FR-009**: System MUST provide filter options for: date range, transaction type, category
- **FR-010**: System MUST allow multiple filters to be applied simultaneously
- **FR-011**: System MUST show visual indicator when filters are active
- **FR-012**: System MUST provide "clear all filters" functionality
- **FR-013**: System MUST export transactions to CSV format
- **FR-014**: CSV export MUST include: date, category, name, note, amount, type
- **FR-015**: CSV export MUST respect currently active filters
- **FR-016**: System MUST provide swipe-to-delete gesture on mobile devices
- **FR-017**: System MUST show confirmation dialog before deleting transactions
- **FR-018**: System MUST provide delete button on desktop hover/click
- **FR-019**: System MUST be fully responsive on mobile devices (320px - 428px width)
- **FR-020**: Filter panel MUST open as bottom sheet on mobile
- **FR-021**: Date range picker MUST be touch-friendly on mobile
- **FR-022**: All touch targets MUST be minimum 44x44px
- **FR-023**: System MUST show loading states during data fetching
- **FR-024**: System MUST show appropriate empty states when no transactions exist
- **FR-025**: Transaction list MUST load within 2 seconds on mobile 4G

### Key Entities

- **Transaction**: ID, user ID, category, name, note, amount, type (income/expense), date, created_at
- **TransactionFilter**: Date range (start, end), type filter, category filter
- **SearchQuery**: Search text, matching transaction IDs

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Transaction list loads within 2 seconds on mobile 4G (90th percentile)
- **SC-002**: Search results appear within 300ms of typing
- **SC-003**: Users can successfully find specific transactions in under 30 seconds (user testing)
- **SC-004**: List achieves 90+ Lighthouse performance score on mobile
- **SC-005**: Infinite scroll maintains 60fps scroll performance
- **SC-006**: Swipe-to-delete gesture has 95%+ success rate on mobile
- **SC-007**: Filter combinations work correctly 100% of the time (automated testing)
- **SC-008**: CSV export completes within 5 seconds for up to 1000 transactions
- **SC-009**: Touch targets meet WCAG 2.1 AA standards (100% compliance)
- **SC-010**: List is fully functional at 320px viewport width
- **SC-011**: Users can delete transactions with 2 taps (95% task success rate)
- **SC-012**: Filter panel is easily discoverable and usable on mobile (90% user success rate)
