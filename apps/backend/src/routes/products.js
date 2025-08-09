const express = require('express');
const {body, validationResult, query} = require('express-validator');
const {authenticateToken, requireAdmin} = require('../middleware/auth');
const {query: dbQuery} = require('../config/database');
const {getCache, setCache} = require('../config/redis');
const logger = require('../utils/logger');
const multer = require('multer');
const upload = multer({ limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024) } });
let cloudinary;
try { cloudinary = require('cloudinary').v2; cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET }); } catch { cloudinary = null; }

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').trim().isLength({min: 2, max: 200}).withMessage('Name must be between 2 and 200 characters'),
  body('price').isFloat({min: 0}).withMessage('Price must be a positive number'),
  body('category_id').optional().isInt({min: 1}).withMessage('Category ID must be a positive integer'),
  body('preparation_time').optional().isInt({min: 0}).withMessage('Preparation time must be a non-negative integer')
];

const validateCategory = [
  body('name').trim().isLength({min: 2, max: 100}).withMessage('Name must be between 2 and 100 characters')
];

// Get all products (public)
router.get('/', [
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({min: 1}),
  query('limit').optional().isInt({min: 1, max: 100})
], async (req, res) => {
  try {
    const {category, search, page = 1, limit = 20} = req.query;
    const offset = (page - 1) * limit;

    // Try to get from cache first (optional)
    try {
      const cacheKey = `products:${category || 'all'}:${search || 'none'}:${page}:${limit}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }
    } catch (error) {
      // Cache not available, continue without it
      console.log('💡 Cache not available, proceeding without cache');
      logger.debug('Cache not available, proceeding without cache');
    }

    // First try to get products from the products table
    let sql = `
      SELECT p.*, c.name as category_name, c.name_en as category_name_en, c.name_he as category_name_he
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
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

    let result;
    try {
      result = await dbQuery(sql, params);
      
      // If no products found in products table, create products from order items
      if (result.rows.length === 0) {
        console.log('🔧 No products found in products table, creating from order items...');
        
        // Get unique products from order items
        const orderItemsResult = await dbQuery(`
          SELECT DISTINCT 
            product_name as name,
            product_name as name_en,
            product_name as name_he,
            'Traditional Yemenite dish' as description,
            'Traditional Yemenite dish' as description_en,
            'מנה תימנית מסורתית' as description_he,
            unit_price as price,
            COUNT(*) as order_count,
            SUM(quantity) as total_quantity
          FROM order_items 
          WHERE product_name IS NOT NULL 
          GROUP BY product_name, unit_price
          ORDER BY total_quantity DESC
          LIMIT 50
        `);
        
        if (orderItemsResult.rows.length > 0) {
          // Create categories if they don't exist
          await dbQuery(`
            INSERT INTO categories (name, name_en, name_he, is_active, display_order)
            VALUES ('Main Dishes', 'Main Dishes', 'מנות עיקריות', true, 1)
            ON CONFLICT (name) DO NOTHING
          `);
          
          // Get the main category
          const categoryResult = await dbQuery('SELECT id FROM categories WHERE name = $1', ['Main Dishes']);
          const categoryId = categoryResult.rows[0]?.id || 1;
          
          // Insert products
          for (let i = 0; i < orderItemsResult.rows.length; i++) {
            const item = orderItemsResult.rows[i];
            await dbQuery(`
              INSERT INTO products (name, name_en, name_he, description, description_en, description_he, price, category_id, is_active, display_order)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
              ON CONFLICT (name) DO NOTHING
            `, [
              item.name, item.name_en, item.name_he,
              item.description, item.description_en, item.description_he,
              item.price, categoryId, i + 1
            ]);
          }
          
          // Now fetch the products again
          result = await dbQuery(sql, params);
        }
      }
      
    } catch (dbError) {
      console.error('❌ Database error fetching products:', dbError.message);
      logger.error('Database error fetching products:', dbError);

      // Check if it's a connection error
      if (dbError.message.includes('Database not connected') ||
          dbError.message.includes('connection') ||
          dbError.code === 'ECONNREFUSED' ||
          dbError.code === 'ENOTFOUND') {
        return res.status(503).json({
          success: false,
          error: 'Database unavailable',
          message: 'Menu items are temporarily unavailable due to database connectivity issues.',
          details: 'Please try again later or contact support if the problem persists.',
          fallback: {
            message: 'The application is currently experiencing technical difficulties.',
            suggestion: 'Please check back in a few minutes.'
          }
        });
      }

      // For other database errors, return generic error
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'Failed to fetch menu items due to a database error.'
      });
    }

    // Cache the result for 5 minutes (optional)
    try {
      const cacheKey = `products:${category || 'all'}:${search || 'none'}:${page}:${limit}`;
      await setCache(cacheKey, result.rows, 300);
      res.setHeader('Cache-Control', 'public, max-age=120');
    } catch (error) {
      // Cache not available, continue without it
      logger.debug('Cache not available, skipping cache set');
    }

    console.log('✅ Products fetched successfully:', {count: result.rows.length, category, search});
    logger.info('Products fetched successfully:', {count: result.rows.length, category, search});

    // total count for pagination
    const totalCountResult = await dbQuery(
      `SELECT COUNT(*) as total
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active IS NOT FALSE` +
       (category ? ` AND c.name ILIKE $1` : '') +
       (search ? (category ? ` AND (p.name ILIKE $2 OR p.description ILIKE $2 OR p.name_en ILIKE $2 OR p.name_he ILIKE $2)`
                               : ` AND (p.name ILIKE $1 OR p.description ILIKE $1 OR p.name_en ILIKE $1 OR p.name_he ILIKE $1)`) : ''),
      category && search ? [`%${category}%`, `%${search}%`] : (category ? [`%${category}%`] : (search ? [`%${search}%`] : []))
    );

    const total = parseInt(totalCountResult.rows?.[0]?.total || 0);

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
    console.error('❌ Get products error:', error.message);
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: 'Internal server error'
    });
  }
});

