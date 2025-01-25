const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

// In-memory data storage
let posts = [];

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."));
  }
};

const upload = multer({ storage, fileFilter });

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "post.req@gmail.com" && password === "1234") {
    return res.status(200).json({ message: "Login successful!" });
  }
  return res.status(401).json({ message: "Invalid credentials!" });
});

// Create a post endpoint
app.post("/posts", upload.single("file"), (req, res) => {
  const { author, description } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "File upload required." });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/${req.file.filename}`;
  const newPost = { id: posts.length + 1, author, description, fileUrl };
  posts.push(newPost);

  return res.status(201).json(newPost);
});

// Get all posts endpoint
app.get("/posts", (req, res) => {
  res.status(200).json(posts);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
