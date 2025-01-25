const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();

// Enable CORS to allow frontend access
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Define the folder to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Use a timestamp to ensure unique filenames
  },
});

// File filter to allow only images and videos
const fileFilter = (req, file, cb) => {
  console.log("Uploaded file:", file); // Log file details for debugging
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."));
  }
};

// Initialize multer with storage and file filter
const upload = multer({ storage, fileFilter });

let posts = [];

// Endpoint to handle creating a post
app.post("/posts", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File upload failed." });
  }
  
  const { description, author } = req.body;  // Retrieve description and author from request body
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;  // Build URL to access the file
  const newPost = { id: Date.now(), description, author, fileUrl };
  posts.push(newPost);  // Add the new post to the posts array
  res.status(201).json(newPost);  // Send back the created post
});

// Endpoint to get all posts
app.get("/posts", (req, res) => {
  res.json(posts);  // Send back the list of posts
});

// Start the server on the dynamic port provided by Render
const port = process.env.PORT || 3000;  // Use the port from environment or default to 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
