require('dotenv').config();
const { Pool } = require('pg');
const logger = require('./src/utils/logger');

// Create a direct database connection
const getTestClient = () => {
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

const addTestData = async () => {
  const client = await getTestClient().connect();
  
  try {
    await client.query('BEGIN');

    // Add test customers (without email column)
    const customers = [
      { name: 'John Doe', phone: '+972-50-111-1111' },
      { name: 'Jane Smith', phone: '+972-50-222-2222' },
      { name: 'Mike Johnson', phone: '+972-50-333-3333' }
    ];

    for (const customer of customers) {
      await client.query(
        `INSERT INTO customers (name, phone, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())`,
        [customer.name, customer.phone]
      );
    }

    // Add test orders
    const orders = [
      {
        order_number: 'SS001',
        customer_name: 'John Doe',
        customer_phone: '+972-50-111-1111',
        delivery_method: 'pickup',
        payment_method: 'cash',
        status: 'pending',
        subtotal: 50.00,
        total: 50.00
      },
      {
        order_number: 'SS002',
        customer_name: 'Jane Smith',
        customer_phone: '+972-50-222-2222',
        delivery_method: 'delivery',
        delivery_address: '123 Main St, Tel Aviv',
        payment_method: 'card',
        status: 'confirmed',
        subtotal: 75.00,
        delivery_charge: 15.00,
        total: 90.00
      },
      {
        order_number: 'SS003',
        customer_name: 'Mike Johnson',
        customer_phone: '+972-50-333-3333',
        delivery_method: 'pickup',
        payment_method: 'online',
        status: 'delivered',
        subtotal: 30.00,
        total: 30.00
      }
    ];

    for (const order of orders) {
      await client.query(
        `INSERT INTO orders (order_number, customer_name, customer_phone, 
         delivery_method, delivery_address, payment_method, status, subtotal, delivery_charge, total, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          order.order_number,
          order.customer_name,
          order.customer_phone,
          order.delivery_method,
          order.delivery_address || null,
          order.payment_method,
          order.status,
          order.subtotal,
          order.delivery_charge || 0,
          order.total
        ]
      );
    }

    await client.query('COMMIT');
    logger.info('Test data added successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error adding test data:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  addTestData()
    .then(() => {
      logger.info('Test data setup completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Test data setup failed:', error);
      process.exit(1);
    });
}

module.exports = { addTestData }; 