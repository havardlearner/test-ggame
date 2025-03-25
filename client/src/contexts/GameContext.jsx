import React, { createContext, useContext, useState } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStats, setGameStats] = useState({
    highScore: 0,
    currentScore: 0,
    rank: 0
  });
  const [socket, setSocket] = useState(null);
  
  // Start game
  const startGame = (playerName, playerColor) => {
    setIsPlaying(true);
    
    // Connect to game server
    const serverUrl = import.meta.env.VITE_APP_SERVER_URL || '';
    console.log('Connecting to game server at:', serverUrl ? `${serverUrl}/game` : '/socket.io/game');
    
    const newSocket = io(serverUrl ? `${serverUrl}/game` : '/socket.io/game', {
      transports: ['websocket'],
      path: serverUrl ? undefined : '/socket.io'
    });
    
    // Enhanced debugging
    console.log('Attempting to connect to game server at:', serverUrl || 'relative path');
    
    // Debug connection status
    newSocket.on('connect', () => {
      console.log('Connected to game server with socket ID:', newSocket.id);
      
      // Join game with player info
      newSocket.emit('join', { 
        name: playerName || 'Guest', 
        color: playerColor || '#00aaff' 
      });
      console.log('Sent join request with name:', playerName);
      
      // Listen for game events
      newSocket.on('initialState', (data) => {
        console.log('Received initial state:', data);
        setPlayerId(data.playerId);
        setGameState(data.gameState);
      });
      
      // Listen for game updates
      newSocket.on('gameUpdate', (updatedState) => {
        console.log('Received game update, players:', 
          Object.keys(updatedState.players).length,
          'resources:', updatedState.energyParticles?.length);
        setGameState(updatedState);
        
        // Update stats if player exists
        if (updatedState.players && playerId && updatedState.players[playerId]) {
          updateStats({
            currentScore: Math.floor(updatedState.players[playerId].energy)
          });
        }
      });
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });
    
    setSocket(newSocket);
  };
  
  // End game
  const endGame = () => {
    if (socket) {
      socket.disconnect();
    }
    setIsPlaying(false);
    setGameState(null);
    setPlayerId(null);
  };
  
  // Update game stats
  const updateStats = (newStats) => {
    setGameStats(prev => ({
      ...prev,
      ...newStats,
      highScore: Math.max(prev.highScore, newStats.currentScore || 0)
    }));
  };
  
  const value = {
    gameState,
    setGameState,
    playerId,
    setPlayerId,
    isPlaying,
    startGame,
    endGame,
    gameStats,
    updateStats,
    socket
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 