import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3001/api';

export const handlers = [
  // Dashboard data endpoint
  http.get(`${API_BASE_URL}/dashboard`, () => {
    return HttpResponse.json({
      userName: '홍길동',
      healthScore: 85,
      healthMetrics: {
        latestVitalSigns: {
          blood_pressure: {
            value: { systolic: 120, diastolic: 80 },
            timestamp: new Date().toISOString(),
          },
          heart_rate: {
            value: 72,
            timestamp: new Date().toISOString(),
          },
          temperature: {
            value: 36.5,
            timestamp: new Date().toISOString(),
          },
          weight: {
            value: 70,
            timestamp: new Date().toISOString(),
          },
          blood_sugar: {
            value: 95,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });
  }),

  // Health data endpoints
  http.get(`${API_BASE_URL}/health/data`, () => {
    return HttpResponse.json({
      userName: '홍길동',
      healthScore: 85,
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.5,
      weight: 70,
      bloodSugar: 95,
      lastUpdated: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE_URL}/health/activities`, () => {
    return HttpResponse.json([
      {
        id: '1',
        icon: '💊',
        title: '아스피린 복용',
        time: '2시간 전',
        type: 'medication',
      },
      {
        id: '2',
        icon: '🏃',
        title: '조깅 30분',
        time: '5시간 전',
        type: 'exercise',
      },
    ]);
  }),

  http.post(`${API_BASE_URL}/health/vitals`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Genomics endpoints
  http.post(`${API_BASE_URL}/genomics/upload`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');
    
    return HttpResponse.json({
      id: 'analysis-123',
      status: 'processing',
      fileName: file ? 'genomic-data.txt' : 'unknown',
      uploadedAt: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE_URL}/genomics/risk-assessments`, () => {
    return HttpResponse.json([
      {
        id: '1',
        disease: '제2형 당뇨병',
        riskLevel: 'medium',
        score: 65,
        percentile: 70,
        factors: {
          genetic: 40,
          lifestyle: 30,
          family: 30,
        },
      },
      {
        id: '2',
        disease: '심혈관 질환',
        riskLevel: 'low',
        score: 35,
        percentile: 40,
        factors: {
          genetic: 20,
          lifestyle: 10,
          family: 5,
        },
      },
    ]);
  }),

  http.get(`${API_BASE_URL}/genomics/pharmacogenomics`, () => {
    return HttpResponse.json([
      {
        drugName: '와파린',
        response: 'decreased',
        description: '정상보다 낮은 대사 속도',
        recommendation: '용량 조절이 필요할 수 있습니다',
      },
      {
        drugName: '클로피도그렐',
        response: 'normal',
        description: '정상 대사 속도',
        recommendation: '표준 용량 사용 가능',
      },
    ]);
  }),

  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'hong@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          name: '홍길동',
          email: 'hong@example.com',
          createdAt: new Date().toISOString(),
        },
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string };
    
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: '2',
        name: body.name,
        email: body.email,
        createdAt: new Date().toISOString(),
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE_URL}/auth/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      id: '1',
      name: '홍길동',
      email: 'hong@example.com',
      createdAt: new Date().toISOString(),
    });
  }),

  // Medical records endpoints
  http.get(`${API_BASE_URL}/medical-records`, () => {
    return HttpResponse.json([
      {
        id: '1',
        date: new Date().toISOString(),
        hospital: '서울대학교병원',
        department: '내과',
        diagnosis: '정기 검진',
        doctor: '김의사',
      },
    ]);
  }),

  // Medications endpoints
  http.get(`${API_BASE_URL}/medications`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: '아스피린',
        dosage: '100mg',
        frequency: '1일 1회',
        startDate: new Date().toISOString(),
      },
    ]);
  }),
];
