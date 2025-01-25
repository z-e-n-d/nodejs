const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let users = [];
let posts = [];

// Storage configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Register route
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'Email is already taken.' });
    }

    users.push({ username, email, password });
    res.status(201).json({ message: 'User registered successfully.' });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials.' });
    }

    res.json({ username: user.username });
});

// Create Post route
app.post('/posts', upload.single('file'), (req, res) => {
    const { description, username } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const postId = posts.length + 1;

    posts.push({
        id: postId,
        description,
        fileUrl,
        username,
    });

    res.status(201).json({ message: 'Post created successfully.' });
});

// Get all posts route
app.get('/posts', (req, res) => {
    res.json(posts);
});

// Delete Post route
app.delete('/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    posts = posts.filter(post => post.id !== postId);

    res.status(200).json({ message: 'Post deleted successfully.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
