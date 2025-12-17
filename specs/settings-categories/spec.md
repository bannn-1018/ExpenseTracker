# Feature Specification: Settings & Category Management (Cài đặt & Quản lý Danh mục)

**Feature Branch**: `006-settings-categories`  
**Created**: December 17, 2025  
**Status**: Draft  
**Input**: User description: "Màn hình Quản lý Danh mục & Cài đặt - Quản lý Category (thêm, xóa, đổi icon), Cài đặt Tiền tệ, Thông báo nhắc nhở"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Expense Categories (Priority: P2)

As a user, I want to add, edit, and delete custom expense categories so that I can track spending in categories that matter to me.

**Why this priority**: Important for personalization but system provides default categories that work for most users initially.

**Independent Test**: Can be fully tested by creating custom categories and verifying they appear in transaction forms and reports.

**Acceptance Scenarios**:

1. **Given** I am in category management, **When** I tap "Thêm danh mục", **Then** I see a form to enter category name and select an icon
2. **Given** I create a custom category, **When** I save it, **Then** it appears in the category grid when adding transactions
3. **Given** I have a custom category, **When** I tap to edit it, **Then** I can change its name and icon
4. **Given** I want to delete a category, **When** I tap delete, **Then** I see confirmation "Xóa danh mục này? Các giao dịch sẽ được chuyển sang 'Khác'"
5. **Given** I am on mobile device, **When** viewing category list, **Then** each category row is touch-friendly with edit/delete buttons easily accessible
6. **Given** I select category icon, **When** icon picker opens, **Then** I see grid of available icons organized by theme

---

### User Story 2 - Set Default Currency (Priority: P2)

As a user, I want to set my preferred currency (VND, USD, EUR, etc.) so that all amounts are displayed in my currency.

**Why this priority**: Important for international users but most initial users will use default VND.

**Independent Test**: Can be tested by changing currency and verifying all amounts across the app update to new currency symbol.

**Acceptance Scenarios**:

1. **Given** I am in settings, **When** I tap "Tiền tệ", **Then** I see a list of supported currencies with search
2. **Given** I select a new currency, **When** I save, **Then** all amounts throughout the app update to show the new currency symbol
3. **Given** I change currency, **When** existing transactions are viewed, **Then** they display with new currency symbol (amounts not converted, just symbol changes)
4. **Given** I search for currency, **When** I type "usd", **Then** I see USD - United States Dollar
5. **Given** I am on mobile device, **When** selecting currency, **Then** the list is scrollable with easy-to-tap rows

---

### User Story 3 - Configure Reminder Notifications (Priority: P3)

As a user, I want to set up daily reminder notifications to log my expenses so that I don't forget to track my spending.

**Why this priority**: Helpful for habit building but not essential for core functionality. Users can manually open app.

**Independent Test**: Can be tested by enabling notifications and verifying notification appears at scheduled time.

**Acceptance Scenarios**:

1. **Given** I am in settings, **When** I toggle "Nhắc nhở hàng ngày", **Then** I am prompted to allow notifications (if not already allowed)
2. **Given** I enable reminders, **When** I set the time (e.g., 9:00 PM), **Then** I receive a notification at that time daily
3. **Given** I receive a reminder notification, **When** I tap it, **Then** the app opens to the add transaction screen
4. **Given** I want to disable reminders, **When** I toggle off, **Then** no more notifications are sent
5. **Given** I am on mobile device, **When** configuring notifications, **Then** system shows native notification permission prompt

---

### User Story 4 - Manage Account Settings (Priority: P2)

As a user, I want to view and update my account information (email, password) so that I can keep my account secure and up to date.

**Why this priority**: Important for account security but infrequently used after initial setup.

**Independent Test**: Can be tested by updating account information and verifying changes are saved correctly.

**Acceptance Scenarios**:

1. **Given** I am in settings, **When** I view account section, **Then** I see my current email and options to change password
2. **Given** I tap "Đổi mật khẩu", **When** form opens, **Then** I must enter current password and new password
3. **Given** I enter correct current password and valid new password, **When** I save, **Then** password is updated and I see "Đã cập nhật mật khẩu"
4. **Given** I enter incorrect current password, **When** I try to save, **Then** I see error "Mật khẩu hiện tại không đúng"
5. **Given** I am on mobile device, **When** entering passwords, **Then** password fields have show/hide toggle

---

### User Story 5 - Data Management (Priority: P3)

As a user, I want to export all my data or delete my account so that I have control over my personal information.

**Why this priority**: Important for privacy compliance but infrequently used. Required for GDPR/privacy compliance.

**Independent Test**: Can be tested by exporting data and verifying complete data is downloaded, and by deleting account and verifying all data is removed.

**Acceptance Scenarios**:

1. **Given** I am in settings, **When** I tap "Xuất tất cả dữ liệu", **Then** I receive a complete export of all my transactions and categories in JSON/CSV format
2. **Given** I tap "Xóa tài khoản", **When** confirmation dialog appears, **Then** I must type "DELETE" and enter password to confirm
3. **Given** I confirm account deletion, **When** process completes, **Then** all my data is permanently deleted and I am logged out
4. **Given** I export data on mobile, **When** export completes, **Then** I can share or save the file using native share sheet

---

### User Story 6 - App Preferences (Priority: P3)

As a user, I want to customize app preferences (theme, language, date format) so that the app feels personalized.

**Why this priority**: Nice to have for UX but not essential for functionality. Default settings work for most users.

