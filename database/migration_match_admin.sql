-- Migration: add matching + admin review schema updates
USE lost_and_found_db;

ALTER TABLE lost_items
  ADD COLUMN IF NOT EXISTS color VARCHAR(80) NULL AFTER category_id;

ALTER TABLE found_items
  ADD COLUMN IF NOT EXISTS color VARCHAR(80) NULL AFTER category_id;

ALTER TABLE lost_items
  MODIFY COLUMN status ENUM('open','match_found','claimed','closed') DEFAULT 'open';

ALTER TABLE found_items
  MODIFY COLUMN status ENUM('unmatched','possible_match','returned') DEFAULT 'unmatched';

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS type VARCHAR(64) DEFAULT 'general' AFTER user_id,
  ADD COLUMN IF NOT EXISTS metadata JSON NULL AFTER message;

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
);

CREATE INDEX idx_lost_status_category ON lost_items(status, category_id, date_lost);
CREATE INDEX idx_found_status_category ON found_items(status, category_id, date_found);
CREATE INDEX idx_match_status_score ON match_candidates(status, score);
CREATE INDEX idx_notification_user_created ON notifications(user_id, created_at);
