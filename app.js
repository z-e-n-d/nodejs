const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// File storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// File-based database
const postsFilePath = path.join(__dirname, "posts.json");
const usersFilePath = path.join(__dirname, "users.json");

function readJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return []; // If the file doesn't exist, return an empty array
        }
        const data = fs.readFileSync(filePath, "utf8");
        return data ? JSON.parse(data) : []; // Parse JSON, fallback to an empty array if the file is empty
    } catch (err) {
        console.error("Error reading file:", err);
        return []; // Return an empty array in case of error
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Failed to write to ${filePath}:`, err);
        throw new Error(`Error writing to file: ${filePath}`);
    }
}

// Routes

// Register a new user
app.post("/register", (req, res) => {
    try {
        const { username, email, password } = req.body;
        const users = readJSON(usersFilePath);

        // Check for existing user
        if (users.some(user => user.username === username || user.email === email)) {
            return res.status(400).json({ error: "Username or email already exists." });
        }

        // Add new user
        users.push({ username, email, password });
        writeJSON(usersFilePath, users);

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to register user." });
    }
});

// Login a user
app.post("/login", (req, res) => {
    try {
        const { email, password } = req.body;
        const users = readJSON(usersFilePath);

        // Authenticate user
        const user = users.find(user => user.email === email && user.password === password);
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        res.status(200).json({ message: "Login successful.", username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to login." });
    }
});

// Get all posts
app.get("/get-posts", (req, res) => {
    try {
        const posts = readJSON(postsFilePath);
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts." });
    }
});

// Create a new post
app.post("/create-posts", upload.single("file"), (req, res) => {
    try {
        const { content, author } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Create new post
        const newPost = {
            id: Date.now().toString(),
            content,
            author,
            fileUrl,
        };

        const posts = readJSON(postsFilePath);
        posts.push(newPost);
        writeJSON(postsFilePath, posts);

        res.status(201).json({ message: "Post created successfully.", post: newPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create post." });
    }
});

// Delete a post
app.delete("/delete-post/:id", (req, res) => {
    try {
        const { id } = req.params;
        let posts = readJSON(postsFilePath);

        // Find and remove post
        const postIndex = posts.findIndex(post => post.id === id);
        if (postIndex === -1) {
            return res.status(404).json({ error: "Post not found." });
        }

        posts.splice(postIndex, 1);
        writeJSON(postsFilePath, posts);

        res.json({ message: "Post deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete post." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
