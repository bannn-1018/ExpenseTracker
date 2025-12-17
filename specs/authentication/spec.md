# Feature Specification: User Authentication

**Feature Branch**: `001-authentication`  
**Created**: December 17, 2025  
**Status**: Draft  
**Input**: User description: "Màn hình Đăng ký & Đăng nhập - Cho phép đăng ký & đăng nhập thông qua email và password"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration (Priority: P1)

As a new user, I want to register for an account using my email and password so that I can start tracking my expenses.

**Why this priority**: This is the entry point to the application. Without user registration, no other features can be used.

**Independent Test**: Can be fully tested by creating a new account with email/password and verifying the account is created and user can access the application.

**Acceptance Scenarios**:

1. **Given** I am on the registration screen, **When** I enter a valid email and a strong password (min 8 characters), **Then** my account is created and I am redirected to the dashboard
2. **Given** I am on the registration screen, **When** I enter an email that already exists, **Then** I see an error message "Email đã được sử dụng"
3. **Given** I am on the registration screen, **When** I enter a weak password (less than 8 characters), **Then** I see an error message "Mật khẩu phải có ít nhất 8 ký tự"
4. **Given** I am on the registration screen, **When** I enter an invalid email format, **Then** I see an error message "Email không hợp lệ"
5. **Given** I am on mobile device, **When** I view the registration form, **Then** all form fields are touch-friendly (min 44x44px tap targets) and keyboard opens with email input type

---

### User Story 2 - User Login (Priority: P1)

As a registered user, I want to log in to my account using my email and password so that I can access my expense data.

**Why this priority**: Login is essential for returning users to access their data. Equally critical as registration.

**Independent Test**: Can be tested by logging in with valid credentials and verifying access to protected features.

**Acceptance Scenarios**:

1. **Given** I have a registered account, **When** I enter my correct email and password, **Then** I am logged in and redirected to the dashboard
2. **Given** I am on the login screen, **When** I enter incorrect credentials, **Then** I see an error message "Email hoặc mật khẩu không đúng"
3. **Given** I am logged in, **When** I close and reopen the app, **Then** I remain logged in (session persists)
4. **Given** I am on mobile device, **When** I view the login form, **Then** the form is responsive and uses appropriate input types (email keyboard for email field)

---

### User Story 3 - Password Reset (Priority: P2)

As a user who forgot their password, I want to reset my password via email so that I can regain access to my account.

**Why this priority**: Important for user retention but not critical for initial launch. Users can contact support as a workaround.

**Independent Test**: Can be tested by requesting password reset, receiving email, and successfully changing password.

**Acceptance Scenarios**:

1. **Given** I forgot my password, **When** I click "Quên mật khẩu" and enter my email, **Then** I receive a password reset link via email
2. **Given** I received a reset link, **When** I click the link and enter a new password, **Then** my password is updated and I can login with the new password
3. **Given** I request a password reset, **When** I enter an email that doesn't exist in the system, **Then** I see a message "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu" (for security reasons)
4. **Given** I have a reset link, **When** the link is older than 1 hour, **Then** I see an error "Link đã hết hạn, vui lòng yêu cầu lại"

---

### User Story 4 - Logout (Priority: P1)

As a logged-in user, I want to log out of my account so that my data is secure when others use my device.

**Why this priority**: Critical for security, especially on shared devices.

**Independent Test**: Can be tested by logging out and verifying session is cleared and user cannot access protected features.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I click the logout button in settings, **Then** I am logged out and redirected to the login screen
2. **Given** I just logged out, **When** I try to access protected pages, **Then** I am redirected to the login screen
3. **Given** I am on mobile device, **When** I logout, **Then** the logout button is easily accessible from the main navigation

---

### Edge Cases

- What happens when a user tries to register while already logged in? (Should redirect to dashboard)
- How does the system handle network failures during login/registration? (Show appropriate error message with retry option)
- What happens if a user tries to use the same reset link twice? (Link should be invalidated after first use)
- How does the system handle special characters in passwords? (Should support all characters)
- What happens on mobile when the keyboard covers input fields? (Page should scroll to keep active input visible)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email and password
- **FR-002**: System MUST validate email addresses using standard email validation regex
- **FR-003**: System MUST enforce password minimum length of 8 characters
- **FR-004**: System MUST hash passwords before storing in database (using bcrypt or similar)
- **FR-005**: System MUST prevent duplicate email registrations
- **FR-006**: System MUST allow registered users to login with email and password
- **FR-007**: System MUST create secure session tokens upon successful login
- **FR-008**: System MUST persist user sessions across browser/app restarts
- **FR-009**: System MUST provide logout functionality that clears session
- **FR-010**: System MUST provide password reset via email functionality
- **FR-011**: System MUST expire password reset links after 1 hour
- **FR-012**: System MUST invalidate password reset links after use
- **FR-013**: System MUST protect all expense data routes with authentication
- **FR-014**: System MUST display appropriate error messages for all failure scenarios
- **FR-015**: Forms MUST be fully responsive on mobile devices (320px - 428px width)
- **FR-016**: Input fields MUST use appropriate mobile keyboard types (email, password)
- **FR-017**: All interactive elements MUST meet minimum touch target size of 44x44px
- **FR-018**: System MUST implement rate limiting on login attempts (max 5 attempts per 15 minutes)

### Key Entities

- **User**: Represents a registered user with email (unique), hashed password, creation date, last login date
- **Session**: Represents an active user session with user ID, token, expiration time
- **PasswordReset**: Represents a password reset request with user ID, token, expiration time, used status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration in under 1 minute on mobile devices
- **SC-002**: Login success rate of 95%+ for users with correct credentials
- **SC-003**: Password reset emails delivered within 30 seconds
- **SC-004**: Zero unauthorized access to user data (all routes properly protected)
- **SC-005**: Authentication forms achieve 90+ Lighthouse accessibility score on mobile
- **SC-006**: Touch targets meet WCAG 2.1 AA standards (minimum 44x44px)
- **SC-007**: Forms are fully usable on devices as small as 320px width
- **SC-008**: Session persistence works correctly across browser/app restarts (98%+ success rate)
