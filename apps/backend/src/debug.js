#!/usr/bin/env node

// Simple debug script to test database connection
require('dotenv').config();
const { connectDB, query } = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

async function testConnections() {
  console.log('🔍 Testing Samna Salta Backend Connections...\n');
  
  // Test database connection
  console.log('📊 Testing Database Connection...');
  try {
    await connectDB();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database query successful:', result.rows[0]);
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
  
  console.log('\n🔴 Testing Redis Connection...');
  try {
    await connectRedis();
    console.log('✅ Redis connection successful');
  } catch (error) {
    console.log('❌ Redis connection failed:', error.message);
  }
  
  console.log('\n📋 Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('SUPABASE_CONNECTION_STRING:', process.env.SUPABASE_CONNECTION_STRING ? 'SET' : 'NOT SET');
  
  console.log('\n🏁 Debug complete!');
}

testConnections().catch(console.error); 