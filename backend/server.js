// server.js
import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import ActiveSession from './models/activeSession.model.js';

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('New client connected:', socket.id);

  // Store session in database
  const session = new ActiveSession({
    sessionId: socket.id,
    ipAddress: socket.handshake.headers['x-forwarded-for'] || socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent'],
    isActive: true
  });

  try {
    await session.save();

    // Emit updated count to all clients
    const activeCount = await ActiveSession.countDocuments({ isActive: true });
    io.emit('userCount', { count: activeCount });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);

      await ActiveSession.findOneAndUpdate(
        { sessionId: socket.id },
        { isActive: false, lastActivity: new Date() }
      );

      // Emit updated count
      const activeCount = await ActiveSession.countDocuments({ isActive: true });
      io.emit('userCount', { count: activeCount });
    });

    // Update last activity on pings
    socket.on('ping', async () => {
      await ActiveSession.findOneAndUpdate(
        { sessionId: socket.id },
        { lastActivity: new Date() }
      );
    });
  } catch (error) {
    console.error('Error recording active session:', error);
  }
});

// Cleanup inactive sessions (run periodically)
setInterval(async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    await ActiveSession.updateMany(
      { lastActivity: { $lt: fiveMinutesAgo }, isActive: true },
      { isActive: false }
    );

    const activeCount = await ActiveSession.countDocuments({ isActive: true });
    io.emit('userCount', { count: activeCount });
  } catch (error) {
    console.error('Error cleaning up inactive sessions:', error);
  }
}, 60 * 1000); // Run every minute

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Listen on provided port
server.listen(PORT, () => {
  console.log(`L Café server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Make io accessible in other files
export { io };