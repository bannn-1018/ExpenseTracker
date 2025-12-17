import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function verifyData() {
  try {
    console.log('📊 Verifying database data...\n');

    // Count categories
    const categoryCount = await sql`
      SELECT 
        type,
        COUNT(*) as count
      FROM categories
      GROUP BY type
      ORDER BY type
    `;

    console.log('Categories:');
    categoryCount.rows.forEach(row => {
      console.log(`  ${row.type === 'expense' ? '💰 Expense' : '💵 Income'}: ${row.count} categories`);
    });

    // Show all categories
    const categories = await sql`
      SELECT name, icon, type, color
      FROM categories
      ORDER BY type, name
    `;

    console.log('\n📋 All Categories:');
    let currentType = '';
    categories.rows.forEach(row => {
      if (row.type !== currentType) {
        currentType = row.type;
        console.log(`\n  ${row.type === 'expense' ? '💸 CHI TIÊU' : '💰 THU NHẬP'}:`);
      }
      console.log(`    ${row.icon} ${row.name} (${row.color})`);
    });

    // Count other tables
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const transactionCount = await sql`SELECT COUNT(*) as count FROM transactions`;

    console.log('\n📊 Database Statistics:');
    console.log(`  👤 Users: ${userCount.rows[0].count}`);
    console.log(`  📝 Transactions: ${transactionCount.rows[0].count}`);
    console.log(`  🏷️  Categories: ${categories.rows.length}`);

    console.log('\n✅ Database is ready to use!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    process.exit();
  }
}

verifyData();
