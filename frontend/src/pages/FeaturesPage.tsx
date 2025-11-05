import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FeaturesPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: '📊',
      title: '건강 대시보드',
      description: '모든 건강 데이터를 한눈에 확인하고 트렌드를 분석합니다.',
      items: ['실시간 건강 지표', '데이터 시각화', '목표 달성률']
    },
    {
      icon: '❤️',
      title: '바이탈 사인 추적',
      description: '혈압, 맥박, 체온, 혈당, 체중 등을 기록하고 관리합니다.',
      items: ['자동 BMI 계산', '이상 징후 알림', '히스토리 관리']
    },
    {
      icon: '🤖',
      title: 'AI 건강 분석',
      description: '머신러닝 기반으로 질병 위험도를 예측하고 맞춤형 조언을 제공합니다.',
      items: ['질병 예측', '위험 요인 분석', '개인화 권장사항']
    },
    {
      icon: '💊',
      title: '복약 관리',
      description: '약물 복용 일정을 관리하고 알림을 받습니다.',
      items: ['복약 알림', '약물 상호작용 경고', '복용 이력 추적']
    },
    {
      icon: '🏥',
      title: '진료 기록',
      description: '병원 방문 내역과 진단 결과를 체계적으로 관리합니다.',
      items: ['ICD-10 진단 코드', '검사 결과 저장', '처방전 관리']
    },
    {
      icon: '🧬',
      title: '유전체 분석',
      description: '유전 정보를 분석하여 질병 위험도를 평가합니다.',
      items: ['SNP 데이터 분석', '약물유전체학', '가족력 관리']
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <header style={{ background: 'white', padding: '1rem 2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#667eea', cursor: 'pointer' }} onClick={() => navigate('/')}>
            🏥 Health Hub
          </h1>
          <button onClick={() => navigate('/login')} style={{ padding: '0.5rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            로그인
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>강력한 기능들</h2>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>당신의 건강을 위한 모든 것</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {features.map((feature, index) => (
            <div key={index} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#333' }}>{feature.title}</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{feature.description}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {feature.items.map((item, i) => (
                  <li key={i} style={{ padding: '0.5rem 0', color: '#667eea' }}>✓ {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <button onClick={() => navigate('/register')} style={{ padding: '1rem 3rem', fontSize: '1.2rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            지금 시작하기
          </button>
        </div>
      </main>
    </div>
  );
}
