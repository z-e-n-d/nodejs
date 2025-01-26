const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/socialMedia', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.log('MongoDB connection error:', error));

// Define Post and User schemas
const postSchema = new mongoose.Schema({
  content: String,
  author: String,
  email: String,
  fileUrl: String,
  videoUrl: String,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const Post = mongoose.model('Post', postSchema);
const User = mongoose.model('User', userSchema);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint to get posts
app.get('/get-posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Endpoint to create a new post
app.post('/create-posts', async (req, res) => {
    const { content, author, email, fileUrl, videoUrl } = req.body;

    try {
        const newPost = new Post({
            content,
            author,
            email,
            fileUrl,
            videoUrl,
        });

        await newPost.save();
        res.status(200).json({ message: 'Post created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Endpoint to delete a post by ID
app.delete('/delete-post/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Endpoint to delete all posts (admin only)
app.post('/delete-all-posts', async (req, res) => {
    const { username, code } = req.body;
    if (username === 'zend' && code === '0926') {
        try {
            await Post.deleteMany({});
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

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Endpoint to log in a user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
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
