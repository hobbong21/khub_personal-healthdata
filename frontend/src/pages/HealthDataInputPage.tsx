import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HealthDataInputPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'blood_pressure',
    systolic: '',
    diastolic: '',
    heartRate: '',
    weight: '',
    bloodSugar: '',
    temperature: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('건강 데이터가 저장되었습니다!');
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          ← 대시보드로
        </button>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '2rem', color: '#333' }}>건강 데이터 입력</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>측정 항목</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="blood_pressure">혈압</option>
                <option value="weight">체중</option>
                <option value="blood_sugar">혈당</option>
                <option value="temperature">체온</option>
              </select>
            </div>

            {formData.type === 'blood_pressure' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>수축기 (mmHg)</label>
                    <input type="number" value={formData.systolic} onChange={(e) => setFormData({ ...formData, systolic: e.target.value })} placeholder="120" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>이완기 (mmHg)</label>
                    <input type="number" value={formData.diastolic} onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })} placeholder="80" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>심박수 (bpm)</label>
                  <input type="number" value={formData.heartRate} onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })} placeholder="72" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
              </>
            )}

            {formData.type === 'weight' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>체중 (kg)</label>
                <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="68.5" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
            )}

            {formData.type === 'blood_sugar' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>혈당 (mg/dL)</label>
                <input type="number" value={formData.bloodSugar} onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })} placeholder="95" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
            )}

            {formData.type === 'temperature' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>체온 (°C)</label>
                <input type="number" step="0.1" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} placeholder="36.5" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>메모</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="특이사항을 입력하세요" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
              저장하기
            </button>
          </form>
        </div>

        <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>💡 측정 팁</h3>
          <ul style={{ lineHeight: '2', color: '#666' }}>
            <li>혈압은 아침 기상 후 측정하는 것이 좋습니다</li>
            <li>체중은 매일 같은 시간에 측정하세요</li>
            <li>혈당은 식전/식후를 구분하여 기록하세요</li>
            <li>규칙적인 측정이 건강 관리의 핵심입니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
