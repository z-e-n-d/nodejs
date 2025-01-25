const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save to 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("Uploaded file:", file); // Log file details for debugging
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."));
  }
};

const upload = multer({ storage, fileFilter });

let posts = [];
let users = []; // Store users for simplicity, should be in DB in real-world use

// Registration route (without password hashing)
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Just store username and email, no hashing
  const newUser = { id: Date.now(), username, email, password };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Simple login (without bcrypt for simplicity)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  res.status(200).json({ message: "Logged in successfully", user });
});

// Create post route
app.post("/posts", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File upload failed." });
  }
  const { description, author } = req.body;
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  const newPost = { id: Date.now(), description, author, fileUrl };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Get all posts
app.get("/posts", (req, res) => {
  res.json(posts);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
