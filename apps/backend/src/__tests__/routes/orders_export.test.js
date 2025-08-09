const express = require('express');
const request = require('supertest');

process.env.NODE_ENV = 'test';

const dbQueryMock = jest.fn();
jest.mock('../../config/database', () => ({ query: (...args) => dbQueryMock(...args) }));
jest.mock('../../middleware/auth', () => ({ authenticateToken: (req, _res, next) => { req.user = { id: 1, isAdmin: true }; next(); }, requireAdmin: (_req, _res, next) => next() }));
jest.mock('../../utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

describe('GET /orders/export.csv', () => {
  let app;
  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use('/orders', require('../../routes/orders'));
  });

  it('returns CSV with header and rows', async () => {
    dbQueryMock.mockResolvedValueOnce({ rows: [
      { id: 1, order_number: 'SS1', status: 'pending', payment_status: 'pending', order_type: 'pickup', customer_name: 'John', customer_phone: '123', customer_email: 'j@e.com', subtotal: 10, delivery_charge: 0, total: 10, created_at: '2024-01-01 10:00:00', updated_at: '2024-01-01 10:00:00' }
    ]});

    const res = await request(app).get('/orders/export.csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text.split('\n')[0]).toContain('order_number');
    expect(res.text).toContain('SS1');
  });
});


