const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/', // Default destination folder
    limits: { fileSize: 1000 * 1024 * 1024 }, // 10 MB limit
});

// Temporary storage for posts and users
const posts = [];
const users = [];

// Register route
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'Email already registered.' });
    }
    users.push({ username, email, password });
    res.status(201).json({ message: 'User registered successfully.' });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password.' });
    }
    res.json({ username: user.username, email: user.email });
});

// Create a new post with file upload
app.post('/posts', upload.single('file'), (req, res) => {
    const { description } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null; // Save file URL for later
    const postId = posts.length + 1;

    posts.push({
        id: postId,
        description,
        fileUrl,
    });

    res.status(201).json({ message: 'Post created successfully.' });
});

// Get all posts
app.get('/posts', (req, res) => {
    res.json(posts);
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const email = req.headers['x-user-email'];

    if (email !== 'zozo.toth.2022home@gmail.com') {
        return res.status(403).json({ error: 'Permission denied.' });
    }

    const postIndex = posts.findIndex(post => post.id === postId);
    if (postIndex === -1) {
        return res.status(404).json({ error: 'Post not found.' });
    }

    // Delete the file if it exists
    const post = posts[postIndex];
    if (post.fileUrl) {
        const filePath = path.join(__dirname, post.fileUrl);
        fs.unlink(filePath, err => {
            if (err) console.error('Failed to delete file:', err);
        });
    }

    posts.splice(postIndex, 1);
    res.json({ message: 'Post deleted successfully.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
