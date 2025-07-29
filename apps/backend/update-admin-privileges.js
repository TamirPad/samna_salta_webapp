require('dotenv').config();
const { query, connectDB } = require('./src/config/database');

async function updateAdminPrivileges() {
  try {
    console.log('🔧 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    
    console.log('🔧 Updating admin privileges...');
    
    // Update the admin user to have admin privileges
    const result = await query(
      'UPDATE users SET is_admin = true, role = \'admin\' WHERE email = $1 RETURNING id, name, email, is_admin, role',
      ['admin@sammasalta.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin privileges updated successfully');
      console.log('Updated user:', result.rows[0]);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating admin privileges:', error.message);
  }
}

updateAdminPrivileges(); 