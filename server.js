const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your_secret_key';

// Mock database
const users = [];

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
// Register
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Check if email is already registered
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'Email already exists.' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Store user
    users.push({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully!' });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate token
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ username: user.username, token });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
