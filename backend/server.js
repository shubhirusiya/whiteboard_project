const express = require('express');
const connectDB = require('./config/db'); // Import the connectDB function
const app = express();
const PORT = 8080;
const cors = require('cors'); 
const signupRoute=require('./routes/signup');
// Connect to MongoDB
app.use(cors());
app.use(express.json());
connectDB();

// Middleware
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/signup',signupRoute);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
