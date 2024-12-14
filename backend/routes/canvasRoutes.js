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

router.get('/get-canvas/:projectName',async(req,res)=>{
  try{
    const{projectName}=req.params;
    if(!projectName){
      return res.status(400).send('Project name is required');

    }
    const canvas=await Canvas.findOne({projectName});

    if(!canvas){
      return res.status(404).send('Canvas not found');

    }

    res.status(200).json(canvas.canvasData);

  }
  catch(error){
    console.log(error);
    res.status(500).send("Error retrieving canvas data");
  }
})

module.exports = router;
