# Tasks: User Authentication

**Feature Branch**: `001-authentication`  
**Estimated Effort**: 3-5 days

## Phase 1: Setup & Configuration (Day 1)

### 1.1 Project Dependencies
- [ ] Install NextAuth.js v5 beta (`next-auth@beta`)
- [ ] Install `@auth/prisma-adapter`
- [ ] Install `bcryptjs` and `@types/bcryptjs`
- [ ] Install `@vercel/postgres`
- [ ] Install `zod` for validation
- [ ] Install email service (`resend` or `sendgrid`)
- [ ] Verify all dependencies are compatible with Next.js 14+

### 1.2 Environment Configuration
- [ ] Create/update `.env.local` file
- [ ] Generate `AUTH_SECRET` using OpenSSL (`openssl rand -base64 32`)
- [ ] Set `DATABASE_URL` for Vercel Postgres
- [ ] Set `AUTH_URL` (e.g., `http://localhost:3000`)
- [ ] Configure `RESEND_API_KEY` for email service
- [ ] Add environment variables to `.gitignore`

### 1.3 Database Schema
- [ ] Create `users` table with columns: id, email, password_hash, created_at, last_login_at, email_verified
- [ ] Create `sessions` table for NextAuth session management
- [ ] Create `password_reset_tokens` table
- [ ] Add index on `users.email`
- [ ] Add index on `sessions.session_token`
- [ ] Add index on `sessions.expires`
- [ ] Add index on `password_reset_tokens.token`
- [ ] Test database connection and schema

### 1.4 NextAuth Configuration
- [ ] Create `auth.ts` in project root
- [ ] Configure Credentials provider
- [ ] Implement `authorize` function with email/password validation
- [ ] Add password hashing verification with bcrypt
- [ ] Set up JWT session strategy with 30-day expiration
- [ ] Configure custom pages (signIn: "/login", error: "/login")
- [ ] Implement JWT callback to add user ID
- [ ] Implement session callback to include user ID
- [ ] Update last_login_at on successful authentication
- [ ] Create `/app/api/auth/[...nextauth]/route.ts` with handlers

## Phase 2: Registration Feature (Day 2)

### 2.1 Registration Validation
- [ ] Create `/lib/validations/auth.ts`
- [ ] Define `registerSchema` with Zod
  - [ ] Email validation (valid format)
  - [ ] Password validation (min 8 chars, uppercase, lowercase, number, special char)
  - [ ] Confirm password matching
- [ ] Add Vietnamese error messages
- [ ] Export TypeScript type from schema

### 2.2 Registration Server Action
- [ ] Create `/app/actions/auth.ts`
- [ ] Implement `registerAction` function
  - [ ] Parse and validate form data
  - [ ] Check if email already exists
  - [ ] Hash password with bcrypt (saltRounds: 10)
  - [ ] Insert new user into database
  - [ ] Handle duplicate email errors
  - [ ] Return appropriate error messages
- [ ] Test with duplicate emails
- [ ] Test with invalid passwords

### 2.3 Registration UI
- [ ] Create `/app/(auth)/register/page.tsx`
- [ ] Create `/components/auth/register-form.tsx`
- [ ] Add email input field (type="email", min-h-44px)
- [ ] Add password input field with visibility toggle
- [ ] Add confirm password input field
- [ ] Implement form submission with `useFormState`
- [ ] Display validation errors from server
- [ ] Add loading state during submission
- [ ] Add "Already have an account?" link to login
- [ ] Style with Tailwind CSS
- [ ] Test responsive design (mobile, tablet, desktop)

### 2.4 Registration Testing
- [ ] Test successful registration flow
- [ ] Test duplicate email error handling
- [ ] Test password validation errors
- [ ] Test password mismatch error
- [ ] Test database record creation
- [ ] Test navigation after successful registration

## Phase 3: Login Feature (Day 3)

### 3.1 Login Validation
- [ ] Add `loginSchema` to `/lib/validations/auth.ts`
- [ ] Email validation
- [ ] Password validation (min 8 chars)
- [ ] Export TypeScript type

### 3.2 Login Server Action
- [ ] Implement `loginAction` in `/app/actions/auth.ts`
- [ ] Validate form data with Zod schema
- [ ] Call `signIn()` from NextAuth
- [ ] Handle authentication errors (invalid credentials)
- [ ] Return user-friendly error messages in Vietnamese
- [ ] Redirect to dashboard on success

### 3.3 Login UI
- [ ] Create `/app/(auth)/login/page.tsx`
- [ ] Create `/components/auth/login-form.tsx`
- [ ] Add email input field
- [ ] Add password input field with visibility toggle
- [ ] Add "Remember me" checkbox (optional)
- [ ] Implement form submission with `useFormState`
- [ ] Display authentication errors
- [ ] Add loading state during login
- [ ] Add "Forgot password?" link
- [ ] Add "Don't have an account?" link to register
- [ ] Style with Tailwind CSS
- [ ] Ensure accessibility (labels, ARIA attributes)

