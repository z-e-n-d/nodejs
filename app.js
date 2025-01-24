const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Mock database for users and posts
const users = [];
const posts = [];

// Register endpoint
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(400).json({ error: 'User already exists!' });
    }

    users.push({ username, email, password });
    res.status(201).json({ message: 'User registered successfully!' });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials!' });
    }

    res.status(200).json({ username: user.username });
});

// Upload post endpoint (handles post submission with file upload)
app.post('/upload-post', (req, res) => {
    const { author, description } = req.body;  // assuming these come as JSON
    let fileName = '';
    let fileData = null;

    if (!author || !description) {
        return res.status(400).json({ error: 'Missing author or description.' });
    }

    // Here we assume that the file data comes in the request body as a field
    // You could use FormData or a similar frontend method to send files as multipart/form-data
    if (req.files && req.files.file) {
        const file = req.files.file;
        fileName = file.name;
        const saveTo = path.join(__dirname, 'uploads', fileName);

        file.mv(saveTo, (err) => {
            if (err) {
                return res.status(500).json({ error: 'File upload failed.' });
            }

            // Save post to the mock database
            posts.push({
                author,
                description,
                fileName,
                fileData: {
                    mimetype: file.mimetype,
                    saveTo
                }
            });

            res.status(200).json({ success: true, message: 'Post uploaded successfully!' });
        });
    } else {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
});

// Keep server awake (ping endpoint)
app.get('/ping', (req, res) => {
    res.status(200).send('Server is awake');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
