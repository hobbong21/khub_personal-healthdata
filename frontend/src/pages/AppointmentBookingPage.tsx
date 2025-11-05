import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppointmentBookingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hospital: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    reason: ''
  });

  const hospitals = ['서울대병원', '연세세브란스병원', '삼성서울병원', '아산병원'];
  const departments = ['내과', '외과', '정형외과', '피부과', '안과', '이비인후과'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('예약이 완료되었습니다!');
    navigate('/appointments');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => navigate('/appointments')} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          ← 예약 목록으로
        </button>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '2rem', color: '#333' }}>🏥 진료 예약</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>병원 선택</label>
              <select value={formData.hospital} onChange={(e) => setFormData({ ...formData, hospital: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="">병원을 선택하세요</option>
                {hospitals.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>진료과</label>
              <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="">진료과를 선택하세요</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>의사 선택 (선택사항)</label>
              <input type="text" value={formData.doctor} onChange={(e) => setFormData({ ...formData, doctor: e.target.value })} placeholder="의사명을 입력하세요" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>날짜</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>시간</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>진료 사유</label>
              <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={4} placeholder="증상이나 진료 목적을 입력하세요" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
              예약하기
            </button>
          </form>
        </div>

        <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>📌 예약 안내</h3>
          <ul style={{ lineHeight: '2', color: '#666', margin: 0, paddingLeft: '1.5rem' }}>
            <li>예약 변경은 진료 24시간 전까지 가능합니다</li>
            <li>예약 시간 10분 전까지 도착해주세요</li>
            <li>건강보험증을 지참해주세요</li>
            <li>예약 확인 문자를 받으실 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
