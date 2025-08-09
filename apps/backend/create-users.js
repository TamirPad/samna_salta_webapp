require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, query, closePool } = require('./src/config/database');

async function ensureUser({ name, email, password, phone, isAdmin }) {
  const hashed = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, phone, is_admin, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           is_admin = EXCLUDED.is_admin,
           updated_at = NOW()
     RETURNING id, name, email, is_admin`,
    [name, email, hashed, phone || null, !!isAdmin]
  );
  return result.rows[0];
}

async function ensureCustomerProfile({ name, email, phone }) {
  try {
    const existing = await query('SELECT id FROM customers WHERE email = $1', [email]);
    if (existing.rows.length > 0) return existing.rows[0];
    const result = await query(
      `INSERT INTO customers (name, email, phone, language, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
      [name, email, phone || null, 'en']
    );
    return result.rows[0];
  } catch (_) {
    return null;
  }
}

async function main() {
  try {
    await connectDB();

    // You can override these via environment variables if desired
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sammasalta.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const adminPhone = process.env.ADMIN_PHONE || '+972500000001';

    const customerEmail = process.env.CUSTOMER_EMAIL || 'customer@sammasalta.com';
    const customerPassword = process.env.CUSTOMER_PASSWORD || 'Customer123!';
    const customerName = process.env.CUSTOMER_NAME || 'Demo Customer';
    const customerPhone = process.env.CUSTOMER_PHONE || '+972500000002';

    const admin = await ensureUser({ name: adminName, email: adminEmail, password: adminPassword, phone: adminPhone, isAdmin: true });
    const customer = await ensureUser({ name: customerName, email: customerEmail, password: customerPassword, phone: customerPhone, isAdmin: false });
    await ensureCustomerProfile({ name: customerName, email: customerEmail, phone: customerPhone });

    console.log('✅ Admin user ensured:', { id: admin.id, email: admin.email });
    console.log('✅ Customer user ensured:', { id: customer.id, email: customer.email });
    console.log('🔐 Credentials (change these in production):');
    console.log(`   Admin:    ${adminEmail} / ${adminPassword}`);
    console.log(`   Customer: ${customerEmail} / ${customerPassword}`);
  } catch (e) {
    console.error('❌ Failed to create users:', e.message);
    process.exitCode = 1;
  } finally {
    try { await closePool(); } catch {}
  }
}

main();


