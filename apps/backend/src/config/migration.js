const { query } = require('./database');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Migration 1: Add phone column to users table if it doesn't exist
    try {
      await query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'samna_salta_webapp' 
            AND table_name = 'users' 
            AND column_name = 'phone'
          ) THEN
            ALTER TABLE samna_salta_webapp.users ADD COLUMN phone VARCHAR(20);
          END IF;
        END $$;
      `);
      logger.info('✅ Migration 1 completed: phone column added to users table');
    } catch (error) {
      logger.error('❌ Migration 1 failed:', error.message);
      // Continue with other migrations even if this one fails
    }

    // Migration 2: Add is_admin column to users table if it doesn't exist
    try {
      await query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'samna_salta_webapp' 
            AND table_name = 'users' 
            AND column_name = 'is_admin'
          ) THEN
            ALTER TABLE samna_salta_webapp.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
          END IF;
        END $$;
      `);
      logger.info('✅ Migration 2 completed: is_admin column added to users table');
    } catch (error) {
      logger.error('❌ Migration 2 failed:', error.message);
    }

    // Migration 3: Ensure products.emoji exists
    try {
      await query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'samna_salta_webapp'
              AND table_name = 'products'
              AND column_name = 'emoji'
          ) THEN
            ALTER TABLE samna_salta_webapp.products ADD COLUMN emoji VARCHAR(16);
          END IF;
        END $$;
      `);
      logger.info('✅ Migration 3 completed: emoji column ensured on products');
    } catch (error) {
      logger.error('❌ Migration 3 failed:', error.message);
    }

    // Migration 4: Ensure orders.notes and order_items.notes exist
    try {
      await query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'samna_salta_webapp'
              AND table_name = 'orders'
              AND column_name = 'notes'
          ) THEN
            ALTER TABLE samna_salta_webapp.orders ADD COLUMN notes TEXT;
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'samna_salta_webapp'
              AND table_name = 'order_items'
              AND column_name = 'notes'
          ) THEN
            ALTER TABLE samna_salta_webapp.order_items ADD COLUMN notes TEXT;
          END IF;
        END $$;
      `);
      logger.info('✅ Migration 4 completed: notes columns ensured on orders and order_items');
    } catch (error) {
      logger.error('❌ Migration 4 failed:', error.message);
    }

    // Migration 5: Ensure users.email_verified exists
    try {
      await query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'samna_salta_webapp'
              AND table_name = 'users'
              AND column_name = 'email_verified'
          ) THEN
            ALTER TABLE samna_salta_webapp.users ADD COLUMN email_verified BOOLEAN DEFAULT false;
          END IF;
        END $$;
      `);
      logger.info('✅ Migration 5 completed: email_verified column ensured on users');
    } catch (error) {
      logger.error('❌ Migration 5 failed:', error.message);
    }

    logger.info('✅ All migrations completed successfully');
  } catch (error) {
    logger.error('❌ Migration process failed:', error);
    throw error;
  }
}

module.exports = { runMigrations }; 