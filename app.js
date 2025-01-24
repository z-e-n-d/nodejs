const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Mock database
const users = [];

// Register endpoint
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(400).json({ error: 'User already exists!' });
    }

    users.push({ username, email, password });
    res.status(201).json({ message: 'User registered successfully!' });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials!' });
    }

    res.status(200).json({ username: user.username });
});

// Keep server awake (ping endpoint)
app.get('/ping', (req, res) => {
    res.status(200).send('Server is awake');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
