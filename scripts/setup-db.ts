import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP,
        email_verified BOOLEAN DEFAULT FALSE
      )
    `;
    console.log('✅ Users table created\n');

    // Create sessions table
    console.log('Creating sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Sessions table created\n');

    // Create password_reset_tokens table
    console.log('Creating password_reset_tokens table...');
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Password reset tokens table created\n');

    // Create categories table
    console.log('Creating categories table...');
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        color VARCHAR(7) NOT NULL,
        is_system BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Categories table created\n');

    // Create transactions table
    console.log('Creating transactions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id),
        amount DECIMAL(12, 2) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        name VARCHAR(255) NOT NULL,
        note TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Transactions table created\n');

    // Create user_settings table
    console.log('Creating user_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        currency VARCHAR(10) DEFAULT 'VND',
        theme VARCHAR(20) DEFAULT 'system',
        language VARCHAR(10) DEFAULT 'vi',
        date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
        notification_enabled BOOLEAN DEFAULT FALSE,
        notification_time TIME DEFAULT '21:00:00',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ User settings table created\n');

    // Create indexes
    console.log('Creating indexes...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens ON password_reset_tokens(token)`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category_id)`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id)`;
    
    console.log('✅ All indexes created\n');

    // Add unique constraint for categories
    console.log('Adding constraints...');
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'unique_user_category_name'
        ) THEN
          ALTER TABLE categories 
          ADD CONSTRAINT unique_user_category_name 
          UNIQUE (user_id, name, type);
        END IF;
      END $$;
    `;
    console.log('✅ Constraints added\n');

    console.log('🎉 Database setup completed successfully!\n');
    
    // Display table summary
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('📊 Created tables:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    process.exit();
  }
}

setupDatabase();
