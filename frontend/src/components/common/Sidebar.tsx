import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import './Sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: string | null;
  submenu?: { label: string; path: string }[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['health', 'medication']);

  const menuItems: MenuItem[] = [
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
        { label: '건강 일지', path: '/health/journal' }
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
        { label: '복용 일정', path: '/medication/schedule' }
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
      badge: null
    },
    {
      id: 'recommendations',
      label: '맞춤 권장사항',
      path: '/recommendations',
      icon: '💡',
      badge: null
    },
    {
      id: 'ai',
      label: 'AI 인사이트',
      path: '/ai-insights',
      icon: '🧠',
      badge: 'AI'
    },
    {
      id: 'wearable',
      label: '웨어러블 기기',
      path: '/wearable',
      icon: '⌚',
      badge: null
    },
    {
      id: 'nlp',
      label: 'AI 어시스턴트',
      path: '/nlp',
      icon: '💬',
      badge: 'NLP'
    },
    {
      id: 'remote-monitoring',
      label: '원격 모니터링',
      path: '/remote-monitoring',
      icon: '📡',
      badge: 'Live'
    },
    {
      id: 'profile',
      label: '프로필 관리',
      path: '/profile',
      icon: '👤',
      badge: null
    }
  ];

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

  const isSubmenuActive = (submenu: { label: string; path: string }[]) => {
    return submenu.some(item => isActive(item.path));
  };

  return (
    <aside className={cn(
      'bg-primary border-r border-light h-full transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="p-4 border-b border-light">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-primary-600 hover:bg-secondary rounded-lg transition-colors"
          >
            <span className="text-lg">
              {isCollapsed ? '→' : '←'}
            </span>
            {!isCollapsed && (
              <span className="ml-2 text-sm font-medium">메뉴 접기</span>
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => (
              <div key={item.id}>
                {/* Main Menu Item */}
                <div className="relative">
                  {item.submenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                        isActive(item.path) || isSubmenuActive(item.submenu)
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-secondary hover:text-primary-600'
                      )}
                    >
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              'px-2 py-0.5 text-xs rounded-full font-medium',
                              item.badge === 'AI' || item.badge === 'NLP' 
                                ? 'bg-purple-100 text-purple-700'
                                : item.badge === 'Live'
                                ? 'bg-green-100 text-green-700'
                                : item.badge === '새로움'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            )}>
                              {item.badge}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {expandedMenus.includes(item.id) ? '▼' : '▶'}
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        isActive(item.path)
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-secondary hover:text-primary-600'
                      )}
                    >
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              'px-2 py-0.5 text-xs rounded-full font-medium',
                              item.badge === 'AI' || item.badge === 'NLP' 
                                ? 'bg-purple-100 text-purple-700'
                                : item.badge === 'Live'
                                ? 'bg-green-100 text-green-700'
                                : item.badge === '새로움'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && expandedMenus.includes(item.id) && !isCollapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive(subItem.path)
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-gray-600 hover:bg-secondary hover:text-primary-600'
                        )}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-light">
            <div className="text-xs text-gray-500 text-center">
              <div className="font-medium">K-hub v1.0</div>
              <div>개인 건강 플랫폼</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;