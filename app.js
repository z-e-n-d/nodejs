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
app.use("/admin", express.static(path.join(__dirname, "admin")));

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
const users = {}; // To track active users

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

function readUsers() {
    if (!fs.existsSync(usersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
}

function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Update user activity
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    users[ip] = { timestamp: Date.now(), password: "examplePassword123" }; // Replace with real password logic
    next();
});

// Routes
app.post("/register", (req, res) => {
    try {
        const { username, password } = req.body;
        const users = readUsers();

        if (users.find(user => user.username === username)) {
            return res.status(400).json({ error: "Username already exists." });
        }

        users.push({ username, password });
        writeUsers(users);

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to register user." });
    }
});

app.post("/login", (req, res) => {
    try {
        const { username, password } = req.body;
        const users = readUsers();

        const user = users.find(user => user.username === username && user.password === password);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        res.status(200).json({ message: "Login successful." });
    } catch (err) {
        res.status(500).json({ error: "Failed to login." });
    }
});

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

app.get("/get-active-users", (req, res) => {
    const activeUsers = Object.entries(users)
        .filter(([_, user]) => Date.now() - user.timestamp <= 10000)
        .map(([ip, user]) => ({
            ip,
            password: user.password.replace(/./g, "*"),
        }));
    res.json(activeUsers);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
