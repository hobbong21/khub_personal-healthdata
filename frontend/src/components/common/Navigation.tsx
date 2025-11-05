import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  FileText, 
  Pill, 
  Calendar, 
  Brain, 
  Users, 
  Dna, 
  Lightbulb, 
  User,
  Watch,
  Monitor,
  MessageSquare
} from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: '대시보드' },
    { path: '/health', icon: Activity, label: '건강 데이터' },
    { path: '/medical-records', icon: FileText, label: '진료 기록' },
    { path: '/medications', icon: Pill, label: '복약 관리' },
    { path: '/appointments', icon: Calendar, label: '병원 예약' },
    { path: '/ai-insights', icon: Brain, label: 'AI 인사이트' },
    { path: '/family-history', icon: Users, label: '가족력' },
    { path: '/genomics', icon: Dna, label: '유전체 분석' },
    { path: '/recommendations', icon: Lightbulb, label: '권장사항' },
    { path: '/wearable', icon: Watch, label: '웨어러블' },
    { path: '/remote-monitoring', icon: Monitor, label: '원격 모니터링' },
    { path: '/nlp', icon: MessageSquare, label: 'AI 상담' },
    { path: '/profile', icon: User, label: '내 프로필' }
  ];

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">건강 플랫폼</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;