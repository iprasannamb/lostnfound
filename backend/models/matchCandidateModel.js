const pool = require('../config/db');

const MatchCandidate = {
  async upsert({ lost_item_id, found_item_id, score }) {
    const [result] = await pool.query(
      `INSERT INTO match_candidates (lost_item_id, found_item_id, score, status)
       VALUES (?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score)), status = IF(status = 'rejected', status, 'pending')`,
      [lost_item_id, found_item_id, score]
    );
    return { id: result.insertId || null };
  },

  async list({ page = 1, limit = 10, status = 'pending' } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';

    if (status && status !== 'all') {
      where = ' WHERE mc.status = ?';
      params.push(status);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM match_candidates mc${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT mc.*, 
        li.title AS lost_title, li.description AS lost_description, li.color AS lost_color, li.location_lost, li.date_lost, li.status AS lost_status,
        li.contact_info AS lost_contact_info, lu.id AS lost_user_id, lu.name AS lost_user_name,
        fi.title AS found_title, fi.description AS found_description, fi.color AS found_color, fi.location_found, fi.date_found, fi.status AS found_status,
        fu.id AS found_user_id, fu.name AS found_user_name
       FROM match_candidates mc
       JOIN lost_items li ON li.id = mc.lost_item_id
       JOIN users lu ON lu.id = li.user_id
       JOIN found_items fi ON fi.id = mc.found_item_id
       JOIN users fu ON fu.id = fi.user_id
       ${where}
       ORDER BY mc.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

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

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT mc.*, li.id AS lost_item_id, li.user_id AS lost_user_id, fi.id AS found_item_id
       FROM match_candidates mc
       JOIN lost_items li ON li.id = mc.lost_item_id
       JOIN found_items fi ON fi.id = mc.found_item_id
       WHERE mc.id = ?`,
      [id]
    );
    return rows[0];
  },

  async review({ id, status, admin_id }) {
    await pool.query(
      'UPDATE match_candidates SET status = ?, reviewed_by_admin = ? WHERE id = ?',
      [status, admin_id, id]
    );
  }
};

module.exports = MatchCandidate;