import { useState, useEffect } from 'react'

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="dashboard fade-in">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="dashboard-title">안녕하세요, 김건강님! 👋</h1>
            <p className="dashboard-subtitle">오늘도 건강한 하루 되세요</p>
          </div>
          <div className="time-section">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats grid grid-cols-4">
        <div className="stat-card">
          <div className="stat-icon health">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">98.6°F</div>
            <div className="stat-label">체온</div>
            <div className="stat-trend up">+0.2°F</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pressure">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">120/80</div>
            <div className="stat-label">혈압</div>
            <div className="stat-trend stable">정상</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon heart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61V4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">72 BPM</div>
            <div className="stat-label">심박수</div>
            <div className="stat-trend down">-3 BPM</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon weight">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">68.5kg</div>
            <div className="stat-label">체중</div>
            <div className="stat-trend up">+0.3kg</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content grid grid-cols-3">
        {/* Health Trends Chart */}
        <div className="card chart-card col-span-2">
          <div className="card-header">
            <h3>건강 트렌드</h3>
            <div className="chart-controls">
              <button className="btn btn-sm btn-secondary">7일</button>
              <button className="btn btn-sm btn-primary">30일</button>
              <button className="btn btn-sm btn-secondary">90일</button>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-placeholder">
              <div className="chart-mock">
                <svg width="100%" height="200" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,150 Q100,120 200,100 T400,80" stroke="var(--primary-600)" strokeWidth="3" fill="none"/>
                  <path d="M0,150 Q100,120 200,100 T400,80 L400,200 L0,200 Z" fill="url(#healthGradient)"/>
                  <circle cx="100" cy="120" r="4" fill="var(--primary-600)"/>
                  <circle cx="200" cy="100" r="4" fill="var(--primary-600)"/>
                  <circle cx="300" cy="90" r="4" fill="var(--primary-600)"/>
                  <circle cx="400" cy="80" r="4" fill="var(--primary-600)"/>
                </svg>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: 'var(--primary-600)'}}></div>
                  <span>전체 건강 점수</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="card tasks-card">
          <div className="card-header">
            <h3>오늘의 할 일</h3>
            <span className="task-count">3/5 완료</span>
          </div>
          <div className="card-body">
            <div className="task-list">
              <div className="task-item completed">
                <div className="task-checkbox checked">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="task-content">
                  <span className="task-title">아침 약 복용</span>
                  <span className="task-time">08:00 AM</span>
                </div>
              </div>

              <div className="task-item completed">
                <div className="task-checkbox checked">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="task-content">
                  <span className="task-title">혈압 측정</span>
                  <span className="task-time">09:30 AM</span>
                </div>
              </div>

              <div className="task-item completed">
                <div className="task-checkbox checked">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="task-content">
                  <span className="task-title">30분 산책</span>
                  <span className="task-time">11:00 AM</span>
                </div>
              </div>

              <div className="task-item">
                <div className="task-checkbox"></div>
                <div className="task-content">
                  <span className="task-title">점심 약 복용</span>
                  <span className="task-time">12:30 PM</span>
                </div>
              </div>

              <div className="task-item">
                <div className="task-checkbox"></div>
                <div className="task-content">
                  <span className="task-title">저녁 운동</span>
                  <span className="task-time">07:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="card records-card">
          <div className="card-header">
            <h3>최근 기록</h3>
            <button className="btn btn-sm btn-secondary">전체 보기</button>
          </div>
          <div className="card-body">
            <div className="record-list">
              <div className="record-item">
                <div className="record-icon vitals">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="record-content">
                  <span className="record-title">바이탈 사인 측정</span>
                  <span className="record-time">2시간 전</span>
                </div>
              </div>

              <div className="record-item">
                <div className="record-icon medication">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M10.5 2C9.67157 2 9 2.67157 9 3.5V4.5C9 5.32843 9.67157 6 10.5 6H13.5C14.3284 6 15 5.32843 15 4.5V3.5C15 2.67157 14.3284 2 13.5 2H10.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="record-content">
                  <span className="record-title">약물 복용 기록</span>
                  <span className="record-time">3시간 전</span>
                </div>
              </div>

              <div className="record-item">
                <div className="record-icon exercise">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6.5 6.5H17.5L19 8V16L17.5 17.5H6.5L5 16V8L6.5 6.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="record-content">
                  <span className="record-title">운동 기록</span>
                  <span className="record-time">어제</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Insights */}
        <div className="card insights-card">
          <div className="card-header">
            <h3>AI 건강 인사이트</h3>
            <span className="ai-badge">AI</span>
          </div>
          <div className="card-body">
            <div className="insight-list">
              <div className="insight-item positive">
                <div className="insight-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="insight-content">
                  <p>혈압이 안정적으로 유지되고 있습니다. 현재 생활 패턴을 계속 유지하세요.</p>
                </div>
              </div>

              <div className="insight-item warning">
                <div className="insight-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="insight-content">
                  <p>수면 시간이 부족합니다. 하루 7-8시간 수면을 권장합니다.</p>
                </div>
              </div>

              <div className="insight-item info">
                <div className="insight-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="insight-content">
                  <p>다음 정기 검진이 2주 후입니다. 미리 예약을 확인해보세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card actions-card">
          <div className="card-header">
            <h3>빠른 작업</h3>
          </div>
          <div className="card-body">
            <div className="action-grid">
              <button className="action-btn">
                <div className="action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>바이탈 기록</span>
              </button>

              <button className="action-btn">
                <div className="action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14.828 14.828L21 21M16.5 10.5C16.5 13.8137 13.8137 16.5 10.5 16.5C7.18629 16.5 4.5 13.8137 4.5 10.5C4.5 7.18629 7.18629 4.5 10.5 4.5C13.8137 4.5 16.5 7.18629 16.5 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>증상 검색</span>
              </button>

              <button className="action-btn">
                <div className="action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V8.5C3 7.39543 3.89543 6.5 5 6.5H19C20.1046 6.5 21 7.39543 21 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>예약 잡기</span>
              </button>

              <button className="action-btn">
                <div className="action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>약 복용 체크</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard