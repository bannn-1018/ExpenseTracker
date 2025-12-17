# Technical Plan: User Authentication

**Feature Branch**: `001-authentication`  
**Created**: December 17, 2025  
**Tech Stack**: Next.js 14+ (App Router), Vercel Postgres, NextAuth.js  
**Estimated Effort**: 3-5 days

## Architecture Overview

### Tech Stack Components
- **Frontend**: Next.js 14+ with App Router, React Server Components
- **Authentication**: NextAuth.js v5 (Auth.js) with Credentials Provider
- **Database**: Vercel Postgres (PostgreSQL)
- **Password Hashing**: bcrypt
- **Email Service**: Resend or SendGrid
- **Validation**: Zod
- **UI Components**: Tailwind CSS, shadcn/ui
- **State Management**: React Server Actions + useFormState

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE
);

-- Sessions table (managed by NextAuth)
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires);
CREATE INDEX idx_password_reset_tokens ON password_reset_tokens(token);
```

## Implementation Plan

### Phase 1: Setup & Configuration (Day 1)

#### 1.1 Project Setup
```bash
# Install dependencies
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install @vercel/postgres zod
npm install resend # for emails
npm install -D @types/bcryptjs
```

#### 1.2 Environment Configuration
```env
# .env.local
DATABASE_URL="postgres://..."
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_..."
```

#### 1.3 NextAuth Configuration
**File**: `auth.ts`
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const { email, password } = loginSchema.parse(credentials)
        
        const result = await sql`
          SELECT * FROM users WHERE email = ${email}
        `
        const user = result.rows[0]
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) return null
        
        // Update last login
        await sql`
          UPDATE users SET last_login_at = CURRENT_TIMESTAMP 
          WHERE id = ${user.id}
        `
        
        return {
          id: user.id.toString(),
          email: user.email
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
```

**File**: `app/api/auth/[...nextauth]/route.ts`
```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### Phase 2: Registration Feature (Day 2)

#### 2.1 Registration Page
**File**: `app/(auth)/register/page.tsx`
```typescript
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Đăng ký</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
```

#### 2.2 Registration Form Component
**File**: `components/auth/register-form.tsx`
```typescript
"use client"

import { useFormState } from "react-dom"
import { registerAction } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, null)
  
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="min-h-[44px]"
        />
      </div>
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Mật khẩu (ít nhất 8 ký tự)"
          required
          minLength={8}
          className="min-h-[44px]"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" className="w-full min-h-[44px]">
        Đăng ký
      </Button>
    </form>
  )
}
```

#### 2.3 Registration Server Action
**File**: `app/actions/auth.ts`
```typescript
"use server"

import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { redirect } from "next/navigation"
import { signIn } from "@/auth"

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự")
})

export async function registerAction(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  })
  
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message
    }
  }
  
  const { email, password } = validatedFields.data
  
  try {
    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    
    if (existingUser.rows.length > 0) {
      return { error: "Email đã được sử dụng" }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Create user
    await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${passwordHash})
    `
    
    // Auto sign in after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false
    })
    
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Có lỗi xảy ra, vui lòng thử lại" }
  }
  
  redirect("/dashboard")
}
```

### Phase 3: Login Feature (Day 2)

#### 3.1 Login Page
**File**: `app/(auth)/login/page.tsx`
```typescript
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Đăng nhập</h1>
        <LoginForm />
        <div className="mt-4 text-center space-y-2">
          <Link 
            href="/forgot-password" 
            className="text-sm text-blue-600 hover:underline block"
          >
            Quên mật khẩu?
          </Link>
          <Link 
            href="/register" 
            className="text-sm text-blue-600 hover:underline block"
          >
            Chưa có tài khoản? Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}
```

#### 3.2 Login Form Component
**File**: `components/auth/login-form.tsx`
```typescript
"use client"

import { useFormState } from "react-dom"
import { loginAction } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, null)
  
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="min-h-[44px]"
        />
      </div>
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          required
          className="min-h-[44px]"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" className="w-full min-h-[44px]">
        Đăng nhập
      </Button>
    </form>
  )
}
```

#### 3.3 Login Server Action
```typescript
// Add to app/actions/auth.ts

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false
    })
  } catch (error) {
    return { error: "Email hoặc mật khẩu không đúng" }
  }
  
  redirect("/dashboard")
}
```

### Phase 4: Password Reset (Day 3)

#### 4.1 Forgot Password Page
**File**: `app/(auth)/forgot-password/page.tsx`
```typescript
"use client"

import { useFormState } from "react-dom"
import { forgotPasswordAction } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPasswordAction, null)
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Quên mật khẩu</h1>
        <form action={formAction} className="space-y-4">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="min-h-[44px]"
          />
          {state?.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <Button type="submit" className="w-full min-h-[44px]">
            Gửi link đặt lại mật khẩu
          </Button>
        </form>
      </div>
    </div>
  )
}
```

#### 4.2 Forgot Password Action
```typescript
// Add to app/actions/auth.ts

import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  
  try {
    const user = await sql`SELECT id FROM users WHERE email = ${email}`
    
    // Always show success message for security
    if (user.rows.length === 0) {
      return {
        success: "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu"
      }
    }
    
    const userId = user.rows[0].id
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 hour
    
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires)
      VALUES (${userId}, ${token}, ${expires})
    `
    
    const resetLink = `${process.env.AUTH_URL}/reset-password?token=${token}`
    
    await resend.emails.send({
      from: "noreply@expensetracker.com",
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `
        <p>Click vào link sau để đặt lại mật khẩu:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
      `
    })
    
    return {
      success: "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu"
    }
  } catch (error) {
    console.error("Forgot password error:", error)
    return { error: "Có lỗi xảy ra, vui lòng thử lại" }
  }
}
```

#### 4.3 Reset Password Page
**File**: `app/(auth)/reset-password/page.tsx`
```typescript
"use client"

