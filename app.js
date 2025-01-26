const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

// Example posts data (in-memory)
let posts = [
    { id: 1, author: "John", content: "Hello, world!", fileUrl: null, videoUrl: null },
    { id: 2, author: "Jane", content: "This is a post with a file", fileUrl: "http://example.com/image.jpg", videoUrl: null }
];

// Serve static files (optional if you want to serve a front-end)
app.use(express.static('public'));

// Endpoint to get posts
app.get('/get-posts', (req, res) => {
    res.json(posts);
});

// Endpoint to delete all posts (admin only)
app.post('/delete-all-posts', (req, res) => {
    const { username, code } = req.body;
    if (username === 'zend' && code === '0926') {
        posts = []; // Clear all posts
        res.status(200).json({ message: 'All posts deleted successfully!' });
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
});

// Endpoint to delete a specific post by ID
app.delete('/delete-post/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    posts = posts.filter(post => post.id !== postId);
    res.status(200).json({ message: 'Post deleted successfully' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
