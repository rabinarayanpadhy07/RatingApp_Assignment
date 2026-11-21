const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  let connection;
  try {
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      multipleStatements: true,
      ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
    });

    const dbName = process.env.DB_NAME || 'rating_app';
    console.log(`Ensuring database ${dbName} exists...`);
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    } catch (err) {
      console.log(`Note: CREATE DATABASE skipped or not permitted (${err.message}). Proceeding with existing database.`);
    }
    await connection.query(`USE \`${dbName}\`;`);

    console.log('Creating tables...');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_role (role),
        INDEX idx_user_name (name),
        INDEX idx_user_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Stores table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        address VARCHAR(400) NOT NULL,
        owner_id INT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_store_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_store_name (name),
        INDEX idx_store_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ratings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_store (user_id, store_id),
        CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_rating_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        INDEX idx_rating_store (store_id),
        INDEX idx_rating_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Checking existing seed users...');
    const [existingUsers] = await connection.query('SELECT COUNT(*) AS count FROM users');

    if (existingUsers[0].count === 0) {
      console.log('Seeding initial data with realistic Indian details...');

      const adminPasswordHash = await bcrypt.hash('Admin@2026#', 10);
      const userPasswordHash = await bcrypt.hash('User@2026#', 10);
      const ownerPasswordHash = await bcrypt.hash('Owner@2026#', 10);

      // Seed Users (All names 20-60 chars, passwords meet requirements, address max 400)
      const usersToInsert = [
        ['Rajeshwar Prasad Sharma', 'admin@ratingapp.com', adminPasswordHash, 'Plot 100, Sector 44, Institutional Area, Gurgaon, Haryana - 122003', 'ADMIN'],
        ['Rahul Devendra Kulkarni', 'user1@ratingapp.com', userPasswordHash, 'Flat 402, Lotus Residency, Baner Road, Pune, Maharashtra - 411045', 'USER'],
        ['Ananya Jayant Deshmukh', 'user2@ratingapp.com', userPasswordHash, 'B-304, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103', 'USER'],
        ['Vikramaditya Singh Rathore', 'owner1@ratingapp.com', ownerPasswordHash, 'Shop 12, Commercial Street, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka - 560001', 'STORE_OWNER'],
        ['Sunil Kumar Subramaniam', 'owner2@ratingapp.com', ownerPasswordHash, 'No. 45, Anna Salai, Thousand Lights, Chennai, Tamil Nadu - 600002', 'STORE_OWNER']
      ];

      for (const user of usersToInsert) {
        await connection.query(
          'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
          user
        );
      }

      // Fetch IDs of owners and users
      const [[owner1]] = await connection.query("SELECT id FROM users WHERE email = 'owner1@ratingapp.com'");
      const [[owner2]] = await connection.query("SELECT id FROM users WHERE email = 'owner2@ratingapp.com'");
      const [[user1]] = await connection.query("SELECT id FROM users WHERE email = 'user1@ratingapp.com'");
      const [[user2]] = await connection.query("SELECT id FROM users WHERE email = 'user2@ratingapp.com'");

      // Seed Stores
      const storesToInsert = [
        ['Sri Krishna Sweets & Bakery', 'contact@srikrishnasweets.in', 'Shop 12, Commercial Street, Shivaji Nagar, Bengaluru, Karnataka - 560001', owner1.id],
        ['Croma Digital Electronics Hub', 'support@cromadigitalhub.in', 'No. 45, Anna Salai, Thousand Lights, Chennai, Tamil Nadu - 600002', owner2.id],
        ['Fabindia Ethnic Craft Emporium', 'help@fabindiaemporium.in', '14, Middle Lane, Khan Market, New Delhi, Delhi - 110003', null],
        ['Apollo Pharmacy & Wellness Hub', 'care@apollowellnesshub.in', 'Plot 88, Road No. 36, Jubilee Hills, Hyderabad, Telangana - 500033', null]
      ];

      for (const store of storesToInsert) {
        await connection.query(
          'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
          store
        );
      }

      // Fetch Store IDs
      const [[store1]] = await connection.query("SELECT id FROM stores WHERE name = 'Sri Krishna Sweets & Bakery'");
      const [[store2]] = await connection.query("SELECT id FROM stores WHERE name = 'Croma Digital Electronics Hub'");
      const [[store3]] = await connection.query("SELECT id FROM stores WHERE name = 'Fabindia Ethnic Craft Emporium'");

      // Seed Ratings
      const ratingsToInsert = [
        [user1.id, store1.id, 5],
        [user1.id, store2.id, 4],
        [user2.id, store1.id, 4],
        [user2.id, store3.id, 5]
      ];

      for (const rating of ratingsToInsert) {
        await connection.query(
          'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
          rating
        );
      }

      console.log('Initial Indian seed data created successfully!');
    } else {
      console.log('Database already has user records, skipping seed insertion.');
    }

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();
