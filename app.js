const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Save files to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename (timestamp)
  }
});

const upload = multer({ storage: storage });

// Middleware to serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use JSON parser middleware
app.use(express.json());

// Simulating users' posts for demonstration
let posts = [];

// Register Route
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  // Registration logic goes here (save user to DB, etc.)
  res.status(200).json({ message: 'Registration successful' });
});

// Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Login logic goes here (check user credentials, etc.)
  res.status(200).json({ username: 'exampleUser' }); // Return a mock username for now
});

// Post creation (with file upload)
app.post('/feed', upload.single('file'), (req, res) => {
  const { description } = req.body;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Create a post object
  const newPost = {
    description,
    fileName: file.filename, // Store the uploaded file's name
  };

  // Save the post to the posts array (or to a database)
  posts.push(newPost);

  res.status(200).json({ message: 'Post created successfully', post: newPost });
});

// Get all posts (for displaying in the feed)
app.get('/feed', (req, res) => {
  res.status(200).json(posts);
});

// Static file server for the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the frontend HTML
app.use(express.static(path.join(__dirname, 'public'))); // Assuming your index.html is in the 'public' folder

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
