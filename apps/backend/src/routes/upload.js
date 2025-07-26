const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image (admin only)
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please select an image file to upload'
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'samna-salta',
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    logger.info('Image uploaded successfully:', { 
      publicId: result.public_id, 
      url: result.secure_url,
      uploadedBy: req.user.id 
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });

  } catch (error) {
    logger.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: 'Internal server error'
    });
  }
});

// Delete image (admin only)
router.delete('/image/:public_id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { public_id } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      logger.info('Image deleted successfully:', { 
        publicId: public_id, 
        deletedBy: req.user.id 
      });

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to delete image',
        message: 'Image could not be deleted'
      });
    }

  } catch (error) {
    logger.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
      message: 'Internal server error'
    });
  }
});

// Get image info (admin only)
router.get('/image/:public_id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { public_id } = req.params;

    // Get image info from Cloudinary
    const result = await cloudinary.api.resource(public_id);

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        created_at: result.created_at
      }
    });

  } catch (error) {
    logger.error('Get image info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get image info',
      message: 'Internal server error'
    });
  }
});

module.exports = router; 