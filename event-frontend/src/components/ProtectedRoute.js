import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    console.log('🔒 ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  }, [isLoading, isAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ ProtectedRoute - Showing loading spinner');
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner">
          <div className="spinner"></div>
          <p>Checking authentication...</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            If this takes too long, check the browser console for errors
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return url
  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  console.log('✅ ProtectedRoute - Authenticated, rendering children');
  return children;
};

export default ProtectedRoute;
