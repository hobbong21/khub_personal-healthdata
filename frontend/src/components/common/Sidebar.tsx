import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const Sidebar = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      id: 'dashboard',
      label: '대시보드',
      path: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
        </svg>
      ),
      badge: null
    },
    {
      id: 'health',
      label: '건강 데이터',
      path: '/health',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      ),
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
      path: '/medical',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      badge: null,
      submenu: [
        { label: '진료 내역', path: '/medical/records' },
        { label: '검사 결과', path: '/medical/tests' },
        { label: '처방전', path: '/medical/prescriptions' },
        { label: '예약 관리', path: '/medical/appointments' }
      ]
    },
    {
      id: 'medication',
      label: '복약 관리',
      path: '/medication',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M10.5 2C9.67157 2 9 2.67157 9 3.5V4.5C9 5.32843 9.67157 6 10.5 6H13.5C14.3284 6 15 5.32843 15 4.5V3.5C15 2.67157 14.3284 2 13.5 2H10.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M12 6V22" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 10H16" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 14H16" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 18H16" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      badge: '3',
      submenu: [
        { label: '복용 중인 약물', path: '/medication/current' },
        { label: '복용 일정', path: '/medication/schedule' },
        { label: '부작용 기록', path: '/medication/side-effects' },
        { label: '약물 상호작용', path: '/medication/interactions' }
      ]
    },
    {
      id: 'genomics',
      label: '유전체 분석',
      path: '/genomics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      ),
      badge: null,
      submenu: [
        { label: '유전자 데이터', path: '/genomics/data' },
        { label: '질병 위험도', path: '/genomics/risk' },
        { label: '약물 반응성', path: '/genomics/pharmacogenomics' },
        { label: '가족력', path: '/genomics/family-history' }
      ]
    },
    {
      id: 'profile',
      label: '프로필 관리',
      path: '/profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      badge: null
    },
    {
      id: 'ai',
      label: 'AI 인사이트',
      path: '/ai',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9.663 17H4.5C3.11929 17 2 15.8807 2 14.5C2 13.1193 3.11929 12 4.5 12C4.55885 12 4.61725 12.0018 4.67508 12.0054C4.27671 11.2618 4.05 10.4006 4.05 9.5C4.05 6.46243 6.51243 4 9.55 4C12.0673 4 14.1925 5.69896 14.8299 8.02299C15.0399 8.00779 15.2526 8 15.4667 8C18.5041 8 21 10.4959 21 13.5333C21 16.5708 18.5041 19.0667 15.4667 19.0667H9.663V17Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M12 15L9 12L12 9" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M15 12H9" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      badge: 'AI',
      submenu: [
        { label: '건강 예측', path: '/ai/predictions' },
        { label: '맞춤 권장사항', path: '/ai/recommendations' },
        { label: '이상 징후 감지', path: '/ai/anomaly-detection' },
        { label: '건강 점수', path: '/ai/health-score' }
      ]
    }
  ]

  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard'])

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? '사이드바 확장' : '사이드바 축소'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        {!isCollapsed && (
          <div className="sidebar-title">
            <h3>메뉴</h3>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
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
                        <span className={`nav-badge ${item.badge === 'AI' ? 'ai' : item.badge === '새로움' ? 'new' : 'count'}`}>
                          {item.badge}
                        </span>
                      )}
                      
                      {item.submenu && (
                        <svg 
                          className={`nav-arrow ${expandedMenus.includes(item.id) ? 'expanded' : ''}`}
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none"
                        >
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </>
                  )}
                </Link>

                {/* Submenu */}
                {item.submenu && !isCollapsed && expandedMenus.includes(item.id) && (
                  <ul className="submenu">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.path} className="submenu-item">
                        <Link
                          to={subItem.path}
                          className={`submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                        >
                          <span className="submenu-dot"></span>
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

      {/* Sidebar Footer */}
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
  )
}

export default Sidebar