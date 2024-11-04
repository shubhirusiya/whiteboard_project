// whiteboard.js

module.exports = (io) => {
    const express = require('express');
    const router = express.Router();
  
    // Define any REST API routes here if necessary
    router.get('/', (req, res) => {
      res.send('Whiteboard API is working');
    });
  
    // Socket.io handling for drawing events
    io.on('connection', (socket) => {
      console.log('A user connected to the whiteboard');
  
      // Receive and broadcast draw data
      socket.on('draw-data', (data) => {
        socket.broadcast.emit('draw-data', data);
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected from the whiteboard');
      });
    });
  
    return router;
  };
  