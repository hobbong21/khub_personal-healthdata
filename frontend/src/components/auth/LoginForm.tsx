import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types/user';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

// 로그인 폼 컴포넌트 (요구사항 1.1, 1.5)
export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // 에러 클리어
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    if (error) {
      clearError();
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      onSuccess?.();
    } catch (error) {
      // 에러는 AuthContext에서 처리됨
      console.error('로그인 실패:', error);
    }
  };

  return (
    <div className="login-form">
      <div className="form-header">
        <h2>로그인</h2>
        <p>건강 관리 플랫폼에 오신 것을 환영합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* 이메일 입력 */}
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={validationErrors.email ? 'error' : ''}
            placeholder="이메일을 입력하세요"
            disabled={isLoading}
          />
          {validationErrors.email && (
            <span className="error-message">{validationErrors.email}</span>
          )}
        </div>

        {/* 비밀번호 입력 */}
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={validationErrors.password ? 'error' : ''}
            placeholder="비밀번호를 입력하세요"
            disabled={isLoading}
          />
          {validationErrors.password && (
            <span className="error-message">{validationErrors.password}</span>
          )}
        </div>

        {/* 전체 에러 메시지 */}
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        {/* 회원가입 링크 */}
        <div className="form-footer">
          <p>
            계정이 없으신가요?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              회원가입
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;