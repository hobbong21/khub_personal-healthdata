import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo" aria-label="사이트 푸터">
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          {/* About Section */}
          <div className={`${styles.footerSection} ${styles.footerAbout}`}>
            <h3><span aria-hidden="true">🏥</span> KnowledgeHub</h3>
            <p>
              AI와 유전체 분석을 활용한 차세대 개인 건강 관리 플랫폼.
              당신의 건강 데이터를 하나로 통합하고, 맞춤형 인사이트를 제공합니다.
            </p>
            <div className={styles.footerSocial} role="group" aria-label="소셜 미디어 링크">
              <a href="#" className={styles.socialLink} aria-label="Facebook 페이지로 이동">
                <span aria-hidden="true">📘</span>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter 페이지로 이동">
                <span aria-hidden="true">🐦</span>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram 페이지로 이동">
                <span aria-hidden="true">📷</span>
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn 페이지로 이동">
                <span aria-hidden="true">💼</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav className={styles.footerSection} aria-label="빠른 링크">
            <h3>빠른 링크</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link to="/dashboard" aria-label="대시보드 페이지로 이동">
                  <span aria-hidden="true">📊</span> 대시보드
                </Link>
              </li>
              <li>
                <Link to="/health/input" aria-label="건강 데이터 페이지로 이동">
                  <span aria-hidden="true">📝</span> 건강 데이터
                </Link>
              </li>
              <li>
                <Link to="/medical-records" aria-label="진료 기록 페이지로 이동">
                  <span aria-hidden="true">🏥</span> 진료 기록
                </Link>
              </li>
              <li>
                <Link to="/medications" aria-label="복약 관리 페이지로 이동">
                  <span aria-hidden="true">💊</span> 복약 관리
                </Link>
              </li>
              <li>
                <Link to="/genomics" aria-label="유전체 분석 페이지로 이동">
                  <span aria-hidden="true">🧬</span> 유전체 분석
                </Link>
              </li>
            </ul>
          </nav>

          {/* Resources */}
          <nav className={styles.footerSection} aria-label="리소스">
            <h3>리소스</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link to="/about" aria-label="사용 가이드 페이지로 이동">
                  <span aria-hidden="true">📚</span> 사용 가이드
                </Link>
              </li>
              <li>
                <Link to="/features" aria-label="자주 묻는 질문 페이지로 이동">
                  <span aria-hidden="true">❓</span> FAQ
                </Link>
              </li>
              <li>
                <Link to="/about" aria-label="회사 소개 페이지로 이동">
                  <span aria-hidden="true">ℹ️</span> 회사 소개
                </Link>
              </li>
              <li>
                <Link to="/contact" aria-label="문의하기 페이지로 이동">
                  <span aria-hidden="true">📧</span> 문의하기
                </Link>
              </li>
              <li>
                <a href="#" aria-label="개인정보처리방침 보기">
                  <span aria-hidden="true">🔒</span> 개인정보처리방침
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className={styles.footerSection}>
            <h3>연락처</h3>
            <ul className={styles.footerLinks} role="list">
              <li>
                <a href="mailto:contact@knowledgehub.com" aria-label="이메일로 문의하기">
                  <span aria-hidden="true">📧</span> contact@knowledgehub.com
                </a>
              </li>
              <li>
                <a href="tel:02-1234-5678" aria-label="전화로 문의하기">
                  <span aria-hidden="true">📞</span> 02-1234-5678
                </a>
              </li>
              <li>
                <a href="#" aria-label="주소 보기">
                  <span aria-hidden="true">📍</span> 서울시 강남구 테헤란로 123
                </a>
              </li>
              <li>
                <span aria-label="운영 시간">
                  <span aria-hidden="true">⏰</span> 평일 09:00 - 18:00
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <div>© {currentYear} KnowledgeHub. All rights reserved.</div>
          <div className={styles.footerBottomLinks}>
            <Link to="/terms">이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
            <Link to="/cookies">쿠키 정책</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
