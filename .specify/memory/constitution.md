# ExpenseTracker Constitution

## Core Principles

### I. Type Safety First
TypeScript must be used throughout the entire application. All components, utilities, API routes, and data models must be fully typed. No `any` types allowed except in rare, documented exceptions. Database schemas must have corresponding TypeScript types/interfaces.

### II. Server Components by Default
Leverage Next.js App Router with React Server Components as the default. Client components must be explicitly marked with `'use client'` and used only when necessary (user interactions, browser APIs, state management). This ensures optimal performance and SEO.

### III. API Route Protection
All API routes must implement proper authentication and authorization. User data isolation is mandatory - users can only access their own expense records. Input validation required on all endpoints using validation libraries (Zod or similar).

### IV. Database Best Practices
Use Vercel Postgres or Vercel KV for data storage. Database queries must be optimized with proper indexing. Implement database connection pooling. Use prepared statements or ORMs (Prisma/Drizzle) to prevent SQL injection. Schema migrations must be version-controlled.

### V. Mobile-First & Responsive Design (NON-NEGOTIABLE)
Mobile-first approach is mandatory. All features must be designed and tested on mobile devices first (320px - 428px width), then progressively enhanced for tablets and desktops. Touch-friendly UI elements (min 44x44px tap targets). Responsive breakpoints: mobile (< 768px), tablet (768px - 1024px), desktop (> 1024px). Follow WCAG 2.1 AA accessibility standards. Use semantic HTML. Implement proper keyboard navigation and screen reader support. Offline capability considerations (service workers for PWA features).

## Technology Stack Requirements

### Frontend
- Next.js 14+ (App Router)
- TypeScript 5+
- Tailwind CSS for styling (with mobile breakpoints)
- Shadcn/ui or similar component library (mobile-optimized)
- React Hook Form for form handling
- Zod for validation
- Responsive design utilities (container queries, viewport units)
- Mobile gesture support libraries if needed

### Backend & Database
- Next.js API Routes (Route Handlers)
- Vercel Postgres (or Vercel KV for simple data)
- Prisma ORM or Drizzle ORM
- NextAuth.js v5 for authentication

### Deployment & Hosting
- Vercel for hosting and deployment
- Environment variables for sensitive data
- Automatic deployments from main branch
- Preview deployments for pull requests

### Development Tools
- ESLint and Prettier for code quality
- Git for version control
- pnpm or npm for package management

## Core Features Requirements

### User Authentication
- Email/password authentication
- Optional: OAuth providers (Google, GitHub)
- Secure session management
- Password reset functionality

### Expense Management
- Create, read, update, delete expenses
- Categorization (food, transport, entertainment, etc.)
- Amount, date, description, category fields
- Optional: Receipt image upload (using Vercel Blob)

### Income Tracking
- Track income sources
- Similar CRUD operations as expenses

### Dashboard & Reports
- Monthly/yearly summary views
- Category-based spending breakdown
- Visual charts (Chart.js or Recharts)
- Balance calculation (income - expenses)

### Data Export
- Export data as CSV or JSON
- Date range filtering for exports

## Performance Standards

- Lighthouse score: 90+ for Performance, Accessibility, Best Practices, SEO (tested on mobile)
- First Contentful Paint (FCP) < 1.5s on mobile 4G
- Time to Interactive (TTI) < 3.5s on mobile devices
- Image optimization using Next.js Image component with responsive sizes
- Implement loading states and skeleton screens
- Use React Suspense for async operations
- Bundle size optimization for mobile networks
- Lazy loading for below-the-fold content
- Minimize layout shifts (CLS < 0.1)

## Mobile Responsiveness Requirements

### Mandatory Mobile Features
- All forms must be mobile-friendly with appropriate input types
- Touch-optimized navigation (hamburger menu, bottom navigation)
- Swipe gestures for common actions (delete, archive)
- Pull-to-refresh functionality where applicable
- Mobile-optimized data tables (card view on mobile)
- Responsive charts and graphs
- Mobile-friendly date/time pickers

### Testing Requirements
- Test on real devices (iOS and Android)
- Chrome DevTools responsive mode testing
- Viewport meta tag properly configured
- No horizontal scrolling on any screen size
- All text readable without zooming (min 16px base font)
- Touch targets minimum 44x44px
- Test with slow 3G network throttling

### Progressive Web App (PWA) Features
- Installable on mobile home screen
- App manifest.json with icons and theme colors
- Service worker for offline support (optional but recommended)
- Add-to-homescreen prompt

## Security Requirements

- HTTPS only (enforced by Vercel)
- Environment variables for all secrets
- CSRF protection on forms
- Rate limiting on API endpoints
- SQL injection prevention via ORM
- XSS protection (React's built-in escaping)
- Secure headers configuration in next.config.js

## Governance

This constitution defines the non-negotiable standards for the ExpenseTracker application. All code must comply with these principles before merging to main branch. 

Exceptions require:
1. Documentation of rationale
2. Technical lead approval
3. Plan to eventually align with constitution

Key rules:
- All PRs must pass TypeScript compilation
- All API routes must have authentication checks
- Database migrations must be tested before deployment
- Mobile responsiveness testing is MANDATORY before merging (test on mobile viewport)
- All new UI components must be tested on mobile devices (real or emulator)
- Accessibility issues are blocking bugs
- Desktop-only features are not allowed (except admin tools with justification)

**Version**: 1.0.0 | **Ratified**: 2025-12-17 | **Last Amended**: 2025-12-17
