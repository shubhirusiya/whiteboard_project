const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures emails are unique
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Correctly export the model
module.exports = mongoose.model('User', userSchema);
