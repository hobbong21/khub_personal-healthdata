import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">K-hub</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="건강 데이터, 약물, 병원 검색..."
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>
      
      <div className="header-right">
        <button className="notification-btn">
          🔔
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email || 'user@example.com'}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;