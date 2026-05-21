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
  date_lost DATE,
  location_lost VARCHAR(255),
  contact_info VARCHAR(255),
  image_path VARCHAR(500),
  status ENUM('open','recovered') DEFAULT 'open',
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
  date_found DATE,
  location_found VARCHAR(255),
  contact_info VARCHAR(255),
  image_path VARCHAR(500),
  status ENUM('available','claimed') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
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
  message VARCHAR(500) NOT NULL,
  read_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- indexes for performance
CREATE INDEX idx_lost_created ON lost_items(created_at);
CREATE INDEX idx_found_created ON found_items(created_at);

-- sample data
INSERT IGNORE INTO categories (name) VALUES ('Electronics'), ('Wallet'), ('Keys'), ('Clothing'), ('Stationery');

INSERT IGNORE INTO users (id, name, email, password, role) VALUES
  (1,'Admin User','admin@example.com','$2b$10$replace_with_hashed_pw', 'admin'),
  (2,'Alice Student','alice@example.com','$2b$10$replace_with_hashed_pw', 'user'),
  (3,'Bob Finder','bob@example.com','$2b$10$replace_with_hashed_pw', 'user');

-- sample lost item
INSERT IGNORE INTO lost_items (user_id, title, description, category_id, date_lost, location_lost, contact_info, status)
VALUES (2, 'Black Backpack', 'Contains laptop and notes', 1, '2026-05-15', 'Library 3rd floor', 'alice@example.com', 'open');

-- sample found item
INSERT IGNORE INTO found_items (user_id, title, description, category_id, date_found, location_found, contact_info, status)
VALUES (3, 'Silver Keyset', '3 keys on a ring', 3, '2026-05-18', 'Cafeteria', 'bob@example.com', 'available');

-- view for quick listing
CREATE OR REPLACE VIEW vw_items AS
SELECT 'lost' AS type, li.id, li.title, li.description, c.name AS category, li.date_lost AS date_event, li.location_lost AS location, u.name AS reporter, li.status, li.created_at
FROM lost_items li JOIN categories c ON li.category_id=c.id JOIN users u ON li.user_id=u.id
UNION ALL
SELECT 'found' AS type, fi.id, fi.title, fi.description, c.name AS category, fi.date_found AS date_event, fi.location_found AS location, u.name AS reporter, fi.status, fi.created_at
FROM found_items fi JOIN categories c ON fi.category_id=c.id JOIN users u ON fi.user_id=u.id;
