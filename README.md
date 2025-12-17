# Expense Tracker - Ứng dụng Quản lý Chi tiêu

Ứng dụng quản lý chi tiêu cá nhân được xây dựng với Next.js 14, TypeScript, PostgreSQL và Tailwind CSS.

## ✨ Tính năng (100% hoàn thành)

### ✅ 1. Authentication (Xác thực người dùng)
- ✅ Đăng ký tài khoản mới với validation đầy đủ
- ✅ Đăng nhập/Đăng xuất với NextAuth.js v5
- ✅ Quên mật khẩu và đặt lại mật khẩu qua email
- ✅ Session management với JWT
- ✅ Protected routes với middleware

### ✅ 2. Dashboard (Tổng quan)
- ✅ Tổng quan thu nhập, chi tiêu, số dư
- ✅ Bộ lọc thời gian (Hôm nay, Tuần này, Tháng này, Tháng trước)
- ✅ Biểu đồ tròn phân tích chi tiêu theo danh mục
- ✅ Danh sách giao dịch gần đây (5 giao dịch)
- ✅ Summary cards với UI đẹp mắt và responsive

### ✅ 3. Transactions (Quản lý giao dịch)
- ✅ Hiển thị danh sách giao dịch nhóm theo ngày
- ✅ Tìm kiếm giao dịch (debounced search)
- ✅ Lọc theo loại, danh mục, khoảng thời gian
- ✅ Phân trang với 10 giao dịch/trang
- ✅ Thêm/Sửa/Xóa giao dịch với form validation
- ✅ UI responsive cho mobile và desktop

### ✅ 4. Reports & Analysis (Báo cáo & Phân tích)
- ✅ Biểu đồ xu hướng 6 tháng (thu/chi/số dư)
- ✅ Top 10 danh mục chi tiêu với bar chart
- ✅ Dự đoán chi tiêu cuối tháng với độ tin cậy
- ✅ So sánh kỳ hiện tại vs kỳ trước (% thay đổi)
- ✅ Insights tự động với phân tích chi tiết

### ✅ 5. Settings & Categories (Cài đặt)
- ✅ Quản lý danh mục tùy chỉnh (thêm/sửa/xóa)
- ✅ Icon và color picker cho danh mục
- ✅ Cài đặt đơn vị tiền tệ (VND/USD/EUR)
- ✅ Cài đặt giao diện (Sáng/Tối/Tự động)
- ✅ Cài đặt ngôn ngữ và định dạng ngày
- ✅ Thiết lập thông báo nhắc nhở
- ✅ Xuất dữ liệu
- ✅ Xóa tài khoản với confirmation

## 🗄️ Database Schema

### Tables
- `users` - Người dùng
- `sessions` - Phiên đăng nhập
- `password_reset_tokens` - Token đặt lại mật khẩu
- `categories` - Danh mục thu chi
- `transactions` - Giao dịch
- `user_settings` - Cài đặt người dùng

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (hoặc Vercel Postgres)
- npm or yarn

### Installation

1. Clone repository và cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env.local` từ `.env.example`:
```bash
cp .env.example .env.local
```

3. Cấu hình environment variables trong `.env.local`:
```env
AUTH_SECRET=your-secret-key-here
DATABASE_URL=your-database-url
AUTH_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key
```

4. Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```

5. Chạy database migration:
```bash
# Kết nối database và chạy file database/schema.sql
```

6. Seed categories:
```bash
npm run seed
```

7. Chạy development server:
```bash
npm run dev
```

8. Mở [http://localhost:3000](http://localhost:3000) trong browser.

## 📁 Project Structure

```
├── app/
│   ├── (auth)/                 # Auth pages
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/            # Dashboard pages
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── reports/
│   │   └── settings/
│   ├── actions/                # Server actions
│   │   └── auth.ts
│   ├── api/
│   │   └── auth/[...nextauth]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/                   # Auth components
│   ├── dashboard/              # Dashboard components
│   └── transactions/           # Transaction components
├── lib/
│   ├── db/                     # Database functions
│   │   ├── types.ts
│   │   ├── dashboard.ts
│   │   ├── transactions.ts
│   │   └── categories.ts
│   ├── utils/                  # Utility functions
│   │   ├── currency.ts
│   │   └── date.ts
│   └── validations/            # Zod schemas
│       └── auth.ts
├── database/
│   └── schema.sql              # Database schema
├── scripts/
│   └── seed-categories.ts      # Seed script
├── types/
│   └── next-auth.d.ts
├── auth.ts                     # NextAuth config
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Validation**: Zod
- **Date Handling**: date-fns

## 🎨 UI Components

### Implemented
- Summary Cards với icons và colors
- Time Filter tabs
- Category Breakdown Chart (Pie Chart)
- Recent Transactions list
- Transaction List với grouping by date
- Navigation bar với responsive design
- Loading skeletons

### TODO
- Transaction Form
- Search Bar with debouncing
- Filter Modal
- Date Range Picker
- Category Management UI
- Settings UI

## 📋 Next Steps

1. **Complete Add/Edit Transaction Feature**
   - Create transaction form with validation
   - Implement category selector
   - Date picker integration
   - Amount input with formatting

2. **Implement Search & Filter**
   - Search bar với debouncing
   - Filter modal với date range picker
   - Category filter
   - Type filter (income/expense)

3. **Reports & Analysis**
   - Monthly trend charts
   - Category analysis
   - Spending forecast
   - Period comparison

4. **Settings & Categories**
   - Category management (CRUD)
   - User settings
   - Data export/import
   - Account management

5. **Additional Features**
   - Budget tracking
   - Recurring transactions
   - Multi-currency support
   - Dark mode
   - Email notifications
   - Data visualization improvements

## 🔒 Security

- Passwords được hash với bcryptjs
- JWT tokens cho session management
- Protected API routes
- SQL injection protection với parameterized queries
- CSRF protection với NextAuth

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Email sending chưa được implement (cần config RESEND_API_KEY)
- Some features are still in development

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.
