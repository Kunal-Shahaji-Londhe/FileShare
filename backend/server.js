// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Enable CORS for development
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Frontend dev server
  methods: ['GET', 'POST']
}));
console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN}`);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('create_room', ({ roomId }) => {
    console.log(`Creating room: ${roomId} for client: ${socket.id}`);
    socket.join(roomId);
    rooms.set(roomId, [socket.id]);
    console.log(`Room created: ${roomId} with clients:`, rooms.get(roomId));
    socket.emit('room_created', { roomId });
  });

  socket.on('join_room', ({ roomId }) => {
    console.log(`Client ${socket.id} attempting to join room: ${roomId}`);
    const clients = rooms.get(roomId);
    if (clients && clients.length === 1) {
      socket.join(roomId);
      clients.push(socket.id);
      rooms.set(roomId, clients);
      console.log(`Client ${socket.id} successfully joined room: ${roomId}`);
      console.log(`Current clients in room ${roomId}:`, rooms.get(roomId));
      io.to(roomId).emit('peer_joined');
    } else {
      console.log(`Failed to join room ${roomId}: Room not found or already full`);
      socket.emit('error', { message: 'Room not found or already full' });
    }
  });

  socket.on('offer', ({ roomId, offer }) => {
    console.log(`Offer received in room ${roomId} from ${socket.id}`);
    socket.to(roomId).emit('offer', { offer });
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`Answer received in room ${roomId} from ${socket.id}`);
    socket.to(roomId).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    console.log(`ICE candidate received in room ${roomId} from ${socket.id}`);
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up rooms
    for (const [roomId, clients] of rooms.entries()) {
      if (clients.includes(socket.id)) {
        const updated = clients.filter((id) => id !== socket.id);
        if (updated.length === 0) {
          rooms.delete(roomId);
          console.log(`Room deleted: ${roomId}`);
        } else {
          rooms.set(roomId, updated);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
