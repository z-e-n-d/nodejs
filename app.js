const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory user database (for demo purposes only)
const users = [{ email: 'test@example.com', password: 'password123' }];

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for file uploads
const upload = multer({
    dest: 'uploads/', // Destination folder for uploaded files
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB file size limit
});

// Serve static HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(
        (u) => u.email === email && u.password === password
    );

    if (user) {
        res.status(200).json({ message: 'Login successful!' });
    } else {
        res.status(401).json({ error: 'Invalid email or password.' });
    }
});

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    const { title } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    // File rename for better organization
    const newFilePath = path.join(
        __dirname,
        'uploads',
        `${Date.now()}_${req.file.originalname}`
    );

    fs.rename(filePath, newFilePath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error processing file.' });
        }

        res.status(200).json({
            message: 'File uploaded successfully!',
            filePath: newFilePath,
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
