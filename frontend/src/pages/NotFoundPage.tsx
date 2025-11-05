import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">페이지를 찾을 수 없습니다</h2>
        <p className="not-found-description">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="not-found-actions">
          <Link to="/dashboard" className="btn-primary">
            대시보드로 이동
          </Link>
          <Link to="/landing" className="btn-secondary">
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
