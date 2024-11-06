const express = require('express');
const Canvas = require('../models/Canvas'); // Import Canvas model
const router = express.Router();

router.post('/save-canvas', async (req, res) => {
  try {
    // Extract projectName and canvasData from the request body
    const { projectName, canvasData } = req.body;

    // Ensure that both projectName and canvasData are provided
    if (!projectName || !canvasData) {
      return res.status(400).send('Project name and canvas data are required');
    }

    // Create a new Canvas document with both projectName and canvasData
    const newCanvas = new Canvas({ projectName, canvasData });

    // Save the canvas data to the database
    await newCanvas.save();

    // Send success response
    res.status(201).send('Canvas data saved successfully');
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send('Error saving canvas data');
  }

  console.log(req.body);  // This is for debugging, optional
});

module.exports = router;
