import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="logo">🏥 Health Hub</div>
          <div className="nav-links">
            <button onClick={() => navigate('/features')}>기능</button>
            <button onClick={() => navigate('/about')}>소개</button>
            <button onClick={() => navigate('/contact')}>문의</button>
            <button onClick={() => navigate('/login')} className="btn-primary">로그인</button>
          </div>
        </nav>
      </header>

      <section className="hero">
        <h1>당신의 건강을 스마트하게 관리하세요</h1>
        <p>AI 기반 개인 맞춤형 건강 관리 플랫폼</p>
        <div className="hero-buttons">
          <button onClick={() => navigate('/register')} className="btn-large btn-primary">
            무료로 시작하기
          </button>
          <button onClick={() => navigate('/features')} className="btn-large btn-secondary">
            더 알아보기
          </button>
        </div>
      </section>

      <section className="features-preview">
        <h2>주요 기능</h2>
        <div className="feature-grid">
          <div className="feature-card" onClick={() => navigate('/dashboard')}>
            <div className="feature-icon">📊</div>
            <h3>건강 대시보드</h3>
            <p>한눈에 보는 건강 지표</p>
          </div>
          <div className="feature-card" onClick={() => navigate('/health/vitals')}>
            <div className="feature-icon">❤️</div>
            <h3>바이탈 추적</h3>
            <p>혈압, 맥박, 체중 관리</p>
          </div>
          <div className="feature-card" onClick={() => navigate('/ai-insights')}>
            <div className="feature-icon">🤖</div>
            <h3>AI 분석</h3>
            <p>맞춤형 건강 인사이트</p>
          </div>
          <div className="feature-card" onClick={() => navigate('/medications')}>
            <div className="feature-icon">💊</div>
            <h3>복약 관리</h3>
            <p>스마트 복약 알림</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2024 Health Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
