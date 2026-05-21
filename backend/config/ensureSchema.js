const pool = require('./db');

async function columnExists(tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function indexExists(tableName, indexName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName]
  );
  return rows.length > 0;
}

async function safeCreateIndex(createSql) {
  try {
    await pool.query(createSql);
  } catch (err) {
    // ER_DUP_KEYNAME / duplicate index name across MySQL variants.
    if (err && (err.code === 'ER_DUP_KEYNAME' || err.errno === 1061)) return;
    throw err;
  }
}

async function ensureSchema() {
  if (!(await columnExists('lost_items', 'color'))) {
    await pool.query('ALTER TABLE lost_items ADD COLUMN color VARCHAR(80) NULL AFTER category_id');
  }

  if (!(await columnExists('found_items', 'color'))) {
    await pool.query('ALTER TABLE found_items ADD COLUMN color VARCHAR(80) NULL AFTER category_id');
  }

  // Expand enum choices first so legacy-to-new status remapping is always valid.
  await pool.query(
    "ALTER TABLE lost_items MODIFY COLUMN status ENUM('open','recovered','match_found','claimed','closed') DEFAULT 'open'"
  );
  await pool.query(
    "ALTER TABLE found_items MODIFY COLUMN status ENUM('available','claimed','unmatched','possible_match','returned') DEFAULT 'unmatched'"
  );

  // Normalize legacy status values before tightening enum definitions.
  await pool.query("UPDATE lost_items SET status = 'closed' WHERE status = 'recovered'");
  await pool.query("UPDATE found_items SET status = 'unmatched' WHERE status = 'available'");
  await pool.query("UPDATE found_items SET status = 'returned' WHERE status = 'claimed'");

  // Final target enums used by the current application.
  await pool.query("ALTER TABLE lost_items MODIFY COLUMN status ENUM('open','match_found','claimed','closed') DEFAULT 'open'");
  await pool.query("ALTER TABLE found_items MODIFY COLUMN status ENUM('unmatched','possible_match','returned') DEFAULT 'unmatched'");

  if (!(await columnExists('notifications', 'type'))) {
    await pool.query("ALTER TABLE notifications ADD COLUMN type VARCHAR(64) DEFAULT 'general' AFTER user_id");
  }

  if (!(await columnExists('notifications', 'metadata'))) {
    await pool.query('ALTER TABLE notifications ADD COLUMN metadata JSON NULL AFTER message');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS match_candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lost_item_id INT NOT NULL,
      found_item_id INT NOT NULL,
      score INT NOT NULL,
      status ENUM('pending','approved','rejected','contacted') DEFAULT 'pending',
      reviewed_by_admin INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_match_pair (lost_item_id, found_item_id),
      FOREIGN KEY (lost_item_id) REFERENCES lost_items(id) ON DELETE CASCADE,
      FOREIGN KEY (found_item_id) REFERENCES found_items(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by_admin) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  if (!(await indexExists('lost_items', 'idx_lost_status_category'))) {
    await safeCreateIndex('CREATE INDEX idx_lost_status_category ON lost_items(status, category_id, date_lost)');
  }
  if (!(await indexExists('found_items', 'idx_found_status_category'))) {
    await safeCreateIndex('CREATE INDEX idx_found_status_category ON found_items(status, category_id, date_found)');
  }
  if (!(await indexExists('match_candidates', 'idx_match_status_score'))) {
    await safeCreateIndex('CREATE INDEX idx_match_status_score ON match_candidates(status, score)');
  }
  if (!(await indexExists('notifications', 'idx_notification_user_created'))) {
    await safeCreateIndex('CREATE INDEX idx_notification_user_created ON notifications(user_id, created_at)');
  }
}

module.exports = { ensureSchema };