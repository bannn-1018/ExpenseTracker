# Tasks: Settings & Category Management (Cài đặt & Quản lý Danh mục)

**Feature Branch**: `006-settings-categories`  
**Estimated Effort**: 4-5 days

## Phase 1: Settings Infrastructure (Day 1)

### 1.1 Database Schema
- [ ] Create `user_settings` table
  - [ ] id, user_id (unique foreign key)
  - [ ] currency (default 'VND')
  - [ ] theme (default 'system')
  - [ ] language (default 'vi')
  - [ ] date_format (default 'DD/MM/YYYY')
  - [ ] notification_enabled (default false)
  - [ ] notification_time (default '21:00:00')
  - [ ] created_at, updated_at
- [ ] Create index on user_id
- [ ] Add unique constraint on categories (user_id, name, type)
- [ ] Test schema creation

### 1.2 Settings Database Functions
- [ ] Create `/lib/db/settings.ts`
- [ ] Define `UserSettings` interface
- [ ] Implement `getUserSettings(userId)`
  - [ ] Query settings by user ID
  - [ ] Create default settings if not exists
  - [ ] Return settings object
- [ ] Implement `updateUserSettings(userId, settings)`
  - [ ] Build dynamic UPDATE query
  - [ ] Convert camelCase to snake_case
  - [ ] Update timestamp
  - [ ] Handle partial updates
- [ ] Test CRUD operations

### 1.3 Category Management Functions
- [ ] Create `/lib/db/category-management.ts`
- [ ] Implement `createCategory(userId, name, icon, type, color)`
  - [ ] Insert new category
  - [ ] Set is_system to false
  - [ ] Revalidate "categories" cache
  - [ ] Return new category ID
- [ ] Implement `updateCategory(userId, categoryId, updates)`
  - [ ] Build dynamic UPDATE query
  - [ ] Verify user ownership
  - [ ] Prevent updating system categories
  - [ ] Revalidate cache
- [ ] Implement `deleteCategory(userId, categoryId)`
  - [ ] Get default "Other" category ID
  - [ ] Reassign all transactions to "Other"
  - [ ] Delete category
  - [ ] Prevent deleting system categories
  - [ ] Revalidate cache
- [ ] Implement `getCategoryUsageCount(userId, categoryId)`
  - [ ] Count transactions using category
  - [ ] Return count
- [ ] Test all functions

### 1.4 Server Actions
- [ ] Create `/app/actions/settings.ts`
- [ ] Implement `updateSettingsAction(userId, formData)`
  - [ ] Parse form data
  - [ ] Validate settings
  - [ ] Update in database
  - [ ] Revalidate cache
  - [ ] Return success/error
- [ ] Create `/app/actions/categories.ts`
- [ ] Implement `createCategoryAction(userId, formData)`
- [ ] Implement `updateCategoryAction(userId, categoryId, formData)`
- [ ] Implement `deleteCategoryAction(userId, categoryId)`
- [ ] Add proper error handling
- [ ] Test actions

## Phase 2: Settings Page Layout (Day 2)

### 2.1 Settings Page Setup
- [ ] Create `/app/(dashboard)/settings/page.tsx`
- [ ] Add authentication check
- [ ] Fetch user settings
- [ ] Fetch categories
- [ ] Use Promise.all() for parallel fetching
- [ ] Set page metadata (title: "Cài đặt")

### 2.2 Page Structure
- [ ] Create header with title
- [ ] Create sections container
- [ ] Add spacing between sections
- [ ] Make responsive layout
- [ ] Test page rendering

### 2.3 Section Components
- [ ] Create `/components/settings/settings-section.tsx`
- [ ] Create `/components/settings/category-management.tsx`
- [ ] Create `/components/settings/account-section.tsx`
- [ ] Create `/components/settings/data-management.tsx`
- [ ] Create base section wrapper component
- [ ] Add section headers
- [ ] Style sections consistently

## Phase 3: Category Management UI (Day 3)

### 3.1 Category Management Section
- [ ] Update `/components/settings/category-management.tsx`
- [ ] Accept categories and userId props
- [ ] Separate categories by type (income/expense)
- [ ] Add "Add Category" button
- [ ] Create category list for expenses
- [ ] Create category list for income
- [ ] Add section headers
- [ ] Style with proper spacing

