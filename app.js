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

function readPosts() {
    if (!fs.existsSync(postsFilePath)) {
        return [];
    }
    const data = fs.readFileSync(postsFilePath, "utf8");
    return JSON.parse(data);
}

function writePosts(posts) {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
}

// Routes
app.get("/get-posts", (req, res) => {
    try {
        const posts = readPosts();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch posts." });
    }
});

app.post("/create-posts", upload.single("file"), (req, res) => {
    try {
        const { content, author } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newPost = {
            id: Date.now().toString(),
            content,
            author,
            fileUrl,
        };

        const posts = readPosts();
        posts.push(newPost);
        writePosts(posts);

        res.status(201).json({ message: "Post created successfully.", post: newPost });
    } catch (err) {
        res.status(500).json({ error: "Failed to create post." });
    }
});

app.delete("/delete-post/:id", (req, res) => {
    try {
        const { id } = req.params;
        let posts = readPosts();
        const postIndex = posts.findIndex(post => post.id === id);

        if (postIndex === -1) {
            return res.status(404).json({ error: "Post not found." });
        }

        posts.splice(postIndex, 1);
        writePosts(posts);

        res.json({ message: "Post deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete post." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
