import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link" onClick={closeMobileMenu}>
            <span className="brand-icon">🏛️</span>
            <span className="brand-text">Vridhajan Sahyog</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          <Link to="/dashboard" className="nav-link">
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>
          <Link to="/member-entry" className="nav-link">
            <span className="nav-icon">👤</span>
            Member Entry
          </Link>
          <Link to="/member-list" className="nav-link">
            <span className="nav-icon">📋</span>
            Member List
          </Link>
          <Link to="/receipt-entry" className="nav-link">
            <span className="nav-icon">💰</span>
            Receipt Entry
          </Link>
          <Link to="/reports" className="nav-link">
            <span className="nav-icon">📊</span>
            Reports
          </Link>
        </div>

        {/* Desktop Logout */}
        <div className="navbar-actions desktop-actions">
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-content">
          <Link to="/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>
          <Link to="/member-entry" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span className="nav-icon">👤</span>
            Member Entry
          </Link>
          <Link to="/member-list" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span className="nav-icon">📋</span>
            Member List
          </Link>
          <Link to="/receipt-entry" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span className="nav-icon">💰</span>
            Receipt Entry
          </Link>
          <Link to="/reports" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span className="nav-icon">📊</span>
            Reports
          </Link>
          <button onClick={handleLogout} className="mobile-logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
