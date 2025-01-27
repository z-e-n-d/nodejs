const express = require("express");
const axios = require("axios");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static("uploads"));

// File storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads";
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// W3Spaces URLs for users.json and posts.json
const usersJsonUrl = "https://re-media.w3spaces.com/users.json";
const postsJsonUrl = "https://re-media.w3spaces.com/posts.json";

// Helper functions to interact with W3Spaces

async function readJSON(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error reading JSON:", error);
        return [];
    }
}

async function writeJSON(url, data) {
    try {
        await axios.put(url, data);
    } catch (error) {
        console.error("Error writing JSON:", error);
    }
}

// Routes

// Register a new user
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const users = await readJSON(usersJsonUrl);

        // Check for existing user
        if (users.some(user => user.username === username || user.email === email)) {
            return res.status(400).json({ error: "Username or email already exists." });
        }

        // Add new user
        users.push({ username, email, password });
        await writeJSON(usersJsonUrl, users);

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to register user." });
    }
});

// Login a user
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readJSON(usersJsonUrl);

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
app.get("/get-posts", async (req, res) => {
    try {
        const posts = await readJSON(postsJsonUrl);
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts." });
    }
});

// Create a new post
app.post("/create-posts", upload.single("file"), async (req, res) => {
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

        const posts = await readJSON(postsJsonUrl);
        posts.push(newPost);
        await writeJSON(postsJsonUrl, posts);

        res.status(201).json({ message: "Post created successfully.", post: newPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create post." });
    }
});

// Delete a post
app.delete("/delete-post/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let posts = await readJSON(postsJsonUrl);

        // Find and remove post
        const postIndex = posts.findIndex(post => post.id === id);
        if (postIndex === -1) {
            return res.status(404).json({ error: "Post not found." });
        }

        posts.splice(postIndex, 1);
        await writeJSON(postsJsonUrl, posts);

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
