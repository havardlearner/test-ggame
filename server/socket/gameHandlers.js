const { nanoid } = require('../utils/nanoidCompat');
const { calculateCollisions, generateEnergyParticles } = require('../utils/gameUtils');

// Game state
const gameState = {
  players: {},
  energyParticles: [],
  aiPlayers: []
};

// AI bot configuration
const AI_BOT_COUNT = 10;
const MIN_PLAYER_COUNT = 5;

// Generate energy particles
function generateEnergyParticles(count = 200) {
  for (let i = 0; i < count; i++) {
    gameState.energyParticles.push({
      id: nanoid(),
      x: Math.random() * 3000,
      y: Math.random() * 3000,
      value: 5 + Math.random() * 15
    });
  }
}

// Initial energy particles
generateEnergyParticles(200);

function setupGameSockets(io) {
  console.log("Setting up game socket handlers");
  
  // Game loop - runs at 30 FPS
  setInterval(() => {
    // Move players based on their velocity
    Object.values(gameState.players).forEach(player => {
      if (player.velocity) {
        player.x += player.velocity.x;
        player.y += player.velocity.y;
        
        // Keep player in bounds
        player.x = Math.max(0, Math.min(3000, player.x));
        player.y = Math.max(0, Math.min(3000, player.y));
        
        // Check for energy particle collisions
        gameState.energyParticles = gameState.energyParticles.filter(particle => {
          const dx = player.x - particle.x;
          const dy = player.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If collision detected
          if (distance < 20 + 5) { // player radius + particle radius
            // Increase player energy
            player.energy += particle.value || 10;
            return false; // remove this particle
          }
          return true; // keep this particle
        });
      }
    });
    
    // Replenish energy particles if needed
    if (gameState.energyParticles.length < 100) {
      generateEnergyParticles(20);
    }
    
    // Broadcast game state to all players
    io.emit('gameUpdate', gameState);
  }, 1000 / 30);

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    // Handle player join
    socket.on('join', (playerData) => {
      console.log('Player joined with data:', playerData);
      const playerId = socket.id;
      
      // Make sure energyParticles exists and has items
      if (!gameState.energyParticles || gameState.energyParticles.length === 0) {
        console.log('Regenerating energy particles');
        gameState.energyParticles = [];
        generateEnergyParticles(200);
      }
      
      gameState.players[playerId] = {
        id: playerId,
        x: Math.random() * 2800 + 100,
        y: Math.random() * 2800 + 100,
        energy: 100,
        color: playerData.color || '#00aaff',
        name: playerData.name || `Player ${playerId.substring(0, 5)}`,
        velocity: { x: 0, y: 0 }
      };
      
      // Send initial game state to the player immediately
      socket.emit('initialState', {
        playerId,
        gameState
      });
      
      // Also broadcast a game update to all clients
      io.emit('gameUpdate', gameState);
      
      adjustAIPlayerCount();
    });

    // Handle player movement
    socket.on('playerMovement', (movementData) => {
      const player = gameState.players[socket.id];
      if (player) {
        console.log('Player movement:', socket.id, movementData);
        
        // Handle angle-based movement
        if (movementData.angle !== undefined) {
          const speed = 5;
          player.velocity = {
            x: Math.cos(movementData.angle) * speed,
            y: Math.sin(movementData.angle) * speed
          };
        }
        
        // Or handle direct position updates
        if (movementData.x !== undefined && movementData.y !== undefined) {
          player.x = movementData.x;
          player.y = movementData.y;
        }
      }
    });

    // Handle player action (using modules/abilities)
    socket.on('playerAction', (actionData) => {
      const player = gameState.players[socket.id];
      if (player) {
        handlePlayerAction(player, actionData);
      }
    });

    // Handle player split
    socket.on('playerSplit', () => {
      const player = gameState.players[socket.id];
      if (player && player.size > 40) {
        splitPlayer(player, socket.id);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      delete gameState.players[socket.id];
      adjustAIPlayerCount();
      io.emit('playerDisconnected', socket.id);
    });
  });
  
  // Helper functions
  function updateAIBots() {
    gameState.aiPlayers.forEach(bot => {
      // AI decision making logic
      const botDecision = calculateBotDecision(bot);
      updatePlayerPosition(bot, botDecision);
    });
  }
  
  function adjustAIPlayerCount() {
    const playerCount = Object.keys(gameState.players).length;
    const requiredBots = Math.max(0, MIN_PLAYER_COUNT - playerCount);
    
    // Remove excess bots
    if (gameState.aiPlayers.length > requiredBots) {
      gameState.aiPlayers = gameState.aiPlayers.slice(0, requiredBots);
    }
    // Add more bots if needed
    else if (gameState.aiPlayers.length < requiredBots) {
      for (let i = gameState.aiPlayers.length; i < requiredBots; i++) {
        createAIBot();
      }
    }
  }
  
  function createAIBot() {
    const botId = `ai-${nanoid(8)}`;
    const bot = {
      id: botId,
      x: Math.random() * 3000,
      y: Math.random() * 3000,
      size: 20 + Math.random() * 30,
      energy: 100 + Math.random() * 200,
      color: getRandomColor(),
      name: `NanoBot ${botId.substr(3, 4)}`,
      isAI: true,
      modules: [],
      velocity: { x: 0, y: 0 }
    };
    gameState.aiPlayers.push(bot);
  }
  
  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
}

module.exports = setupGameSockets; 