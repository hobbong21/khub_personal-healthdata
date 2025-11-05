import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

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

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Health Hub 소개</h2>
        
        <section style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>우리의 미션</h3>
          <p style={{ lineHeight: '1.8', color: '#555' }}>
            Health Hub는 개인의 건강 데이터를 체계적으로 수집, 저장, 분석하여 
            맞춤형 건강 관리 및 질병 예측 서비스를 제공하는 통합 플랫폼입니다.
          </p>
        </section>

        <section style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>핵심 가치</h3>
          <ul style={{ lineHeight: '2', color: '#555' }}>
            <li><strong>개인화:</strong> AI 기반 맞춤형 건강 관리</li>
            <li><strong>통합성:</strong> 모든 건강 데이터를 한곳에서</li>
            <li><strong>보안:</strong> HIPAA 준수 보안 정책</li>
            <li><strong>접근성:</strong> 언제 어디서나 건강 관리</li>
          </ul>
        </section>

        <section style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>기술 스택</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h4>프론트엔드</h4>
              <ul style={{ color: '#555' }}>
                <li>React 18</li>
                <li>TypeScript</li>
                <li>TanStack Query</li>
              </ul>
            </div>
            <div>
              <h4>백엔드</h4>
              <ul style={{ color: '#555' }}>
                <li>Node.js + Express</li>
                <li>PostgreSQL</li>
                <li>Redis</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
