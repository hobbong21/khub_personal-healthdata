import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <header className="bg-primary border-b border-light shadow-sm sticky top-0 z-fixed">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
              🏥
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">K-hub</h1>
              <p className="text-xs text-secondary">개인 건강 플랫폼</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="건강 데이터, 약물, 병원 검색..."
                className="input pl-10 pr-4"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </form>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <div className="text-xl">🔔</div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-primary">{user?.name || 'User'}</div>
                  <div className="text-xs text-secondary">{user?.email || 'user@example.com'}</div>
                </div>
                <div className="text-gray-400">
                  {isUserMenuOpen ? '▲' : '▼'}
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-primary border border-light rounded-lg shadow-lg py-2 z-dropdown">
                  <div className="px-4 py-2 border-b border-light">
                    <div className="font-medium text-primary">{user?.name || 'User'}</div>
                    <div className="text-sm text-secondary">{user?.email || 'user@example.com'}</div>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-secondary transition-colors">
                    👤 프로필 설정
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-secondary transition-colors">
                    ⚙️ 환경 설정
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-secondary transition-colors">
                    🔒 개인정보 보호
                  </button>
                  
                  <div className="border-t border-light mt-2 pt-2">
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-red-50 transition-colors"
                    >
                      🚪 로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;