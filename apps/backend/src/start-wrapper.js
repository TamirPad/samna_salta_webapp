#!/usr/bin/env node

// Wrapper script to start the server with better error handling
console.log('🚀 Starting Samna Salta Backend with wrapper...');

// Load environment variables
require('dotenv').config();

// Set up basic error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Wrapper: Uncaught Exception:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Wrapper: Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Import and start the server
try {
  console.log('📦 Loading server module...');
  const { app, server, io } = require('./server');
  console.log('✅ Server module loaded successfully');
} catch (error) {
  console.error('❌ Failed to load server module:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

console.log('✅ Wrapper completed, server should be running'); 