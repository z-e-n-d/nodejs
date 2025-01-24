const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON parsing
app.use(express.json());

// Serve static files (if needed)
app.use(express.static('public'));

// Home route to check if the server is running
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// API route to check server status
app.get('/status', (req, res) => {
    res.json({ status: 'Server is up and running!' });
});

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});