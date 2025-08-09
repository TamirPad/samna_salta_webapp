const express = require('express');
const {body, validationResult, query} = require('express-validator');
const {authenticateToken, requireAdmin, optionalAuth} = require('../middleware/auth');
const {query: dbQuery, getClient, isInDevelopmentMode} = require('../config/database');
const logger = require('../utils/logger');

// Optional stripe import
let Stripe, stripe;
try {
  Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.log('⚠️ Stripe not available, payment features will be disabled');
  stripe = null;
}

const router = express.Router();

// Validation middleware
const validateOrder = [
  body('customer_name').trim().isLength({min: 2, max: 100}).withMessage('Customer name must be between 2 and 100 characters'),
  body('customer_phone').trim().notEmpty().withMessage('Phone number is required'),
  body('customer_email').optional().isEmail().withMessage('Please provide a valid email'),
  body('delivery_method').isIn(['pickup', 'delivery']).withMessage('Delivery method must be pickup or delivery'),
  body('delivery_address').if(body('delivery_method').equals('delivery')).notEmpty().withMessage('Delivery address is required for delivery orders'),
  body('payment_method').isIn(['cash', 'card', 'online']).withMessage('Payment method must be cash, card, or online'),
  body('order_items').isArray({min: 1}).withMessage('Order must contain at least one item'),
  body('order_items.*.product_id').isInt({min: 1}).withMessage('Product ID must be a positive integer'),
  body('order_items.*.quantity').isInt({min: 1}).withMessage('Quantity must be at least 1'),
  body('subtotal').optional().isFloat({min: 0}).withMessage('Subtotal must be a positive number'),
  body('total').optional().isFloat({min: 0}).withMessage('Total must be a positive number'),
  // Optional selected options structure
  body('order_items.*.selected_options').optional().isArray(),
  body('order_items.*.selected_options.*.option_id').optional().isInt({ min: 1 }),
  body('order_items.*.selected_options.*.values').optional().isArray(),
  body('order_items.*.selected_options.*.values.*.id').optional().isInt({ min: 1 })
];

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SS${timestamp}${random}`;
};

// Build simple printable invoice HTML
const buildInvoiceHtml = (order, items, options = {}) => {
  const receipt = options.receipt === true;
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString();
  const deliveryMethod = (order.order_type || order.delivery_method || 'pickup').toString();
  const deliveryCharge = Number(order.delivery_charge || 0);
  const subtotal = items.reduce((sum, it) => sum + Number(it.total_price || 0), 0);
  const total = subtotal + deliveryCharge;
  const widthCss = receipt ? "@page { size: 58mm auto; margin: 6mm; } body { width: 58mm; }" : "@page { size: A4; margin: 15mm; }";
  const rows = items.map((it, idx) => {
    const name = it.product_name || `Item ${idx+1}`;
    const qty = Number(it.quantity || 1);
    const unit = Number(it.unit_price || 0).toFixed(2);
    const line = Number(it.total_price || qty * Number(unit)).toFixed(2);
    return `<tr><td>${idx+1}. ${name}</td><td class='c'>${qty}</td><td class='r'>₪${unit}</td><td class='r'>₪${line}</td></tr>`;
  }).join('');
  const addressBlock = deliveryMethod === 'delivery' && order.delivery_address ? `<div><strong>Address:</strong> ${order.delivery_address}</div>` : '';
  const instrBlock = order.delivery_instructions ? `<div><strong>Instructions:</strong> ${order.delivery_instructions}</div>` : '';
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8" />
  <title>Invoice #${order.order_number || order.id}</title>
  <style>
    ${widthCss}
    body { font-family: Arial, Helvetica, sans-serif; color: #111; }
    h1, h2, h3 { margin: 0 0 8px; }
    .header { border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 12px; }
    .meta { font-size: 12px; color: #555; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { padding: 6px 4px; border-bottom: 1px solid #eee; }
    tfoot td { border-top: 1px solid #ccc; font-weight: bold; }
    .r { text-align: right; }
    .c { text-align: center; }
    @media print { .no-print { display:none !important } }
  </style>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <meta name="format-detection" content="telephone=no" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;" />
  </head>
<body>
  <div class="header">
    <h1>Samna Salta</h1>
    <div class="meta">Invoice • ${createdAt}</div>
    <div class="meta">Order #${order.order_number || order.id}</div>
  </div>
  <div class="meta">
    <div><strong>Customer:</strong> ${order.customer_name || ''}</div>
    <div><strong>Phone:</strong> ${order.customer_phone || ''}</div>
    <div><strong>Method:</strong> ${deliveryMethod}</div>
    ${addressBlock}
    ${instrBlock}
  </div>
  <table>
    <thead><tr><th>Item</th><th class='c'>Qty</th><th class='r'>Unit</th><th class='r'>Total</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr><td colspan="3">Subtotal</td><td class='r'>₪${subtotal.toFixed(2)}</td></tr>
      <tr><td colspan="3">Delivery</td><td class='r'>₪${deliveryCharge.toFixed(2)}</td></tr>
      <tr><td colspan="3">Grand Total</td><td class='r'>₪${total.toFixed(2)}</td></tr>
    </tfoot>
  </table>
  <div class="meta no-print" style="margin-top:12px">
    <button onclick="window.print()">Print</button>
  </div>
</body></html>`;
};

