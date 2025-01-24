const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Files will be saved in the "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Mock database for users and posts
const users = [];
const posts = [];

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

// Upload post endpoint (handles post submission with file upload)
app.post('/upload-post', upload.single('file'), (req, res) => {
    const { author, description } = req.body;
    const file = req.file;

    if (!author || !description || !file) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save the post to the mock database (or real database)
    posts.push({
        author,
        description,
        filePath: file.path,
        fileName: file.originalname
    });

    res.status(200).json({ success: true, message: 'Post uploaded successfully!' });
});

// Keep server awake (ping endpoint)
app.get('/ping', (req, res) => {
    res.status(200).send('Server is awake');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
