# 🚀 Quick Start Guide - Expense Tracker

Get the Expense Tracker app running in **5 minutes**!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Terminal/Command line access

## Step 1: Clone & Install (1 min)

```bash
# Navigate to project directory
cd ExpenseTracker

# Install dependencies
npm install
```

## Step 2: Setup Environment (1 min)

Create `.env.local` file in the root directory:

```env
# PostgreSQL Connection
POSTGRES_URL="postgresql://username:password@localhost:5432/expense_tracker"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Step 3: Setup Database (2 min)

### Option A: Using PostgreSQL locally

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE expense_tracker;
\q

# Run schema
psql -U postgres -d expense_tracker -f database/schema.sql

# Load default categories (optional but recommended)
psql -U postgres -d expense_tracker -f database/seed-categories.sql
```

### Option B: Using Vercel Postgres (Cloud)

1. Go to [vercel.com](https://vercel.com)
2. Create new Postgres database
3. Copy connection string to `.env.local`
4. Run migrations:
```bash
psql $POSTGRES_URL -f database/schema.sql
psql $POSTGRES_URL -f database/seed-categories.sql
```

## Step 4: Start Development Server (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 5: Create First Account (30 sec)

1. Click "Đăng ký" (Register)
2. Enter email and password
3. Click "Đăng ký"
4. Login with your credentials

**🎉 You're all set! Start tracking your expenses!**

---

## 📱 Quick Feature Tour

### 1. Dashboard (`/dashboard`)
- View income, expenses, and balance
- Filter by time period
- See category breakdown chart
- Recent transactions

### 2. Transactions (`/transactions`)
- Add income/expense
- Search and filter
- Edit/delete transactions
- Pagination

### 3. Reports (`/reports`)
- 6-month trends
- Category analysis
- Spending forecast
- Period comparison

### 4. Settings (`/settings`)
- Manage categories
- Account settings
- Notification preferences
- Data export

---

## 🛠️ Common Commands

```bash
# Development
npm run dev                 # Start dev server

# Production
npm run build              # Build for production
npm start                  # Start production server

# Database (if using scripts)
npm run db:setup           # Setup database
npm run db:seed            # Seed categories
npm run db:verify          # Verify data

# Code Quality
npm run lint               # Run ESLint
```

---

## 🔧 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:** Ensure PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app
```

### NEXTAUTH_SECRET Missing

```
Error: NEXTAUTH_SECRET is not set
```

**Fix:** Add NEXTAUTH_SECRET to `.env.local`
```bash
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Port 3000 Already in Use

```
Error: Port 3000 is already in use
```

**Fix:** Use different port
```bash
PORT=3001 npm run dev
```

### Database Schema Not Found

```
Error: relation "users" does not exist
```

**Fix:** Run schema migration
```bash
psql $POSTGRES_URL -f database/schema.sql
```

---

## 📊 Sample Data

After seeding, you'll have:
- **15 Income Categories**: Salary, Freelance, Investment, Gift, etc.
- **15 Expense Categories**: Food, Transport, Shopping, Bills, etc.

### Quick Test Transaction

After login, add a test transaction:
1. Click "Thêm giao dịch" button
2. Fill in:
   - Amount: 100000
   - Category: Ăn uống
   - Type: Chi tiêu
   - Description: Lunch
3. Click "Thêm giao dịch"

---

## 🎯 Next Steps

### Customize Your Experience

1. **Add Custom Categories**
   - Go to Settings → Quản lý danh mục
   - Click "+ Thêm danh mục"
   - Choose icon, color, and name

2. **Set Preferences**
   - Go to Settings → Cài đặt tài khoản
   - Choose currency (VND/USD/EUR)
   - Set theme and language
   - Enable notifications

3. **Start Tracking**
   - Add daily transactions
   - Review dashboard weekly
   - Check reports monthly
   - Analyze spending patterns

---

## 📖 Learn More

- **Full Documentation**: See `DOCUMENTATION.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Project Summary**: See `PROJECT_SUMMARY.md`

---

## 🐛 Found a Bug?

1. Check the console for errors (F12 in browser)
2. Review `.env.local` configuration
3. Ensure database is properly set up
4. Check if all dependencies are installed

---

## 💡 Pro Tips

### For Developers

- Use TypeScript strict mode for better type safety
- Run `npm run lint` before committing
- Keep `.env.local` out of version control
- Use meaningful commit messages

### For Users

- Add transactions daily for accurate tracking
- Review reports weekly to stay on budget
- Set up notification reminders
- Export data regularly for backup

---

## 🔐 Security Reminders

- ✅ Never share `.env.local` file
- ✅ Use strong passwords (min 6 characters)
- ✅ Keep dependencies updated
- ✅ Enable HTTPS in production
- ✅ Regular database backups

---

## 📱 Mobile Development Setup

To test on mobile devices:

1. Find your local IP:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. Update `.env.local`:
```env
NEXTAUTH_URL="http://192.168.1.x:3000"
```

3. Access from mobile browser:
```
http://192.168.1.x:3000
```

---

## 🚀 Ready for Production?

See `DEPLOYMENT.md` for:
- Vercel deployment (easiest)
- Railway deployment
- Self-hosted VPS setup
- Environment configuration
- SSL/HTTPS setup

---

## 📞 Need Help?

### Common Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **NextAuth.js**: [next-auth.js.org](https://next-auth.js.org)
- **PostgreSQL**: [postgresql.org/docs](https://www.postgresql.org/docs/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)

### Community

- [Next.js Discord](https://discord.gg/nextjs)
- [NextAuth Discord](https://discord.gg/nextauth)
- [Vercel Community](https://github.com/vercel/next.js/discussions)

---

**Happy Coding! 💻✨**

*Start tracking your expenses in style!* 💰📊
