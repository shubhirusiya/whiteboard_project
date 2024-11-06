const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/whiteboard';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

// Export the connection function
module.exports = connectDB;
