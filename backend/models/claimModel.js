const pool = require('../config/db');

const Claim = {
  async create(data) {
    const { user_id, item_type, item_id, details, proof_path } = data;
    const [result] = await pool.query(
      `INSERT INTO claims (user_id, item_type, item_id, details, proof_path) VALUES (?, ?, ?, ?, ?)`,
      [user_id, item_type, item_id, details, proof_path]
    );
    return { id: result.insertId };
  },
  async listForItem(item_type, item_id) {
    const [rows] = await pool.query('SELECT c.*, u.name as user_name FROM claims c JOIN users u ON c.user_id=u.id WHERE c.item_type=? AND c.item_id=?', [item_type, item_id]);
    return rows;
  },
  async updateStatus(id, status) {
    await pool.query('UPDATE claims SET status=? WHERE id=?', [status, id]);
  }
};

module.exports = Claim;
