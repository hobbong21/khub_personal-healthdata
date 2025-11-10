import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgotPassword'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { login, register, requestPasswordReset } = useAuth();

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // 소셜 로그인 로직 (추후 구현)
    console.log(`${provider} 소셜 로그인 시도`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register({ name, email, password });
        setMessage('회원가입이 완료되었습니다. 로그인해주세요.');
        setMode('login');
      } else if (mode === 'forgotPassword') {
        await requestPasswordReset(email);
        setMessage('비밀번호 재설정 이메일을 발송했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">K-hub</span>
          </div>
          <h1>{
            mode === 'login' ? '로그인' : 
            mode === 'register' ? '회원가입' : '비밀번호 재설정'
          }</h1>
          <p>건강한 삶을 위한 첫 걸음을 시작하세요</p>
        </div>

        {message && <div className="message">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
              />
            </div>
          )}
          
          {(mode === 'login' || mode === 'register' || mode === 'forgotPassword') && (
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
          )}
          
          {(mode === 'login' || mode === 'register') && (
            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? '처리 중...' : 
              mode === 'login' ? '로그인' : 
              mode === 'register' ? '회원가입' : '재설정 이메일 발송'
            }
          </button>
        </form>

        {mode === 'login' && (
          <>
            <div className="social-login">
              <button className="social-btn google" onClick={() => handleSocialLogin('google')}>Continue with Google</button>
              <button className="social-btn apple" onClick={() => handleSocialLogin('apple')}>Continue with Apple</button>
            </div>
            <div className="forgot-password-link">
              <button onClick={() => setMode('forgotPassword')}>비밀번호를 잊으셨나요?</button>
            </div>
          </>
        )}

        <div className="auth-footer">
          <p>
            {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button 
              className="mode-switch-btn"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>

        <div className="demo-info">
          <h4>데모 계정</h4>
          <p>이메일: demo@khub.com</p>
          <p>비밀번호: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
