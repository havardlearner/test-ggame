const { nanoid } = require('nanoid');

// Calculate collisions between players and energy particles
const calculateCollisions = (gameState) => {
  // Player-energy collisions
  Object.values(gameState.players).forEach(player => {
    gameState.energyParticles = gameState.energyParticles.filter(particle => {
      const distance = getDistance(player, particle);
      
      // If player collides with energy particle
      if (distance < player.size + particle.size) {
        // Increase player size
        player.energy += particle.energy;
        player.size += particle.size * 0.1;
        
        // Create new energy particle
        gameState.energyParticles.push(createEnergyParticle());
        
        return false; // Remove the collected particle
      }
      return true;
    });
  });
  
  // Player-player collisions
  Object.values(gameState.players).forEach(player => {
    // Check collisions with other players
    Object.values(gameState.players).forEach(otherPlayer => {
      if (player.id !== otherPlayer.id) {
        handlePlayerCollision(player, otherPlayer);
      }
    });
    
    // Check collisions with AI bots
    gameState.aiPlayers.forEach(bot => {
      handlePlayerCollision(player, bot);
    });
  });
  
  // AI-energy collisions
  gameState.aiPlayers.forEach(bot => {
    gameState.energyParticles = gameState.energyParticles.filter(particle => {
      const distance = getDistance(bot, particle);
      
      // If AI bot collides with energy particle
      if (distance < bot.size + particle.size) {
        // Increase bot size
        bot.energy += particle.energy;
        bot.size += particle.size * 0.1;
        
        // Create new energy particle
        gameState.energyParticles.push(createEnergyParticle());
        
        return false; // Remove the collected particle
      }
      return true;
    });
  });
  
  // AI-AI collisions
  gameState.aiPlayers.forEach((bot, index) => {
    gameState.aiPlayers.slice(index + 1).forEach(otherBot => {
      handlePlayerCollision(bot, otherBot);
    });
  });
};

// Handle collision between two players/bots
const handlePlayerCollision = (player1, player2) => {
  const distance = getDistance(player1, player2);
  
  // If players collide
  if (distance < player1.size + player2.size) {
    // Larger player consumes smaller player
    if (player1.size > player2.size * 1.1) {
      // Player 1 consumes player 2
      player1.energy += player2.energy * 0.8; // 80% energy transfer
      player1.size += player2.size * 0.2; // 20% size increase
      
      // Reset consumed player/bot
      if (player2.isAI) {
        // Reset AI bot
        Object.assign(player2, createAIBot());
      } else {
        // Reset player - will be handled by client disconnect/reconnect
      }
    } else if (player2.size > player1.size * 1.1) {
      // Player 2 consumes player 1
      player2.energy += player1.energy * 0.8;
      player2.size += player1.size * 0.2;
      
      // Reset consumed player/bot
      if (player1.isAI) {
        // Reset AI bot
        Object.assign(player1, createAIBot());
      } else {
        // Reset player - will be handled by client disconnect/reconnect
      }
    } else {
      // Similar sized players - bounce off each other
      const angle = Math.atan2(player2.y - player1.y, player2.x - player1.x);
      const overlap = player1.size + player2.size - distance;
      
      // Move players apart
      player1.x -= Math.cos(angle) * overlap * 0.5;
      player1.y -= Math.sin(angle) * overlap * 0.5;
      player2.x += Math.cos(angle) * overlap * 0.5;
      player2.y += Math.sin(angle) * overlap * 0.5;
    }
  }
};

// Generate energy particles
const generateEnergyParticles = (particles, count) => {
  for (let i = 0; i < count; i++) {
    particles.push(createEnergyParticle());
  }
};

// Create a single energy particle
const createEnergyParticle = () => {
  return {
    id: nanoid(),
    x: Math.random() * 3000,
    y: Math.random() * 3000,
    size: 5 + Math.random() * 5,
    energy: 10 + Math.random() * 20,
    color: '#00ffff'
  };
};

