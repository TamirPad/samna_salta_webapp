#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:5fBBhV7x6qzqRMff@db.kwrwxtccbnvadqedaqdd.supabase.co:5432/postgres";

console.log("🚀 Initializing Samna Salta Webapp Database...");
console.log("📊 Using database:", DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

// Create database pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database_init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log("🔧 Creating schema and tables...");
    
    // Execute the SQL
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log("✅ Database initialization completed successfully!");
      console.log("");
      console.log("📋 Summary:");
      console.log("  - Schema: samna_salta_webapp");
      console.log("  - Tables created: users, categories, products, customers, orders, order_items, etc.");
      console.log("  - Sample data inserted");
      console.log("  - Indexes created for performance");
      console.log("");
      console.log("🔑 Default admin credentials:");
      console.log("  - Email: admin@sammasalta.com");
      console.log("  - Password: admin123");
      console.log("");
      console.log("🌐 You can now start your application!");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Database initialization failed!");
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initDatabase(); 