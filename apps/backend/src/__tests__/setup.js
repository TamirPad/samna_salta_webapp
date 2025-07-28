// Simple test setup for backend
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock database connection
jest.mock('../config/database', () => ({
  getClient: jest.fn().mockReturnValue({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  }),
}));

// Mock Redis connection
jest.mock('../config/redis', () => ({
  getClient: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
  }),
})); 