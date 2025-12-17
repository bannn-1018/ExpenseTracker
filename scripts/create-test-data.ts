import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function createTestData() {
  try {
    console.log('🚀 Starting test data creation...\n')

    // 1. Create test user
    console.log('👤 Creating test user...')
    const email = 'test@gmail.com'
    const password = 'Aa@123456'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user exists
    const { rows: existingUsers } = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    let userId: number

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id
      console.log(`✓ User already exists with ID: ${userId}`)
    } else {
      const { rows: newUser } = await sql`
        INSERT INTO users (email, password_hash, email_verified)
        VALUES (${email}, ${hashedPassword}, true)
        RETURNING id
      `
      userId = newUser[0].id
      console.log(`✓ User created with ID: ${userId}`)
    }

    // 2. Get categories
    console.log('\n📋 Fetching categories...')
    const { rows: categories } = await sql`
      SELECT id, name, type FROM categories 
      WHERE user_id IS NULL OR user_id = ${userId}
    `
    
    const incomeCategories = categories.filter(c => c.type === 'income')
    const expenseCategories = categories.filter(c => c.type === 'expense')
    
    console.log(`✓ Found ${incomeCategories.length} income categories`)
    console.log(`✓ Found ${expenseCategories.length} expense categories`)

    // 3. Delete existing transactions for this user
    console.log('\n🗑️  Cleaning up existing transactions...')
    const { rowCount } = await sql`
      DELETE FROM transactions WHERE user_id = ${userId}
    `
    console.log(`✓ Deleted ${rowCount} existing transactions`)

    // 4. Create transactions for last 5 months
    console.log('\n💰 Creating test transactions...')
    
    const today = new Date()
    const transactions: any[] = []
    
    for (let monthOffset = 4; monthOffset >= 0; monthOffset--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
      
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
      console.log(`\n  📅 ${monthName}`)
      
      // Income transactions (3-5 per month)
      const incomeCount = Math.floor(Math.random() * 3) + 3
      for (let i = 0; i < incomeCount; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
        const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
        
        // Income amounts: 5M - 50M
        const amount = Math.floor(Math.random() * 45000000) + 5000000
        
        const names = [
          'Lương tháng',
          'Thưởng dự án',
          'Freelance',
          'Đầu tư',
          'Bán hàng',
          'Hoa hồng',
          'Thu nhập phụ'
        ]
        
        transactions.push({
          userId,
          categoryId: category.id,
          amount,
          type: 'income',
          date: date.toISOString().split('T')[0],
          name: names[Math.floor(Math.random() * names.length)],
          note: null
        })
      }
      
      // Expense transactions (15-25 per month)
      const expenseCount = Math.floor(Math.random() * 11) + 15
      for (let i = 0; i < expenseCount; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
        
        // Expense amounts based on category
        let amount: number
        const categoryName = category.name.toLowerCase()
        
        if (categoryName.includes('nhà') || categoryName.includes('thuê')) {
          amount = Math.floor(Math.random() * 5000000) + 3000000 // 3M-8M
        } else if (categoryName.includes('điện') || categoryName.includes('nước')) {
          amount = Math.floor(Math.random() * 1000000) + 200000 // 200K-1.2M
        } else if (categoryName.includes('ăn') || categoryName.includes('food')) {
          amount = Math.floor(Math.random() * 300000) + 50000 // 50K-350K
        } else if (categoryName.includes('xe') || categoryName.includes('xăng')) {
          amount = Math.floor(Math.random() * 500000) + 100000 // 100K-600K
        } else if (categoryName.includes('mua sắm') || categoryName.includes('shopping')) {
          amount = Math.floor(Math.random() * 2000000) + 200000 // 200K-2.2M
        } else if (categoryName.includes('giải trí') || categoryName.includes('du lịch')) {
          amount = Math.floor(Math.random() * 3000000) + 200000 // 200K-3.2M
        } else {
          amount = Math.floor(Math.random() * 1000000) + 100000 // 100K-1.1M
        }
        
        const expenseNames: Record<string, string[]> = {
          'ăn uống': ['Ăn sáng', 'Ăn trưa', 'Ăn tối', 'Cà phê', 'Trà sữa', 'Ăn vặt'],
          'mua sắm': ['Quần áo', 'Giày dép', 'Phụ kiện', 'Mỹ phẩm', 'Đồ gia dụng'],
          'xe': ['Xăng xe', 'Sửa xe', 'Rửa xe', 'Grab', 'Taxi', 'Gửi xe'],
          'nhà': ['Tiền nhà', 'Điện', 'Nước', 'Internet', 'Gas'],
          'giải trí': ['Xem phim', 'Karaoke', 'Cafe', 'Bar', 'Game'],
          'sức khỏe': ['Khám bệnh', 'Mua thuốc', 'Vitamin', 'Gym'],
        }
        
        let nameList = ['Chi tiêu']
        for (const [key, values] of Object.entries(expenseNames)) {
          if (categoryName.includes(key)) {
            nameList = values
            break
          }
        }
        
        transactions.push({
          userId,
          categoryId: category.id,
          amount,
          type: 'expense',
          date: date.toISOString().split('T')[0],
          name: nameList[Math.floor(Math.random() * nameList.length)],
          note: null
        })
      }
      
      console.log(`    ✓ ${incomeCount} income + ${expenseCount} expense transactions`)
    }
    
    // Insert all transactions
    console.log(`\n💾 Inserting ${transactions.length} transactions...`)
    
    for (const tx of transactions) {
      await sql`
        INSERT INTO transactions (user_id, category_id, amount, type, date, name, note)
        VALUES (${tx.userId}, ${tx.categoryId}, ${tx.amount}, ${tx.type}, ${tx.date}, ${tx.name}, ${tx.note})
      `
    }
    
    console.log(`✓ All transactions inserted successfully!`)
    
    // Summary
    console.log('\n📊 Summary:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   User ID: ${userId}`)
    console.log(`   Total Transactions: ${transactions.length}`)
    console.log(`   Period: Last 5 months`)
    
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    
    console.log(`\n   Total Income: ${totalIncome.toLocaleString('vi-VN')} ₫`)
    console.log(`   Total Expense: ${totalExpense.toLocaleString('vi-VN')} ₫`)
    console.log(`   Balance: ${(totalIncome - totalExpense).toLocaleString('vi-VN')} ₫`)
    
    console.log('\n✅ Test data created successfully!')
    console.log('\n🔐 Login credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    
  } catch (error) {
    console.error('❌ Error creating test data:', error)
    throw error
  }
}

createTestData()
  .then(() => {
    console.log('\n👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
