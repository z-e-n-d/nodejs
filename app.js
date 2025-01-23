const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Mock Database for posts, likes, and comments
let posts = [];
let users = []; // Mock user data (you can use real authentication for a live app)

// Middleware for parsing JSON data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads (images and videos)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Store with timestamp
    }
});

const upload = multer({ storage: storage });

// Serve the upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to post an image/video with a title
app.post('/post', upload.single('media'), (req, res) => {
    const { title } = req.body;
    const file = req.file;
    if (!file || !title) {
        return res.status(400).json({ error: 'Title and media file are required' });
    }

    const newPost = {
        id: Date.now(),
        title,
        media: file.path,
        likes: 0,
        comments: [],
    };
    posts.push(newPost);
    res.status(201).json(newPost);
});

// Route to like a post
app.post('/like/:postId', (req, res) => {
    const { postId } = req.params;
    const post = posts.find(p => p.id == postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    post.likes += 1;
    res.status(200).json(post);
});

// Route to comment on a post
app.post('/comment/:postId', (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    const post = posts.find(p => p.id == postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    post.comments.push(comment);
    res.status(200).json(post);
});

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