### 3.2 Category Item Component
- [ ] Create CategoryItem sub-component
- [ ] Display category icon with colored background
- [ ] Display category name
- [ ] Add Edit button (only for user categories)
- [ ] Add Delete button (only for user categories)
- [ ] Disable actions for system categories
- [ ] Add hover effects
- [ ] Make touch-friendly (44px min height)
- [ ] Test interaction

### 3.3 Category Dialog
- [ ] Create `/components/settings/category-dialog.tsx`
- [ ] Use shadcn/ui Dialog component
- [ ] Support two modes: "create" and "edit"
- [ ] Add form fields:
  - [ ] Category name input
  - [ ] Icon picker
  - [ ] Type selector (income/expense)
  - [ ] Color picker
- [ ] Add form validation
- [ ] Add submit button
- [ ] Add cancel button
- [ ] Show loading state
- [ ] Handle form submission
- [ ] Close dialog on success
- [ ] Test dialog functionality

### 3.4 Icon Picker Component
- [ ] Create `/components/settings/icon-picker.tsx`
- [ ] Use emoji picker or custom icon set
- [ ] Display grid of icons
- [ ] Highlight selected icon
- [ ] Make searchable (optional)
- [ ] Add popular icons section
- [ ] Test icon selection

### 3.5 Color Picker Component
- [ ] Create `/components/settings/color-picker.tsx`
- [ ] Display preset color swatches
- [ ] Add custom color input (optional)
- [ ] Highlight selected color
- [ ] Show color preview
- [ ] Return hex color value
- [ ] Test color selection

### 3.6 Delete Confirmation
- [ ] Add confirmation dialog before delete
- [ ] Show category name in confirmation
- [ ] Show number of transactions using category
- [ ] Explain transactions will move to "Other"
- [ ] Add "Cancel" and "Delete" buttons
- [ ] Style delete button as destructive
- [ ] Test deletion flow

## Phase 4: App Settings (Day 4)

### 4.1 General Settings Section
- [ ] Create settings section component
- [ ] Add Currency selector
  - [ ] VND, USD, EUR options
  - [ ] Display currency symbol
  - [ ] Update on change
- [ ] Add Date format selector
  - [ ] DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  - [ ] Show example for each format
  - [ ] Update on change
- [ ] Add Language selector
  - [ ] Vietnamese, English
  - [ ] Update on change (optional i18n integration)
- [ ] Test settings updates

### 4.2 Theme Settings
- [ ] Install next-themes: `npm install next-themes`
- [ ] Create theme provider wrapper
- [ ] Add theme selector:
  - [ ] Light theme
  - [ ] Dark theme
  - [ ] System (auto)
- [ ] Show theme preview
- [ ] Apply theme immediately
- [ ] Persist theme preference
- [ ] Test theme switching

### 4.3 Notification Settings
- [ ] Add notification toggle switch
- [ ] Add notification time picker
- [ ] Show notification permission status
- [ ] Request notification permission when enabled
- [ ] Save notification settings
- [ ] Test notification toggle

### 4.4 Settings Form Handling
- [ ] Use React Hook Form (optional)
- [ ] Add form validation
- [ ] Show unsaved changes warning
- [ ] Add "Save Changes" button
- [ ] Add "Reset" button
- [ ] Show loading state during save
- [ ] Show success/error messages
- [ ] Test form submission

## Phase 5: Account & Data Management (Day 5)

### 5.1 Account Section
- [ ] Display user email
- [ ] Display account creation date
- [ ] Add "Change Password" button
- [ ] Add "Change Email" button (optional)
- [ ] Link to password change page
- [ ] Test account display

### 5.2 Password Change
- [ ] Create `/app/(dashboard)/settings/change-password/page.tsx`
- [ ] Add current password field
- [ ] Add new password field
- [ ] Add confirm password field
- [ ] Validate password requirements
- [ ] Implement change password action
- [ ] Show success message
- [ ] Redirect after success
- [ ] Test password change

### 5.3 Data Export
- [ ] Add "Export All Data" button
- [ ] Implement export function
- [ ] Generate JSON with:
  - [ ] All transactions
  - [ ] All categories
  - [ ] User settings
- [ ] Generate CSV option
- [ ] Add timestamp to filename
- [ ] Trigger download
- [ ] Show progress indicator
- [ ] Test with large datasets

### 5.4 Data Import
- [ ] Add "Import Data" button
- [ ] Create file upload component
- [ ] Support CSV and JSON formats
- [ ] Validate file format
- [ ] Parse imported data
- [ ] Show preview before import
- [ ] Handle duplicates
- [ ] Import in batches
- [ ] Show progress
- [ ] Test import functionality

