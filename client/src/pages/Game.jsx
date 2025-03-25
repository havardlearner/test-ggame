import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { initGame, destroyGame } from '../game/gameInit';
import ChatBox from '../components/ChatBox';
import './Game.css';

const Game = () => {
  const { user } = useAuth();
  const { 
    isPlaying, 
    startGame, 
    endGame, 
    gameStats, 
    playerId,
    socket
  } = useGame();
  
  const navigate = useNavigate();
  
  const [playerSettings, setPlayerSettings] = useState({
    playerName: user?.username || `Guest_${Math.floor(Math.random() * 1000)}`,
    playerColor: '#' + Math.floor(Math.random()*16777215).toString(16)
  });
  
  const handleSettingsChange = (e) => {
    setPlayerSettings({
      ...playerSettings,
      [e.target.name]: e.target.value
    });
  };
  
  const handleStartGame = () => {
    startGame(playerSettings.playerName, playerSettings.playerColor);
  };
  
  const handleEndGame = () => {
    endGame();
  };
  
  // Initialize the game when socket and playerId are available
  useEffect(() => {
    if (isPlaying && socket && playerId) {
      console.log('Initializing game with playerId:', playerId);
      const game = initGame(socket, playerId);
      
      return () => {
        destroyGame();
      };
    }
  }, [isPlaying, socket, playerId]);
  
  return (
    <div className="game-page">
      {!isPlaying ? (
        <div className="game-setup">
          <div className="settings-panel">
            <h2>Game Settings</h2>
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="playerName">Your Name</label>
                <input
                  type="text"
                  id="playerName"
                  name="playerName"
                  value={playerSettings.playerName}
                  onChange={handleSettingsChange}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="playerColor">NanoBot Color</label>
                <input
                  type="color"
                  id="playerColor"
                  name="playerColor"
                  value={playerSettings.playerColor}
                  onChange={handleSettingsChange}
                />
              </div>
              
              <button onClick={handleStartGame} className="start-button">
                Start Game
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div id="game-container" className="with-chat"></div>
          
          <ChatBox />
          
          <div className="game-overlay">
            <div className="game-stats">
              <p>Score: {gameStats.currentScore}</p>
              <p>High Score: {gameStats.highScore}</p>
            </div>
            <button onClick={handleEndGame} className="end-button">
              Exit Game
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Game; 