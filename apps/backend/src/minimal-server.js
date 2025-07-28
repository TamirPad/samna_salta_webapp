#!/usr/bin/env node

// Minimal server test to isolate issues
const express = require('express');
const { createServer } = require('http');

console.log('🚀 Starting minimal server test...');

const app = express();
const server = createServer(app);

// Basic middleware
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Minimal server is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`✅ Minimal server running on port ${port}`);
  console.log(`🌐 Test endpoint: http://localhost:${port}/test`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});

// Error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${port} in use, trying ${port + 1}`);
    server.listen(port + 1);
  }
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}); 