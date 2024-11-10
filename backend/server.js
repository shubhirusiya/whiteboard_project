const express = require('express');
const connectDB = require('./config/db'); // Import the connectDB function
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const signupRoute = require('./routes/signup');
const whiteboardRoutes = require('./routes/whiteboard'); // Import the whiteboard route function
const canvasRoutes = require('./routes/canvasRoutes'); // Import canvasRoutes

const PORT = 8080;
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }  // Enable CORS if needed
});

app.use(express.json({ limit: '10mb' })); // Set JSON payload limit
app.use(bodyParser.json({ limit: '10mb' })); // Set JSON payload limit for body-parser if needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); 
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('draw-data', (data) => {
    // Broadcast the data to all other connected clients
    socket.broadcast.emit('draw-data', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Sample route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Routes
app.use('/', signupRoute);
app.use('/whiteboard', whiteboardRoutes(io)); // Pass the io instance to whiteboardRoutes
app.use('/', canvasRoutes); // Updated to include canvasRoutes for saving canvas and project name

// Start server with `server.listen`
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
