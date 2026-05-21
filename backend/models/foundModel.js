const pool = require('../config/db');

const FoundItem = {
  async create(data) {
    const { user_id, title, description, category_id, color, date_found, location_found, contact_info, image_path } = data;
    const [result] = await pool.query(
      `INSERT INTO found_items (user_id, title, description, category_id, color, date_found, location_found, contact_info, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, description, category_id, color, date_found, location_found, contact_info, image_path]
    );
    return { id: result.insertId };
  },
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT fi.*, c.name AS category_name, u.name AS user_name, u.email AS user_email
       FROM found_items fi
       LEFT JOIN categories c ON fi.category_id = c.id
       JOIN users u ON fi.user_id = u.id
       WHERE fi.id = ?`,
      [id]
    );
    return rows[0];
  },
  async list({ page = 1, limit = 20, category, status, q } = {}) {
    const offset = (page - 1) * limit;
    let baseQuery =
      ' FROM found_items fi LEFT JOIN categories c ON fi.category_id=c.id JOIN users u ON fi.user_id=u.id';
    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('(c.name = ? OR fi.category_id = ?)');
      params.push(category);
      params.push(Number(category) || -1);
    }
    if (status) {
      conditions.push('fi.status = ?');
      params.push(status);
    }
    if (q) {
      conditions.push('(fi.title LIKE ? OR fi.description LIKE ? OR fi.location_found LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (conditions.length) baseQuery += ` WHERE ${conditions.join(' AND ')}`;

    const listQuery =
      'SELECT fi.*, c.name as category_name, u.name as user_name' +
      baseQuery +
      ' ORDER BY fi.created_at DESC LIMIT ? OFFSET ?';

    const countQuery = 'SELECT COUNT(*) AS total' + baseQuery;
    const [countRows] = await pool.query(countQuery, params);

    params.push(Number(limit), Number(offset));
    const [rows] = await pool.query(listQuery, params);

    return {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / Number(limit)) || 1
      }
    };
  },

  async listOpenForMatching() {
    const [rows] = await pool.query(
      `SELECT id, user_id, title, description, category_id, color, date_found, location_found
       FROM found_items
       WHERE status IN ('unmatched', 'possible_match')`
    );
    return rows;
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE found_items SET status = ? WHERE id = ?', [status, id]);
  }
};

module.exports = FoundItem;
