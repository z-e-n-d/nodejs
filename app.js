const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// In-memory storage for posts and users
let posts = [];
let users = [];

// Endpoint to get posts
app.get('/get-posts', (req, res) => {
    try {
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Endpoint to create a new post
app.post('/create-posts', (req, res) => {
    const { content, author, email, fileUrl, videoUrl } = req.body;

    try {
        const newPost = {
            id: posts.length + 1,  // Simple in-memory ID generation
            content,
            author,
            email,
            fileUrl,
            videoUrl,
        };

        posts.push(newPost);
        res.status(200).json({ message: 'Post created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Endpoint to delete a post by ID
app.delete('/delete-post/:id', (req, res) => {
    const postId = parseInt(req.params.id);

    try {
        posts = posts.filter(post => post.id !== postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Endpoint to delete all posts (admin only)
app.post('/delete-all-posts', (req, res) => {
    const { username, code } = req.body;
    if (username === 'zend' && code === '0926') {
        try {
            posts = [];  // Clear all posts
            res.status(200).json({ message: 'All posts deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete all posts' });
        }
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
});

// Endpoint to register a user
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            email,
            password: hashedPassword,
        };

        users.push(newUser);
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Endpoint to log in a user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
