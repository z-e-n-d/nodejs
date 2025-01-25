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
    cb(null, "uploads/");
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

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
