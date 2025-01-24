const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// Simulated database
const users = [];

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  users.push({ username, email, password });
  res.status(201).json({ message: 'Registration successful' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.status(200).json({ message: 'Login successful', username: user.username });
});

// File Upload Configuration
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

// Catch-All Route for Errors
app.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
