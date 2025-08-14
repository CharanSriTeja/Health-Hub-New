// 1. Import all required packages
require('dotenv').config(); // Loads variables from .env into the application
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 2. Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// 3. Set up middleware
// This allows your server to accept requests from your React app
app.use(cors()); 
// This allows your server to understand and parse incoming JSON data from requests
app.use(express.json()); 

// 4. Connect to your MongoDB database
// Mongoose uses the connection string from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB."))
  .catch(err => console.error("MongoDB connection error:", err));

// 5. Define a test API route to make sure the server is working
// When you visit http://localhost:5001/api/test, you will get this response
app.get('/api/test', (req, res) => {
  res.json({ message: "Hello from the Express server! Your back-end is connected." });
});

// Add more API routes for your application's logic here
// For example: app.use('/api/users', require('./routes/users'));

// 6. Start listening for requests
// This line officially starts your server on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