**Independent Test**: Can be tested by changing preferences and verifying UI updates accordingly.

**Acceptance Scenarios**:

1. **Given** I am in settings, **When** I tap "Giao diện", **Then** I can choose between Light/Dark/System theme
2. **Given** I select Dark theme, **When** I save, **Then** entire app switches to dark mode immediately
3. **Given** I change language, **When** I select English, **Then** all text updates to English
4. **Given** I change date format, **When** I select DD/MM/YYYY or MM/DD/YYYY, **Then** all dates display in selected format
5. **Given** I am on mobile device, **When** changing preferences, **Then** changes apply immediately with smooth transitions

---

### Edge Cases

- What happens when user tries to delete a category with existing transactions? (Reassign transactions to "Other" category)
- How does system handle deleting all categories? (Prevent deletion of last category, maintain at least one default)
- What happens when currency is changed for an account with many transactions? (Only symbol changes, no conversion, show warning)
- How does notification permission work on devices that have denied it? (Show instructions to enable in device settings)
- What happens when user tries to change email to one that already exists? (Show error "Email đã được sử dụng")
- How does account deletion work when there's an error? (Rollback, don't delete partial data)
- What happens when exporting very large datasets (>10,000 transactions)? (Show progress, handle in background)
- How does theme switching work with cached pages? (Force reload or use CSS variables for instant switching)

## Requirements *(mandatory)*

### Functional Requirements

**Category Management:**
- **FR-001**: System MUST allow users to create custom expense and income categories
- **FR-002**: System MUST provide icon picker with at least 50 icons organized by theme
- **FR-003**: System MUST allow users to edit category name and icon
- **FR-004**: System MUST allow users to delete custom categories
- **FR-005**: System MUST reassign transactions to "Other" category when their category is deleted
- **FR-006**: System MUST prevent deletion of system default categories
- **FR-007**: System MUST show category usage count before deletion
- **FR-008**: Custom category names MUST be unique per user

**Currency Settings:**
- **FR-009**: System MUST support at least: VND, USD, EUR, GBP, JPY, CNY
- **FR-010**: System MUST allow users to select default currency
- **FR-011**: System MUST update currency symbol throughout app when changed
- **FR-012**: System MUST provide search functionality in currency picker
- **FR-013**: Currency change MUST only affect display, not transaction amounts

**Notification Settings:**
- **FR-014**: System MUST allow users to enable/disable daily reminders
- **FR-015**: System MUST allow users to set custom reminder time
- **FR-016**: System MUST request notification permissions appropriately
- **FR-017**: Notification tap MUST open app to add transaction screen
- **FR-018**: System MUST respect Do Not Disturb settings

**Account Settings:**
- **FR-019**: System MUST allow users to change password with current password verification
- **FR-020**: System MUST enforce password strength requirements on change
- **FR-021**: System MUST display current email (read-only or with verification for changes)
- **FR-022**: System MUST provide logout functionality

**Data Management:**
- **FR-023**: System MUST allow users to export all their data in JSON and CSV formats
- **FR-024**: Export MUST include all transactions, categories, and account info
- **FR-025**: System MUST allow users to delete their account permanently
- **FR-026**: Account deletion MUST require typed confirmation and password
- **FR-027**: Account deletion MUST remove all user data permanently
- **FR-028**: Export MUST complete within 10 seconds for up to 10,000 transactions

**App Preferences:**
- **FR-029**: System MUST support Light/Dark/System theme modes
- **FR-030**: System MUST persist theme selection across sessions
- **FR-031**: Optional: Support multiple languages (Vietnamese, English)
- **FR-032**: Optional: Support date format preferences (DD/MM/YYYY, MM/DD/YYYY)

**Mobile Responsiveness:**
- **FR-033**: Settings screen MUST be fully responsive on mobile (320px - 428px width)
- **FR-034**: All touch targets MUST be minimum 44x44px
- **FR-035**: Icon picker MUST be touch-friendly with 56x56px minimum icon sizes
- **FR-036**: Toggle switches MUST be large enough for easy tapping (48px width minimum)
- **FR-037**: Settings MUST be organized in collapsible sections on mobile

### Key Entities

- **Category**: ID, user_id, name, icon, type (expense/income), is_system (boolean), color, display_order
- **UserSettings**: user_id, currency, theme, language, date_format, notification_enabled, notification_time
- **NotificationSchedule**: user_id, time, frequency, enabled

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a custom category in under 30 seconds
- **SC-002**: Currency change updates entire app within 2 seconds
- **SC-003**: Notifications deliver within 1 minute of scheduled time (95%+ reliability)
- **SC-004**: Settings screen achieves 90+ Lighthouse accessibility score on mobile
- **SC-005**: Touch targets meet WCAG 2.1 AA standards (100% compliance)
- **SC-006**: Icon picker is usable on mobile without excessive scrolling (icons visible in max 2 screens)
- **SC-007**: Theme switching completes instantly (<500ms) with no flash
- **SC-008**: Data export completes within 10 seconds for 10,000 transactions
- **SC-009**: Account deletion success rate 100% (no partial deletions)
- **SC-010**: Users can find desired settings in under 20 seconds (user testing)
- **SC-011**: Password change requires current password verification (100% security compliance)
- **SC-012**: Settings are fully functional at 320px viewport width
- **SC-013**: Category management prevents orphaned transactions (100% automated testing)
- **SC-014**: Notification permission flow has 80%+ acceptance rate (user testing)
