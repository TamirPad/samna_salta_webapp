const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { query: dbQuery, getCache, setCache } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('preparation_time').optional().isInt({ min: 0 }).withMessage('Preparation time must be a non-negative integer')
];

const validateCategory = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
];

// Get all products (public)
router.get('/', [
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Try to get from cache first (optional)
    let cached = null;
    try {
      const cacheKey = `products:${category || 'all'}:${search || 'none'}:${page}:${limit}`;
      cached = await getCache(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }
    } catch (error) {
      // Cache not available, continue without it
      logger.debug('Cache not available, proceeding without cache');
    }

    let sql = `
      SELECT p.*, c.name as category_name, c.name_en as category_name_en, c.name_he as category_name_he
      FROM menu_products p
      LEFT JOIN menu_categories c ON p.category_id = c.id
      WHERE p.is_active IS NOT FALSE
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      sql += ` AND c.name ILIKE $${paramCount}`;
      params.push(`%${category}%`);
    }

    if (search) {
      paramCount++;
      sql += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR p.name_en ILIKE $${paramCount} OR p.name_he ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY p.display_order ASC, p.name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await dbQuery(sql, params);

    // Cache the result for 5 minutes (optional)
    try {
      const cacheKey = `products:${category || 'all'}:${search || 'none'}:${page}:${limit}`;
      await setCache(cacheKey, result.rows, 300);
    } catch (error) {
      // Cache not available, continue without it
      logger.debug('Cache not available, skipping cache set');
    }

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows.length
      }
    });

  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: 'Internal server error'
    });
  }
});

// Get all categories (public)
router.get('/categories', async (req, res) => {
  try {
    // Try to get from cache first (optional)
    let cached = null;
    try {
      const cacheKey = 'categories:all';
      cached = await getCache(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }
    } catch (error) {
      // Cache not available, continue without it
      logger.debug('Cache not available, proceeding without cache');
    }

    const result = await dbQuery(
      'SELECT * FROM menu_categories WHERE is_active IS NOT FALSE ORDER BY display_order ASC, name ASC'
    );

    // Cache the result for 30 minutes (optional)
    try {
      const cacheKey = 'categories:all';
      await setCache(cacheKey, result.rows, 1800);
    } catch (error) {
      // Cache not available, continue without it
      logger.debug('Cache not available, skipping cache set');
    }

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: 'Internal server error'
    });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to get from cache first (optional)
    let cached = null;
    try {
      const cacheKey = `product:${id}`;
      cached = await getCache(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }
    } catch (error) {
      // Cache not available, continue without it
      logger.debug('Cache not available, proceeding without cache');
    }

    const result = await dbQuery(
      `SELECT p.*, c.name as category_name, c.name_en as category_name_en, c.name_he as category_name_he
       FROM menu_products p
       LEFT JOIN menu_categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active IS NOT FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    const product = result.rows[0];

    // Cache the result for 10 minutes (optional)
    try {
      const cacheKey = `product:${id}`;
      await setCache(cacheKey, product, 600);
    } catch (error) {
      // Cache not available, continue without it
      logger.debug('Cache not available, skipping cache set');
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: 'Internal server error'
    });
  }
});

// Admin routes - require authentication and admin privileges

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      name, name_en, name_he, description, description_en, description_he,
      price, category_id, image_url, emoji, preparation_time,
      is_active, is_new, is_popular, available
    } = req.body;

    const result = await dbQuery(
      `INSERT INTO menu_products (name, name_en, name_he, description, description_en, description_he,
       price, category_id, image_url, emoji, preparation_time, is_active, is_new, is_popular, available,
       created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
       RETURNING *`,
      [
        name, name_en, name_he, description, description_en, description_he,
        price, category_id, image_url, emoji, preparation_time || 0,
        is_active !== false, is_new || false, is_popular || false, available !== false
      ]
    );

    const product = result.rows[0];

    logger.info('Product created:', { productId: product.id, name: product.name });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: 'Internal server error'
    });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const {
      name, name_en, name_he, description, description_en, description_he,
      price, category_id, image_url, emoji, preparation_time,
      is_active, is_new, is_popular, available
    } = req.body;

    const result = await dbQuery(
      `UPDATE menu_products SET 
       name = $1, name_en = $2, name_he = $3, description = $4, description_en = $5, description_he = $6,
       price = $7, category_id = $8, image_url = $9, emoji = $10, preparation_time = $11,
       is_active = $12, is_new = $13, is_popular = $14, available = $15, updated_at = NOW()
       WHERE id = $16
       RETURNING *`,
      [
        name, name_en, name_he, description, description_en, description_he,
        price, category_id, image_url, emoji, preparation_time || 0,
        is_active !== false, is_new || false, is_popular || false, available !== false, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    const product = result.rows[0];

    logger.info('Product updated:', { productId: product.id, name: product.name });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: 'Internal server error'
    });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbQuery(
      'DELETE FROM menu_products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    const product = result.rows[0];

    logger.info('Product deleted:', { productId: product.id, name: product.name });

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });

  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: 'Internal server error'
    });
  }
});

// Category management routes

// Create category (admin only)
router.post('/categories', authenticateToken, requireAdmin, validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, name_en, name_he, description, description_en, description_he, image_url, sort_order } = req.body;

    const result = await dbQuery(
      `INSERT INTO menu_categories (name, name_en, name_he, description, description_en, description_he,
       image_url, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [name, name_en, name_he, description, description_en, description_he, image_url, sort_order || 0]
    );

    const category = result.rows[0];

    logger.info('Category created:', { categoryId: category.id, name: category.name });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    logger.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      message: 'Internal server error'
    });
  }
});

// Update category (admin only)
router.put('/categories/:id', authenticateToken, requireAdmin, validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { name, name_en, name_he, description, description_en, description_he, image_url, sort_order, is_active } = req.body;

    const result = await dbQuery(
      `UPDATE menu_categories SET 
       name = $1, name_en = $2, name_he = $3, description = $4, description_en = $5, description_he = $6,
       image_url = $7, sort_order = $8, is_active = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [name, name_en, name_he, description, description_en, description_he, image_url, sort_order || 0, is_active !== false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      });
    }

    const category = result.rows[0];

    logger.info('Category updated:', { categoryId: category.id, name: category.name });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    logger.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
      message: 'Internal server error'
    });
  }
});

// Delete category (admin only)
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productsResult = await dbQuery(
      'SELECT COUNT(*) as count FROM menu_products WHERE category_id = $1',
      [id]
    );

    if (parseInt(productsResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Category has products',
        message: 'Cannot delete category that has products. Please remove or reassign products first.'
      });
    }

    const result = await dbQuery(
      'DELETE FROM menu_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      });
    }

    const category = result.rows[0];

    logger.info('Category deleted:', { categoryId: category.id, name: category.name });

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: category
    });

  } catch (error) {
    logger.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
      message: 'Internal server error'
    });
  }
});

module.exports = router; 