// Simple test endpoint
router.get('/test', async (req, res) => {
  try {
    const result = await dbQuery('SELECT 1 as test');
    res.json({
      success: true,
      message: 'Database connection working',
      data: result.rows[0]
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to check database tables
router.get('/test-db', async (req, res) => {
  try {
    // Check if products table exists
    const productsResult = await dbQuery('SELECT COUNT(*) as count FROM products');
    const categoriesResult = await dbQuery('SELECT COUNT(*) as count FROM categories');
    const orderItemsResult = await dbQuery('SELECT DISTINCT product_name FROM order_items LIMIT 10');
    
    res.json({
      success: true,
      data: {
        products_count: productsResult.rows[0].count,
        categories_count: categoriesResult.rows[0].count,
        sample_products: orderItemsResult.rows
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      data: {
        products_count: 0,
        categories_count: 0,
        sample_products: []
      }
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

    let result = await dbQuery(
      'SELECT * FROM categories WHERE is_active IS NOT FALSE ORDER BY display_order ASC, name ASC'
    );
    
    // If no categories found, create default categories
    if (result.rows.length === 0) {
      console.log('🔧 No categories found, creating default categories...');
      
      await dbQuery(`
        INSERT INTO categories (name, name_en, name_he, is_active, display_order)
        VALUES 
          ('Main Dishes', 'Main Dishes', 'מנות עיקריות', true, 1),
          ('Appetizers', 'Appetizers', 'מנות פתיחה', true, 2),
          ('Beverages', 'Beverages', 'משקאות', true, 3),
          ('Desserts', 'Desserts', 'קינוחים', true, 4)
        ON CONFLICT (name) DO NOTHING
      `);
      
      result = await dbQuery(
        'SELECT * FROM categories WHERE is_active IS NOT FALSE ORDER BY display_order ASC, name ASC'
      );
    }

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
    const {id} = req.params;

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
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
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
      `INSERT INTO products (name, name_en, name_he, description, description_en, description_he,
       price, category_id, image_url, emoji, preparation_time_minutes, is_active, is_new, is_popular,
       created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING *`,
      [
        name, name_en, name_he, description, description_en, description_he,
        price, category_id, image_url, emoji || null, preparation_time || 15,
        is_active !== false, is_new || false, is_popular || false
      ]
    );

    const product = result.rows[0];

    logger.info('Product created:', {productId: product.id, name: product.name});

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

    const {id} = req.params;
    const {
      name, name_en, name_he, description, description_en, description_he,
      price, category_id, image_url, emoji, preparation_time,
      is_active, is_new, is_popular, available
    } = req.body;

    const result = await dbQuery(
      `UPDATE products SET 
       name = $1, name_en = $2, name_he = $3, description = $4, description_en = $5, description_he = $6,
       price = $7, category_id = $8, image_url = $9, emoji = $10, preparation_time_minutes = $11,
       is_active = $12, is_new = $13, is_popular = $14, updated_at = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        name, name_en, name_he, description, description_en, description_he,
        price, category_id, image_url, emoji || null, preparation_time || 0,
        is_active !== false, is_new || false, is_popular || false, id
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

    logger.info('Product updated:', {productId: product.id, name: product.name});

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
    const {id} = req.params;

    const result = await dbQuery(
      'DELETE FROM products WHERE id = $1 RETURNING *',
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

    logger.info('Product deleted:', {productId: product.id, name: product.name});

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

    const {name, name_en, name_he, description, description_en, description_he, image_url, sort_order} = req.body;

    const result = await dbQuery(
      `INSERT INTO categories (name, name_en, name_he, description, description_en, description_he,
       image_url, display_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
       RETURNING *`,
      [name, name_en, name_he, description, description_en, description_he, image_url, sort_order || 0]
    );

    const category = result.rows[0];

    logger.info('Category created:', {categoryId: category.id, name: category.name});

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

    const {id} = req.params;
    const {name, name_en, name_he, description, description_en, description_he, image_url, sort_order, is_active} = req.body;

    const result = await dbQuery(
      `UPDATE categories SET 
       name = $1, name_en = $2, name_he = $3, description = $4, description_en = $5, description_he = $6,
       image_url = $7, display_order = $8, is_active = $9, updated_at = NOW()
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

    logger.info('Category updated:', {categoryId: category.id, name: category.name});

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
    const {id} = req.params;

    // Check if category has products
    const productsResult = await dbQuery(
      'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
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
      'DELETE FROM categories WHERE id = $1 RETURNING *',
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

    logger.info('Category deleted:', {categoryId: category.id, name: category.name});

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

// Upload product image (admin only)
router.post('/upload', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!cloudinary) {
      return res.status(503).json({ success: false, error: 'Image service unavailable' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }
    const result = await cloudinary.uploader.upload_stream({ folder: 'products' }, (err, data) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Upload failed' });
      }
      return res.json({ success: true, data: { url: data.secure_url } });
    });
    // Write file buffer to stream
    result.end(req.file.buffer);
  } catch (error) {
    logger.error('Image upload error:', error);
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
});
