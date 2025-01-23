const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

const users = []; // Temporary in-memory user storage (use a database in production)
const posts = []; // Temporary in-memory post storage

// Middleware for parsing JSON and serving static files
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Route: Register
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (users.find((user) => user.email === email)) {
        return res.status(400).json({ error: 'Email already registered.' });
    }
    users.push({ username, email, password });
    res.json({ message: 'Registration successful!' });
});

// Route: Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }
    res.json({ message: 'Login successful!', username: user.username });
});

// Route: Upload Media
app.post('/upload', upload.single('media'), (req, res) => {
    const { title } = req.body;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    posts.push({ title, filePath: `/uploads/${req.file.filename}` });
    res.json({ message: 'Media uploaded successfully!', post: { title, filePath: `/uploads/${req.file.filename}` } });
});

// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
