import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest, LifestyleHabits } from '../../types/user';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

// 회원가입 폼 컴포넌트 (요구사항 1.1, 1.2, 1.3, 1.5)
export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    name: '',
    birthDate: '',
    gender: 'male',
    bloodType: '',
    height: undefined,
    weight: undefined,
    lifestyleHabits: {
      smoking: false,
      alcohol: 'none',
      exerciseFrequency: 0,
      dietType: '',
    },
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('lifestyleHabits.')) {
      const habitKey = name.split('.')[1] as keyof LifestyleHabits;
      setFormData(prev => ({
        ...prev,
        lifestyleHabits: {
          ...prev.lifestyleHabits!,
          [habitKey]: type === 'checkbox' 
            ? (e.target as HTMLInputElement).checked
            : habitKey === 'exerciseFrequency' 
              ? parseInt(value) || 0
              : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value,
      }));
    }

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

  // 1단계 유효성 검사 (기본 정보)
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      errors.password = '비밀번호는 최소 8자 이상이어야 합니다';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다';
    }

    if (!formData.name) {
      errors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      errors.name = '이름은 최소 2자 이상이어야 합니다';
    }

    if (!formData.birthDate) {
      errors.birthDate = '생년월일을 입력해주세요';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 2단계 유효성 검사 (신체 정보)
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.height && (formData.height < 50 || formData.height > 300)) {
      errors.height = '키는 50cm에서 300cm 사이여야 합니다';
    }

    if (formData.weight && (formData.weight < 10 || formData.weight > 500)) {
      errors.weight = '몸무게는 10kg에서 500kg 사이여야 합니다';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 3단계 유효성 검사 (생활습관)
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.lifestyleHabits?.exerciseFrequency !== undefined) {
      if (formData.lifestyleHabits.exerciseFrequency < 0 || formData.lifestyleHabits.exerciseFrequency > 14) {
        errors['lifestyleHabits.exerciseFrequency'] = '주당 운동 횟수는 0회에서 14회 사이여야 합니다';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 다음 단계로 이동
  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 이전 단계로 이동
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    try {
      await register(formData);
      onSuccess?.();
    } catch (error) {
      console.error('회원가입 실패:', error);
    }
  };

  // 1단계: 기본 정보 (요구사항 1.1, 1.2)
  const renderStep1 = () => (
    <div className="form-step">
      <h3>기본 정보</h3>
      
      <div className="form-group">
        <label htmlFor="email">이메일 *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={validationErrors.email ? 'error' : ''}
          placeholder="이메일을 입력하세요"
        />
        {validationErrors.email && (
          <span className="error-message">{validationErrors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">비밀번호 *</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={validationErrors.password ? 'error' : ''}
          placeholder="비밀번호를 입력하세요"
        />
        {validationErrors.password && (
          <span className="error-message">{validationErrors.password}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="name">이름 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={validationErrors.name ? 'error' : ''}
          placeholder="이름을 입력하세요"
        />
        {validationErrors.name && (
          <span className="error-message">{validationErrors.name}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="birthDate">생년월일 *</label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className={validationErrors.birthDate ? 'error' : ''}
        />
        {validationErrors.birthDate && (
          <span className="error-message">{validationErrors.birthDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="gender">성별 *</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="other">기타</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="bloodType">혈액형</label>
        <select
          id="bloodType"
          name="bloodType"
          value={formData.bloodType}
          onChange={handleChange}
        >
          <option value="">선택하세요</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </div>
    </div>
  );

  // 2단계: 신체 정보 (요구사항 1.2, 1.4)
  const renderStep2 = () => (
    <div className="form-step">
      <h3>신체 정보</h3>
      <p className="step-description">키와 몸무게를 입력하면 BMI를 자동으로 계산해드립니다.</p>
      
      <div className="form-group">
        <label htmlFor="height">키 (cm)</label>
        <input
          type="number"
          id="height"
          name="height"
          value={formData.height || ''}
          onChange={handleChange}
          className={validationErrors.height ? 'error' : ''}
          placeholder="키를 입력하세요"
          min="50"
          max="300"
        />
        {validationErrors.height && (
          <span className="error-message">{validationErrors.height}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="weight">몸무게 (kg)</label>
        <input
          type="number"
          id="weight"
          name="weight"
          value={formData.weight || ''}
          onChange={handleChange}
          className={validationErrors.weight ? 'error' : ''}
          placeholder="몸무게를 입력하세요"
          min="10"
          max="500"
          step="0.1"
        />
        {validationErrors.weight && (
          <span className="error-message">{validationErrors.weight}</span>
        )}
      </div>

      {/* BMI 미리보기 */}
      {formData.height && formData.weight && (
        <div className="bmi-preview">
          <p>예상 BMI: {((formData.weight / ((formData.height / 100) ** 2))).toFixed(1)}</p>
        </div>
      )}
    </div>
  );

  // 3단계: 생활습관 (요구사항 1.3)
  const renderStep3 = () => (
    <div className="form-step">
      <h3>생활습관 정보</h3>
      <p className="step-description">더 정확한 건강 분석을 위해 생활습관 정보를 입력해주세요.</p>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="lifestyleHabits.smoking"
            checked={formData.lifestyleHabits?.smoking || false}
            onChange={handleChange}
          />
          흡연
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="alcohol">음주 수준</label>
        <select
          id="alcohol"
          name="lifestyleHabits.alcohol"
          value={formData.lifestyleHabits?.alcohol || 'none'}
          onChange={handleChange}
        >
          <option value="none">금주</option>
          <option value="light">가끔 (주 1-2회)</option>
          <option value="moderate">보통 (주 3-4회)</option>
          <option value="heavy">자주 (주 5회 이상)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="exerciseFrequency">주당 운동 횟수</label>
        <input
          type="number"
          id="exerciseFrequency"
          name="lifestyleHabits.exerciseFrequency"
          value={formData.lifestyleHabits?.exerciseFrequency || 0}
          onChange={handleChange}
          className={validationErrors['lifestyleHabits.exerciseFrequency'] ? 'error' : ''}
          min="0"
          max="14"
        />
        {validationErrors['lifestyleHabits.exerciseFrequency'] && (
          <span className="error-message">{validationErrors['lifestyleHabits.exerciseFrequency']}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="dietType">식단 유형</label>
        <input
          type="text"
          id="dietType"
          name="lifestyleHabits.dietType"
          value={formData.lifestyleHabits?.dietType || ''}
          onChange={handleChange}
          placeholder="예: 균형잡힌 식단, 채식주의, 저탄수화물 등"
        />
      </div>
    </div>
  );

  return (
    <div className="register-form">
      <div className="form-header">
        <h2>회원가입</h2>
        <div className="step-indicator">
          <span className={currentStep >= 1 ? 'active' : ''}>1</span>
          <span className={currentStep >= 2 ? 'active' : ''}>2</span>
          <span className={currentStep >= 3 ? 'active' : ''}>3</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* 전체 에러 메시지 */}
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="secondary-button"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              이전
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              className="primary-button"
              onClick={handleNext}
              disabled={isLoading}
            >
              다음
            </button>
          ) : (
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? '가입 중...' : '회원가입 완료'}
            </button>
          )}
        </div>

        {/* 로그인 링크 */}
        <div className="form-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              로그인
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;