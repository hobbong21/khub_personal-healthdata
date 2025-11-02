const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: '개인 건강 플랫폼 백엔드 서버가 정상 작동 중입니다.'
  });
});

// API routes
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      healthScore: 85,
      metrics: [
        { name: '혈압', value: '120/80', unit: 'mmHg', status: 'normal' },
        { name: '심박수', value: '72', unit: 'bpm', status: 'normal' },
        { name: '체중', value: '68.5', unit: 'kg', status: 'normal' },
        { name: '혈당', value: '95', unit: 'mg/dL', status: 'normal' }
      ],
      recentActivities: [
        { type: 'measurement', description: '혈압 측정 - 120/80 mmHg', time: '2시간 전' },
        { type: 'medication', description: '약물 복용 - 혈압약', time: '4시간 전' },
        { type: 'exercise', description: '운동 기록 - 30분 걷기', time: '어제' }
      ]
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      name: '김건강',
      email: 'kim.health@example.com',
      role: 'patient'
    }
  });
});

// Mock authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          name: '김건강',
          email: email,
          role: 'patient'
        },
        token: 'mock-jwt-token'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '이메일과 비밀번호를 입력해주세요.'
      }
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다.'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 개인 건강 플랫폼 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;