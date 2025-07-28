#!/usr/bin/env node

// Wrapper script to start the server with better error handling
console.log('🚀 Starting Samna Salta Backend with wrapper...');

// Load environment variables
require('dotenv').config();

console.log('📋 Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');

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
  
  // Use require to load the server module
  require('./server');
  
  console.log('✅ Server module loaded successfully');
  console.log('✅ Wrapper completed, server should be running');
} catch (error) {
  console.error('❌ Failed to load server module:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Try to provide more helpful error information
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('💡 Hint: Check if all dependencies are installed');
  } else if (error.message.includes('SyntaxError')) {
    console.error('💡 Hint: Check for syntax errors in server.js');
  }
  
  process.exit(1);
} 