### 3.4 Login Testing
- [ ] Test successful login flow
- [ ] Test invalid email error
- [ ] Test invalid password error
- [ ] Test non-existent user error
- [ ] Test redirect to dashboard after login
- [ ] Test session creation
- [ ] Test last_login_at update

## Phase 4: Password Reset (Day 4)

### 4.1 Password Reset Request
- [ ] Create `/app/(auth)/forgot-password/page.tsx`
- [ ] Create `/components/auth/forgot-password-form.tsx`
- [ ] Add email input field
- [ ] Implement `requestPasswordResetAction` in `/app/actions/auth.ts`
  - [ ] Validate email exists in database
  - [ ] Generate random reset token
  - [ ] Set token expiration (1 hour)
  - [ ] Store token in database
  - [ ] Send reset email with token link
- [ ] Display success message (even if email doesn't exist - security)
- [ ] Test email delivery

### 4.2 Password Reset Form
- [ ] Create `/app/(auth)/reset-password/[token]/page.tsx`
- [ ] Verify token validity on page load
- [ ] Show error if token is expired or invalid
- [ ] Create `/components/auth/reset-password-form.tsx`
- [ ] Add new password input
- [ ] Add confirm password input
- [ ] Implement `resetPasswordAction`
  - [ ] Validate token
  - [ ] Check if token is used or expired
  - [ ] Validate new password
  - [ ] Hash new password
  - [ ] Update user password
  - [ ] Mark token as used
  - [ ] Clear all user sessions
- [ ] Redirect to login after successful reset
- [ ] Test complete flow

### 4.3 Email Templates
- [ ] Create `/lib/emails/password-reset.ts`
- [ ] Design password reset email template
- [ ] Add reset link with token
- [ ] Add expiration notice (1 hour)
- [ ] Add security warning
- [ ] Test email rendering
- [ ] Test with Resend/SendGrid

## Phase 5: Session Management & Middleware (Day 5)

### 5.1 Auth Middleware
- [ ] Create `/middleware.ts`
- [ ] Protect dashboard routes (require authentication)
- [ ] Redirect unauthenticated users to `/login`
- [ ] Redirect authenticated users away from auth pages
- [ ] Add public routes matcher
- [ ] Test middleware protection

### 5.2 Logout Functionality
- [ ] Implement `logoutAction` in `/app/actions/auth.ts`
- [ ] Call `signOut()` from NextAuth
- [ ] Clear session from database
- [ ] Redirect to login page
- [ ] Create logout button component
- [ ] Add to user menu/header
- [ ] Test logout flow

### 5.3 Session Utilities
- [ ] Create `/lib/auth/session.ts`
- [ ] Implement `getCurrentUser()` helper
- [ ] Implement `requireAuth()` helper
- [ ] Add session caching
- [ ] Test session helpers in Server Components

### 5.4 Auth UI Components
- [ ] Create `/components/auth/auth-guard.tsx` (client-side protection)
- [ ] Create `/components/auth/user-menu.tsx`
- [ ] Add user avatar/email display
- [ ] Add dropdown menu with logout
- [ ] Test in various layouts

## Phase 6: Testing & Polish (Final)

### 6.1 Integration Testing
- [ ] Test complete registration → login flow
- [ ] Test password reset flow end-to-end
- [ ] Test session persistence across page refreshes
- [ ] Test session expiration (30 days)
- [ ] Test concurrent sessions from different devices
- [ ] Test logout from all devices

### 6.2 Security Testing
- [ ] Verify passwords are properly hashed (never stored plain)
- [ ] Test SQL injection prevention
- [ ] Test CSRF protection (built-in to NextAuth)
- [ ] Verify secure session cookies (httpOnly, secure)
- [ ] Test rate limiting for login attempts (optional)
- [ ] Review error messages (no information leakage)

### 6.3 Error Handling
- [ ] Add error boundaries for auth components
- [ ] Handle network errors gracefully
- [ ] Add fallback UI for failed auth checks
- [ ] Test offline behavior
- [ ] Add proper logging for auth errors

### 6.4 Accessibility & UX
- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Add proper ARIA labels
- [ ] Test with browser autofill
- [ ] Add password strength indicator (optional)
- [ ] Test mobile touch interactions
- [ ] Verify form validation feedback is clear

### 6.5 Documentation
- [ ] Document authentication flow
- [ ] Add setup instructions to README
- [ ] Document environment variables
- [ ] Add API documentation for auth actions
- [ ] Create troubleshooting guide

---

## Acceptance Criteria

- ✅ Users can register with email and password
- ✅ Passwords are hashed and stored securely
- ✅ Users can log in with credentials
- ✅ Sessions persist for 30 days
- ✅ Users can reset forgotten passwords via email
- ✅ Protected routes require authentication
- ✅ Users can log out successfully
- ✅ All forms have proper validation and error messages
- ✅ UI is responsive on mobile, tablet, and desktop
- ✅ Accessible to screen readers and keyboard navigation
