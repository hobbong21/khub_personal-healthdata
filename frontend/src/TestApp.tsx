import React, { useState, useEffect } from 'react';

const TestApp: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('확인 중...');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loginStatus, setLoginStatus] = useState<string>('');

  // API 상태 확인
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        setApiStatus(`✅ API 연결됨: ${data.message}`);
      } catch (error) {
        setApiStatus(`❌ API 연결 실패: ${error}`);
      }
    };

    checkApiHealth();
  }, []);

  // 프로필 조회
  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile');
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('프로필 조회 실패:', error);
    }
  };

  // 로그인 테스트
  const testLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLoginStatus('✅ 로그인 성공');
      } else {
        setLoginStatus('❌ 로그인 실패');
      }
    } catch (error) {
      setLoginStatus(`❌ 로그인 오류: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏥 개인 건강 플랫폼 테스트</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>API 상태</h2>
        <p>{apiStatus}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>기능 테스트</h2>
        <button 
          onClick={testLogin}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          로그인 테스트
        </button>
        
        <button 
          onClick={fetchProfile}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          프로필 조회
        </button>
        
        {loginStatus && <p>{loginStatus}</p>}
      </div>

      {userProfile && (
        <div style={{ marginBottom: '20px' }}>
          <h2>사용자 프로필</h2>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(userProfile, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <h2>구현된 기능들</h2>
        <ul>
          <li>✅ 사용자 인증 (로그인/회원가입)</li>
          <li>✅ 사용자 프로필 관리</li>
          <li>✅ 건강 데이터 추적</li>
          <li>✅ 진료 기록 관리</li>
          <li>✅ 복약 관리</li>
          <li>✅ 병원 예약 관리</li>
          <li>✅ 가족력 관리</li>
          <li>✅ 유전체 분석</li>
          <li>✅ AI 건강 인사이트</li>
          <li>✅ 웨어러블 기기 연동</li>
          <li>✅ 의료 문서 관리</li>
          <li>✅ NLP 기반 건강 상담</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h3>다음 단계</h3>
        <p>1. 권장사항 페이지 라우팅 추가</p>
        <p>2. TypeScript 오류 수정</p>
        <p>3. 환경 설정 완료</p>
        <p>4. 데이터베이스 연결 및 마이그레이션</p>
      </div>
    </div>
  );
};

export default TestApp;