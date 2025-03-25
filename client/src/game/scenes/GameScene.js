import Phaser from 'phaser';
import io from 'socket.io-client';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.socket = null;
    this.player = null;
    this.cursors = null;
    this.energyParticles = null;
    this.otherPlayers = {};
    this.scoreText = null;
    this.playerSettings = null;
  }

  init(data) {
    this.socket = data.socket;
    this.playerSettings = data.playerSettings;
  }

  preload() {
    this.load.image('nanobot', 'assets/nanobot.png');
    this.load.image('energy', 'assets/energy.png');
  }

  create() {
    // Set up background
    this.add.rectangle(0, 0, this.game.config.width * 3, this.game.config.height * 3, 0x000022).setOrigin(0.5);
    
    // Create grid lines
    const gridSize = 50;
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333366, 0.3);
    
    for (let x = 0; x < this.game.config.width * 3; x += gridSize) {
      graphics.moveTo(x - this.game.config.width, -this.game.config.height);
      graphics.lineTo(x - this.game.config.width, this.game.config.height * 2);
    }
    
    for (let y = 0; y < this.game.config.height * 3; y += gridSize) {
      graphics.moveTo(-this.game.config.width, y - this.game.config.height);
      graphics.lineTo(this.game.config.width * 2, y - this.game.config.height);
    }
    
    graphics.strokePath();

    // Create energy particles group
    this.energyParticles = this.physics.add.group();
    
    // Create player
    this.createPlayer();
    
    // Set up controls
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Set up camera to follow player
    this.cameras.main.startFollow(this.player);
    
    // Score text
    this.scoreText = this.add.text(10, 10, 'Energy: 0', { 
      fontSize: '24px', 
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setScrollFactor(0);
    
    // Set up socket events
    this.setupSocketEvents();
  }

  createPlayer() {
    this.player = this.physics.add.image(0, 0, 'nanobot')
      .setOrigin(0.5)
      .setScale(0.5)
      .setDepth(10)
      .setTint(Phaser.Display.Color.HexStringToColor(this.playerSettings.playerColor).color);
      
    this.player.setCollideWorldBounds(false);
    this.player.body.setCircle(this.player.width / 2);
    this.player.energy = 100;
    this.player.maxSpeed = 300;
  }

  setupSocketEvents() {
    if (!this.socket) return;
    
    // Listen for game state updates
    this.socket.on('gameUpdate', (gameState) => {
      this.handleGameUpdate(gameState);
    });
    
    // Listen for new energy particles
    this.socket.on('newEnergy', (energyData) => {
      this.addEnergyParticle(energyData);
    });
    
    // Listen for other player movements
    this.socket.on('playerMoved', (playerData) => {
      this.handlePlayerMovement(playerData);
    });
    
    // Listen for player disconnects
    this.socket.on('playerDisconnected', (playerId) => {
      this.removePlayer(playerId);
    });
  }

  handleGameUpdate(gameState) {
    // Update energy particles
    if (gameState.energy) {
      this.updateEnergyParticles(gameState.energy);
    }
    
    // Update other players
    if (gameState.players) {
      this.updatePlayers(gameState.players);
    }
  }

  updateEnergyParticles(energyData) {
    // Clear existing particles and recreate them
    this.energyParticles.clear(true, true);
    
    energyData.forEach(energy => {
      const particle = this.physics.add.image(energy.x, energy.y, 'energy')
        .setScale(0.3)
        .setTint(0x00ffaa);
      
      this.energyParticles.add(particle);
    });
  }

  updatePlayers(players) {
    // Update existing players and add new ones
    Object.keys(players).forEach(id => {
      const playerData = players[id];
      
      // Skip current player
      if (id === this.socket.id) {
        this.player.energy = playerData.energy;
        this.updatePlayerSize();
        return;
      }
      
      if (!this.otherPlayers[id]) {
        // Create new player
        this.otherPlayers[id] = this.physics.add.image(
          playerData.x, 
          playerData.y, 
          'nanobot'
        )
        .setScale(0.5 * (1 + playerData.energy / 500))
        .setTint(playerData.color || 0xff0000);
      } else {
        // Update existing player
        this.otherPlayers[id].setPosition(playerData.x, playerData.y);
        this.otherPlayers[id].setScale(0.5 * (1 + playerData.energy / 500));
      }
    });
  }

  removePlayer(playerId) {
    if (this.otherPlayers[playerId]) {
      this.otherPlayers[playerId].destroy();
      delete this.otherPlayers[playerId];
    }
  }

  updatePlayerSize() {
    // Scale player based on energy
    const scale = 0.5 * (1 + this.player.energy / 500);
    this.player.setScale(scale);
    
    // Adjust collision radius
    this.player.body.setCircle(this.player.width / 2 / scale);
    
    // Update speed (smaller = faster)
    this.player.maxSpeed = 300 * (1 / (0.5 + scale / 2));
    
    // Update score text
    this.scoreText.setText(`Energy: ${Math.floor(this.player.energy)}`);
  }

  update() {
    if (!this.player) return;
    
    // Player movement
    let speedX = 0;
    let speedY = 0;
    
    if (this.cursors.left.isDown) {
      speedX = -this.player.maxSpeed;
    } else if (this.cursors.right.isDown) {
      speedX = this.player.maxSpeed;
    }
    
    if (this.cursors.up.isDown) {
      speedY = -this.player.maxSpeed;
    } else if (this.cursors.down.isDown) {
      speedY = this.player.maxSpeed;
    }
    
    // Normalize diagonal movement
    if (speedX !== 0 && speedY !== 0) {
      const factor = 1 / Math.sqrt(2);
      speedX *= factor;
      speedY *= factor;
    }
    
    this.player.setVelocity(speedX, speedY);
    
    // Check for energy collection
    this.physics.overlap(
      this.player, 
      this.energyParticles, 
      this.collectEnergy, 
      null, 
      this
    );
    
    // Send player position to server
    if (this.socket) {
      this.socket.emit('playerMovement', {
        x: this.player.x,
        y: this.player.y,
        energy: this.player.energy
      });
    }
  }

  collectEnergy(player, energy) {
    energy.destroy();
    player.energy += 10;
    this.updatePlayerSize();
    
    // Emit energy collected
    if (this.socket) {
      this.socket.emit('energyCollected', { id: energy.id });
    }
  }
} 