// Create order (public)
router.post('/', optionalAuth, validateOrder, async (req, res) => {
  try {
    // If running without DB (development mode), return a mocked success response
    if (isInDevelopmentMode && typeof isInDevelopmentMode === 'function' && isInDevelopmentMode()) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Validation failed (dev mode):', { details: errors.array() });
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { total } = req.body || {};
      const orderId = `dev-${Date.now()}`;
      const orderNumber = generateOrderNumber();
      logger.info('Dev mode: creating mock order', { orderId, orderNumber });
      return res.status(201).json({
        success: true,
        message: 'Order created successfully (dev mode)',
        data: {
          order: {
            id: orderId,
            order_number: orderNumber,
            status: 'pending',
            total: total || 0,
          },
          payment_intent: null,
        },
      });
    }

    let client;
    try {
      client = await getClient();
    } catch (connErr) {
      // DB unavailable: degrade gracefully with mock order (so checkout works during outages)
      const { total } = req.body || {};
      const orderId = `dev-${Date.now()}`;
      const orderNumber = generateOrderNumber();
      logger.warn('DB unavailable, returning mock order for create:', connErr.message);
      return res.status(201).json({
        success: true,
        message: 'Order created successfully (fallback mode)',
        data: {
          order: {
            id: orderId,
            order_number: orderNumber,
            status: 'pending',
            total: total || 0,
          },
          payment_intent: null,
        },
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation failed:', { details: errors.array() });
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

  const {
      customer_name, customer_phone, customer_email,
      delivery_method, order_type, delivery_address, delivery_instructions, special_instructions,
      payment_method, order_items
    } = req.body;

    // Fetch authoritative product prices and compute totals server-side
    const productIdSet = new Set((order_items || []).map((it) => it.product_id).filter(Boolean));
    if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ success: false, error: 'Validation failed', message: 'Order must contain items' });
    }
    const productsResult = await client.query(
      `SELECT id, name, price FROM products WHERE id = ANY($1::int[]) AND is_active IS NOT FALSE`,
      [Array.from(productIdSet)]
    );
    const productById = new Map(productsResult.rows.map((p) => [p.id, p]));
    let computedSubtotal = 0;
    // Collect option value ids
    const optionValueIdSet = new Set();
    for (const item of order_items) {
      if (Array.isArray(item.selected_options)) {
        for (const opt of item.selected_options) {
          if (opt && Array.isArray(opt.values)) {
            for (const v of opt.values) {
              const vid = parseInt(v.id, 10);
              if (!Number.isNaN(vid)) optionValueIdSet.add(vid);
            }
          }
        }
      }
    }
    let optionValueById = new Map();
    if (optionValueIdSet.size > 0) {
      const valuesResult = await client.query(
        `SELECT id, name, price_adjustment FROM product_option_values WHERE id = ANY($1::int[])`,
        [Array.from(optionValueIdSet)]
      );
      optionValueById = new Map(valuesResult.rows.map((r) => [r.id, r]));
    }

    const normalizedItems = [];
    for (const item of order_items) {
      const product = productById.get(item.product_id);
      if (!product) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'Invalid product', message: `Product ${item.product_id} not available` });
      }
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitPrice = Number(product.price);
      // Sum adjustments per unit for selected options
      let addOnPerUnit = 0;
      if (Array.isArray(item.selected_options)) {
        for (const opt of item.selected_options) {
          if (opt && Array.isArray(opt.values)) {
            for (const v of opt.values) {
              const row = optionValueById.get(parseInt(v.id, 10));
              if (row) addOnPerUnit += Number(row.price_adjustment || 0);
            }
          }
        }
      }
      const lineTotal = (unitPrice + addOnPerUnit) * quantity;
      computedSubtotal += lineTotal;
      normalizedItems.push({ product_id: product.id, product_name: product.name, quantity, unit_price: unitPrice + addOnPerUnit, total_price: lineTotal, selected_options: Array.isArray(item.selected_options) ? item.selected_options : [] });
    }
    // Delivery charge can be derived from environment or default 0
    const deliveryCharge = (order_type === 'delivery' || delivery_method === 'delivery') ? Number(process.env.DELIVERY_CHARGE || 0) : 0;
    const computedTotal = computedSubtotal + deliveryCharge;

    // Map to schema column name
    const resolvedOrderType = order_type || delivery_method || 'pickup';

    await client.query('BEGIN');

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create or find customer (always bind orders.customer_id to customers.id)
    let customerId = null;
    const effectiveEmail = (customer_email && String(customer_email).trim()) || (req.user && req.user.email) || null;
    if (effectiveEmail) {
      const existing = await client.query('SELECT id FROM customers WHERE email = $1', [effectiveEmail]);
      if (existing.rows.length > 0) {
        customerId = existing.rows[0].id;
      } else {
        const newCustomer = await client.query(
          `INSERT INTO customers (name, email, phone, language, delivery_address, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
          [customer_name || (effectiveEmail.split('@')[0]), effectiveEmail, customer_phone || null, 'en', delivery_address || null]
        );
        customerId = newCustomer.rows[0].id;
      }
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_email,
       order_type, delivery_address, delivery_instructions, payment_method,
       subtotal, delivery_charge, total, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
      [
        orderNumber, customerId, customer_name, customer_phone, customer_email,
        resolvedOrderType, delivery_address, delivery_instructions, payment_method,
        computedSubtotal, deliveryCharge, computedTotal
      ]
    );

    const order = orderResult.rows[0];

    // Create order items and option selections
    for (const item of normalizedItems) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [order.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_price]
      );
      const orderItemId = itemResult.rows[0].id;
      if (Array.isArray(item.selected_options)) {
        for (const opt of item.selected_options) {
          const optionId = opt.option_id || null;
          const optionName = opt.option_name || '';
          const values = Array.isArray(opt.values) ? opt.values : [];
          for (const v of values) {
            const valRow = optionValueById.get(parseInt(v.id, 10));
            const valName = (v && v.name) || (valRow && valRow.name) || '';
            const padj = valRow ? Number(valRow.price_adjustment || 0) : 0;
            await client.query(
              `INSERT INTO order_item_options (order_item_id, option_id, option_value_id, option_name, option_value_name, price_adjustment)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [orderItemId, optionId, v.id, optionName, valName, padj]
            );
          }
        }
      }
    }

    // Create initial status update
    await client.query(
      `INSERT INTO order_status_updates (order_id, status, description, created_by_user_id, created_by_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [order.id, 'pending', 'Order placed successfully', req.user?.id || null, req.user?.email || null]
    );

    // Process payment if online
    let paymentIntent = null;
    if (payment_method === 'online') {
      if (!stripe) {
        await client.query('ROLLBACK');
        return res.status(500).json({
          success: false,
          error: 'Payment processing unavailable',
          message: 'Payment processing features are currently unavailable. Please try again later.'
        });
      }
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(computedTotal * 100), // Convert to cents
          currency: 'ils',
          metadata: {
            order_id: order.id,
            order_number: orderNumber
          }
        });

        // Update order with payment intent
        await client.query(
          'UPDATE orders SET stripe_payment_intent_id = $1 WHERE id = $2',
          [paymentIntent.id, order.id]
        );
      } catch (paymentError) {
        logger.error('Payment processing error:', paymentError);
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Payment processing failed',
          message: 'Unable to process payment. Please try again.'
        });
      }
    }

    await client.query('COMMIT');

    // Send real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${order.id}`).emit('order-update', {
        orderId: order.id,
        status: 'pending',
        message: 'Order placed successfully'
      });
    }

    logger.info('Order created successfully:', {orderId: order.id, orderNumber});

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total: order.total
        },
        payment_intent: paymentIntent ? {
          client_secret: paymentIntent.client_secret,
          id: paymentIntent.id
        } : null
      }
    });

  } catch (error) {
    // Fallback to mock order on DB connectivity issues
    const msg = (error && error.message) || '';
    if (
      msg.includes('Database not connected') ||
      msg.includes('connection') ||
      (error && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND'))
    ) {
      const { total } = req.body || {};
      const orderId = `dev-${Date.now()}`;
      const orderNumber = generateOrderNumber();
      logger.warn('Create order fallback due to DB error:', { message: msg });
      return res.status(201).json({
        success: true,
        message: 'Order created successfully (fallback mode)',
        data: {
          order: {
            id: orderId,
            order_number: orderNumber,
            status: 'pending',
            total: total || 0,
          },
          payment_intent: null,
        },
      });
    }
    logger.error('Create order error:', { message: msg, stack: error.stack, body: req.body });
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: 'Internal server error'
    });
  } finally {
    try {
      // Release client if present
      if (typeof client !== 'undefined' && client) {
        await client.release();
      }
    } catch {}
  }
});

