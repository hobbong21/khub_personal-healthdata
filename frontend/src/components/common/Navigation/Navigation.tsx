import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';
import { NavigationProps } from './Navigation.types';

export const Navigation: React.FC<NavigationProps> = ({ user }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: '📊', label: '대시보드' },
    { path: '/health/input', icon: '📝', label: '건강 데이터' },
    { path: '/medical-records', icon: '🏥', label: '진료 기록' },
    { path: '/medications', icon: '💊', label: '복약 관리' },
    { path: '/genomics', icon: '🧬', label: '유전체 분석' },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMobileMenuToggle();
    }
    if (e.key === 'Escape' && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className={styles.navbar} role="navigation" aria-label="주 네비게이션">
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo} aria-label="KnowledgeHub 홈으로 이동">
          <div className={styles.navLogoIcon} aria-hidden="true">🏥</div>
          <span>KnowledgeHub</span>
        </Link>

        <ul 
          className={`${styles.navMenu} ${isMobileMenuOpen ? styles.active : ''}`}
          role="menubar"
          aria-label="주 메뉴"
        >
          {navItems.map((item) => (
            <li key={item.path} className={styles.navItem} role="none">
              <Link
                to={item.path}
                className={`${styles.navLink} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
                role="menuitem"
                aria-label={`${item.label} 페이지로 이동`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.navActions} role="group" aria-label="추가 네비게이션">
          <Link 
            to="/about" 
            className={`${styles.navBtn} ${styles.navBtnOutline}`}
            aria-label="가이드 페이지로 이동"
          >
            <span aria-hidden="true">📚</span>
            <span>가이드</span>
          </Link>
          <Link 
            to="/" 
            className={`${styles.navBtn} ${styles.navBtnPrimary}`}
            aria-label="홈 페이지로 이동"
          >
            <span aria-hidden="true">🏠</span>
            <span>홈</span>
          </Link>
        </div>

        <button
          className={styles.mobileMenuToggle}
          onClick={handleMobileMenuToggle}
          onKeyDown={handleMobileMenuKeyDown}
          aria-label="모바일 메뉴 토글"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>
    </nav>
  );
};
