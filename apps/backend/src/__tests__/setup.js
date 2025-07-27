// Test setup for backend
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
process.env.STRIPE_SECRET_KEY = 'sk_test_test';
process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_api_key';
process.env.CLOUDINARY_API_SECRET = 'test_api_secret';

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock external services
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'test_public_id',
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test',
        client_secret: 'pi_test_secret',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test',
        status: 'succeeded',
      }),
    },
    customers: {
      create: jest.fn().mockResolvedValue({
        id: 'cus_test',
        email: 'test@example.com',
      }),
    },
  }));
});

jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'msg_test',
        status: 'sent',
      }),
    },
  })),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test_message_id',
    }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock database connection
jest.mock('../config/database', () => ({
  getClient: jest.fn().mockReturnValue({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  }),
  getMigrationClient: jest.fn().mockReturnValue({
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
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
  getSession: jest.fn(),
  setSession: jest.fn(),
  deleteSession: jest.fn(),
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Global test utilities
global.testUtils = {
  // Helper to create test user data
  createTestUser: (overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    phone: '+1234567890',
    is_admin: false,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  // Helper to create test product data
  createTestProduct: (overrides = {}) => ({
    id: 1,
    name: 'Test Product',
    description: 'Test product description',
    price: 10.99,
    category_id: 1,
    image_url: 'https://example.com/image.jpg',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  // Helper to create test order data
  createTestOrder: (overrides = {}) => ({
    id: 1,
    customer_id: 1,
    status: 'pending',
    total_amount: 25.99,
    delivery_address: '123 Test St',
    delivery_phone: '+1234567890',
    notes: 'Test order notes',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  // Helper to create test customer data
  createTestCustomer: (overrides = {}) => ({
    id: 1,
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '+1234567890',
    address: '123 Test St',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  // Helper to create test order item data
  createTestOrderItem: (overrides = {}) => ({
    id: 1,
    order_id: 1,
    product_id: 1,
    quantity: 2,
    price: 10.99,
    created_at: new Date(),
    ...overrides,
  }),

  // Helper to create test category data
  createTestCategory: (overrides = {}) => ({
    id: 1,
    name: 'Test Category',
    description: 'Test category description',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  // Helper to create JWT token
  createTestToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({
      id: 1,
      email: 'test@example.com',
      isAdmin: false,
      sessionId: 'test-session-id',
      ...payload,
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
  },

  // Helper to create mock request
  createMockRequest: (overrides = {}) => ({
    headers: {},
    body: {},
    params: {},
    query: {},
    user: null,
    id: 'req-123',
    url: '/api/test',
    method: 'GET',
    ip: '127.0.0.1',
    get: jest.fn().mockReturnValue('Mozilla/5.0'),
    ...overrides,
  }),

  // Helper to create mock response
  createMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    return res;
  },

  // Helper to create mock next function
  createMockNext: () => jest.fn(),

  // Helper to create mock database result
  createMockDbResult: (rows = [], rowCount = 0) => ({
    rows,
    rowCount,
  }),

  // Helper to create mock Redis result
  createMockRedisResult: (value = null) => value,

  // Helper to create mock error
  createMockError: (message = 'Test error', statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  },

  // Helper to wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create test database queries
  createTestQueries: () => ({
    insertUser: 'INSERT INTO users (name, email, password_hash, phone, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    selectUser: 'SELECT * FROM users WHERE id = $1',
    selectUserByEmail: 'SELECT * FROM users WHERE email = $1',
    updateUser: 'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *',
    deleteUser: 'DELETE FROM users WHERE id = $1',
    insertProduct: 'INSERT INTO products (name, description, price, category_id, image_url, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    selectProduct: 'SELECT * FROM products WHERE id = $1',
    selectProducts: 'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC',
    updateProduct: 'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5, is_active = $6 WHERE id = $7 RETURNING *',
    deleteProduct: 'DELETE FROM products WHERE id = $1',
    insertOrder: 'INSERT INTO orders (customer_id, status, total_amount, delivery_address, delivery_phone, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    selectOrder: 'SELECT * FROM orders WHERE id = $1',
    selectOrders: 'SELECT * FROM orders ORDER BY created_at DESC',
    updateOrder: 'UPDATE orders SET status = $1, total_amount = $2 WHERE id = $3 RETURNING *',
    deleteOrder: 'DELETE FROM orders WHERE id = $1',
  }),
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.exit to prevent tests from exiting
const originalExit = process.exit;
process.exit = jest.fn();

// Restore process.exit after tests
afterAll(() => {
  process.exit = originalExit;
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('test-random-string'),
  }),
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue('test-file-content'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('test/path'),
  resolve: jest.fn().mockReturnValue('/absolute/test/path'),
  dirname: jest.fn().mockReturnValue('test'),
  basename: jest.fn().mockReturnValue('test.js'),
}));

// Mock os
jest.mock('os', () => ({
  hostname: jest.fn().mockReturnValue('test-host'),
  platform: jest.fn().mockReturnValue('darwin'),
  release: jest.fn().mockReturnValue('test-release'),
}));

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn().mockReturnValue('test-output'),
  spawn: jest.fn().mockReturnValue({
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn(),
  }),
}));

// Mock http/https
jest.mock('http', () => ({
  createServer: jest.fn().mockReturnValue({
    listen: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
  }),
}));

jest.mock('https', () => ({
  createServer: jest.fn().mockReturnValue({
    listen: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
  }),
}));

// Mock socket.io
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  })),
}));

// Mock express
jest.mock('express', () => {
  const express = jest.fn();
  express.json = jest.fn();
  express.urlencoded = jest.fn();
  express.static = jest.fn();
  express.Router = jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    use: jest.fn(),
  });
  return express;
});

// Mock helmet
jest.mock('helmet', () => jest.fn());

// Mock cors
jest.mock('cors', () => jest.fn());

// Mock compression
jest.mock('compression', () => jest.fn());

// Mock morgan
jest.mock('morgan', () => jest.fn());

// Mock express-rate-limit
jest.mock('express-rate-limit', () => jest.fn());

// Mock csurf
jest.mock('csurf', () => jest.fn());

// Mock multer
jest.mock('multer', () => jest.fn().mockReturnValue({
  single: jest.fn(),
  array: jest.fn(),
  fields: jest.fn(),
}));

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn(),
  param: jest.fn(),
  query: jest.fn(),
  validationResult: jest.fn(),
}));

// Mock joi
jest.mock('joi', () => ({
  object: jest.fn().mockReturnValue({
    validate: jest.fn(),
  }),
  string: jest.fn().mockReturnValue({
    required: jest.fn(),
    email: jest.fn(),
    min: jest.fn(),
    max: jest.fn(),
  }),
  number: jest.fn().mockReturnValue({
    required: jest.fn(),
    min: jest.fn(),
    max: jest.fn(),
  }),
  boolean: jest.fn().mockReturnValue({
    required: jest.fn(),
  }),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({
    id: 1,
    email: 'test@example.com',
    isAdmin: false,
    sessionId: 'test-session-id',
  }),
}));

// Mock pg
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  })),
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  })),
}));

// Mock cron
jest.mock('cron', () => ({
  CronJob: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    fireOnTick: jest.fn(),
  })),
})); 