import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UpdateProfileRequest, BMICalculation, ProfileCompleteness } from '../../types/user';
import apiService from '../../services/api';

// 프로필 관리 컴포넌트 (요구사항 1.2, 1.3, 1.4, 1.5)
export function ProfileManager() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'basic' | 'physical' | 'lifestyle'>('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bmiData, setBmiData] = useState<BMICalculation | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [formData, setFormData] = useState<UpdateProfileRequest>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 컴포넌트 마운트 시 프로필 완성도 로드
  useEffect(() => {
    loadProfileCompleteness();
  }, [user]);

  // 사용자 정보가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        gender: user.gender,
        bloodType: user.bloodType || '',
        height: user.height,
        weight: user.weight,
        lifestyleHabits: user.lifestyleHabits,
      });

      // BMI 계산
      if (user.height && user.weight) {
        calculateBMI(user.height, user.weight);
      }
    }
  }, [user]);

  // 프로필 완성도 로드
  const loadProfileCompleteness = async () => {
    try {
      const data = await apiService.getProfileCompleteness();
      setCompleteness(data);
    } catch (error) {
      console.error('프로필 완성도 로드 실패:', error);
    }
  };

  // BMI 계산
  const calculateBMI = async (height: number, weight: number) => {
    try {
      const data = await apiService.calculateBMI(height, weight);
      setBmiData(data);
    } catch (error) {
      console.error('BMI 계산 실패:', error);
    }
  };

  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('lifestyleHabits.')) {
      const habitKey = name.split('.')[1];
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name && formData.name.length < 2) {
      newErrors.name = '이름은 최소 2자 이상이어야 합니다';
    }

    if (formData.height && (formData.height < 50 || formData.height > 300)) {
      newErrors.height = '키는 50cm에서 300cm 사이여야 합니다';
    }

    if (formData.weight && (formData.weight < 10 || formData.weight > 500)) {
      newErrors.weight = '몸무게는 10kg에서 500kg 사이여야 합니다';
    }

    if (formData.lifestyleHabits?.exerciseFrequency !== undefined) {
      if (formData.lifestyleHabits.exerciseFrequency < 0 || formData.lifestyleHabits.exerciseFrequency > 14) {
        newErrors.exerciseFrequency = '주당 운동 횟수는 0회에서 14회 사이여야 합니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 프로필 업데이트
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      await loadProfileCompleteness();
      
      // BMI 재계산
      if (formData.height && formData.weight) {
        await calculateBMI(formData.height, formData.weight);
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 편집 취소
  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        gender: user.gender,
        bloodType: user.bloodType || '',
        height: user.height,
        weight: user.weight,
        lifestyleHabits: user.lifestyleHabits,
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  if (!user) {
    return <div>사용자 정보를 불러오는 중...</div>;
  }

  return (
    <div className="profile-manager">
      {/* 프로필 완성도 표시 */}
      {completeness && (
        <div className="profile-completeness">
          <h3>프로필 완성도</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${completeness.completeness}%` }}
            />
          </div>
          <p>{completeness.completeness}% 완성</p>
          
          {completeness.missingFields.length > 0 && (
            <div className="missing-fields">
              <p>누락된 정보: {completeness.missingFields.join(', ')}</p>
            </div>
          )}
          
          {completeness.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>권장사항</h4>
              <ul>
                {completeness.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={activeTab === 'basic' ? 'active' : ''}
          onClick={() => setActiveTab('basic')}
        >
          기본 정보
        </button>
        <button
          className={activeTab === 'physical' ? 'active' : ''}
          onClick={() => setActiveTab('physical')}
        >
          신체 정보
        </button>
        <button
          className={activeTab === 'lifestyle' ? 'active' : ''}
          onClick={() => setActiveTab('lifestyle')}
        >
          생활습관
        </button>
      </div>

      {/* 편집 버튼 */}
      <div className="profile-actions">
        {!isEditing ? (
          <button
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            편집
          </button>
        ) : (
          <div className="edit-actions">
            <button
              className="save-button"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
            <button
              className="cancel-button"
              onClick={handleCancel}
              disabled={isLoading}
            >
              취소
            </button>
          </div>
        )}
      </div>

      {/* 기본 정보 탭 */}
      {activeTab === 'basic' && (
        <div className="tab-content">
          <h3>기본 정보</h3>
          
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="readonly"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">생년월일</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate || ''}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">성별</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              disabled={!isEditing}
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
              value={formData.bloodType || ''}
              onChange={handleChange}
              disabled={!isEditing}
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
      )}

      {/* 신체 정보 탭 */}
      {activeTab === 'physical' && (
        <div className="tab-content">
          <h3>신체 정보</h3>
          
          <div className="form-group">
            <label htmlFor="height">키 (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className={errors.height ? 'error' : ''}
              min="50"
              max="300"
            />
            {errors.height && <span className="error-message">{errors.height}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="weight">몸무게 (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className={errors.weight ? 'error' : ''}
              min="10"
              max="500"
              step="0.1"
            />
            {errors.weight && <span className="error-message">{errors.weight}</span>}
          </div>

          {/* BMI 정보 표시 */}
          {bmiData && (
            <div className="bmi-info">
              <h4>BMI 정보</h4>
              <div className="bmi-card">
                <div className="bmi-value">
                  <span className="bmi-number">{bmiData.bmi}</span>
                  <span className="bmi-category">{bmiData.description}</span>
                </div>
                <div className={`bmi-status ${bmiData.category}`}>
                  {bmiData.category === 'normal' && '정상'}
                  {bmiData.category === 'underweight' && '저체중'}
                  {bmiData.category === 'overweight' && '과체중'}
                  {bmiData.category === 'obese' && '비만'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 생활습관 탭 */}
      {activeTab === 'lifestyle' && (
        <div className="tab-content">
          <h3>생활습관 정보</h3>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="lifestyleHabits.smoking"
                checked={formData.lifestyleHabits?.smoking || false}
                onChange={handleChange}
                disabled={!isEditing}
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
              disabled={!isEditing}
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
              disabled={!isEditing}
              className={errors.exerciseFrequency ? 'error' : ''}
              min="0"
              max="14"
            />
            {errors.exerciseFrequency && (
              <span className="error-message">{errors.exerciseFrequency}</span>
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
              disabled={!isEditing}
              placeholder="예: 균형잡힌 식단, 채식주의, 저탄수화물 등"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileManager;