const express = require('express');
const {body, validationResult, query} = require('express-validator');
const {authenticateToken, requireAdmin} = require('../middleware/auth');
const {query: dbQuery} = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware
const validateCustomer = [
  body('name').trim().isLength({min: 2, max: 100}).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
];

// Get all customers (admin only)
router.get('/', authenticateToken, requireAdmin, [
  query('search').optional().isString(),
  query('page').optional().isInt({min: 1}),
  query('limit').optional().isInt({min: 1, max: 100})
], async (req, res) => {
  try {
    const {search, page = 1, limit = 20} = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT c.*, 
             COUNT(o.id) as total_orders,
             SUM(o.total) as total_spent,
             MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
    `;

    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      sql += ` WHERE (c.name ILIKE $${paramCount} OR c.email ILIKE $${paramCount} OR c.phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    sql += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await dbQuery(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM customers';
    if (search) {
      countSql += ' WHERE (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)';
    }
    const countResult = await dbQuery(countSql, search ? [`%${search}%`] : []);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
      message: 'Internal server error'
    });
  }
});

// Get customer by ID (admin only)
// Match only numeric IDs so that '/me' does not get captured by this route
router.get('/:id(\\d+)', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {id} = req.params;

    const customerResult = await dbQuery(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
        message: 'The requested customer does not exist'
      });
    }

    const customer = customerResult.rows[0];

    // Get customer orders
    const ordersResult = await dbQuery(
      `SELECT o.*, 
              COUNT(oi.id) as items_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [id]
    );

    const customerData = {
      ...customer,
      orders: ordersResult.rows
    };

    res.json({
      success: true,
      data: customerData
    });

  } catch (error) {
    logger.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
      message: 'Internal server error'
    });
  }
});

// Update customer (admin only)
router.put('/:id(\\d+)', authenticateToken, requireAdmin, validateCustomer, async (req, res) => {
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
    const {name, email, phone, delivery_address, language} = req.body;

    const result = await dbQuery(
      `UPDATE customers SET 
       name = $1, email = $2, phone = $3, delivery_address = $4, language = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, email, phone, delivery_address, language, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
        message: 'The requested customer does not exist'
      });
    }

    const customer = result.rows[0];

    logger.info('Customer updated:', {customerId: customer.id, name: customer.name});

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });

  } catch (error) {
    logger.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer',
      message: 'Internal server error'
    });
  }
});

// Delete customer (admin only)
router.delete('/:id(\\d+)', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {id} = req.params;

    // Check if customer has orders
    const ordersResult = await dbQuery(
      'SELECT COUNT(*) as count FROM orders WHERE customer_id = $1',
      [id]
    );

    if (parseInt(ordersResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer has orders',
        message: 'Cannot delete customer that has orders. Please delete orders first.'
      });
    }

    const result = await dbQuery(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
        message: 'The requested customer does not exist'
      });
    }

    const customer = result.rows[0];

    logger.info('Customer deleted:', {customerId: customer.id, name: customer.name});

    res.json({
      success: true,
      message: 'Customer deleted successfully',
      data: customer
    });

  } catch (error) {
    logger.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
      message: 'Internal server error'
    });
  }
});

module.exports = router;

// Get/update current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await dbQuery('SELECT id, name, email, phone, delivery_address, language FROM customers WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Get profile error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

router.put('/me', authenticateToken, validateCustomer, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    }
    const { name, email, phone, delivery_address, language } = req.body;
    const result = await dbQuery(
      `UPDATE customers SET name = $1, email = $2, phone = $3, delivery_address = $4, language = $5, updated_at = NOW() WHERE id = $6 RETURNING id, name, email, phone, delivery_address, language`,
      [name, email, phone, delivery_address, language, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    return res.json({ success: true, message: 'Profile updated', data: result.rows[0] });
  } catch (error) {
    logger.error('Update profile error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});
