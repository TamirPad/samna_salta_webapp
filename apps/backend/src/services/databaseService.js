const {query, isDBConnected, isDevelopmentModeEnabled} = require('../config/database');
const logger = require('../utils/logger');

class DatabaseService {
  static async executeQuery(sql, params = []) {
    try {
      if (!isDBConnected()) {
        if (isDevelopmentModeEnabled()) {
          throw new Error('Database not connected - running in development mode');
        }
        throw new Error('Database connection not available');
      }

      const result = await query(sql, params);
      return result;
    } catch (error) {
      logger.error('Database query failed:', {
        sql,
        params,
        error: error.message
      });
      throw error;
    }
  }

  static async findOne(sql, params = []) {
    const result = await this.executeQuery(sql, params);
    return result.rows[0] || null;
  }

  static async findMany(sql, params = []) {
    const result = await this.executeQuery(sql, params);
    return result.rows;
  }

  static async insert(table, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const sql = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.executeQuery(sql, values);
    return result.rows[0];
  }

  static async update(table, id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 2}`).join(', ');

    const sql = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.executeQuery(sql, [id, ...values]);
    return result.rows[0];
  }

  static async delete(table, id) {
    const sql = `
      DELETE FROM ${table}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.executeQuery(sql, [id]);
    return result.rows[0];
  }

  static async count(sql, params = []) {
    const result = await this.executeQuery(sql, params);
    return parseInt(result.rows[0]?.count || 0);
  }

  static async transaction(callback) {
    // Note: This is a simplified transaction implementation
    // In production, you'd want proper transaction handling
    try {
      return await callback();
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService;
