import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [announcement, setAnnouncement] = useState({
    title: "Welcome to NanoBots.io",
    content: "Control your nanobot, collect energy particles, and compete with other players to dominate the nano-verse!",
    date: new Date().toLocaleDateString()
  });
  
  useEffect(() => {
    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
      try {
        // This would be a real API call in production
        // For now, use mock data
        const mockLeaderboard = [
          { id: 1, username: "NanoMaster", highScore: 9854, rank: 1 },
          { id: 2, username: "QuantumBot", highScore: 8721, rank: 2 },
          { id: 3, username: "MicroHunter", highScore: 7632, rank: 3 },
          { id: 4, username: "EnergySiphon", highScore: 6543, rank: 4 },
          { id: 5, username: "ByteCollector", highScore: 5421, rank: 5 },
        ];
        
        setTimeout(() => {
          setLeaderboard(mockLeaderboard);
          setIsLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);
  
  const handlePlayNow = () => {
    navigate('/game');
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="game-title">NanoBots<span className="io-text">.io</span></h1>
          <p className="game-tagline">Collect. Grow. Dominate.</p>
          
          <div className="cta-buttons">
            <button 
              className="play-button" 
              onClick={handlePlayNow}
            >
              Play Now
            </button>
            
            {!isAuthenticated ? (
              <div className="auth-buttons">
                <Link to="/login" className="auth-button login">
                  Login
                </Link>
                <Link to="/register" className="auth-button register">
                  Register
                </Link>
              </div>
            ) : (
              <Link to="/profile" className="profile-button">
                My Profile
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="home-content">
        <div className="content-section announcement-section">
          <h2 className="section-title">Announcement</h2>
          <div className="announcement-card">
            <h3>{announcement.title}</h3>
            <p>{announcement.content}</p>
            <span className="announcement-date">{announcement.date}</span>
          </div>
        </div>
        
        <div className="content-section leaderboard-section">
          <h2 className="section-title">Top Players</h2>
          {isLoading ? (
            <div className="loading">Loading leaderboard...</div>
          ) : (
            <div className="leaderboard">
              <div className="leaderboard-header">
                <span className="rank-col">Rank</span>
                <span className="player-col">Player</span>
                <span className="score-col">Score</span>
              </div>
              
              {leaderboard.map((player) => (
                <div key={player.id} className="leaderboard-row">
                  <span className="rank-col">{player.rank}</span>
                  <span className="player-col">{player.username}</span>
                  <span className="score-col">{player.highScore.toLocaleString()}</span>
                </div>
              ))}
              
              <Link to="/leaderboard" className="view-all">
                View Full Leaderboard
              </Link>
            </div>
          )}
        </div>
        
        <div className="content-section how-to-play-section">
          <h2 className="section-title">How To Play</h2>
          <div className="how-to-play-steps">
            <div className="step">
              <div className="step-icon">1</div>
              <h3>Control Your Nanobot</h3>
              <p>Use your mouse or keyboard arrows to move your nanobot around the arena.</p>
            </div>
            
            <div className="step">
              <div className="step-icon">2</div>
              <h3>Collect Energy</h3>
              <p>Gather energy particles to grow larger and stronger.</p>
            </div>
            
            <div className="step">
              <div className="step-icon">3</div>
              <h3>Compete</h3>
              <p>Rise through the ranks and dominate the leaderboard!</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="home-footer">
        <div className="footer-content">
          <p>&copy; 2023 NanoBots.io</p>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 