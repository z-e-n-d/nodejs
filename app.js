const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/', // Set the destination folder for uploaded files
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov/;
    const isValid = allowedTypes.test(file.mimetype);
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});

// Temporary storage for posts and users
const posts = [];
const users = [];

// Logger Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Register route
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (users.find(user => user.email === email)) {
    console.error('Email already registered.');
    return res.status(400).json({ error: 'Email already registered.' });
  }

  users.push({ username, email, password });
  console.log('User registered successfully:', email);
  res.status(201).json({ message: 'User registered successfully.' });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    console.error('Invalid email or password.');
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  console.log('User logged in:', email);
  res.json({ username: user.username, email: user.email });
});

// Create a new post
app.post('/posts', upload.single('file'), (req, res) => {
  const { description } = req.body;

  console.log('Received post:', description, req.file);

  if (!description && !req.file) {
    console.error('Description or file is required.');
    return res.status(400).json({ error: 'Description or file is required.' });
  }

  if (!req.file) {
    console.error('No file uploaded.');
    return res.status(400).json({ error: 'Failed to upload the file.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const postId = posts.length + 1;

  posts.push({ id: postId, description, fileUrl });
  console.log('Post created successfully:', { id: postId, description, fileUrl });
  res.status(201).json({ message: 'Post created successfully.' });
});

// Get all posts
app.get('/posts', (req, res) => {
  console.log('Fetching all posts.');
  res.json(posts);
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const email = req.headers['x-user-email'];

  if (email !== 'zozo.toth.2022home@gmail.com') {
    console.error('Permission denied for email:', email);
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex === -1) {
    console.error('Post not found:', postId);
    return res.status(404).json({ error: 'Post not found.' });
  }

  const post = posts[postIndex];
  if (post.fileUrl) {
    const filePath = path.join(__dirname, post.fileUrl);
    fs.unlink(filePath, err => {
      if (err) {
        console.error('Failed to delete file:', err);
      } else {
        console.log('File deleted:', filePath);
      }
    });
  }

  posts.splice(postIndex, 1);
  console.log('Post deleted:', postId);
  res.json({ message: 'Post deleted successfully.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});