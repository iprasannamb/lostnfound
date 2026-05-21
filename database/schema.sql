-- Lost and Found Management System - MySQL schema
CREATE DATABASE IF NOT EXISTS lost_and_found_db;
USE lost_and_found_db;

-- users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- lost items
CREATE TABLE IF NOT EXISTS lost_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  color VARCHAR(80),
  date_lost DATE,
  location_lost VARCHAR(255),
  contact_info VARCHAR(255),
  image_path VARCHAR(500),
  status ENUM('open','match_found','claimed','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- found items
CREATE TABLE IF NOT EXISTS found_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  color VARCHAR(80),
  date_found DATE,
  location_found VARCHAR(255),
  contact_info VARCHAR(255),
  image_path VARCHAR(500),
  status ENUM('unmatched','possible_match','returned') DEFAULT 'unmatched',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- match candidates for admin review workflow
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

-- claims
CREATE TABLE IF NOT EXISTS claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_type ENUM('lost','found') NOT NULL,
  item_id INT NOT NULL,
  details TEXT,
  proof_path VARCHAR(500),
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- notifications (simple)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(64) DEFAULT 'general',
  message VARCHAR(500) NOT NULL,
  metadata JSON NULL,
  read_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- indexes for performance
CREATE INDEX idx_lost_created ON lost_items(created_at);
CREATE INDEX idx_found_created ON found_items(created_at);
CREATE INDEX idx_lost_status_category ON lost_items(status, category_id, date_lost);
CREATE INDEX idx_found_status_category ON found_items(status, category_id, date_found);
CREATE INDEX idx_match_status_score ON match_candidates(status, score);
CREATE INDEX idx_notification_user_created ON notifications(user_id, created_at);

-- sample data
INSERT IGNORE INTO categories (name) VALUES ('Electronics'), ('Wallet'), ('Keys'), ('Clothing'), ('Stationery');

INSERT IGNORE INTO users (id, name, email, password, role) VALUES
  (1,'Admin User','admin@example.com','$2b$10$replace_with_hashed_pw', 'admin'),
  (2,'Alice Student','alice@example.com','$2b$10$replace_with_hashed_pw', 'user'),
  (3,'Bob Finder','bob@example.com','$2b$10$replace_with_hashed_pw', 'user');

-- sample lost item
INSERT IGNORE INTO lost_items (user_id, title, description, category_id, color, date_lost, location_lost, contact_info, status)
VALUES (2, 'Black Backpack', 'Contains laptop and notes', 1, 'black', '2026-05-15', 'Library 3rd floor', 'alice@example.com', 'open');

-- sample found item
INSERT IGNORE INTO found_items (user_id, title, description, category_id, color, date_found, location_found, contact_info, status)
VALUES (3, 'Silver Keyset', '3 keys on a ring', 3, 'silver', '2026-05-18', 'Cafeteria', 'bob@example.com', 'unmatched');

-- view for quick listing
CREATE OR REPLACE VIEW vw_items AS
SELECT 'lost' AS type, li.id, li.title, li.description, c.name AS category, li.date_lost AS date_event, li.location_lost AS location, u.name AS reporter, li.status, li.created_at
FROM lost_items li JOIN categories c ON li.category_id=c.id JOIN users u ON li.user_id=u.id
UNION ALL
SELECT 'found' AS type, fi.id, fi.title, fi.description, c.name AS category, fi.date_found AS date_event, fi.location_found AS location, u.name AS reporter, fi.status, fi.created_at
FROM found_items fi JOIN categories c ON fi.category_id=c.id JOIN users u ON fi.user_id=u.id;
