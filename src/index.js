const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route that returns a message
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// POST route that accepts data
app.post('/data', (req, res) => {
  const { name, age } = req.body;
  res.json({ message: `Received data: ${name}, ${age}` });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});