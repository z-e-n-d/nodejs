const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');

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
    const busboy = new Busboy({ headers: req.headers });
    let author = '';
    let description = '';
    let fileData = null;
    let fileName = '';

    busboy.on('field', (fieldname, val) => {
        if (fieldname === 'author') {
            author = val;
        } else if (fieldname === 'description') {
            description = val;
        }
    });

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        fileName = filename;
        const saveTo = path.join(__dirname, 'uploads', filename);
        file.pipe(fs.createWriteStream(saveTo));
        fileData = { mimetype, saveTo };
    });

    busboy.on('finish', () => {
        if (!author || !description || !fileData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Save the post to the mock database (or real database)
        posts.push({
            author,
            description,
            fileName,
            fileData
        });

        res.status(200).json({ success: true, message: 'Post uploaded successfully!' });
    });

    req.pipe(busboy);
});

// Keep server awake (ping endpoint)
app.get('/ping', (req, res) => {
    res.status(200).send('Server is awake');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
