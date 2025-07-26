require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../utils/logger');

// Create a direct database connection for migrations
const getMigrationClient = () => {
  // Check if using Supabase
  if (process.env.SUPABASE_CONNECTION_STRING) {
    return new Pool({
      connectionString: process.env.SUPABASE_CONNECTION_STRING,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  // Fallback to local PostgreSQL
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'samna_salta',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
};

const createTables = async () => {
  const client = await getMigrationClient().connect();
  
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `);

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_en VARCHAR(100),
        name_he VARCHAR(100),
        description TEXT,
        description_en TEXT,
        description_he TEXT,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        name_en VARCHAR(200),
        name_he VARCHAR(200),
        description TEXT,
        description_en TEXT,
        description_he TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url VARCHAR(500),
        emoji VARCHAR(10),
        preparation_time INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        is_new BOOLEAN DEFAULT FALSE,
        is_popular BOOLEAN DEFAULT FALSE,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_en VARCHAR(100),
        name_he VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        language VARCHAR(5) DEFAULT 'he',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(255),
        delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('pickup', 'delivery')),
        delivery_address TEXT,
        delivery_instructions TEXT,
        special_instructions TEXT,
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'online')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')),
        subtotal DECIMAL(10,2) NOT NULL,
        delivery_charge DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        stripe_payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(200) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create order_status_updates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_updates (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB,
        user_id INTEGER REFERENCES users(id),
        session_id VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query('COMMIT');
    logger.info('Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const createAdminUser = async () => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if admin user already exists
    const existingAdmin = await getMigrationClient().query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@sammasalta.com']
    );

    if (existingAdmin.rows.length > 0) {
      logger.info('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await getMigrationClient().query(
      `INSERT INTO users (name, email, password_hash, phone, is_admin, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      ['Admin User', 'admin@sammasalta.com', hashedPassword, '+972-50-123-4567', true]
    );

    logger.info('Admin user created successfully');
    logger.info('Email: admin@sammasalta.com');
    logger.info('Password: admin123');

  } catch (error) {
    logger.error('Failed to create admin user:', error);
  }
};

const insertDefaultData = async () => {
  try {
    // Insert default categories
    const categories = [
      { name: 'Breads', name_en: 'Breads', name_he: 'לחמים', sort_order: 1 },
      { name: 'Pastries', name_en: 'Pastries', name_he: 'מאפים', sort_order: 2 },
      { name: 'Dairy', name_en: 'Dairy', name_he: 'מוצרי חלב', sort_order: 3 },
      { name: 'Spices', name_en: 'Spices', name_he: 'תבלינים', sort_order: 4 }
    ];

    for (const category of categories) {
      await getMigrationClient().query(
        `INSERT INTO categories (name, name_en, name_he, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [category.name, category.name_en, category.name_he, category.sort_order]
      );
    }

    // Insert default products
    const products = [
      {
        name: 'Kubaneh',
        name_en: 'Kubaneh',
        name_he: 'כובאנה',
        description: 'Traditional Yemenite bread baked overnight with a unique flavor and texture',
        description_en: 'Traditional Yemenite bread baked overnight with a unique flavor and texture',
        description_he: 'לחם תימני מסורתי שנאפה במשך הלילה עם טעם ומרקם ייחודיים',
        price: 25.00,
        category_id: 1,
        emoji: '🍞',
        preparation_time: 30,
        is_new: true,
        is_popular: true
      },
      {
        name: 'Samneh',
        name_en: 'Samneh',
        name_he: 'סמנה',
        description: 'Traditional clarified butter made from sheep or goat milk',
        description_en: 'Traditional clarified butter made from sheep or goat milk',
        description_he: 'חמאה מזוקקת מסורתית העשויה מחלב כבשים או עזים',
        price: 15.00,
        category_id: 3,
        emoji: '🧈',
        preparation_time: 15,
        is_popular: true
      },
      {
        name: 'Red Bisbas',
        name_en: 'Red Bisbas',
        name_he: 'ביסבוס אדום',
        description: 'Traditional Yemenite hot sauce',
        description_en: 'Traditional Yemenite hot sauce',
        description_he: 'רוטב חריף תימני מסורתי',
        price: 12.00,
        category_id: 4,
        emoji: '🌶️',
        preparation_time: 5
      },
      {
        name: 'Hilbeh',
        name_en: 'Hilbeh',
        name_he: 'חילבה',
        description: 'Traditional fenugreek paste',
        description_en: 'Traditional fenugreek paste',
        description_he: 'ממרח חילבה מסורתי',
        price: 10.00,
        category_id: 4,
        emoji: '🌿',
        preparation_time: 5
      }
    ];

    for (const product of products) {
      await getMigrationClient().query(
        `INSERT INTO products (name, name_en, name_he, description, description_en, description_he, 
         price, category_id, emoji, preparation_time, is_new, is_popular, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [
          product.name, product.name_en, product.name_he,
          product.description, product.description_en, product.description_he,
          product.price, product.category_id, product.emoji,
          product.preparation_time, product.is_new, product.is_popular
        ]
      );
    }

    // Insert default business settings
    await getMigrationClient().query(
      `INSERT INTO business_settings (business_name, business_description, business_address, 
       business_phone, business_email, business_hours, delivery_charge, currency, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        'Samna Salta',
        'Traditional Yemenite Food',
        'Tel Aviv, Israel',
        '+972-50-123-4567',
        'info@sammasalta.com',
        'Sunday-Thursday: 9:00-22:00, Friday: 9:00-15:00',
        15.00,
        'ILS'
      ]
    );

    logger.info('Default data inserted successfully');

  } catch (error) {
    logger.error('Failed to insert default data:', error);
  }
};

const runMigrations = async () => {
  try {
    logger.info('Starting database migration...');
    
    await createTables();
    await createAdminUser();
    await insertDefaultData();
    
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 