import { useFormState } from "react-dom"
import { useSearchParams } from "next/navigation"
import { resetPasswordAction } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, formAction] = useFormState(resetPasswordAction, null)
  
  if (!token) {
    return <div>Link không hợp lệ</div>
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Đặt lại mật khẩu</h1>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <Input
            type="password"
            name="password"
            placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
            required
            minLength={8}
            className="min-h-[44px]"
          />
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <Button type="submit" className="w-full min-h-[44px]">
            Đặt lại mật khẩu
          </Button>
        </form>
      </div>
    </div>
  )
}
```

#### 4.4 Reset Password Action
```typescript
// Add to app/actions/auth.ts

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  
  if (password.length < 8) {
    return { error: "Mật khẩu phải có ít nhất 8 ký tự" }
  }
  
  try {
    const result = await sql`
      SELECT user_id, expires, used
      FROM password_reset_tokens
      WHERE token = ${token}
    `
    
    if (result.rows.length === 0) {
      return { error: "Link không hợp lệ hoặc đã hết hạn" }
    }
    
    const { user_id, expires, used } = result.rows[0]
    
    if (used || new Date() > new Date(expires)) {
      return { error: "Link đã hết hạn, vui lòng yêu cầu lại" }
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${user_id}`
    await sql`UPDATE password_reset_tokens SET used = true WHERE token = ${token}`
    
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "Có lỗi xảy ra, vui lòng thử lại" }
  }
  
  redirect("/login")
}
```

### Phase 5: Protected Routes & Logout (Day 4)

#### 5.1 Middleware for Protected Routes
**File**: `middleware.ts`
```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/register")
  
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
```

#### 5.2 Logout Component
**File**: `components/auth/logout-button.tsx`
```typescript
import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({ redirectTo: "/login" })
      }}
    >
      <Button type="submit" variant="ghost" className="min-h-[44px]">
        Đăng xuất
      </Button>
    </form>
  )
}
```

### Phase 6: Mobile Optimization & Testing (Day 5)

#### 6.1 Responsive Layout
**File**: `app/(auth)/layout.tsx`
```typescript
export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
```

#### 6.2 Mobile Viewport Meta
**File**: `app/layout.tsx`
```typescript
export const metadata = {
  viewport: "width=device-width, initial-scale=1, maximum-scale=5"
}
```

#### 6.3 Rate Limiting (Optional but Recommended)
**File**: `lib/rate-limit.ts`
```typescript
import { sql } from "@vercel/postgres"

export async function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now()
  const windowStart = new Date(now - windowMs)
  
  await sql`DELETE FROM rate_limits WHERE created_at < ${windowStart}`
  
  const attempts = await sql`
    SELECT COUNT(*) as count FROM rate_limits
    WHERE identifier = ${identifier} AND created_at >= ${windowStart}
  `
  
  if (attempts.rows[0].count >= maxAttempts) {
    return false
  }
  
  await sql`INSERT INTO rate_limits (identifier) VALUES (${identifier})`
  
  return true
}

// Add to database schema:
// CREATE TABLE rate_limits (
//   id SERIAL PRIMARY KEY,
//   identifier VARCHAR(255),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/auth.test.ts
import { registerAction, loginAction } from "@/app/actions/auth"

describe("Authentication", () => {
  test("should register new user", async () => {
    const formData = new FormData()
    formData.append("email", "test@example.com")
    formData.append("password", "password123")
    
    const result = await registerAction(null, formData)
    expect(result?.error).toBeUndefined()
  })
  
  test("should reject duplicate email", async () => {
    // ... test implementation
  })
  
  test("should reject weak password", async () => {
    // ... test implementation
  })
})
```

### E2E Tests (Playwright)
```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test"

test("complete registration flow", async ({ page }) => {
  await page.goto("/register")
  await page.fill('input[name="email"]', "newuser@test.com")
  await page.fill('input[name="password"]', "securepass123")
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL("/dashboard")
})
```

## Performance Targets

- **Login/Register response time**: < 1 second
- **Session validation**: < 100ms
- **Password reset email delivery**: < 30 seconds
- **Mobile Lighthouse scores**: 90+ for all metrics

## Security Checklist

- ✅ Passwords hashed with bcrypt (cost factor 10+)
- ✅ HTTPS enforced in production
- ✅ Session tokens cryptographically secure
- ✅ Rate limiting on authentication endpoints
- ✅ No sensitive data in client-side code
- ✅ CSRF protection via NextAuth
- ✅ Input validation with Zod
- ✅ SQL injection prevention via parameterized queries

## Deployment Checklist

1. Set environment variables in Vercel
2. Run database migrations
3. Test authentication flow in staging
4. Configure email service (Resend)
5. Set up monitoring for failed logins
6. Deploy to production
7. Test on real mobile devices

## Future Enhancements

- OAuth providers (Google, GitHub)
- Two-factor authentication
- Email verification
- Session management (view/revoke active sessions)
- Account lockout after failed attempts
