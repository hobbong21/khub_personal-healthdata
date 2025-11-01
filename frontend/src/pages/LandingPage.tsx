import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('individuals');

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#2563eb"/>
                  <path d="M16 8L20 12H18V20H14V12H12L16 8Z" fill="white"/>
                  <rect x="10" y="22" width="12" height="2" rx="1" fill="white"/>
                </svg>
              </div>
              <span className="logo-text">K-hub</span>
            </div>
          </div>
          
          <nav className="main-nav">
            <a href="#solutions" className="nav-link">Solutions</a>
            <a href="#platform" className="nav-link">Platform</a>
            <a href="#resources" className="nav-link">Resources</a>
            <a href="#company" className="nav-link">Company</a>
          </nav>
          
          <div className="header-actions">
            <Link to="/auth" className="login-link">Sign in</Link>
            <Link to="/auth" className="cta-button">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <span className="badge-text">AI-powered personalized healthcare</span>
            </div>
            
            <h1 className="hero-title">
              The future of<br />
              <span className="highlight">personal health management</span>
            </h1>
            
            <p className="hero-description">
              K-hub systematically collects and analyzes your personal health data<br />
              to provide tailored health management solutions through an integrated platform.
            </p>
            
            <div className="hero-buttons">
              <Link to="/auth" className="btn btn-primary">
                <span>Start for free</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <button className="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5 3L12 8L5 13V3Z" fill="currentColor"/>
                </svg>
                <span>Watch demo</span>
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Active users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Data security</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">AI monitoring</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="platform-preview">
              <div className="preview-window">
                <div className="window-header">
                  <div className="window-controls">
                    <span className="control red"></span>
                    <span className="control yellow"></span>
                    <span className="control green"></span>
                  </div>
                  <div className="window-title">K-hub Dashboard</div>
                </div>
                <div className="window-content">
                  <div className="dashboard-mockup">
                    <div className="sidebar-mock">
                      <div className="nav-item active">
                        <div className="nav-icon">📊</div>
                        <span>Dashboard</span>
                      </div>
                      <div className="nav-item">
                        <div className="nav-icon">💓</div>
                        <span>Health Data</span>
                      </div>
                      <div className="nav-item">
                        <div className="nav-icon">🏥</div>
                        <span>Medical Records</span>
                      </div>
                      <div className="nav-item">
                        <div className="nav-icon">💊</div>
                        <span>Medications</span>
                      </div>
                    </div>
                    <div className="main-content-mock">
                      <div className="health-cards">
                        <div className="health-card">
                          <div className="card-header">Blood Pressure</div>
                          <div className="card-value">120/80</div>
                          <div className="card-trend positive">↗ +2%</div>
                        </div>
                        <div className="health-card">
                          <div className="card-header">Heart Rate</div>
                          <div className="card-value">72 bpm</div>
                          <div className="card-trend stable">→ Normal</div>
                        </div>
                      </div>
                      <div className="chart-mock">
                        <div className="chart-header">Health Trends</div>
                        <div className="chart-lines">
                          <div className="chart-line"></div>
                          <div className="chart-line"></div>
                          <div className="chart-line"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="solutions-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">솔루션</span>
            <h2>모든 건강 관리 요구사항을<br />하나의 플랫폼에서</h2>
            <p>개인부터 의료기관까지, 다양한 사용자의 건강 관리 니즈를 충족하는 통합 솔루션</p>
          </div>
          
          <div className="solutions-tabs">
            <button 
              className={`tab-button ${activeTab === 'individuals' ? 'active' : ''}`}
              onClick={() => setActiveTab('individuals')}
            >
              개인 사용자
            </button>
            <button 
              className={`tab-button ${activeTab === 'healthcare' ? 'active' : ''}`}
              onClick={() => setActiveTab('healthcare')}
            >
              의료기관
            </button>
            <button 
              className={`tab-button ${activeTab === 'enterprise' ? 'active' : ''}`}
              onClick={() => setActiveTab('enterprise')}
            >
              기업
            </button>
          </div>
          
          <div className="solutions-content">
            {activeTab === 'individuals' && (
              <div className="solution-panel">
                <div className="solution-text">
                  <h3>개인 맞춤형 건강 관리</h3>
                  <p>AI 기반 분석으로 개인의 건강 패턴을 파악하고, 맞춤형 건강 관리 솔루션을 제공합니다.</p>
                  <ul className="feature-list">
                    <li>
                      <span className="check-icon">✓</span>
                      <span>실시간 바이탈 사인 모니터링</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>AI 기반 건강 예측 및 권장사항</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>통합 의료 기록 관리</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>스마트 복약 관리 시스템</span>
                    </li>
                  </ul>
                  <Link to="/auth" className="solution-cta">
                    개인 플랜 시작하기 →
                  </Link>
                </div>
                <div className="solution-visual">
                  <div className="phone-mockup">
                    <div className="phone-screen">
                      <div className="app-header">
                        <div className="status-bar">9:41 AM</div>
                        <div className="app-title">K-hub</div>
                      </div>
                      <div className="health-summary">
                        <div className="health-score">85</div>
                        <div className="health-status">Excellent</div>
                        <div className="health-trend">↗ +5% this week</div>
                      </div>
                      <div className="quick-actions">
                        <div className="action-item">
                          <div className="action-icon">💓</div>
                          <span>Record Vitals</span>
                        </div>
                        <div className="action-item">
                          <div className="action-icon">💊</div>
                          <span>Medications</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'healthcare' && (
              <div className="solution-panel">
                <div className="solution-text">
                  <h3>의료기관 통합 솔루션</h3>
                  <p>환자 데이터 통합 관리와 AI 기반 진단 지원으로 의료 서비스 품질을 향상시킵니다.</p>
                  <ul className="feature-list">
                    <li>
                      <span className="check-icon">✓</span>
                      <span>환자 데이터 통합 대시보드</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>AI 진단 지원 시스템</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>원격 환자 모니터링</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>의료진 협업 도구</span>
                    </li>
                  </ul>
                  <button className="solution-cta">
                    의료기관 상담 신청 →
                  </button>
                </div>
                <div className="solution-visual">
                  <div className="desktop-mockup">
                    <div className="desktop-screen">
                      <div className="medical-dashboard">
                        <div className="dashboard-header">
                          <h3>Patient Dashboard</h3>
                          <div className="search-bar">🔍 Search patients...</div>
                        </div>
                        <div className="dashboard-content">
                          <div className="patient-list">
                            <div className="patient-item active">
                              <div className="patient-avatar">JD</div>
                              <div className="patient-info">
                                <div className="patient-name">John Doe</div>
                                <div className="patient-status">Critical</div>
                              </div>
                            </div>
                            <div className="patient-item">
                              <div className="patient-avatar">SM</div>
                              <div className="patient-info">
                                <div className="patient-name">Sarah Miller</div>
                                <div className="patient-status">Stable</div>
                              </div>
                            </div>
                          </div>
                          <div className="patient-details">
                            <div className="vital-signs">
                              <div className="vital-item">
                                <span className="vital-label">BP</span>
                                <span className="vital-value">140/90</span>
                              </div>
                              <div className="vital-item">
                                <span className="vital-label">HR</span>
                                <span className="vital-value">85 bpm</span>
                              </div>
                            </div>
                            <div className="ai-insights">
                              <div className="insight-header">🤖 AI Insights</div>
                              <div className="insight-item">High BP detected - recommend medication review</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'enterprise' && (
              <div className="solution-panel">
                <div className="solution-text">
                  <h3>기업 건강 관리 플랫폼</h3>
                  <p>직원들의 건강 관리를 통해 생산성 향상과 의료비 절감을 실현합니다.</p>
                  <ul className="feature-list">
                    <li>
                      <span className="check-icon">✓</span>
                      <span>직원 건강 현황 대시보드</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>건강 검진 관리 시스템</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>웰니스 프로그램 운영</span>
                    </li>
                    <li>
                      <span className="check-icon">✓</span>
                      <span>의료비 분석 및 최적화</span>
                    </li>
                  </ul>
                  <button className="solution-cta">
                    기업 솔루션 문의 →
                  </button>
                </div>
                <div className="solution-visual">
                  <div className="tablet-mockup">
                    <div className="tablet-screen">
                      <div className="enterprise-dashboard">
                        <div className="dashboard-nav">
                          <div className="nav-tab active">Overview</div>
                          <div className="nav-tab">Programs</div>
                          <div className="nav-tab">Analytics</div>
                        </div>
                        <div className="employee-stats">
                          <div className="stat-box">
                            <div className="stat-title">Health Score</div>
                            <div className="stat-value">78%</div>
                          </div>
                          <div className="stat-box">
                            <div className="stat-title">Participation</div>
                            <div className="stat-value">92%</div>
                          </div>
                        </div>
                        <div className="wellness-programs">
                          <div className="program-item">
                            <div className="program-icon">🏃</div>
                            <div className="program-name">Fitness Challenge</div>
                            <div className="program-participants">245 participants</div>
                          </div>
                          <div className="program-item">
                            <div className="program-icon">🧘</div>
                            <div className="program-name">Mindfulness Sessions</div>
                            <div className="program-participants">128 participants</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">핵심 기능</span>
            <h2>건강 관리의 모든 것을<br />하나의 플랫폼에서</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <div className="feature-content">
                <h3>AI 건강 분석</h3>
                <p>머신러닝 기반 개인 맞춤형 건강 인사이트와 질병 예측 서비스</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🧬</div>
              <div className="feature-content">
                <h3>유전체 분석</h3>
                <p>개인 유전 정보 기반 질병 위험도 평가 및 약물 반응성 분석</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <div className="feature-content">
                <h3>웨어러블 연동</h3>
                <p>다양한 웨어러블 기기와 연동하여 실시간 건강 데이터 수집</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏥</div>
              <div className="feature-content">
                <h3>통합 의료 기록</h3>
                <p>모든 진료 기록과 검사 결과를 체계적으로 관리하는 통합 시스템</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💊</div>
              <div className="feature-content">
                <h3>스마트 복약 관리</h3>
                <p>약물 상호작용 경고와 복약 알림으로 안전한 복약 지원</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <div className="feature-content">
                <h3>의료급 보안</h3>
                <p>HIPAA 준수 및 최고 수준의 암호화로 개인 건강 정보 보호</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="platform-section">
        <div className="container">
          <div className="platform-content">
            <div className="platform-text">
              <span className="section-badge">플랫폼</span>
              <h2>통합된 건강 관리<br />생태계</h2>
              <p>
                K-hub는 개인의 건강 여정 전반을 지원하는 포괄적인 플랫폼입니다. 
                데이터 수집부터 분석, 실행까지 모든 과정을 하나의 통합된 환경에서 제공합니다.
              </p>
              
              <div className="platform-features">
                <div className="platform-feature">
                  <div className="feature-icon-small">📊</div>
                  <div className="feature-text">
                    <h4>실시간 데이터 수집</h4>
                    <p>웨어러블 기기와 의료 기관에서 자동으로 데이터를 수집합니다.</p>
                  </div>
                </div>
                
                <div className="platform-feature">
                  <div className="feature-icon-small">🧠</div>
                  <div className="feature-text">
                    <h4>AI 기반 분석</h4>
                    <p>머신러닝으로 개인 건강 패턴을 분석하고 예측합니다.</p>
                  </div>
                </div>
                
                <div className="platform-feature">
                  <div className="feature-icon-small">🎯</div>
                  <div className="feature-text">
                    <h4>맞춤형 권장사항</h4>
                    <p>개인의 특성에 맞는 건강 관리 방법을 제안합니다.</p>
                  </div>
                </div>
              </div>
              
              <Link to="/auth" className="platform-cta">
                플랫폼 체험하기 →
              </Link>
            </div>
            
            <div className="platform-visual">
              <div className="ecosystem-diagram">
                <div className="center-hub">
                  <div className="hub-icon">🏥</div>
                  <div className="hub-label">K-hub</div>
                </div>
                
                <div className="connection-node node-1">
                  <div className="node-icon">📱</div>
                  <div className="node-label">웨어러블</div>
                </div>
                
                <div className="connection-node node-2">
                  <div className="node-icon">🏥</div>
                  <div className="node-label">병원</div>
                </div>
                
                <div className="connection-node node-3">
                  <div className="node-icon">🧬</div>
                  <div className="node-label">유전체</div>
                </div>
                
                <div className="connection-node node-4">
                  <div className="node-icon">🤖</div>
                  <div className="node-label">AI 분석</div>
                </div>
                
                <svg className="connections" viewBox="0 0 300 300">
                  <line x1="150" y1="150" x2="75" y2="75" stroke="#4299e1" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite"/>
                  </line>
                  <line x1="150" y1="150" x2="225" y2="75" stroke="#4299e1" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite"/>
                  </line>
                  <line x1="150" y1="150" x2="75" y2="225" stroke="#4299e1" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite"/>
                  </line>
                  <line x1="150" y1="150" x2="225" y2="225" stroke="#4299e1" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite"/>
                  </line>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">활성 사용자</div>
              <div className="stat-description">전 세계 사용자들이 K-hub로 건강을 관리하고 있습니다</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">1M+</div>
              <div className="stat-label">건강 데이터 포인트</div>
              <div className="stat-description">매일 수집되는 건강 데이터로 더 정확한 분석을 제공합니다</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <div className="stat-label">예측 정확도</div>
              <div className="stat-description">AI 모델의 높은 정확도로 신뢰할 수 있는 건강 예측을 제공합니다</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">실시간 모니터링</div>
              <div className="stat-description">언제나 당신의 건강을 지켜보는 스마트 모니터링 시스템</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">고객 후기</span>
            <h2>사용자들이 말하는<br />K-hub의 가치</h2>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"K-hub 덕분에 혈압 관리가 훨씬 쉬워졌어요. AI가 제안하는 생활습관 개선 방법이 정말 도움이 됩니다."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">김</div>
                <div className="author-info">
                  <div className="author-name">김○○</div>
                  <div className="author-role">고혈압 환자, 55세</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"유전체 분석 결과를 바탕으로 한 맞춤형 건강 관리 계획이 인상적이었습니다. 예방 의학의 미래를 보는 것 같아요."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">박</div>
                <div className="author-info">
                  <div className="author-name">박○○</div>
                  <div className="author-role">의사, 42세</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"복약 관리 기능이 정말 유용해요. 약물 상호작용 경고와 복용 알림 덕분에 안전하게 약을 복용할 수 있어요."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">이</div>
                <div className="author-info">
                  <div className="author-name">이○○</div>
                  <div className="author-role">당뇨병 환자, 38세</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>더 건강한 미래를<br />지금 시작하세요</h2>
              <p>K-hub와 함께 개인 맞춤형 건강 관리의 새로운 경험을 시작해보세요.</p>
            </div>
            <div className="cta-actions">
              <Link to="/auth" className="btn btn-primary btn-large">
                무료로 시작하기
                <span className="btn-arrow">→</span>
              </Link>
              <button className="btn btn-secondary btn-large">
                상담 신청하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>K-hub</h4>
              <p>AI 기반 맞춤형 건강 관리의 새로운 표준</p>
            </div>
            <div className="footer-section">
              <h4>제품</h4>
              <ul>
                <li><a href="#features">기능</a></li>
                <li><a href="#pricing">요금제</a></li>
                <li><a href="#security">보안</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>지원</h4>
              <ul>
                <li><a href="#help">도움말</a></li>
                <li><a href="#contact">문의하기</a></li>
                <li><a href="#api">API 문서</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>회사</h4>
              <ul>
                <li><a href="#about">회사 소개</a></li>
                <li><a href="#privacy">개인정보처리방침</a></li>
                <li><a href="#terms">이용약관</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 K-hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;