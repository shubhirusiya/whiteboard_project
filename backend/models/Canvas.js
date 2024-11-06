const mongoose = require('mongoose');

const canvasSchema = new mongoose.Schema({
    projectName: {
        type: String,
    },
  canvasData: {
     // The project name
    type:Object ,
    required: true
  }
});

const Canvas = mongoose.model('Canvas', canvasSchema);

module.exports = Canvas;
