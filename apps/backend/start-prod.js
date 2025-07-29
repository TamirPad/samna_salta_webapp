#!/usr/bin/env node

// Production start script for Samna Salta Backend
console.log('🚀 Starting Samna Salta Backend in production mode...');

// Set default environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 10000;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://samna-salta-webapp.onrender.com';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Log configuration
console.log('📊 Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Using default'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`   LOG_LEVEL: ${process.env.LOG_LEVEL}`);

// Check for required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-key-change-in-production') {
    console.warn('⚠️ Warning: JWT_SECRET not set, using default (not secure for production)');
}

if (!process.env.DATABASE_URL) {
    console.warn('⚠️ Warning: DATABASE_URL not set, running in development mode with sample data');
}

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Start the server
try {
    require('./src/server.js');
} catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
} 