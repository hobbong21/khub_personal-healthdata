const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    birthDate: '1990-01-01',
    gender: 'male',
    height: 175,
    weight: 70
  }
];

const mockHealthData = [
  {
    id: '1',
    userId: '1',
    type: 'blood_pressure',
    value: { systolic: 120, diastolic: 80 },
    unit: 'mmHg',
    measuredAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '1',
    type: 'weight',
    value: 70,
    unit: 'kg',
    measuredAt: new Date().toISOString()
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Test server is running'
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@example.com' && password === 'password') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: mockUsers[0]
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    name,
    birthDate: null,
    gender: null,
    height: null,
    weight: null
  };
  
  mockUsers.push(newUser);
  
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: newUser
  });
});

// User endpoints
app.get('/api/users/profile', (req, res) => {
  res.json({
    success: true,
    user: mockUsers[0]
  });
});

app.put('/api/users/profile', (req, res) => {
  const updates = req.body;
  Object.assign(mockUsers[0], updates);
  
  res.json({
    success: true,
    user: mockUsers[0]
  });
});

// Health data endpoints
app.get('/api/health/records', (req, res) => {
  res.json({
    success: true,
    data: mockHealthData
  });
});

app.post('/api/health/records', (req, res) => {
  const newRecord = {
    id: String(mockHealthData.length + 1),
    userId: '1',
    ...req.body,
    measuredAt: new Date().toISOString()
  };
  
  mockHealthData.push(newRecord);
  
  res.json({
    success: true,
    data: newRecord
  });
});

// Dashboard data
app.get('/api/health/dashboard', (req, res) => {
  const latestWeight = mockHealthData
    .filter(d => d.type === 'weight')
    .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt))[0];
    
  const latestBP = mockHealthData
    .filter(d => d.type === 'blood_pressure')
    .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt))[0];

  res.json({
    success: true,
    data: {
      summary: {
        totalRecords: mockHealthData.length,
        lastUpdate: new Date().toISOString(),
        currentWeight: latestWeight?.value || null,
        currentBP: latestBP?.value || null
      },
      recentTrends: {
        weight: mockHealthData.filter(d => d.type === 'weight').slice(-7),
        bloodPressure: mockHealthData.filter(d => d.type === 'blood_pressure').slice(-7)
      },
      goals: {
        weightGoal: 68,
        exerciseGoal: 150, // minutes per week
        completed: {
          weight: false,
          exercise: true
        }
      },
      todos: [
        { id: 1, task: '혈압 측정', completed: false },
        { id: 2, task: '운동 30분', completed: true },
        { id: 3, task: '약 복용', completed: false }
      ]
    }
  });
});

// Medical records
app.get('/api/medical/records', (req, res) => {
  const mockMedicalRecords = [
    {
      id: '1',
      hospitalName: '서울대학교병원',
      department: '내과',
      doctorName: '김의사',
      visitDate: '2024-01-15',
      diagnosis: '정기검진',
      cost: 50000
    }
  ];
  
  res.json({
    success: true,
    data: mockMedicalRecords
  });
});

// Medications
app.get('/api/medications', (req, res) => {
  const mockMedications = [
    {
      id: '1',
      name: '혈압약',
      dosage: '5mg',
      frequency: '1일 1회',
      startDate: '2024-01-01',
      isActive: true
    }
  ];
  
  res.json({
    success: true,
    data: mockMedications
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});