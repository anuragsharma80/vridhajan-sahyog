import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'member-entry',
      title: 'Member Entry',
      description: 'Add new members or update existing member information',
      icon: '👤',
      path: '/member-entry',
      color: '#3b82f6'
    },
    {
      id: 'member-list',
      title: 'Member List',
      description: 'View and manage all registered members',
      icon: '📋',
      path: '/member-list',
      color: '#10b981'
    },
    {
      id: 'receipt-entry',
      title: 'Receipt Entry',
      description: 'Record donations and generate receipts',
      icon: '💰',
      path: '/receipt-entry',
      color: '#f59e0b'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'View and export donation reports with advanced filtering',
      icon: '📊',
      path: '/reports',
      color: '#8b5cf6'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏛️ VRIDHAJAN SAHYOG</h1>
        <p className="dashboard-subtitle">Charitable Trust Management System</p>
        <p className="dashboard-welcome">Welcome to your dashboard. Select a module to get started.</p>
      </div>

      <div className="dashboard-grid">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="dashboard-card"
            onClick={() => handleMenuClick(item.path)}
            style={{ '--card-color': item.color }}
          >
            <div className="card-icon">
              {item.icon}
            </div>
            <div className="card-content">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-description">{item.description}</p>
            </div>
            <div className="card-arrow">
              →
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-footer">
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-label">System Status</span>
            <span className="stat-value">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔒</span>
            <span className="stat-label">Security</span>
            <span className="stat-value">Protected</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <span className="stat-label">Performance</span>
            <span className="stat-value">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