### 5.5 Account Deletion
- [ ] Add "Delete Account" button
- [ ] Style as destructive action
- [ ] Add confirmation dialog
- [ ] Require password confirmation
- [ ] Explain data deletion is permanent
- [ ] Implement delete account action
- [ ] Delete all user data:
  - [ ] Transactions
  - [ ] Categories
  - [ ] Settings
  - [ ] User account
- [ ] Sign out user
- [ ] Redirect to homepage
- [ ] Test deletion flow

## Phase 6: Notifications (Optional)

### 6.1 Web Push Setup
- [ ] Install web push library or use OneSignal
- [ ] Configure service worker
- [ ] Add manifest.json updates
- [ ] Request notification permission
- [ ] Store push subscription
- [ ] Test push permission

### 6.2 Daily Reminder
- [ ] Create notification scheduling system
- [ ] Use user's notification_time setting
- [ ] Schedule daily reminder
- [ ] Send notification: "Don't forget to log your expenses!"
- [ ] Handle notification click (open app)
- [ ] Test notification delivery

### 6.3 Budget Alerts (if budget feature exists)
- [ ] Check if user is over budget
- [ ] Send alert notification
- [ ] Include category and amount
- [ ] Test budget alerts

### 6.4 Notification Preferences
- [ ] Add notification type toggles:
  - [ ] Daily reminders
  - [ ] Budget alerts
  - [ ] Weekly summaries
- [ ] Save preferences
- [ ] Test preference updates

## Phase 7: Testing & Polish

### 7.1 Settings Testing
- [ ] Test all settings updates
- [ ] Test settings persistence
- [ ] Test default settings creation
- [ ] Test with invalid data
- [ ] Test concurrent updates
- [ ] Verify cache invalidation

### 7.2 Category Management Testing
- [ ] Test creating categories
- [ ] Test editing categories
- [ ] Test deleting categories
- [ ] Test category reassignment
- [ ] Test with many categories (100+)
- [ ] Test duplicate name prevention
- [ ] Verify system categories can't be modified

### 7.3 Data Export/Import Testing
- [ ] Test export with no data
- [ ] Test export with large dataset
- [ ] Test CSV export format
- [ ] Test JSON export format
- [ ] Test import validation
- [ ] Test import with invalid data
- [ ] Test import with duplicates

### 7.4 Responsive Testing
- [ ] Test on mobile (320px - 428px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px+)
- [ ] Test dialogs on mobile
- [ ] Test color picker on touch devices
- [ ] Test icon picker on mobile

### 7.5 Accessibility Testing
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Add ARIA labels
- [ ] Test form validation announcements
- [ ] Verify color contrast
- [ ] Add focus indicators
- [ ] Test with reduced motion

### 7.6 Performance Testing
- [ ] Test with many categories
- [ ] Test large data exports
- [ ] Optimize database queries
- [ ] Test settings page load time
- [ ] Measure interaction responsiveness

### 7.7 Integration Testing
- [ ] Test category changes reflect in transactions
- [ ] Test settings changes apply globally
- [ ] Test theme persistence across pages
- [ ] Test data sync after import
- [ ] Test with multiple browser tabs

### 7.8 Cross-browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile browsers
- [ ] Test theme on all browsers

### 7.9 Error Handling
- [ ] Test network failures
- [ ] Test database errors
- [ ] Test file upload errors
- [ ] Test invalid form submissions
- [ ] Verify error messages are clear
- [ ] Test error recovery

### 7.10 Documentation
- [ ] Document settings options
- [ ] Document category management
- [ ] Document export/import formats
- [ ] Add user guide
- [ ] Document notification setup
- [ ] Add developer notes

---

## Acceptance Criteria

- ✅ Users can create custom categories with name, icon, color
- ✅ Users can edit their own categories
- ✅ Users can delete categories (transactions reassigned)
- ✅ System categories cannot be edited or deleted
- ✅ Users can update app settings (currency, date format, theme)
- ✅ Theme changes apply immediately across the app
- ✅ Users can enable/disable notifications
- ✅ Users can export all data (JSON/CSV)
- ✅ Users can import data from files
- ✅ Users can change their password
- ✅ Users can delete their account
- ✅ All forms have proper validation
- ✅ Settings persist across sessions
- ✅ Page is responsive on all devices
- ✅ All interactive elements are accessible
- ✅ Category icons and colors are customizable
