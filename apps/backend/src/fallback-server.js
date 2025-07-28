#!/usr/bin/env node

// Ultra-simple fallback server that will definitely work
const express = require('express');
const { createServer } = require('http');

console.log('🆘 Starting fallback server...');

const app = express();
const server = createServer(app);

// Basic middleware
app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Fallback server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'fallback'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'fallback',
    services: {
      database: 'disconnected',
      redis: 'disconnected'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Samna Salta Backend (Fallback Mode)',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`✅ Fallback server running on port ${port}`);
  console.log(`🌐 Test endpoint: http://localhost:${port}/api/test`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});

// Error handling
server.on('error', (error) => {
  console.error('❌ Fallback server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${port} in use, trying ${port + 1}`);
    server.listen(port + 1);
  }
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down fallback server');
  server.close(() => {
    console.log('✅ Fallback server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down fallback server');
  server.close(() => {
    console.log('✅ Fallback server closed');
    process.exit(0);
  });
}); 