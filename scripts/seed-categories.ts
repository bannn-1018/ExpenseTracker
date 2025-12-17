import { sql } from '@vercel/postgres'

const expenseCategories = [
  { name: 'Ăn uống', icon: '🍜', color: '#ef4444', order: 1 },
  { name: 'Di chuyển', icon: '🚗', color: '#3b82f6', order: 2 },
  { name: 'Mua sắm', icon: '🛍️', color: '#ec4899', order: 3 },
  { name: 'Giải trí', icon: '🎮', color: '#8b5cf6', order: 4 },
  { name: 'Y tế', icon: '💊', color: '#10b981', order: 5 },
  { name: 'Giáo dục', icon: '📚', color: '#f59e0b', order: 6 },
  { name: 'Nhà cửa', icon: '🏠', color: '#6366f1', order: 7 },
  { name: 'Hóa đơn', icon: '📄', color: '#14b8a6', order: 8 },
  { name: 'Khác', icon: '📦', color: '#6b7280', order: 99 },
]

const incomeCategories = [
  { name: 'Lương', icon: '💰', color: '#10b981', order: 1 },
  { name: 'Thưởng', icon: '🎁', color: '#f59e0b', order: 2 },
  { name: 'Đầu tư', icon: '📈', color: '#3b82f6', order: 3 },
  { name: 'Bán hàng', icon: '🏪', color: '#8b5cf6', order: 4 },
  { name: 'Khác', icon: '💵', color: '#6b7280', order: 99 },
]

export async function seedCategories() {
  try {
    console.log('Seeding expense categories...')
    
    for (const category of expenseCategories) {
      await sql`
        INSERT INTO categories (user_id, name, icon, type, color, is_system, display_order)
        VALUES (NULL, ${category.name}, ${category.icon}, 'expense', ${category.color}, true, ${category.order})
        ON CONFLICT DO NOTHING
      `
    }

    console.log('Seeding income categories...')
    
    for (const category of incomeCategories) {
      await sql`
        INSERT INTO categories (user_id, name, icon, type, color, is_system, display_order)
        VALUES (NULL, ${category.name}, ${category.icon}, 'income', ${category.color}, true, ${category.order})
        ON CONFLICT DO NOTHING
      `
    }

    console.log('Categories seeded successfully!')
  } catch (error) {
    console.error('Error seeding categories:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedCategories()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
