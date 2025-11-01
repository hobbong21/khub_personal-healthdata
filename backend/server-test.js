const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Personal Health Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock user authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
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

// Mock user profile
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

// Mock health data
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

// Mock medical records
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

// Mock medications
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

// Mock appointments
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`👤 Profile endpoint: http://localhost:${PORT}/api/users/profile`);
});