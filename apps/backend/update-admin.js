require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, connectDB } = require('./src/config/database');

async function updateAdminPassword() {
  try {
    console.log('🔧 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    
    console.log('🔧 Updating admin password...');
    
    // Hash the password 'admin123'
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    // Update the admin user's password
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, name, email',
      [hashedPassword, 'admin@sammasalta.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password updated successfully');
      console.log('Updated user:', result.rows[0]);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error.message);
  }
}

updateAdminPassword(); 