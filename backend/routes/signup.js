const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure this path is correct

// Handle signup
router.post('/signup', async (req, res) => {
    console.log('Received request:', req.body); // Log the request body

    const { name, email, password } = req.body;

    const newUser = new User({ name, email, password });

    try {
        await newUser.save();
        console.log('User saved successfully');
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

module.exports = router;
