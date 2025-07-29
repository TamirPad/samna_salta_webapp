require('dotenv').config();
const { connectDB, query } = require('./src/config/database');
const { runMigrations } = require('./src/config/migration');

async function testDatabase() {
  try {
    console.log('🔧 Testing database connection...');
    
    // Try to connect
    await connectDB();
    
    console.log('✅ Database connection successful');
    
    // Run migrations
    console.log('🔧 Running migrations...');
    await runMigrations();
    
    // Test a simple query
    console.log('🔧 Testing query...');
    const result = await query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Query successful:', result.rows[0]);
    
    // Check if phone column exists
    console.log('🔧 Checking phone column...');
    const columnsResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'samna_salta_webapp' 
      AND table_name = 'users' 
      AND column_name = 'phone'
    `);
    
    if (columnsResult.rows.length > 0) {
      console.log('✅ Phone column exists in users table');
    } else {
      console.log('❌ Phone column does not exist in users table');
    }
    
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', error);
  }
}

testDatabase(); 