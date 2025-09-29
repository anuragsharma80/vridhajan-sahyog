import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './SessionTimeout.css';

const SessionTimeout = () => {
  // For testing: Use 2 minutes instead of 30 minutes
  // Change this back to 30 * 60 for production
  const TIMEOUT_DURATION = 30 * 60; // 2 minutes for testing, 30 * 60 for production
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_DURATION);
  const [showWarning, setShowWarning] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  // Debug: Log when component mounts
  useEffect(() => {
    console.log(`⏰ SessionTimeout component mounted - ${TIMEOUT_DURATION / 60} minute timer started`);
  }, [TIMEOUT_DURATION]);

  // Activity tracking
  const resetTimer = useCallback(() => {
    console.log(`🔄 Session timer reset to ${TIMEOUT_DURATION / 60} minutes`);
    setTimeLeft(TIMEOUT_DURATION); // Reset to timeout duration
    setShowWarning(false);
    setIsActive(true);
  }, [TIMEOUT_DURATION]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (isActive) {
      resetTimer();
    }
  }, [isActive, resetTimer]);

  // Logout function
  const handleLogout = useCallback(async () => {
    console.log('🚪 Session timeout - logging out user');
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear any stored tokens
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  // Extend session function
  const handleExtendSession = async () => {
    try {
      const response = await API.post('/auth/refresh');
      if (response.data.success) {
        resetTimer();
        setShowWarning(false);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Session extension error:', error);
      handleLogout();
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          
          // Show warning 30 seconds before timeout (or 1 minute for longer timeouts)
          const warningTime = TIMEOUT_DURATION > 5 * 60 ? 60 : 30;
          if (newTime === warningTime && !showWarning) {
            console.log(`⚠️ Session timeout warning - ${warningTime} seconds remaining`);
            setShowWarning(true);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      // Timeout reached, logout user
      handleLogout();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, showWarning, handleLogout, TIMEOUT_DURATION]);

  // Activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [handleActivity, TIMEOUT_DURATION]);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Don't render anything if not showing warning and not timed out
  const warningTime = TIMEOUT_DURATION > 5 * 60 ? 60 : 30;
  if (!showWarning && timeLeft > warningTime) {
    return null;
  }

  return (
    <div className="session-timeout-overlay">
      <div className="session-timeout-modal">
        <div className="session-timeout-header">
          <h3>⚠️ Session Timeout Warning</h3>
        </div>
        
        <div className="session-timeout-body">
          <p>
            You will be automatically logged out in{' '}
            <strong>{formatTime(timeLeft)}</strong> due to inactivity.
          </p>
          <p>Click "Stay Logged In" to continue your session.</p>
        </div>
        
        <div className="session-timeout-footer">
          <button 
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Logout Now
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleExtendSession}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;
