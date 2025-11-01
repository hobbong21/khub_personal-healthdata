import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: '대시보드',
      path: '/dashboard',
      icon: '📊',
      badge: null
    },
    {
      id: 'health',
      label: '건강 데이터',
      path: '/health',
      icon: '💓',
      badge: '새로움',
      submenu: [
        { label: '바이탈 사인', path: '/health/vitals' },
        { label: '건강 일지', path: '/health/journal' },
        { label: '운동 기록', path: '/health/exercise' },
        { label: '수면 패턴', path: '/health/sleep' }
      ]
    },
    {
      id: 'medical',
      label: '진료 기록',
      path: '/medical-records',
      icon: '🏥',
      badge: null
    },
    {
      id: 'medication',
      label: '복약 관리',
      path: '/medication',
      icon: '💊',
      badge: '3',
      submenu: [
        { label: '복용 중인 약물', path: '/medication/current' },
        { label: '복용 일정', path: '/medication/schedule' },
        { label: '부작용 기록', path: '/medication/side-effects' },
        { label: '약물 상호작용', path: '/medication/interactions' }
      ]
    },
    {
      id: 'appointments',
      label: '병원 예약',
      path: '/appointments',
      icon: '📅',
      badge: null
    },
    {
      id: 'family-history',
      label: '가족력 관리',
      path: '/family-history',
      icon: '👨‍👩‍👧‍👦',
      badge: null
    },
    {
      id: 'genomics',
      label: '유전체 분석',
      path: '/genomics',
      icon: '🧬',
      badge: null,
      submenu: [
        { label: '유전자 데이터', path: '/genomics/data' },
        { label: '질병 위험도', path: '/genomics/risk' },
        { label: '약물 반응성', path: '/genomics/pharmacogenomics' }
      ]
    },
    {
      id: 'ai',
      label: 'AI 인사이트',
      path: '/ai-insights',
      icon: '🧠',
      badge: 'AI',
      submenu: [
        { label: '건강 예측', path: '/ai-insights/predictions' },
        { label: '맞춤 권장사항', path: '/ai-insights/recommendations' },
        { label: '이상 징후 감지', path: '/ai-insights/anomaly-detection' },
        { label: '건강 점수', path: '/ai-insights/health-score' }
      ]
    },
    {
      id: 'wearable',
      label: '웨어러블 기기',
      path: '/wearable',
      icon: '⌚',
      badge: null,
      submenu: [
        { label: '기기 관리', path: '/wearable/devices' },
        { label: '동기화 상태', path: '/wearable/sync' },
        { label: '데이터 분석', path: '/wearable/analytics' }
      ]
    },
    {
      id: 'nlp',
      label: 'AI 건강 어시스턴트',
      path: '/nlp',
      icon: '💬',
      badge: 'NLP',
      submenu: [
        { label: '건강 상담 챗봇', path: '/nlp/chatbot' },
        { label: '의료 문서 분석', path: '/nlp/documents' },
        { label: '증상 분석', path: '/nlp/symptoms' },
        { label: '사용 통계', path: '/nlp/stats' }
      ]
    },
    {
      id: 'profile',
      label: '프로필 관리',
      path: '/profile',
      icon: '👤',
      badge: null
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState<string[]>(['health', 'medication']);

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? '사이드바 확장' : '사이드바 축소'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
        
        {!isCollapsed && (
          <div className="sidebar-title">
            <h3>메뉴</h3>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <div className="nav-item-wrapper">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => item.submenu && toggleSubmenu(item.id)}
                >
                  <div className="nav-icon">
                    {item.icon}
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      
                      {item.badge && (
                        <span className={`nav-badge ${
                          item.badge === 'AI' ? 'ai' : 
                          item.badge === 'NLP' ? 'nlp' :
                          item.badge === '새로움' ? 'new' : 'count'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      
                      {item.submenu && (
                        <span className={`nav-arrow ${expandedMenus.includes(item.id) ? 'expanded' : ''}`}>
                          ▼
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {item.submenu && !isCollapsed && expandedMenus.includes(item.id) && (
                  <ul className="submenu">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.path} className="submenu-item">
                        <Link
                          to={subItem.path}
                          className={`submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                        >
                          <span className="submenu-dot">•</span>
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="health-summary">
            <h4>오늘의 건강</h4>
            <div className="health-stats">
              <div className="stat">
                <span className="stat-label">걸음 수</span>
                <span className="stat-value">8,432</span>
              </div>
              <div className="stat">
                <span className="stat-label">수분 섭취</span>
                <span className="stat-value">1.2L</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;