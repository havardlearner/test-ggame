import Phaser from 'phaser';

let game = null;

const initGame = (socket, playerId) => {
  // Only initialize once
  if (game) {
    return game;
  }

  console.log("Initializing game with playerId:", playerId);

  // Basic game configuration
  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight - 64, // Account for navbar
    backgroundColor: '#0f0f1a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  // Game state
  let gameState = null;
  let localPlayerId = playerId;
  let playerSprite = null;
  let otherPlayers = {};
  let resources = {};
  let cursors = null;
  let scoreText = null;
  
  // Preload assets
  function preload() {
    console.log("Preloading game assets");
    // Use solid colored rectangles instead of images for now
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODM1RTg5QTkxMzEyMTFFQTk3MDhGRDY3NTZCQ0FCOEQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODM1RTg5QUExMzEyMTFFQTk3MDhGRDY3NTZCQ0FCOEQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4MzVFODlBNzEzMTIxMUVBOTcwOEZENjc1NkJDQUI4RCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4MzVFODlBODEzMTIxMUVBOTcwOEZENjc1NkJDQUI4RCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pnp1EGIAAAGDSURBVHja7JaxTsMwEIZ9jl0kJFMWRl5gQeoTdOAJeAAWJEBiZukrwAtkg6HpA7CwsVRVJYaKgdJKDGCUJI7vaiexHbshQWpH+nNV5e78+c7nxJYxhhWpbVapNQIMgAHwPwEWnYySGzuXhxu6eQGvw9ROQNF+AR+P7fYCKbbh2SkE0J74GgGkYhQBNufYZe+491bSXq+3/trr+joHsdZ+XXdbRt+rHlYHQEJCjmWpP+78+unrmQHZa5AfBFEGWgLIpEJi+1qd3T8jcfHy3vGzALJWmvAUJnLHZAnkLYB5EAMgA/2I7J6NQygSkAAJEIMStoVJACOQAZAhHG2o5oLRuJyAKGUkJCJSYU93rvTRdwl7T7c1w5YQEAEpBRJADCRKVkEOEYN5EdtCPFrCLJJz2QGpEBJAkuYSUeQlLEoV8XmR0tIQSighhBJaE1JXVaFLqXscsFWstiulGq+D1f44Egu3htWBF0aOxNABN/YtxZWD4wHoKDC5sBr7MjrZA9D8MwvE4FfAABgAv9MndtQgRkj9y2oAAAAASUVORK5CYII=');
    this.load.image('energy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Rjk3RjkzNzYxMzEzMTFFQTlBMjVGQzJGQkMzOEEzOTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Rjk3RjkzNzcxMzEzMTFFQTlBMjVGQzJGQkMzOEEzOTMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGOTdGOTM3NDEzMTMxMUVBOUEyNUZDMkZCQzM4QTM5MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGOTdGOTM3NTEzMTMxMUVBOUEyNUZDMkZCQzM4QTM5MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhHr6CcAAAJkSURBVHjarJRLSFVREIaPd5U+sFQMSXtpUVFJSRTUoohoWS2CaGFEQUTbWrSQ2rQpIgnatAu6LVoEFQhFDxRK0jTt5uNmmXXzUZapee9/vmeOa8/NywU1xe/hP+fM/GfmzDlHicgkpZQTiiQNhsEcsASMQ78ZB/UDNqvKQqAJrDP/cI1jtlnt/2Mhz7qmrOj4ESKMTNrPdOE6kx5R7PDmO99BdbhnGG7onOmZMjkzAP60N4HJAkqAHzxlJ3QmA3qBKlJOFB6BDK/tMizwQJkq7f5Gh7Qi0DntL+GfkFoT0YGkEh42gxF1lM6CWtAKFUGxA0A5FYw2BxqU8YfC9D9aVXQ0KDcA2F98Pk2D9zHDzsJyQnMrwK3EfK/wFjwlbsJnMLObMnGC+K64DXSCVMN/BXNA6w+w2Kpoj2fwOugCbcRtqXFwo8i0O2sUe4J2OyuylLdX0G/5AjrAR9DoWU38Fo6BNnAw4gdtEbRoC+mCZrAdjDnuMFgInmh/hzWg1vQXPX++BTt0ZIEy3+9Kn7AQNIBl2l8GhZRtpLwxZdN7FRgG98AAYzrBAuIN5LYT3g0uEj+nzFNwDeTrHXGN/jTNzKXP7dBuMxiFbYoXeXbP8/a1Iq/lWgvWgjvM3Qnv1zSZtJ/PJVVW5HXAJ8s2xwqzV5lnKJx1/I6dX8Ir7e8ATcTzbflsjc/tZp6LF7ZyQDlooTw+dXYlabctpAua2LZUxz0B9nEPBJY3l/Hl91g5oAT2U34ZGKUvpv1a47uC8HZQN0kbJpOQW+TfAgwAL3nNSwGcMYgAAAAASUVORK5CYII=');
  }
  
  // Create game objects
  function create() {
    console.log("Creating game objects");
    
    // Listen for window resize
    window.addEventListener('resize', () => {
      game.scale.resize(window.innerWidth, window.innerHeight - 64);
    });
    
    // Set up the camera
    this.cameras.main.setBackgroundColor('#0f0f1a');
    
    // Create a grid background
    createGrid(this);
    
    // Create the player
    playerSprite = this.add.circle(400, 300, 20, 0x00aaff);
    
    // Create score text
    scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    scoreText.setScrollFactor(0);
    
    // Setup cursor keys for movement
    cursors = this.input.keyboard.createCursorKeys();
    
    // Setup socket events for game state updates
    if (socket) {
      socket.on('gameUpdate', (updatedState) => {
        gameState = updatedState;
        updateGameObjects(this);
      });
    }
    
    // Debug text
    this.add.text(16, 50, 'Player ID: ' + localPlayerId, { 
      fontSize: '16px', 
      fill: '#00ff00'
    }).setScrollFactor(0);
  }
  
  // Game update loop
  function update() {
    if (!socket || !playerSprite) return;
    
    // Mouse/touch movement - handle both click and drag
    const pointer = this.input.activePointer;
    
    if (pointer.isDown) {
      const angle = Phaser.Math.Angle.Between(
        playerSprite.x, 
        playerSprite.y,
        pointer.worldX, 
        pointer.worldY
      );
      
      // Send movement to server
      socket.emit('playerMovement', { angle });
      
      // For smoother visual feedback, you can also apply the movement locally
      // But the server update will eventually override this
      const speed = 5;
      playerSprite.x += Math.cos(angle) * speed;
      playerSprite.y += Math.sin(angle) * speed;
    }
    
    // Keyboard movement
    let dx = 0;
    let dy = 0;
    
    if (cursors.left.isDown) dx = -1;
    else if (cursors.right.isDown) dx = 1;
    
    if (cursors.up.isDown) dy = -1;
    else if (cursors.down.isDown) dy = 1;
    
    if (dx !== 0 || dy !== 0) {
      const angle = Math.atan2(dy, dx);
      socket.emit('playerMovement', { angle });
      
      // Local movement
      const speed = 5;
      playerSprite.x += Math.cos(angle) * speed;
      playerSprite.y += Math.sin(angle) * speed;
    }
  }
  
  // Helper function to create grid background
  function createGrid(scene) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, 0x333366, 0.3);
    
    const worldWidth = 3000;
    const worldHeight = 3000;
    const gridSize = 100;
    
    // Set world bounds
    scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    
    // Draw vertical lines
    for (let x = 0; x <= worldWidth; x += gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, worldHeight);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= worldHeight; y += gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(worldWidth, y);
    }
    
    graphics.strokePath();
  }
  
  // Helper function to update game objects based on game state
  function updateGameObjects(scene) {
    if (!gameState) return;
    
    // Update player position
    if (gameState.players && gameState.players[localPlayerId]) {
      const player = gameState.players[localPlayerId];
      playerSprite.setPosition(player.x, player.y);
      
      // Update camera to follow player
      scene.cameras.main.startFollow(playerSprite);
      
      // Update score
      scoreText.setText(`Score: ${Math.floor(player.energy)}`);
    }
    
    // Update or create other players
    if (gameState.players) {
      Object.entries(gameState.players).forEach(([id, data]) => {
        if (id === localPlayerId || !data) return;
        
        if (!otherPlayers[id]) {
          // Create new player sprite
          const color = Phaser.Display.Color.HexStringToColor(data.color || '#ff0000').color;
          otherPlayers[id] = scene.add.circle(data.x, data.y, 10 + (data.energy / 10), color);
          
          // Add player name
          scene.add.text(data.x, data.y - 30, data.name, {
            fontSize: '14px',
            fill: '#ffffff'
          }).setOrigin(0.5).setData('playerId', id);
        } else {
          // Update existing player
          otherPlayers[id].setPosition(data.x, data.y);
          otherPlayers[id].setRadius(10 + (data.energy / 10));
        }
      });
    }
    
    // Update or create resources
    if (gameState.energyParticles) {
      gameState.energyParticles.forEach((resource, index) => {
        if (!resources[index]) {
          resources[index] = scene.add.circle(
            resource.x, 
            resource.y, 
            5, 
            0x00ffff
          );
        } else {
          resources[index].setPosition(resource.x, resource.y);
        }
      });
    }
  }

  // Create the game
  game = new Phaser.Game(config);
  return game;
};

const destroyGame = () => {
  if (game) {
    game.destroy(true);
    game = null;
  }
};

export { initGame, destroyGame }; 