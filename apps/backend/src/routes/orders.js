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
  body('subtotal').isFloat({min: 0}).withMessage('Subtotal must be a positive number'),
  body('total').isFloat({min: 0}).withMessage('Total must be a positive number')
];

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SS${timestamp}${random}`;
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

    const client = await getClient();

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
      payment_method, order_items, subtotal, delivery_charge, total
    } = req.body;

    // Map to schema column name
    const resolvedOrderType = order_type || delivery_method || 'pickup';

    await client.query('BEGIN');

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create or find customer
    let customerId = null;
    if (req.user) {
      customerId = req.user.id;
    } else if (customer_email) {
      const customerResult = await client.query(
        'SELECT id FROM customers WHERE email = $1',
        [customer_email]
      );

      if (customerResult.rows.length > 0) {
        customerId = customerResult.rows[0].id;
      } else {
        const newCustomerResult = await client.query(
          `INSERT INTO customers (name, name_en, name_he, email, phone, address, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING id`,
          [customer_name, customer_name, customer_name, customer_email, customer_phone, delivery_address]
        );
        customerId = newCustomerResult.rows[0].id;
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
        subtotal, delivery_charge || 0, total
      ]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of order_items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_price,
        ]
      );
    }

    // Create initial status update
    await client.query(
      `INSERT INTO order_status_updates (order_id, status, description)
       VALUES ($1, $2, $3)`,
      [order.id, 'pending', 'Order placed successfully']
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
          amount: Math.round(total * 100), // Convert to cents
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
    // If client was acquired, ensure rollback and release happen via finally
    logger.error('Create order error:', { message: error.message, stack: error.stack, body: req.body });
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
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    // Get status updates
    const statusUpdatesResult = await dbQuery(
      'SELECT * FROM order_status_updates WHERE order_id = $1 ORDER BY created_at ASC',
      [id]
    );

    const orderData = {
      ...order,
      order_items: itemsResult.rows,
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

// Update order status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('description').optional().isString()
], async (req, res) => {
  const client = await getClient();

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
      `INSERT INTO order_status_updates (order_id, status, description)
       VALUES ($1, $2, $3)`,
      [id, status, description || `Order status updated to ${status}`]
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
    client.release();
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
      `INSERT INTO order_status_updates (order_id, status, description)
       VALUES ($1, $2, $3)`,
      [id, 'confirmed', 'Payment confirmed and order confirmed']
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
  const client = await getClient();

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
    client.release();
  }
});

module.exports = router;
