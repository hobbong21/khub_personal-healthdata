const http = require('http');
const PORT = 5003;

const mockUsers = [
  { id: '1', email: 'test@example.com', name: 'Test User', birthDate: '1990-01-01' }
];

const mockHealthData = [
  { id: '1', type: 'blood_pressure', value: { systolic: 120, diastolic: 80 }, measuredAt: new Date().toISOString() },
  { id: '2', type: 'weight', value: 70, unit: 'kg', measuredAt: new Date().toISOString() }
];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;
  const method = req.method;

  if (url === '/health' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  } 
  else if (url === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, password } = JSON.parse(body);
      if (email === 'test@example.com' && password === 'password') {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, token: 'mock-token', user: mockUsers[0] }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
      }
    });
  }
  else if (url === '/api/users/profile' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, user: mockUsers[0] }));
  }
  else if (url === '/api/health/records' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: mockHealthData }));
  }
  else if (url === '/api/health/dashboard' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        summary: { totalRecords: mockHealthData.length, lastUpdate: new Date().toISOString() },
        recentTrends: { weight: mockHealthData.filter(d => d.type === 'weight') },
        goals: { weightGoal: 68, exerciseGoal: 150 },
        todos: [
          { id: 1, task: '혈압 측정', completed: false },
          { id: 2, task: '운동 30분', completed: true }
        ]
      }
    }));
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🧪 Simple test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  console.log(`\n✅ Test credentials: test@example.com / password`);
});
