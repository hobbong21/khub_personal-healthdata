import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

// 인증 페이지 컴포넌트 (요구사항 1.1, 1.5)
export function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // 이미 인증된 사용자는 대시보드로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleSuccess = () => {
    // AuthContext에서 자동으로 리다이렉트 처리됨
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>개인 건강 플랫폼</h1>
          <p>당신의 건강을 체계적으로 관리하세요</p>
        </div>

        <div className="auth-content">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={handleSwitchMode}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchMode}
            />
          )}
        </div>

        <div className="auth-features">
          <h3>플랫폼 주요 기능</h3>
          <div className="features-grid">
            <div className="feature-item">
              <h4>건강 데이터 관리</h4>
              <p>바이탈 사인, 건강 일지, 운동 기록을 체계적으로 관리</p>
            </div>
            <div className="feature-item">
              <h4>BMI 자동 계산</h4>
              <p>키와 몸무게 입력 시 BMI를 자동으로 계산하고 분석</p>
            </div>
            <div className="feature-item">
              <h4>진료 기록 보관</h4>
              <p>병원 방문 내역과 처방전을 안전하게 보관</p>
            </div>
            <div className="feature-item">
              <h4>AI 건강 분석</h4>
              <p>머신러닝 기반 개인화된 건강 인사이트 제공</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;