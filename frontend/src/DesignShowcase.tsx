import React, { useState } from 'react';
import './DesignShowcase.css';

const DesignShowcase: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'profile'>('landing');

  const renderLandingPreview = () => (
    <div className="design-preview landing-preview">
      <div className="preview-header">
        <h2>🏥 K-hub</h2>
        <nav className="preview-nav">
          <a href="#features">기능</a>
          <a href="#about">소개</a>
          <a href="#contact">문의</a>
          <button className="login-btn">로그인</button>
        </nav>
      </div>
      
      <div className="hero-section">
        <div className="hero-content">
          <h1>당신의 건강을 위한 <span className="highlight">스마트한 동반자</span></h1>
          <p>AI 기반 개인 맞춤형 건강 관리 플랫폼으로 평생 건강 데이터를 체계적으로 관리하고 질병을 예방하세요.</p>
          <div className="hero-buttons">
            <button className="btn-primary">무료로 시작하기</button>
            <button className="btn-secondary">데모 보기</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="mockup-content">
              <div className="mockup-card">💓 건강 지표</div>
              <div className="mockup-card">🧠 AI 분석</div>
              <div className="mockup-card">🏥 진료 기록</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2>주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>AI 기반 건강 분석</h3>
            <p>머신러닝으로 개인 맞춤형 건강 인사이트 제공</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧬</div>
            <h3>유전체 분석</h3>
            <p>개인 유전 정보 기반 질병 위험도 분석</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>웨어러블 연동</h3>
            <p>다양한 기기와 연동하여 실시간 데이터 수집</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardPreview = () => (
    <div className="design-preview dashboard-preview">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>좋은 아침입니다, <span className="user-name">김건강</span>님! 👋</h1>
          <p>오늘도 건강한 하루 되세요.</p>
        </div>
        <div className="health-score">
          <div className="score-circle">
            <span className="score-number">85</span>
            <span className="score-label">점</span>
          </div>
          <div className="score-info">
            <h3>건강 점수</h3>
            <p className="score-status">우수</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>빠른 실행</h2>
        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon">💓</div>
            <div className="action-content">
              <h3>바이탈 사인 기록</h3>
              <p>혈압, 맥박, 체온 등을 기록하세요</p>
            </div>
          </div>
          <div className="action-card">
            <div className="action-icon">💊</div>
            <div className="action-content">
              <h3>복약 확인</h3>
              <p>오늘의 복약 일정을 확인하세요</p>
            </div>
          </div>
          <div className="action-card">
            <div className="action-icon">🏥</div>
            <div className="action-content">
              <h3>병원 예약</h3>
              <p>새로운 진료 예약을 잡으세요</p>
            </div>
          </div>
          <div className="action-card">
            <div className="action-icon">🧠</div>
            <div className="action-content">
              <h3>AI 인사이트</h3>
              <p>개인화된 건강 분석을 확인하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>오늘의 건강 지표</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-icon">🩺</div>
              <div className="metric-info">
                <h4>혈압</h4>
                <span className="metric-value">120/80 mmHg</span>
                <span className="metric-status good">정상</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">💓</div>
              <div className="metric-info">
                <h4>심박수</h4>
                <span className="metric-value">72 bpm</span>
                <span className="metric-status good">정상</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>다가오는 일정</h3>
          <div className="events-list">
            <div className="event-item today">
              <div className="event-icon">🏥</div>
              <div className="event-info">
                <h4>정기 검진</h4>
                <p>오늘 오후 2:00 - 서울대병원</p>
              </div>
              <span className="event-badge">오늘</span>
            </div>
            <div className="event-item">
              <div className="event-icon">💊</div>
              <div className="event-info">
                <h4>혈압약 복용</h4>
                <p>오늘 오후 6:00</p>
              </div>
              <span className="event-badge">예정</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>AI 건강 인사이트</h3>
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon">🎯</div>
              <div className="insight-text">
                <h4>개인화된 권장사항</h4>
                <p>주 3회 유산소 운동을 권장합니다.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">📈</div>
              <div className="insight-text">
                <h4>개선 사항</h4>
                <p>활동량이 15% 증가했습니다!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfilePreview = () => (
    <div className="design-preview profile-preview">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">김</div>
        </div>
        <div className="profile-info">
          <h1>김건강</h1>
          <p>kim.health@example.com</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">나이</span>
              <span className="stat-value">34세</span>
            </div>
            <div className="stat">
              <span className="stat-label">BMI</span>
              <span className="stat-value">22.9</span>
            </div>
            <div className="stat">
              <span className="stat-label">혈액형</span>
              <span className="stat-value">A+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="tab active">개인 정보</button>
        <button className="tab">건강 정보</button>
        <button className="tab">생활 습관</button>
        <button className="tab">의료 기록</button>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>개인 정보</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>이름</label>
              <span>김건강</span>
            </div>
            <div className="info-item">
              <label>생년월일</label>
              <span>1990-05-15 (34세)</span>
            </div>
            <div className="info-item">
              <label>성별</label>
              <span>남성</span>
            </div>
            <div className="info-item">
              <label>전화번호</label>
              <span>010-1234-5678</span>
            </div>
          </div>
        </div>

        <div className="health-overview">
          <h3>건강 정보</h3>
          <div className="health-cards">
            <div className="health-card">
              <div className="health-icon">📏</div>
              <div className="health-info">
                <h4>키</h4>
                <span>175 cm</span>
              </div>
            </div>
            <div className="health-card">
              <div className="health-icon">⚖️</div>
              <div className="health-info">
                <h4>몸무게</h4>
                <span>70 kg</span>
              </div>
            </div>
            <div className="health-card">
              <div className="health-icon">🩸</div>
              <div className="health-info">
                <h4>혈액형</h4>
                <span>A+</span>
              </div>
            </div>
            <div className="health-card">
              <div className="health-icon">📊</div>
              <div className="health-info">
                <h4>BMI</h4>
                <span>22.9</span>
                <small className="bmi-status">정상</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="design-showcase">
      <div className="showcase-header">
        <h1>🏥 K-hub - 디자인 시연</h1>
        <p>새롭게 디자인된 메인페이지, 대시보드, 프로필 페이지를 확인해보세요</p>
      </div>

      <div className="view-selector">
        <button 
          className={`view-btn ${currentView === 'landing' ? 'active' : ''}`}
          onClick={() => setCurrentView('landing')}
        >
          🏠 랜딩 페이지
        </button>
        <button 
          className={`view-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          📊 대시보드
        </button>
        <button 
          className={`view-btn ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentView('profile')}
        >
          👤 프로필 페이지
        </button>
      </div>

      <div className="preview-container">
        {currentView === 'landing' && renderLandingPreview()}
        {currentView === 'dashboard' && renderDashboardPreview()}
        {currentView === 'profile' && renderProfilePreview()}
      </div>

      <div className="design-features">
        <h2>🎨 디자인 특징</h2>
        <div className="features-list">
          <div className="feature">
            <h3>🎯 사용자 중심 디자인</h3>
            <p>직관적인 네비게이션과 명확한 정보 구조로 사용자 경험 최적화</p>
          </div>
          <div className="feature">
            <h3>📱 반응형 디자인</h3>
            <p>모든 디바이스에서 완벽하게 작동하는 적응형 레이아웃</p>
          </div>
          <div className="feature">
            <h3>🎨 모던 UI/UX</h3>
            <p>최신 디자인 트렌드를 반영한 깔끔하고 세련된 인터페이스</p>
          </div>
          <div className="feature">
            <h3>🚀 성능 최적화</h3>
            <p>빠른 로딩과 부드러운 애니메이션으로 향상된 사용자 경험</p>
          </div>
        </div>
      </div>

      <div className="implementation-status">
        <h2>✅ 구현 현황</h2>
        <div className="status-grid">
          <div className="status-item completed">
            <span className="status-icon">✅</span>
            <span>랜딩 페이지 디자인</span>
          </div>
          <div className="status-item completed">
            <span className="status-icon">✅</span>
            <span>대시보드 리디자인</span>
          </div>
          <div className="status-item completed">
            <span className="status-icon">✅</span>
            <span>프로필 페이지 개선</span>
          </div>
          <div className="status-item completed">
            <span className="status-icon">✅</span>
            <span>반응형 레이아웃</span>
          </div>
          <div className="status-item in-progress">
            <span className="status-icon">🔄</span>
            <span>컴포넌트 통합</span>
          </div>
          <div className="status-item pending">
            <span className="status-icon">⏳</span>
            <span>애니메이션 추가</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignShowcase;