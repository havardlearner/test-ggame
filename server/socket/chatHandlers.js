const crypto = require('crypto');
const User = require('../models/User');
const { verifyToken } = require('../utils/auth');

// In-memory store for active connections and public keys
// In production, consider using Redis for this
const activeConnections = new Map();
const publicKeys = new Map();

function setupChatSockets(io) {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }
      
      // Attach user info to socket
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Store messages in memory for now (could move to database later)
  const recentMessages = [];
  const MAX_RECENT_MESSAGES = 50;

  io.on('connection', (socket) => {
    console.log('Chat client connected:', socket.id);
    const userId = socket.user._id.toString();
    
    // Store connection
    activeConnections.set(userId, socket.id);
    
    // Send recent message history to newly connected clients
    socket.emit('chatHistory', recentMessages);
    
    // Handle key exchange for E2EE
    socket.on('publicKey', ({ publicKey }) => {
      publicKeys.set(userId, publicKey);
    });
    
    // Handle messages
    socket.on('sendMessage', async ({ recipientId, encryptedMessage }) => {
      try {
        // Check if users are mutual subscribers
        const user = await User.findById(userId);
        const recipient = await User.findById(recipientId);
        
        if (!user || !recipient) {
          return socket.emit('error', { message: 'User not found' });
        }
        
        const isMutualSubscriber = 
          user.subscriptions.includes(recipientId) && 
          recipient.subscriptions.includes(userId);
          
        if (!isMutualSubscriber) {
          return socket.emit('error', { 
            message: 'You can only message mutual subscribers'
          });
        }
        
        // Get recipient's socket
        const recipientSocketId = activeConnections.get(recipientId);
        if (recipientSocketId) {
          // Send message to recipient
          io.to(recipientSocketId).emit('newMessage', {
            senderId: userId,
            encryptedMessage,
            timestamp: Date.now()
          });
        }
        
        // Acknowledge message was sent
        socket.emit('messageSent', { recipientId, timestamp: Date.now() });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle voice chat signaling
    socket.on('voiceCallSignal', ({ recipientId, signal }) => {
      const recipientSocketId = activeConnections.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('voiceCallSignal', {
          senderId: userId,
          signal
        });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      activeConnections.delete(userId);
      console.log('Chat client disconnected:', socket.id);
    });

    // Handle sending chat message
    socket.on('sendChatMessage', (messageData) => {
      // Get the player from the game namespace
      const playerId = socket.id;
      const gameIo = io.of('/game');
      
      // Try to find player info in the game state
      let playerName = `Player ${playerId.substring(0, 5)}`;
      let playerColor = '#ffffff';
      
      // Check if we can access the game state
      if (gameIo.adapter && gameIo.adapter.rooms) {
        // Look for player in the game state
        const players = Object.values(gameIo.adapter.rooms)
          .filter(room => room.sockets && room.sockets[playerId])
          .map(room => room.gameState?.players?.[playerId])
          .filter(Boolean);
        
        if (players.length > 0) {
          playerName = players[0].name || playerName;
          playerColor = players[0].color || playerColor;
        }
      }
      
      // Create the full message object
      const message = {
        id: Date.now().toString(),
        playerId,
        sender: playerName,
        color: playerColor,
        text: messageData.text,
        timestamp: messageData.timestamp || new Date().toISOString()
      };
      
      // Store message in recent history
      recentMessages.push(message);
      if (recentMessages.length > MAX_RECENT_MESSAGES) {
        recentMessages.shift();
      }
      
      // Broadcast to all clients
      io.emit('chatMessage', message);
    });
  });
}

module.exports = setupChatSockets; 