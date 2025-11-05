import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MedicationTrackingPage() {
  const navigate = useNavigate();
  const [medications] = useState([
    { id: 1, name: '혈압약', dosage: '10mg', time: '08:00', taken: true },
    { id: 2, name: '비타민D', dosage: '1000IU', time: '12:00', taken: false },
    { id: 3, name: '오메가3', dosage: '1캡슐', time: '20:00', taken: false }
  ]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          ← 대시보드로
        </button>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: '#333' }}>💊 오늘의 복약 일정</h2>
            <button style={{ padding: '0.5rem 1rem', background: '#4ecdc4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + 약 추가
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {medications.map((med) => (
              <div key={med.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: med.taken ? '#e8f5e9' : '#fff3e0', borderRadius: '8px', border: `2px solid ${med.taken ? '#4caf50' : '#ff9800'}` }}>
                <input type="checkbox" checked={med.taken} readOnly style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: '0.25rem', color: '#333' }}>{med.name}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{med.dosage} • {med.time}</p>
                </div>
                <div style={{ fontSize: '2rem' }}>{med.taken ? '✅' : '⏰'}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>📊 이번 주 복약률</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#4caf50', textAlign: 'center' }}>85%</div>
            <p style={{ textAlign: 'center', color: '#666', marginTop: '0.5rem' }}>18/21회 복용 완료</p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>⚠️ 주의사항</h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666', lineHeight: '1.8' }}>
              <li>식후 30분 이내 복용</li>
              <li>알코올과 함께 복용 금지</li>
              <li>부작용 발생 시 의사 상담</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