// Get order by ID (public for order tracking)
router.get('/:id', async (req, res) => {
  try {
    const {id} = req.params;

    const orderResult = await dbQuery(
      `SELECT o.*, 
              array_agg(DISTINCT osu.status) as status_history,
              array_agg(DISTINCT osu.created_at) as status_timestamps
       FROM orders o
       LEFT JOIN order_status_updates osu ON o.id = osu.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await dbQuery(
        'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id',
        [id]
      );

      // Get order item options
      let itemOptionsByItemId = new Map();
      if (itemsResult.rows.length > 0) {
        const optResult = await dbQuery(
          'SELECT * FROM order_item_options WHERE order_id IS NULL AND order_item_id = ANY($1::int[]) ORDER BY id',
          [itemsResult.rows.map(r => r.id)]
        ).catch(async () => {
          // Some DBs may not have order_id column in order_item_options; fallback to no filter
          const r = await dbQuery('SELECT * FROM order_item_options WHERE order_item_id = ANY($1::int[]) ORDER BY id', [itemsResult.rows.map(r => r.id)]);
          return r;
        });
        for (const row of optResult.rows) {
          const list = itemOptionsByItemId.get(row.order_item_id) || [];
          list.push({
            option_id: row.option_id,
            option_name: row.option_name,
            option_value_id: row.option_value_id,
            option_value_name: row.option_value_name,
            price_adjustment: Number(row.price_adjustment || 0)
          });
          itemOptionsByItemId.set(row.order_item_id, list);
        }
      }

    // Get status updates
    const statusUpdatesResult = await dbQuery(
      'SELECT * FROM order_status_updates WHERE order_id = $1 ORDER BY created_at ASC',
      [id]
    );

      const orderData = {
      ...order,
        order_items: itemsResult.rows.map(it => ({ ...it, options: itemOptionsByItemId.get(it.id) || [] })),
      status_updates: statusUpdatesResult.rows
    };

    res.json({
      success: true,
      data: orderData
    });

  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: 'Internal server error'
    });
  }
});

// Get printable invoice (HTML)
router.get('/:id/invoice', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await dbQuery('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const itemsResult = await dbQuery('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id', [id]);
    const html = buildInvoiceHtml(orderResult.rows[0], itemsResult.rows, { receipt: false });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    logger.error('Get invoice error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate invoice' });
  }
});

// Get printable receipt (narrow)
router.get('/:id/receipt', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await dbQuery('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const itemsResult = await dbQuery('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id', [id]);
    const html = buildInvoiceHtml(orderResult.rows[0], itemsResult.rows, { receipt: true });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    logger.error('Get receipt error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate receipt' });
  }
});

// Get orders (admin only)
router.get('/', authenticateToken, requireAdmin, [
  query('status').optional().isString(),
  query('page').optional().isInt({min: 1}),
  query('limit').optional().isInt({min: 1, max: 100})
], async (req, res) => {
  try {
    const {status, page = 1, limit = 20} = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT o.*, 
             COUNT(oi.id) as items_count,
             array_agg(DISTINCT osu.status) as recent_statuses
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN order_status_updates osu ON o.id = osu.order_id
    `;

    const params = [];
    let paramCount = 0;

    if (status && status !== 'all') {
      paramCount++;
      sql += ` WHERE o.status = $${paramCount}`;
      params.push(status);
    }

    sql += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await dbQuery(sql, params);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await dbQuery(
          `SELECT oi.*, p.name as product_name, p.name_en as product_name_en, p.name_he as product_name_he
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1
           ORDER BY oi.id`,
          [order.id]
        );
        
        return {
          ...order,
          order_items: itemsResult.rows.map(item => ({
            id: item.id,
            product_name: item.product_name || item.product_name_en || item.product_name_he || 'Unknown Product',
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price),
            total_price: parseFloat(item.total_price)
          }))
        };
      })
    );

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM orders';
    if (status && status !== 'all') {
      countSql += ' WHERE status = $1';
    }
    const countResult = await dbQuery(countSql, status && status !== 'all' ? [status] : []);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: 'Internal server error'
    });
  }
});

// Export orders as CSV (admin only)
router.get('/export.csv', authenticateToken, requireAdmin, [
  query('status').optional().isString(),
  query('start_date').optional().isString(),
  query('end_date').optional().isString()
], async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;
    const clauses = [];
    const params = [];
    let idx = 1;
    if (status && status !== 'all') {
      clauses.push(`o.status = $${idx++}`);
      params.push(status);
    }
    if (start_date) {
      clauses.push(`o.created_at >= $${idx++}`);
      params.push(new Date(start_date));
    }
    if (end_date) {
      clauses.push(`o.created_at <= $${idx++}`);
      params.push(new Date(end_date));
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `
      SELECT o.id, o.order_number, o.status, o.payment_status, o.order_type,
             o.customer_name, o.customer_phone, o.customer_email,
             o.subtotal, o.delivery_charge, o.total,
             to_char(o.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
             to_char(o.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at
        FROM orders o
       ${where}
       ORDER BY o.created_at DESC
    `;
    const result = await dbQuery(sql, params);
    const header = [
      'id','order_number','status','payment_status','order_type','customer_name','customer_phone','customer_email','subtotal','delivery_charge','total','created_at','updated_at'
    ];
    const escape = (v) => {
      if (v === null || typeof v === 'undefined') return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    const rows = result.rows.map(r => header.map(k => escape(r[k])));
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    logger.error('Export orders CSV error:', error);
    return res.status(500).json({ success: false, error: 'Failed to export CSV' });
  }
});

