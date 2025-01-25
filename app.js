const express = require("express");
const bcrypt = require("bcrypt");
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

let users = []; // This is where we'll store users temporarily (in-memory)

// Registration route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists." });
  }

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = { email, password: hashedPassword };
  users.push(newUser);  // Store the user (in-memory for now)

  res.status(201).json({ message: "User registered successfully", user: newUser });
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Find the user
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials." });
  }

  // Compare the password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid credentials." });
  }

  res.status(200).json({ message: "Login successful", user });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
