const pool = require('../config/db');

const LostItem = {
  async create(data) {
    const { user_id, title, description, category_id, date_lost, location_lost, contact_info, image_path } = data;
    const [result] = await pool.query(
      `INSERT INTO lost_items (user_id, title, description, category_id, date_lost, location_lost, contact_info, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, description, category_id, date_lost, location_lost, contact_info, image_path]
    );
    return { id: result.insertId };
  },
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT li.*, c.name AS category_name, u.name AS user_name, u.email AS user_email
       FROM lost_items li
       LEFT JOIN categories c ON li.category_id = c.id
       JOIN users u ON li.user_id = u.id
       WHERE li.id = ?`,
      [id]
    );
    return rows[0];
  },
  async list({ page = 1, limit = 20, category, status, q } = {}) {
    const offset = (page - 1) * limit;
    let baseQuery =
      ' FROM lost_items li LEFT JOIN categories c ON li.category_id=c.id JOIN users u ON li.user_id=u.id';
    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('(c.name = ? OR li.category_id = ?)');
      params.push(category);
      params.push(Number(category) || -1);
    }
    if (status) {
      conditions.push('li.status = ?');
      params.push(status);
    }
    if (q) {
      conditions.push('(li.title LIKE ? OR li.description LIKE ? OR li.location_lost LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (conditions.length) baseQuery += ` WHERE ${conditions.join(' AND ')}`;

    const listQuery =
      'SELECT li.*, c.name as category_name, u.name as user_name' +
      baseQuery +
      ' ORDER BY li.created_at DESC LIMIT ? OFFSET ?';

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
  }
};

module.exports = LostItem;
