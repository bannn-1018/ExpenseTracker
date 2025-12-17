# Deployment Guide - Expense Tracker

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel là lựa chọn tốt nhất cho Next.js applications.

#### Prerequisites
- Vercel account (free tier available)
- GitHub repository
- PostgreSQL database (Vercel Postgres or external)

#### Steps

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Connect to Vercel**
- Truy cập [vercel.com](https://vercel.com)
- Click "Import Project"
- Chọn GitHub repository
- Vercel tự động detect Next.js

3. **Configure Environment Variables**

Trong Vercel dashboard, thêm:
```
POSTGRES_URL=<your-database-url>
NEXTAUTH_URL=<your-production-url>
NEXTAUTH_SECRET=<generated-secret>
```

4. **Deploy**
- Click "Deploy"
- Vercel sẽ build và deploy tự động
- Mỗi push mới sẽ trigger deployment

#### Vercel Postgres Setup

1. Trong Vercel project:
   - Storage → Create Database → Postgres
   - Copy connection string

2. Run migration:
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run migration
vercel env pull .env.local
psql $POSTGRES_URL < database/schema.sql
psql $POSTGRES_URL < database/seed-categories.sql
```

---

### Option 2: Railway

Railway cung cấp database và hosting miễn phí.

#### Steps

1. **Create Railway account**
   - Truy cập [railway.app](https://railway.app)
   - Sign up với GitHub

2. **Deploy from GitHub**
   - New Project → Deploy from GitHub repo
   - Chọn repository

3. **Add PostgreSQL**
   - Add service → Database → PostgreSQL
   - Copy connection string

4. **Set Environment Variables**
```
POSTGRES_URL=<railway-postgres-url>
NEXTAUTH_URL=https://<your-app>.railway.app
NEXTAUTH_SECRET=<generated-secret>
```

5. **Run Migrations**
```bash
# Connect to Railway Postgres
railway connect postgres

# In psql prompt:
\i database/schema.sql
\i database/seed-categories.sql
```

---

### Option 3: Self-Hosted (VPS)

Deploy on DigitalOcean, AWS EC2, hoặc VPS khác.

#### Prerequisites
- Ubuntu 22.04 VPS
- Domain name (optional)
- SSH access

#### Setup Steps

1. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (Process manager)
sudo npm install -g pm2
```

2. **Setup PostgreSQL**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE expense_tracker;
CREATE USER expenseuser WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expenseuser;
\q

# Run migrations
psql -U expenseuser -d expense_tracker < database/schema.sql
psql -U expenseuser -d expense_tracker < database/seed-categories.sql
```

3. **Deploy Application**
```bash
# Clone repository
git clone <your-repo> /var/www/expense-tracker
cd /var/www/expense-tracker

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
POSTGRES_URL=postgresql://expenseuser:secure_password@localhost:5432/expense_tracker
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOF

# Build
npm run build

# Start with PM2
pm2 start npm --name "expense-tracker" -- start
pm2 save
pm2 startup
```

4. **Setup Nginx (Optional)**
```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/expense-tracker

# Add:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🗄️ Database Backup

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/expense-tracker"
DB_NAME="expense_tracker"

mkdir -p $BACKUP_DIR

pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

### Schedule with Cron
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🔒 Security Checklist

### Before Production

- [ ] Change NEXTAUTH_SECRET to strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS if needed
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Use strong database passwords
- [ ] Limit database access by IP
- [ ] Set up monitoring & alerts
- [ ] Configure error logging

### Environment Variables Security

**Never commit to Git:**
- `.env.local` (already in .gitignore)
- Database credentials
- API keys

**Use Vercel/Railway secrets management:**
- All platforms provide encrypted storage
- Environment variables are injected at runtime

---

## 📊 Monitoring

### Vercel Analytics
```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking with Sentry
```bash
npm install @sentry/nextjs
```

```bash
npx @sentry/wizard -i nextjs
```

---

## 🧪 Pre-Deployment Testing

### 1. Build Test
```bash
npm run build
```
✅ Should complete without errors

### 2. Production Preview
```bash
npm run build && npm start
```
✅ Test all features in production mode

### 3. Database Connection
```bash
# Test connection
node -e "const { sql } = require('@vercel/postgres'); sql\`SELECT 1\`.then(() => console.log('Connected!'))"
```

### 4. Environment Variables
- [ ] All required vars set
- [ ] NEXTAUTH_URL matches production URL
- [ ] Database URL is correct
- [ ] Secrets are secure (not default values)

---

## 🔄 Continuous Deployment

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📱 Post-Deployment

### 1. Verify Deployment
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create transactions
- [ ] Charts render correctly
- [ ] Settings page functional

### 2. Test on Devices
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet

### 3. Performance Check
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s

### 4. Monitor
- [ ] Check error logs
- [ ] Monitor database connections
- [ ] Watch server resources

---

## 🆘 Troubleshooting

### Build Errors

**Error: Cannot find module**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Database connection failed**
- Check POSTGRES_URL format
- Verify database is accessible
- Check firewall rules

### Runtime Errors

**NextAuth callback URL mismatch**
- Ensure NEXTAUTH_URL matches your domain
- Include protocol (https://)

**Database query timeout**
- Check database indexes
- Optimize slow queries
- Increase connection pool

---

## 📞 Support

### Vercel Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)

### Railway Support
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

### Community
- [Next.js GitHub](https://github.com/vercel/next.js/discussions)
- [NextAuth.js Discord](https://discord.gg/nextauth)

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Seed data loaded
- [ ] Build passes locally
- [ ] Security checklist completed

### Deployment
- [ ] Choose platform (Vercel/Railway/VPS)
- [ ] Deploy application
- [ ] Configure custom domain (optional)
- [ ] Enable SSL/HTTPS
- [ ] Test all features

### Post-Deployment
- [ ] Monitor logs
- [ ] Set up backups
- [ ] Configure alerts
- [ ] Document deployment
- [ ] Train users (if applicable)

---

**🎉 Your Expense Tracker is now live!**
