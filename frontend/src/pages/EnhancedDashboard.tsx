import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './EnhancedDashboard.css';

interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: string;
  icon: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
}

interface UpcomingEvent {
  id: string;
  type: 'appointment' | 'medication' | 'checkup';
  title: string;
  time: string;
  location?: string;
  status: 'upcoming' | 'today' | 'overdue';
}

const EnhancedDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [quickActions] = useState<QuickAction[]>([
    {
      id: '1',
      title: '바이탈 사인 기록',
      description: '혈압, 맥박, 체온 등을 기록하세요',
      icon: '💓',
      link: '/health',
      color: '#ff6b6b'
    },
    {
      id: '2',
      title: '복약 확인',
      description: '오늘의 복약 일정을 확인하세요',
      icon: '💊',
      link: '/medication',
      color: '#4ecdc4'
    },
    {
      id: '3',
      title: '병원 예약',
      description: '새로운 진료 예약을 잡으세요',
      icon: '🏥',
      link: '/appointments',
      color: '#45b7d1'
    },
    {
      id: '4',
      title: 'AI 인사이트',
      description: '개인화된 건강 분석을 확인하세요',
      icon: '🧠',
      link: '/ai-insights',
      color: '#96ceb4'
    }
  ]);

  const [upcomingEvents] = useState<UpcomingEvent[]>([
    {
      id: '1',
      type: 'appointment',
      title: '정기 검진',
      time: '오늘 오후 2:00',
      location: '서울대병원 내과',
      status: 'today'
    },
    {
      id: '2',
      type: 'medication',
      title: '혈압약 복용',
      time: '오늘 오후 6:00',
      status: 'upcoming'
    },
    {
      id: '3',
      type: 'checkup',
      title: '혈당 측정',
      time: '내일 오전 8:00',
      status: 'upcoming'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Mock health metrics data
    setHealthMetrics([
      {
        id: '1',
        name: '혈압',
        value: '120/80',
        unit: 'mmHg',
        status: 'good',
        trend: 'stable',
        change: '±0',
        icon: '🩺'
      },
      {
        id: '2',
        name: '심박수',
        value: '72',
        unit: 'bpm',
        status: 'good',
        trend: 'down',
        change: '-2',
        icon: '💓'
      },
      {
        id: '3',
        name: '체중',
        value: '68.5',
        unit: 'kg',
        status: 'good',
        trend: 'down',
        change: '-0.3',
        icon: '⚖️'
      },
      {
        id: '4',
        name: '혈당',
        value: '95',
        unit: 'mg/dL',
        status: 'good',
        trend: 'stable',
        change: '±2',
        icon: '🩸'
      }
    ]);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '좋은 오후입니다';
    return '좋은 저녁입니다';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#48bb78';
      case 'warning': return '#ed8936';
      case 'critical': return '#f56565';
      default: return '#718096';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  return (
    <div className="enhanced-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            {getGreeting()}, <span className="user-name">김건강</span>님! 👋
          </h1>
          <p className="welcome-subtitle">
            오늘도 건강한 하루 되세요. 현재 시간: {currentTime.toLocaleTimeString('ko-KR')}
          </p>
        </div>
        <div className="health-score-card">
          <div className="health-score">
            <div className="score-circle">
              <span className="score-number">85</span>
              <span className="score-label">점</span>
            </div>
            <div className="score-info">
              <h3>건강 점수</h3>
              <p className="score-status good">우수</p>
              <p className="score-change">+3점 (지난주 대비)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">빠른 실행</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <Link 
              key={action.id} 
              to={action.link} 
              className="quick-action-card"
              style={{ '--accent-color': action.color } as React.CSSProperties}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Health Metrics */}
        <div className="dashboard-card health-metrics-card">
          <div className="card-header">
            <h2>오늘의 건강 지표</h2>
            <Link to="/health" className="view-all-link">전체 보기</Link>
          </div>
          <div className="metrics-grid">
            {healthMetrics.map((metric) => (
              <div key={metric.id} className="metric-item">
                <div className="metric-icon">{metric.icon}</div>
                <div className="metric-info">
                  <h4>{metric.name}</h4>
                  <div className="metric-value">
                    <span className="value">{metric.value}</span>
                    <span className="unit">{metric.unit}</span>
                  </div>
                  <div className="metric-status">
                    <span 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(metric.status) }}
                    ></span>
                    <span className="trend">{getTrendIcon(metric.trend)} {metric.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-card events-card">
          <div className="card-header">
            <h2>다가오는 일정</h2>
            <Link to="/appointments" className="view-all-link">전체 보기</Link>
          </div>
          <div className="events-list">
            {upcomingEvents.map((event) => (
              <div key={event.id} className={`event-item ${event.status}`}>
                <div className="event-type-icon">
                  {event.type === 'appointment' && '🏥'}
                  {event.type === 'medication' && '💊'}
                  {event.type === 'checkup' && '📋'}
                </div>
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p className="event-time">{event.time}</p>
                  {event.location && <p className="event-location">{event.location}</p>}
                </div>
                <div className={`event-status-badge ${event.status}`}>
                  {event.status === 'today' && '오늘'}
                  {event.status === 'upcoming' && '예정'}
                  {event.status === 'overdue' && '지연'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Preview */}
        <div className="dashboard-card ai-insights-card">
          <div className="card-header">
            <h2>AI 건강 인사이트</h2>
            <Link to="/ai-insights" className="view-all-link">자세히 보기</Link>
          </div>
          <div className="insights-content">
            <div className="insight-item featured">
              <div className="insight-icon">🎯</div>
              <div className="insight-text">
                <h4>개인화된 권장사항</h4>
                <p>최근 데이터를 바탕으로 주 3회 유산소 운동을 권장합니다.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">⚠️</div>
              <div className="insight-text">
                <h4>주의사항</h4>
                <p>수면 패턴이 불규칙합니다. 일정한 수면 시간을 유지해보세요.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">📈</div>
              <div className="insight-text">
                <h4>개선 사항</h4>
                <p>지난 주 대비 활동량이 15% 증가했습니다. 좋은 추세입니다!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Trends Chart */}
        <div className="dashboard-card trends-card">
          <div className="card-header">
            <h2>건강 트렌드</h2>
            <div className="chart-controls">
              <button className="chart-period active">7일</button>
              <button className="chart-period">30일</button>
              <button className="chart-period">90일</button>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <div className="chart-line">
                <div className="chart-point" style={{ left: '10%', bottom: '60%' }}></div>
                <div className="chart-point" style={{ left: '25%', bottom: '65%' }}></div>
                <div className="chart-point" style={{ left: '40%', bottom: '70%' }}></div>
                <div className="chart-point" style={{ left: '55%', bottom: '68%' }}></div>
                <div className="chart-point" style={{ left: '70%', bottom: '75%' }}></div>
                <div className="chart-point" style={{ left: '85%', bottom: '80%' }}></div>
              </div>
              <div className="chart-labels">
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
                <span>일</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h2>최근 활동</h2>
            <Link to="/health" className="view-all-link">전체 보기</Link>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">💓</div>
              <div className="activity-info">
                <p><strong>혈압 측정</strong> - 120/80 mmHg</p>
                <span className="activity-time">2시간 전</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💊</div>
              <div className="activity-info">
                <p><strong>약물 복용</strong> - 혈압약</p>
                <span className="activity-time">4시간 전</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🚶</div>
              <div className="activity-info">
                <p><strong>운동 기록</strong> - 30분 걷기</p>
                <span className="activity-time">어제</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;