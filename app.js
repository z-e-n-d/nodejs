const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('your-mongo-db-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Post Schema
const postSchema = new mongoose.Schema({
  author: String,
  description: String,
  fileUrl: String,
  videoUrl: String,
});

const Post = mongoose.model('Post', postSchema);

// Setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes

// Get all posts
app.get('/get-posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).send({ error: 'Failed to retrieve posts.' });
  }
});

// Create post
app.post('/create-posts', upload.single('file'), async (req, res) => {
  const { content, author, email } = req.body;
  let fileUrl = '';
  let videoUrl = '';

  if (req.file) {
    if (req.file.mimetype.startsWith('image')) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.file.mimetype.startsWith('video')) {
      videoUrl = `/uploads/${req.file.filename}`;
    }
  }

  const newPost = new Post({
    author,
    description: content,
    fileUrl,
    videoUrl,
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).send({ error: 'Failed to create post.' });
  }
});

// Delete post by ID
app.delete('/delete-post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).send({ error: 'Post not found.' });
    }
    res.status(200).send({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).send({ error: 'Error deleting post.' });
  }
});

// Admin delete all posts (requires specific username and code)
app.delete('/delete-all-posts', (req, res) => {
  const { username, code } = req.body;
  if (username === 'z-e-n-d' && code === '0926') {
    Post.deleteMany({}, (err) => {
      if (err) {
        return res.status(500).send({ error: 'Failed to delete posts.' });
      }
      res.status(200).send({ message: 'All posts deleted.' });
    });
  } else {
    res.status(403).send({ error: 'Unauthorized' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Here you would check the username and password against your DB
    // For now, we're simulating a successful login.
    if (username && password) {
      res.status(200).json({ username });
    } else {
      res.status(400).send({ error: 'Invalid credentials.' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Login failed.' });
  }
});

// Register Route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  // Here, you would register the user (save to DB)
  try {
    // Simulate successful registration
    res.status(201).send({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).send({ error: 'Registration failed.' });
  }
});

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
