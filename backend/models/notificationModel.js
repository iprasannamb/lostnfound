const pool = require('../config/db');

const Notification = {
  async create({ user_id, type = 'match_update', message, metadata = null }) {
    await pool.query(
      'INSERT INTO notifications (user_id, type, message, metadata) VALUES (?, ?, ?, ?)',
      [user_id, type, message, metadata ? JSON.stringify(metadata) : null]
    );
  },

  async listForUser(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?', [userId]);
    const [rows] = await pool.query(
      'SELECT id, message, type, metadata, read_flag, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, Number(limit), Number(offset)]
    );
    return {
      data: rows.map((row) => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / Number(limit)) || 1
      }
    };
  }
};

module.exports = Notification;