// Create an AI bot
const createAIBot = () => {
  const botId = `ai-${nanoid(8)}`;
  return {
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
};

// Calculate bot movement decisions
const calculateBotDecision = (bot) => {
  // This is a simplified AI decision making
  // In a real implementation, this would be more sophisticated
  
  // Random movement with some inertia
  let decision = {
    x: bot.velocity.x * 0.8 + (Math.random() - 0.5) * 0.4,
    y: bot.velocity.y * 0.8 + (Math.random() - 0.5) * 0.4
  };
  
  // Normalize the vector
  const length = Math.sqrt(decision.x * decision.x + decision.y * decision.y);
  if (length > 0) {
    decision.x /= length;
    decision.y /= length;
  }
  
  // Update bot velocity
  bot.velocity = decision;
  
  return decision;
};

// Update player position based on movement input
const updatePlayerPosition = (player, movementInput) => {
  // Calculate speed based on player size
  const speed = Math.max(1, 5 - player.size / 50);
  
  // Apply movement
  player.x += movementInput.x * speed;
  player.y += movementInput.y * speed;
  
  // Keep within bounds
  player.x = Math.max(0, Math.min(3000, player.x));
  player.y = Math.max(0, Math.min(3000, player.y));
  
  // Update velocity
  player.velocity = {
    x: movementInput.x * speed,
    y: movementInput.y * speed
  };
};

// Handle player ability/module usage
const handlePlayerAction = (player, actionData) => {
  const { abilityIndex } = actionData;
  
  // Check if player has the ability
  if (player.modules.length <= abilityIndex) {
    return; // Player doesn't have this ability
  }
  
  const ability = player.modules[abilityIndex];
  
  // Check if ability is on cooldown
  if (ability.cooldown > 0) {
    return; // Ability is on cooldown
  }
  
  // Use ability based on type
  switch (ability.type) {
    case 'speed_boost':
      // Temporary speed boost will be applied in updatePlayerPosition
      ability.active = true;
      ability.duration = 3000; // 3 seconds
      ability.cooldown = 10000; // 10 seconds
      break;
      
    case 'shield':
      // Temporary invulnerability
      ability.active = true;
      ability.duration = 2000; // 2 seconds
      ability.cooldown = 15000; // 15 seconds
      break;
      
    case 'magnet':
      // Attract nearby energy particles
      ability.active = true;
      ability.duration = 5000; // 5 seconds
      ability.cooldown = 12000; // 12 seconds
      break;
      
    case 'pulse':
      // Push nearby enemies away
      applyPulseEffect(player);
      ability.cooldown = 8000; // 8 seconds
      break;
      
    case 'trap':
      // Deploy a trap at current position
      deployTrap(player);
      ability.cooldown = 20000; // 20 seconds
      break;
  }
};

// Split player into two smaller nanobots
const splitPlayer = (player, playerId) => {
  // Calculate new size
  const newSize = player.size * 0.7; // 70% of original size
  
  // Update original player
  player.size = newSize;
  player.energy = player.energy * 0.7; // 70% of original energy
  
  // Create the split nanobot
  const splitNanobot = {
    id: `${playerId}-split-${Date.now()}`,
    x: player.x + Math.cos(Math.random() * Math.PI * 2) * player.size * 2,
    y: player.y + Math.sin(Math.random() * Math.PI * 2) * player.size * 2,
    size: newSize * 0.6, // Split is smaller
    energy: player.energy * 0.3, // 30% of original energy
    color: player.color,
    name: player.name,
    parentId: playerId, // Reference to parent
    modules: [],
    velocity: { 
      x: -player.velocity.x, 
      y: -player.velocity.y 
    }
  };
  
  // Add to game state - this would be handled in the main game logic
  return splitNanobot;
};

// Helper function to calculate distance between two objects
const getDistance = (obj1, obj2) => {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Generate random color
const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

module.exports = {
  calculateCollisions,
  generateEnergyParticles,
  createEnergyParticle,
  updatePlayerPosition,
  handlePlayerAction,
  splitPlayer,
  calculateBotDecision
}; 