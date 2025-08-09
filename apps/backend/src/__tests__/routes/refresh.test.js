const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh';

// Mock Redis cache/session used by refresh route
const getCacheMock = jest.fn();
const setCacheMock = jest.fn();
const deleteCacheMock = jest.fn();

jest.mock('../../config/redis', () => ({
  getCache: (...args) => getCacheMock(...args),
  setCache: (...args) => setCacheMock(...args),
  deleteCache: (...args) => deleteCacheMock(...args),
  setSession: jest.fn(),
  deleteSession: jest.fn(),
  getSession: jest.fn(),
}));

// Minimal logger mock
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('POST /auth/refresh', () => {
  let app;
  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    // Use JSON to allow body parsing, but cookie is used for refresh
    app.use(require('cookie-parser')());
    app.use('/auth', require('../../routes/auth'));
  });

  it('returns 401 when no refresh token provided', async () => {
    const res = await request(app).post('/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('rotates refresh token and returns new access token when valid', async () => {
    const userId = 123;
    const sessionId = 'sess-abc';
    const jti = 'jti-1';
    const refresh = jwt.sign({ userId, sessionId, jti }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

    // Session is active
    getCacheMock.mockImplementation(async (key) => {
      if (key === `user:${userId}:session:${sessionId}`) return { userId };
      if (key === `refresh:${userId}:${sessionId}:${jti}`) return true;
      return null;
    });

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', [`rt=${refresh}`]);

    expect(res.status).toBe(200);
    expect(res.body && res.body.success).toBe(true);
    // Should delete old jti and set new one
    expect(deleteCacheMock).toHaveBeenCalledWith(`refresh:${userId}:${sessionId}:${jti}`);
    expect(setCacheMock).toHaveBeenCalled();
    // Should return an access token
    const token = res.body?.data?.token;
    expect(typeof token).toBe('string');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(userId);
    expect(decoded.sessionId).toBe(sessionId);
  });
});


