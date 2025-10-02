import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fallback timer to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ AuthContext - Fallback timer triggered, stopping loading');
        setIsLoading(false);
      }
    }, 10000); // 10 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [isLoading]);

  // Check authentication status on app startup
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Checking authentication status...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication check timeout')), 5000)
      );
      
      // Make a request to a protected endpoint to check if user is authenticated
      const response = await Promise.race([
        API.get('/auth/verify'),
        timeoutPromise
      ]);
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.data.user);
        console.log('✅ User is authenticated:', response.data.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('❌ User is not authenticated');
      }
    } catch (error) {
      console.log('❌ Authentication check failed:', error.message || error.response?.status);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.data.user);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      
      if (response.data.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Check auth status on mount
  useEffect(() => {
    // Add a small delay to ensure the app can render first
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Set up API interceptor to handle authentication state changes
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          setIsAuthenticated(false);
          setUser(null);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
