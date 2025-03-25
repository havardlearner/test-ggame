import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  // DEVELOPMENT BYPASS: Comment this out when authentication is working
  return children;
  
  // Original protection logic (uncomment when ready)
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }
  
  // return children;
};

export default ProtectedRoute; 