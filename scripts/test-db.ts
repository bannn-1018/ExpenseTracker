import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    
    console.log('✅ Database connected successfully!');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗄️  Database version:', result.rows[0].db_version.split(' ')[0], '\n');
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    if (tables.rows.length > 0) {
      console.log('📊 Existing tables:');
      tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    } else {
      console.log('⚠️  No tables found. Run "npm run db:setup" to create tables.');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('\n💡 Make sure you have:');
    console.log('   1. Created a Postgres database on Vercel');
    console.log('   2. Run "vercel env pull .env.local"');
    console.log('   3. Your .env.local file contains POSTGRES_URL');
  } finally {
    process.exit();
  }
}

testConnection();
