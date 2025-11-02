const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (프론트엔드 public 폴더)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// 메인 페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index-enhanced.html'));
});

// API 라우트들 (기존 테스트 서버와 동일)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Personal Health Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'Test User',
        email: email
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
});

app.get('/api/users/profile', (req, res) => {
  res.json({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    birthDate: '1990-01-01',
    gender: 'male',
    height: 175,
    weight: 70,
    bloodType: 'A+',
    createdAt: new Date().toISOString()
  });
});

app.get('/api/health/vitals', (req, res) => {
  res.json({
    vitals: [
      {
        id: '1',
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        measuredAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        measuredAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/medical/records', (req, res) => {
  res.json({
    records: [
      {
        id: '1',
        hospitalName: 'Test Hospital',
        department: 'Internal Medicine',
        doctorName: 'Dr. Test',
        visitDate: '2024-01-15',
        diagnosis: 'Regular checkup'
      }
    ]
  });
});

app.get('/api/medications', (req, res) => {
  res.json({
    medications: [
      {
        id: '1',
        name: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'Daily',
        startDate: '2024-01-01',
        isActive: true
      }
    ]
  });
});

app.get('/api/appointments', (req, res) => {
  res.json({
    appointments: [
      {
        id: '1',
        hospitalName: 'Test Hospital',
        department: 'Cardiology',
        appointmentDate: '2024-02-15T10:00:00Z',
        status: 'scheduled'
      }
    ]
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  // API 요청이 아닌 경우 메인 페이지로 리다이렉트
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, '../frontend/public/index-enhanced.html'));
  }
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced HTML Server running on port ${PORT}`);
  console.log(`🌐 Main page: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
});