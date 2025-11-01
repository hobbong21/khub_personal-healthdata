import React, { useState } from 'react';
import './EnhancedProfilePage.css';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  height: number;
  weight: number;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  lifestyleHabits: {
    smoking: boolean;
    alcohol: 'none' | 'light' | 'moderate' | 'heavy';
    exerciseFrequency: number;
    dietType: string;
  };
  medicalHistory: string[];
  allergies: string[];
}

const EnhancedProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'health' | 'lifestyle' | 'medical' | 'privacy'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: '김건강',
    email: 'kim.health@example.com',
    birthDate: '1990-05-15',
    gender: 'male',
    bloodType: 'A+',
    height: 175,
    weight: 70,
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    emergencyContact: {
      name: '김가족',
      relationship: '배우자',
      phone: '010-9876-5432'
    },
    lifestyleHabits: {
      smoking: false,
      alcohol: 'light',
      exerciseFrequency: 3,
      dietType: '균형잡힌 식단'
    },
    medicalHistory: ['고혈압', '당뇨병 가족력'],
    allergies: ['페니실린', '견과류']
  });

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (height: number, weight: number) => {
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    return bmi.toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: '저체중', color: '#4299e1' };
    if (bmi < 25) return { status: '정상', color: '#48bb78' };
    if (bmi < 30) return { status: '과체중', color: '#ed8936' };
    return { status: '비만', color: '#f56565' };
  };

  const handleSave = () => {
    // API call to save profile
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false);
  };

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>개인 정보</h3>
        <button 
          className={`edit-btn ${isEditing ? 'save' : 'edit'}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? '저장' : '편집'}
        </button>
        {isEditing && (
          <button className="cancel-btn" onClick={handleCancel}>
            취소
          </button>
        )}
      </div>
      
      <div className="info-grid">
        <div className="info-item">
          <label>이름</label>
          {isEditing ? (
            <input 
              type="text" 
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
            />
          ) : (
            <span>{profile.name}</span>
          )}
        </div>
        
        <div className="info-item">
          <label>이메일</label>
          {isEditing ? (
            <input 
              type="email" 
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
            />
          ) : (
            <span>{profile.email}</span>
          )}
        </div>
        
        <div className="info-item">
          <label>생년월일</label>
          {isEditing ? (
            <input 
              type="date" 
              value={profile.birthDate}
              onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
            />
          ) : (
            <span>{profile.birthDate} ({calculateAge(profile.birthDate)}세)</span>
          )}
        </div>
        
        <div className="info-item">
          <label>성별</label>
          {isEditing ? (
            <select 
              value={profile.gender}
              onChange={(e) => setProfile({...profile, gender: e.target.value as any})}
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          ) : (
            <span>{profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '기타'}</span>
          )}
        </div>
        
        <div className="info-item">
          <label>전화번호</label>
          {isEditing ? (
            <input 
              type="tel" 
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
            />
          ) : (
            <span>{profile.phone}</span>
          )}
        </div>
        
        <div className="info-item full-width">
          <label>주소</label>
          {isEditing ? (
            <input 
              type="text" 
              value={profile.address}
              onChange={(e) => setProfile({...profile, address: e.target.value})}
            />
          ) : (
            <span>{profile.address}</span>
          )}
        </div>
      </div>
      
      <div className="emergency-contact">
        <h4>비상 연락처</h4>
        <div className="info-grid">
          <div className="info-item">
            <label>이름</label>
            {isEditing ? (
              <input 
                type="text" 
                value={profile.emergencyContact.name}
                onChange={(e) => setProfile({
                  ...profile, 
                  emergencyContact: {...profile.emergencyContact, name: e.target.value}
                })}
              />
            ) : (
              <span>{profile.emergencyContact.name}</span>
            )}
          </div>
          
          <div className="info-item">
            <label>관계</label>
            {isEditing ? (
              <input 
                type="text" 
                value={profile.emergencyContact.relationship}
                onChange={(e) => setProfile({
                  ...profile, 
                  emergencyContact: {...profile.emergencyContact, relationship: e.target.value}
                })}
              />
            ) : (
              <span>{profile.emergencyContact.relationship}</span>
            )}
          </div>
          
          <div className="info-item">
            <label>전화번호</label>
            {isEditing ? (
              <input 
                type="tel" 
                value={profile.emergencyContact.phone}
                onChange={(e) => setProfile({
                  ...profile, 
                  emergencyContact: {...profile.emergencyContact, phone: e.target.value}
                })}
              />
            ) : (
              <span>{profile.emergencyContact.phone}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHealthInfo = () => {
    const bmi = parseFloat(calculateBMI(profile.height, profile.weight));
    const bmiStatus = getBMIStatus(bmi);
    
    return (
      <div className="profile-section">
        <div className="section-header">
          <h3>건강 정보</h3>
        </div>
        
        <div className="health-overview">
          <div className="health-card">
            <div className="health-icon">📏</div>
            <div className="health-info">
              <h4>키</h4>
              <span className="health-value">{profile.height} cm</span>
            </div>
          </div>
          
          <div className="health-card">
            <div className="health-icon">⚖️</div>
            <div className="health-info">
              <h4>몸무게</h4>
              <span className="health-value">{profile.weight} kg</span>
            </div>
          </div>
          
          <div className="health-card">
            <div className="health-icon">🩸</div>
            <div className="health-info">
              <h4>혈액형</h4>
              <span className="health-value">{profile.bloodType}</span>
            </div>
          </div>
          
          <div className="health-card bmi-card">
            <div className="health-icon">📊</div>
            <div className="health-info">
              <h4>BMI</h4>
              <span className="health-value">{bmi}</span>
              <span 
                className="bmi-status"
                style={{ color: bmiStatus.color }}
              >
                {bmiStatus.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="medical-info">
          <div className="medical-section">
            <h4>병력</h4>
            <div className="tag-list">
              {profile.medicalHistory.map((condition, index) => (
                <span key={index} className="tag medical-tag">
                  {condition}
                </span>
              ))}
            </div>
          </div>
          
          <div className="medical-section">
            <h4>알레르기</h4>
            <div className="tag-list">
              {profile.allergies.map((allergy, index) => (
                <span key={index} className="tag allergy-tag">
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLifestyleInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>생활 습관</h3>
      </div>
      
      <div className="lifestyle-grid">
        <div className="lifestyle-item">
          <div className="lifestyle-icon">🚭</div>
          <div className="lifestyle-info">
            <h4>흡연</h4>
            <span className={`lifestyle-status ${profile.lifestyleHabits.smoking ? 'negative' : 'positive'}`}>
              {profile.lifestyleHabits.smoking ? '흡연' : '비흡연'}
            </span>
          </div>
        </div>
        
        <div className="lifestyle-item">
          <div className="lifestyle-icon">🍷</div>
          <div className="lifestyle-info">
            <h4>음주</h4>
            <span className="lifestyle-status">
              {profile.lifestyleHabits.alcohol === 'none' && '금주'}
              {profile.lifestyleHabits.alcohol === 'light' && '가끔'}
              {profile.lifestyleHabits.alcohol === 'moderate' && '보통'}
              {profile.lifestyleHabits.alcohol === 'heavy' && '자주'}
            </span>
          </div>
        </div>
        
        <div className="lifestyle-item">
          <div className="lifestyle-icon">🏃</div>
          <div className="lifestyle-info">
            <h4>운동 빈도</h4>
            <span className="lifestyle-status">
              주 {profile.lifestyleHabits.exerciseFrequency}회
            </span>
          </div>
        </div>
        
        <div className="lifestyle-item">
          <div className="lifestyle-icon">🥗</div>
          <div className="lifestyle-info">
            <h4>식단</h4>
            <span className="lifestyle-status">
              {profile.lifestyleHabits.dietType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="enhanced-profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            <span className="avatar-initial">{profile.name.charAt(0)}</span>
          </div>
          <button className="avatar-edit-btn">📷</button>
        </div>
        <div className="profile-basic-info">
          <h1>{profile.name}</h1>
          <p className="profile-email">{profile.email}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">나이</span>
              <span className="stat-value">{calculateAge(profile.birthDate)}세</span>
            </div>
            <div className="stat">
              <span className="stat-label">BMI</span>
              <span className="stat-value">{calculateBMI(profile.height, profile.weight)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">혈액형</span>
              <span className="stat-value">{profile.bloodType}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          개인 정보
        </button>
        <button 
          className={`tab ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          건강 정보
        </button>
        <button 
          className={`tab ${activeTab === 'lifestyle' ? 'active' : ''}`}
          onClick={() => setActiveTab('lifestyle')}
        >
          생활 습관
        </button>
        <button 
          className={`tab ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          의료 기록
        </button>
        <button 
          className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          개인정보 설정
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'personal' && renderPersonalInfo()}
        {activeTab === 'health' && renderHealthInfo()}
        {activeTab === 'lifestyle' && renderLifestyleInfo()}
        {activeTab === 'medical' && (
          <div className="profile-section">
            <h3>의료 기록 연동</h3>
            <p>진료 기록, 검사 결과, 처방전 등을 연동하여 관리하세요.</p>
            <button className="btn btn-primary">의료 기록 페이지로 이동</button>
          </div>
        )}
        {activeTab === 'privacy' && (
          <div className="profile-section">
            <h3>개인정보 및 보안 설정</h3>
            <div className="privacy-options">
              <div className="privacy-item">
                <h4>비밀번호 변경</h4>
                <p>계정 보안을 위해 정기적으로 비밀번호를 변경하세요.</p>
                <button className="btn btn-secondary">비밀번호 변경</button>
              </div>
              <div className="privacy-item">
                <h4>2단계 인증</h4>
                <p>추가 보안을 위해 2단계 인증을 활성화하세요.</p>
                <button className="btn btn-secondary">설정하기</button>
              </div>
              <div className="privacy-item">
                <h4>데이터 내보내기</h4>
                <p>개인 건강 데이터를 안전하게 내보낼 수 있습니다.</p>
                <button className="btn btn-secondary">데이터 내보내기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProfilePage;