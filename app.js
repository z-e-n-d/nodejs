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

// File-based database
const postsFilePath = path.join(__dirname, "posts.json");
const usersFilePath = path.join(__dirname, "users.json");

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Register a new user
app.post("/register", (req, res) => {
    try {
        const { username, email, password } = req.body;
        const users = readJSON(usersFilePath);

        // Check for existing user
        const userExists = users.some(user => user.username === username || user.email === email);
        if (userExists) {
            return res.status(400).json({ error: "Username or email already exists." });
        }

        // Create a response object that frontend can use to update the file
        const newUser = { username, email, password };

        res.status(201).json({
            message: "User registration successful",
            update: { action: "add", data: newUser } // frontend will update the JSON file with this data
        });
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

        res.status(200).json({
            message: "Login successful.",
            user: { username: user.username }
        });
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
app.post("/create-posts", (req, res) => {
    try {
        const { content, author } = req.body;

        // Create new post
        const newPost = {
            id: Date.now().toString(),
            content,
            author
        };

        res.status(201).json({
            message: "Post created successfully.",
            update: { action: "add", data: newPost } // frontend will update the posts JSON file with this data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create post." });
    }
});

// Delete a post
app.delete("/delete-post/:id", (req, res) => {
    try {
        const { id } = req.params;
        const posts = readJSON(postsFilePath);

        // Find and remove post
        const postIndex = posts.findIndex(post => post.id === id);
        if (postIndex === -1) {
            return res.status(404).json({ error: "Post not found." });
        }

        const deletedPost = posts.splice(postIndex, 1);

        res.json({
            message: "Post deleted successfully.",
            update: { action: "remove", data: deletedPost[0] } // frontend will remove the post from JSON
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete post." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
