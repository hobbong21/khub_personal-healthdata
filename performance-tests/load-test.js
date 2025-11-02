// K6 Performance Test Script for K-hub

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// 커스텀 메트릭
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// 환경 변수
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const API_URL = __ENV.API_URL || 'http://localhost:3001';

// 테스트 설정
export const options = {
  stages: [
    // Ramp-up
    { duration: '2m', target: 10 },   // 2분 동안 10명까지 증가
    { duration: '5m', target: 10 },   // 5분 동안 10명 유지
    { duration: '2m', target: 20 },   // 2분 동안 20명까지 증가
    { duration: '5m', target: 20 },   // 5분 동안 20명 유지
    { duration: '2m', target: 50 },   // 2분 동안 50명까지 증가
    { duration: '5m', target: 50 },   // 5분 동안 50명 유지
    { duration: '2m', target: 100 },  // 2분 동안 100명까지 증가
    { duration: '5m', target: 100 },  // 5분 동안 100명 유지
    // Ramp-down
    { duration: '5m', target: 0 },    // 5분 동안 0명까지 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95%의 요청이 2초 이내
    http_req_failed: ['rate<0.05'],    // 에러율 5% 미만
    errors: ['rate<0.05'],             // 커스텀 에러율 5% 미만
  },
};

// 테스트 데이터
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
];

// 헬퍼 함수
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function generateHealthData() {
  return {
    bloodPressure: {
      systolic: Math.floor(Math.random() * 40) + 100, // 100-140
      diastolic: Math.floor(Math.random() * 30) + 60,  // 60-90
    },
    heartRate: Math.floor(Math.random() * 40) + 60,    // 60-100
    weight: Math.floor(Math.random() * 50) + 50,       // 50-100
    temperature: (Math.random() * 2 + 36).toFixed(1),  // 36.0-38.0
  };
}

// 메인 테스트 함수
export default function () {
  const user = getRandomUser();
  let authToken = null;

  // 1. 홈페이지 로드 테스트
  const homeResponse = http.get(BASE_URL);
  check(homeResponse, {
    'homepage loads successfully': (r) => r.status === 200,
    'homepage response time < 1s': (r) => r.timings.duration < 1000,
  });
  errorRate.add(homeResponse.status !== 200);
  responseTime.add(homeResponse.timings.duration);

  sleep(1);

  // 2. API 헬스체크
  const healthResponse = http.get(`${API_URL}/api/health`);
  check(healthResponse, {
    'health check passes': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(healthResponse.status !== 200);

  sleep(1);

  // 3. 사용자 로그인
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginResponse = http.post(`${API_URL}/api/auth/login`, loginPayload, loginParams);
  
  const loginSuccess = check(loginResponse, {
    'login successful': (r) => r.status === 200 || r.status === 201,
    'login response time < 2s': (r) => r.timings.duration < 2000,
  });

  if (loginSuccess && loginResponse.json('token')) {
    authToken = loginResponse.json('token');
  }

  errorRate.add(!loginSuccess);
  sleep(2);

  // 인증이 필요한 API 테스트 (토큰이 있는 경우만)
  if (authToken) {
    const authHeaders = {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    };

    // 4. 대시보드 데이터 조회
    const dashboardResponse = http.get(`${API_URL}/api/dashboard`, authHeaders);
    check(dashboardResponse, {
      'dashboard data loads': (r) => r.status === 200,
      'dashboard response time < 1.5s': (r) => r.timings.duration < 1500,
    });
    errorRate.add(dashboardResponse.status !== 200);

    sleep(1);

    // 5. 건강 데이터 입력
    const healthData = generateHealthData();
    const healthPayload = JSON.stringify({
      type: 'vital_signs',
      data: healthData,
      recordedAt: new Date().toISOString(),
    });

    const healthResponse = http.post(`${API_URL}/api/health/records`, healthPayload, authHeaders);
    check(healthResponse, {
      'health data creation successful': (r) => r.status === 200 || r.status === 201,
      'health data response time < 1s': (r) => r.timings.duration < 1000,
    });
    errorRate.add(healthResponse.status !== 200 && healthResponse.status !== 201);

    sleep(1);

    // 6. 건강 기록 조회
    const recordsResponse = http.get(`${API_URL}/api/health/records?limit=10`, authHeaders);
    check(recordsResponse, {
      'health records retrieval successful': (r) => r.status === 200,
      'health records response time < 1s': (r) => r.timings.duration < 1000,
    });
    errorRate.add(recordsResponse.status !== 200);

    sleep(1);

    // 7. 프로필 조회
    const profileResponse = http.get(`${API_URL}/api/user/profile`, authHeaders);
    check(profileResponse, {
      'profile retrieval successful': (r) => r.status === 200,
      'profile response time < 800ms': (r) => r.timings.duration < 800,
    });
    errorRate.add(profileResponse.status !== 200);

    sleep(1);

    // 8. 의료 기록 조회 (페이지네이션 테스트)
    const medicalRecordsResponse = http.get(`${API_URL}/api/medical/records?page=1&limit=5`, authHeaders);
    check(medicalRecordsResponse, {
      'medical records retrieval successful': (r) => r.status === 200,
      'medical records response time < 1.2s': (r) => r.timings.duration < 1200,
    });
    errorRate.add(medicalRecordsResponse.status !== 200);

    sleep(1);

    // 9. AI 인사이트 조회 (부하가 큰 작업)
    const aiInsightsResponse = http.get(`${API_URL}/api/ai/insights`, authHeaders);
    check(aiInsightsResponse, {
      'AI insights retrieval': (r) => r.status === 200 || r.status === 202, // 202는 처리 중
      'AI insights response time < 3s': (r) => r.timings.duration < 3000,
    });
    errorRate.add(aiInsightsResponse.status !== 200 && aiInsightsResponse.status !== 202);

    sleep(2);
  }

  // 10. 정적 리소스 로드 테스트
  const staticResources = [
    `${BASE_URL}/assets/css/main.css`,
    `${BASE_URL}/assets/js/main.js`,
    `${BASE_URL}/favicon.ico`,
  ];

  staticResources.forEach((url) => {
    const response = http.get(url);
    check(response, {
      [`static resource ${url} loads`]: (r) => r.status === 200 || r.status === 304,
    });
  });

  sleep(Math.random() * 3 + 1); // 1-4초 랜덤 대기
}

// 설정 검증 함수
export function setup() {
  console.log(`Starting performance test against: ${BASE_URL}`);
  console.log(`API endpoint: ${API_URL}`);
  
  // 기본 연결 테스트
  const response = http.get(`${API_URL}/api/health`);
  if (response.status !== 200) {
    throw new Error(`API health check failed: ${response.status}`);
  }
  
  console.log('Setup completed successfully');
  return { timestamp: new Date().toISOString() };
}

// 정리 함수
export function teardown(data) {
  console.log(`Performance test completed at: ${new Date().toISOString()}`);
  console.log(`Test started at: ${data.timestamp}`);
}