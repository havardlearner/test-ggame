import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const data = await fetchUser();
        setUserData(data);
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [fetchUser]);
  
  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>User Profile</h1>
        
        <div className="profile-info">
          <div className="info-group">
            <label>Username:</label>
            <span>{userData?.username}</span>
          </div>
          
          <div className="info-group">
            <label>Email:</label>
            <span>{userData?.email}</span>
          </div>
          
          <div className="info-group">
            <label>Member Since:</label>
            <span>{new Date(userData?.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="game-stats">
          <h2>Game Statistics</h2>
          <div className="stats-group">
            <label>High Score:</label>
            <span>{userData?.highScore || 0}</span>
          </div>
          
          <div className="stats-group">
            <label>Games Played:</label>
            <span>{userData?.gamesPlayed || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 