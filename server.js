import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 1. INITIALIZE APP ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

console.log("1. App initialized...");

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'skillswap'
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to MySQL database.');
});

// --- 4. CREATE TABLES ---
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
        
`;

const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;
db.query(createMessagesTable, (err) => { if(err) console.error("Messages table error:", err); });

const createConnectionsTable = `
    CREATE TABLE IF NOT EXISTS connections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(100) NOT NULL,
        match_name VARCHAR(100) NOT NULL,
        match_id INT NOT NULL,
        status VARCHAR(20) DEFAULT 'connected',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL, 
        description VARCHAR(255) NOT NULL,
        partner VARCHAR(100) DEFAULT 'System',
        amount INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createUsersTable, (err) => { if(err) console.error("Users table error:", err); });
db.query(createConnectionsTable, (err) => { if(err) console.error("Connections table error:", err); });
db.query(createTransactionsTable, (err) => { 
    if(err) console.error("Transactions table error:", err);
    else console.log("✅ All tables ready.");
});

// --- 5. ROUTES ---

// REGISTER (With Server-Side Regex Validation)
app.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    // Regex Patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{6,}$/; // Min 6 chars

    // Validation Checks
    if (!full_name || !email || !password) {
        return res.status(400).json({ status: 'error', message: 'All fields required' });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ status: 'error', message: 'Invalid email format' });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ status: 'error', message: 'Password must be 6+ chars' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [full_name, email, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ status: 'error', message: 'User already exists' });
                return res.status(500).json({ status: 'error', message: 'Database error' });
            }
            res.status(201).json({ status: 'success', message: 'Registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});
// --- CHAT ROUTES (POLLING) ---

// 1. GET MESSAGES (The "Poll")
app.get('/messages', (req, res) => {
    // Get all messages ordered by time
    db.query('SELECT * FROM messages ORDER BY created_at ASC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// 2. SEND MESSAGE
app.post('/messages', (req, res) => {
    const { sender, content } = req.body;
    if (!content) return res.status(400).json({ error: 'No content' });

    const sql = 'INSERT INTO messages (sender, content) VALUES (?, ?)';
    db.query(sql, [sender, content], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ status: 'success' });
    });
});

// LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: 'error', message: 'Fields required' });

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
        if (results.length === 0) return res.status(401).json({ status: 'error', message: 'User not found' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const { password, ...userSafe } = user;
            res.json({ status: 'success', message: 'Login successful', user: userSafe });
        } else {
            res.status(401).json({ status: 'error', message: 'Invalid password' });
        }
    });
});

// CONNECT
app.post('/connect', (req, res) => {
    const { user_email, match_name, match_id } = req.body;
    const checkSql = 'SELECT * FROM connections WHERE user_email = ? AND match_id = ?';
    db.query(checkSql, [user_email, match_id], (err, results) => {
        if (err) return res.status(500).json({ status: 'error' });
        if (results.length > 0) return res.json({ status: 'success', message: 'Already connected' });

        const insertSql = 'INSERT INTO connections (user_email, match_name, match_id) VALUES (?, ?, ?)';
        db.query(insertSql, [user_email, match_name, match_id], (err) => {
            if (err) return res.status(500).json({ status: 'error' });
            res.json({ status: 'success', message: 'Connected!' });
        });
    });
});

app.get('/my-connections', (req, res) => {
    const { email } = req.query;
    const sql = 'SELECT * FROM connections WHERE user_email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ status: 'error' });
        res.json({ status: 'success', connections: results });
    });
});

// GET TRANSACTIONS
app.get('/my-transactions', (req, res) => {
    const { email } = req.query;
    
    // 1. Check if user has any transactions
    const checkSql = 'SELECT * FROM transactions WHERE user_email = ? ORDER BY created_at DESC';
    db.query(checkSql, [email], (err, results) => {
        if (err) return res.status(500).json({ status: 'error' });

        // 2. If NO transactions, insert a "Welcome Bonus" automatically
        if (results.length === 0) {
            const insertSql = `INSERT INTO transactions (user_email, type, description, partner, amount) 
                               VALUES (?, 'bonus', 'Welcome Bonus', 'SkillSwap', 150)`;
            db.query(insertSql, [email], (err) => {
                if (err) return res.status(500).json({ status: 'error' });
                // Return the new fake transaction immediately
                return res.json({ 
                    status: 'success', 
                    transactions: [{
                        type: 'bonus',
                        description: 'Welcome Bonus',
                        partner: 'SkillSwap',
                        amount: 150,
                        created_at: new Date()
                    }]
                });
            });
        } else {
            // 3. Return real transactions
            res.json({ status: 'success', transactions: results });
        }
    });
});

// --- 6. START SERVER ---
console.log("Attempting to start server...");

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log("   (Press Ctrl + C to stop)\n");
});