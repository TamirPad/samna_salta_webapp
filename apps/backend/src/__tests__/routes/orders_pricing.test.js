const express = require('express');
const request = require('supertest');

process.env.NODE_ENV = 'test';

const dbQueryMock = jest.fn();
jest.mock('../../config/database', () => ({
  query: (...args) => dbQueryMock(...args),
  getClient: async () => ({
    query: (...args) => dbQueryMock(...args),
    release: jest.fn(),
  })
}));

jest.mock('../../utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

describe('POST /orders pricing', () => {
  let app;
  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/orders', require('../../routes/orders'));
  });

  it('computes totals from DB and options add-ons', async () => {
    // Mock product and option value lookups
    dbQueryMock.mockImplementation(async (sql, params) => {
      const text = String(sql);
      if (text.includes('SELECT id, name, price FROM products')) {
        return { rows: [{ id: 1, name: 'Pita', price: 10.0 }] };
      }
      if (text.includes('SELECT id, name, price_adjustment FROM product_option_values')) {
        return { rows: [{ id: 101, name: 'Cheese', price_adjustment: 2.5 }] };
      }
      if (text.startsWith('BEGIN') || text.startsWith('COMMIT')) return {};
      if (text.includes('INSERT INTO orders')) {
        return { rows: [{ id: 999, order_number: 'SS123', total: 0 }] };
      }
      if (text.includes('INSERT INTO order_items')) {
        return { rows: [{ id: 1001 }] };
      }
      if (text.includes('INSERT INTO order_item_options')) {
        return {};
      }
      if (text.includes('INSERT INTO order_status_updates')) {
        return {};
      }
      if (text.includes('UPDATE orders SET stripe_payment_intent_id')) return {};
      return {};
    });

    const res = await request(app)
      .post('/orders')
      .send({
        customer_name: 'John',
        customer_phone: '+972500000000',
        delivery_method: 'pickup',
        payment_method: 'cash',
        order_items: [
          {
            product_id: 1,
            quantity: 2,
            selected_options: [
              { option_id: 10, values: [{ id: 101 }] }
            ]
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body?.success).toBe(true);
    // Price should be (10 + 2.5) * 2 = 25
    // The response uses persisted order total, so we check that calls were made consistently
    const insertOrderCalls = dbQueryMock.mock.calls.filter(c => String(c[0]).includes('INSERT INTO orders'));
    expect(insertOrderCalls.length).toBe(1);
    const values = insertOrderCalls[0][1];
    const subtotal = values[9 - 1]; // computedSubtotal position in params
    const total = values[12 - 1];   // computedTotal position in params
    expect(Number(subtotal)).toBeCloseTo(25.0, 5);
    expect(Number(total)).toBeCloseTo(25.0, 5);
  });
});


