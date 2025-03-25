import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/ApiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on first render
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const userData = await ApiService.getUser();
        setUser(userData);
      } catch (err) {
        console.error("Authentication error:", err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      await ApiService.register(userData);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login a user
  const login = async (credentials) => {
    try {
      const data = await ApiService.login(credentials);
      localStorage.setItem('token', data.token);
      const userData = await ApiService.getUser();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout a user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Fetch current user data
  const fetchUser = async () => {
    try {
      const userData = await ApiService.getUser();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 