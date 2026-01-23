/*
 * PROJECT: SkillSwap Backend (Node.js + MySQL)
 * RUBRIC REQUIREMENTS:
 * 1. Database: Use MySQL tables.
 * 2. Validation: Server-side validation using Regex.
 * 3. AJAX: Use JSON for data interchange.
 */

import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

const app = express();
app.use(cors());
app.use(bodyParser.json());
dotenv.config();

// Step 2: Configure the Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'skillswap',
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
  // Step 3: Create the 'users' table if it doesn't exist
  const createTable = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  db.query(createTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table is ready.');
    }
  });
});

// Step 4: Registration Route
app.post('/register', async (req, res) => {
  const { full_name, email, password } = req.body;

  // Server-side validation
  if (!full_name || full_name.trim() === '') {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  // Step 5: Hash the password
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUser = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
    db.query(insertUser, [full_name, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already registered.' });
        }
        return res.status(500).json({ error: 'Database error.' });
      }
      return res.json({ status: 'success', message: 'User registered!' });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Step 6: Start the server
app.listen(3000, () => {
  console.log('SkillSwap backend running on port 3000');
});