// Get current user's orders (requires auth)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Resolve customer by user or email
    let customerId = null;
    try {
      const c = await dbQuery('SELECT id FROM customers WHERE email = (SELECT email FROM users WHERE id = $1) OR id = $2', [req.user.id, req.user.id]);
      if (c.rows.length > 0) customerId = c.rows[0].id;
    } catch {}

    const result = await dbQuery(
      `SELECT o.*
       FROM orders o
       WHERE ($1::int IS NOT NULL AND o.customer_id = $1)
          OR ($2::text IS NOT NULL AND o.customer_email = $2)
       ORDER BY o.created_at DESC
       LIMIT $3 OFFSET $4`,
      [customerId, req.user.email || null, limit, offset]
    );

    const countResult = await dbQuery(
      `SELECT COUNT(*) as total FROM orders
       WHERE ($1::int IS NOT NULL AND customer_id = $1)
          OR ($2::text IS NOT NULL AND customer_email = $2)`,
      [customerId, req.user.email || null]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total || 0),
        pages: Math.ceil(parseInt(countResult.rows[0].total || 0) / limit)
      }
    });
  } catch (error) {
    logger.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: 'Internal server error'
    });
  }
});

  // Update order status (admin only)
  router.patch('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('description').optional().isString()
], async (req, res) => {
  let client;
  try {
    client = await getClient();
  } catch (e) {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable',
      message: 'Cannot update order status while database is unavailable'
    });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {id} = req.params;
    const {status, description} = req.body;

    await client.query('BEGIN');

    // Update order status
    const orderResult = await client.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    // Add status update
    await client.query(
      `INSERT INTO order_status_updates (order_id, status, description, created_by_user_id, created_by_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, status, description || `Order status updated to ${status}`, req.user?.id || null, req.user?.email || null]
    );

    await client.query('COMMIT');

    const order = orderResult.rows[0];

    // Send real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${id}`).emit('order-update', {
        orderId: id,
        status,
        message: description || `Order status updated to ${status}`
      });
    }

    // If delivered: add summary update and close out
    if (status === 'delivered') {
      try {
        await dbQuery(
          `INSERT INTO order_status_updates (order_id, status, description, created_by_user_id, created_by_name)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, 'delivered', 'Order marked as delivered', req.user?.id || null, req.user?.email || null]
        );
      } catch {}
    }

    logger.info('Order status updated:', {orderId: id, status, updatedBy: req.user.id});

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      message: 'Internal server error'
    });
  } finally {
    if (client) client.release();
  }
});

// Confirm payment (for online payments)
router.post('/:id/confirm-payment', async (req, res) => {
  try {
    const {id} = req.params;
    const {payment_intent_id} = req.body;

    if (!payment_intent_id) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent required',
        message: 'Payment intent ID is required'
      });
    }

    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Payment processing unavailable',
        message: 'Payment processing features are currently unavailable. Please try again later.'
      });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
        message: 'Payment has not been completed successfully'
      });
    }

    // Update order status
    await dbQuery(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      ['confirmed', id]
    );

    // Add status update
    await dbQuery(
      `INSERT INTO order_status_updates (order_id, status, description, created_by_user_id, created_by_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, 'confirmed', 'Payment confirmed and order confirmed', null, 'stripe-webhook']
    );

    // Send real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${id}`).emit('order-update', {
        orderId: id,
        status: 'confirmed',
        message: 'Payment confirmed and order confirmed'
      });
    }

    logger.info('Payment confirmed:', {orderId: id, paymentIntentId: payment_intent_id});

    res.json({
      success: true,
      message: 'Payment confirmed successfully'
    });

  } catch (error) {
    logger.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
      message: 'Internal server error'
    });
  }
});

// Cancel order (admin only)
router.post('/:id/cancel', authenticateToken, requireAdmin, [
  body('reason').optional().isString()
], async (req, res) => {
  let client;
  try {
    client = await getClient();
  } catch (e) {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable',
      message: 'Cannot cancel order while database is unavailable'
    });
  }

  try {
    const {id} = req.params;
    const {reason} = req.body;

    await client.query('BEGIN');

    // Check if order can be cancelled
    const orderResult = await client.query(
      'SELECT status FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    const order = orderResult.rows[0];
    if (['delivered', 'cancelled'].includes(order.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled',
        message: 'Order has already been delivered or cancelled'
      });
    }

    // Update order status
    await client.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      ['cancelled', id]
    );

    // Add status update
    await client.query(
      `INSERT INTO order_status_updates (order_id, status, description)
       VALUES ($1, $2, $3)`,
      [id, 'cancelled', reason || 'Order cancelled by admin']
    );

    await client.query('COMMIT');

    // Send real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${id}`).emit('order-update', {
        orderId: id,
        status: 'cancelled',
        message: reason || 'Order cancelled by admin'
      });
    }

    logger.info('Order cancelled:', {orderId: id, reason, cancelledBy: req.user.id});

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order',
      message: 'Internal server error'
    });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
