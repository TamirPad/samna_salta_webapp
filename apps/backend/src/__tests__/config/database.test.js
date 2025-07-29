const {connectDB, query, getClient, pool} = require('../../config/database');

// Mock the logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Mock the redis module
jest.mock('../../config/redis', () => ({
  getCache: jest.fn(),
  setCache: jest.fn()
}));

describe('Database Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('connectDB', () => {
    it('should connect to database successfully', async () => {
      // Mock successful connection
      const mockClient = {
        release: jest.fn()
      };
      pool.connect = jest.fn().mockResolvedValue(mockClient);

      await expect(connectDB()).resolves.not.toThrow();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error on connection failure', async () => {
      // Mock connection failure
      pool.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));

      await expect(connectDB()).rejects.toThrow('Connection failed');
    });
  });

  describe('query', () => {
    it('should execute query successfully', async () => {
      const mockResult = {
        rows: [{id: 1, name: 'test'}],
        rowCount: 1
      };
      pool.query = jest.fn().mockResolvedValue(mockResult);

      const result = await query('SELECT * FROM users WHERE id = $1', [1]);

      expect(result).toEqual(mockResult);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    it('should throw error on query failure', async () => {
      pool.query = jest.fn().mockRejectedValue(new Error('Query failed'));

      await expect(query('SELECT * FROM invalid_table')).rejects.toThrow('Query failed');
    });
  });

  describe('getClient', () => {
    it('should return a client from the pool', async () => {
      const mockClient = {id: 'test-client'};
      pool.connect = jest.fn().mockResolvedValue(mockClient);

      const client = await getClient();

      expect(client).toEqual(mockClient);
      expect(pool.connect).toHaveBeenCalled();
    });
  });

  describe('pool configuration', () => {
    it('should have correct pool configuration', () => {
      expect(pool.options.max).toBe(20);
      expect(pool.options.idleTimeoutMillis).toBe(30000);
      expect(pool.options.connectionTimeoutMillis).toBe(2000);
      expect(pool.options.ssl.rejectUnauthorized).toBe(false);
    });
  });
});
