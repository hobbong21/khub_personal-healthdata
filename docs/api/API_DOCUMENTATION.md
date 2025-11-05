# API Documentation

## Overview

This document describes the API integration layer for the Personal Health Platform frontend application. The API layer is built using Axios and provides type-safe methods for interacting with the backend services.

## Table of Contents

- [API Configuration](#api-configuration)
- [Authentication](#authentication)
- [Health Data API](#health-data-api)
- [Genomics API](#genomics-api)
- [Error Handling](#error-handling)
- [Request/Response Types](#requestresponse-types)

## API Configuration

### Base Configuration

The API client is configured in `src/services/api.ts`:

```typescript
import axios from 'axios';
import { env } from '@config/env';

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Environment Variables

API configuration is controlled through environment variables:

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TIMEOUT=30000
```

### Interceptors

#### Request Interceptor

Automatically adds authentication token to requests:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(env.authTokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Response Interceptor

Handles common error scenarios:

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem(env.authTokenKey);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Authentication

### Login

```typescript
POST /auth/login

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "name": "홍길동",
    "email": "user@example.com"
  }
}
```

### Logout

```typescript
POST /auth/logout

Request: (empty body)

Response:
{
  "message": "Logged out successfully"
}
```

### Refresh Token

```typescript
POST /auth/refresh

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Health Data API

### Get Health Data

Retrieves the user's current health data summary.

```typescript
GET /health/data

Response:
{
  "userName": "홍길동",
  "healthScore": 85,
  "bloodPressure": "120/80",
  "heartRate": 72,
  "temperature": 36.5,
  "weight": 70.5,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

**Usage:**

```typescript
import { healthDataApi } from '@services/healthDataApi';

const data = await healthDataApi.getHealthData();
```

### Get Activities

Retrieves the user's recent health activities.

```typescript
GET /health/activities

Query Parameters:
- limit: number (default: 10)
- offset: number (default: 0)

Response:
{
  "activities": [
    {
      "id": "activity-123",
      "icon": "❤️",
      "title": "혈압 측정",
      "time": "2024-01-15T10:30:00Z",
      "type": "measurement"
    },
    {
      "id": "activity-124",
      "icon": "💊",
      "title": "약 복용",
      "time": "2024-01-15T09:00:00Z",
      "type": "medication"
    }
  ],
  "total": 50
}
```

**Usage:**

```typescript
const activities = await healthDataApi.getActivities({ limit: 20 });
```

### Update Vital Signs

Updates the user's vital signs.

```typescript
POST /health/vitals

Request:
{
  "bloodPressure": "120/80",
  "heartRate": 72,
  "temperature": 36.5,
  "weight": 70.5,
  "measuredAt": "2024-01-15T10:30:00Z"
}

Response:
{
  "id": "vital-123",
  "message": "Vital signs updated successfully"
}
```

**Usage:**

```typescript
await healthDataApi.updateVitalSigns({
  bloodPressure: "120/80",
  heartRate: 72,
  temperature: 36.5,
  weight: 70.5
});
```

### Get Chart Data

Retrieves historical data for charts.

```typescript
GET /health/chart-data

Query Parameters:
- period: 'week' | 'month' | 'year'
- metrics: string[] (e.g., ['bloodPressure', 'heartRate'])

Response:
{
  "period": "week",
  "labels": ["월", "화", "수", "목", "금", "토", "일"],
  "datasets": {
    "bloodPressure": [120, 118, 122, 119, 121, 120, 118],
    "heartRate": [72, 70, 75, 73, 71, 72, 70],
    "temperature": [36.5, 36.6, 36.4, 36.5, 36.7, 36.5, 36.6],
    "weight": [70, 70.2, 69.8, 70.1, 70, 69.9, 70.1]
  }
}
```

## Genomics API

### Upload Genomic Data

Uploads genomic data file for analysis.

```typescript
POST /genomics/upload

Request: (multipart/form-data)
- file: File (VCF, TXT, or CSV format)
- sourcePlatform: string (e.g., "23andMe", "AncestryDNA")

Response:
{
  "id": "genomic-123",
  "userId": "user-123",
  "sourcePlatform": "23andMe",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "status": "processing",
  "message": "File uploaded successfully"
}
```

**Usage:**

```typescript
import { genomicsApi } from '@services/genomicsApi';

const formData = new FormData();
formData.append('file', file);
formData.append('sourcePlatform', '23andMe');

const result = await genomicsApi.uploadGenomicData(formData);
```

### Get Risk Assessments

Retrieves disease risk assessments based on genomic data.

```typescript
GET /genomics/risk-assessments

Query Parameters:
- analysisId: string (optional)

Response:
{
  "assessments": [
    {
      "id": "risk-123",
      "disease": "제2형 당뇨병",
      "riskLevel": "medium",
      "score": 65,
      "percentile": 70,
      "factors": {
        "genetic": 40,
        "lifestyle": 30,
        "family": 30
      },
      "description": "평균보다 약간 높은 위험도",
      "recommendations": [
        "규칙적인 운동",
        "건강한 식단 유지"
      ]
    }
  ]
}
```

**Usage:**

```typescript
const assessments = await genomicsApi.getRiskAssessments();
```

### Get Pharmacogenomics Data

Retrieves drug response predictions based on genomic data.

```typescript
GET /genomics/pharmacogenomics

Response:
{
  "drugs": [
    {
      "drugName": "Warfarin",
      "response": "decreased",
      "description": "이 약물에 대한 반응이 감소할 수 있습니다",
      "recommendation": "의사와 상담하여 용량 조절이 필요할 수 있습니다",
      "genes": ["CYP2C9", "VKORC1"]
    }
  ]
}
```

**Usage:**

```typescript
const pharmacogenomics = await genomicsApi.getPharmacogenomics();
```

### Get Analysis Status

Checks the status of a genomic analysis.

```typescript
GET /genomics/analysis/:id/status

Response:
{
  "id": "genomic-123",
  "status": "completed",
  "progress": 100,
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:35:00Z",
  "results": {
    "riskAssessments": 15,
    "pharmacogenomics": 8,
    "traits": 25
  }
}
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or token expired |
| `FORBIDDEN` | 403 | User doesn't have permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Example

```typescript
try {
  const data = await healthDataApi.getHealthData();
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      console.error('Data not found');
    } else if (error.response?.status === 401) {
      console.error('Unauthorized - redirecting to login');
    } else {
      console.error('API error:', error.response?.data?.error?.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Request/Response Types

### Health Data Types

```typescript
// src/types/health.types.ts

export interface HealthData {
  userName: string;
  healthScore: number;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  lastUpdated: Date;
}

export interface Activity {
  id: string;
  icon: string;
  title: string;
  time: string;
  type: 'measurement' | 'medication' | 'appointment' | 'exercise';
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  measuredAt?: Date;
}
```

### Genomics Types

```typescript
// src/types/genomics.types.ts

export interface GenomicData {
  id: string;
  userId: string;
  sourcePlatform: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'failed';
}

export interface RiskAssessment {
  id: string;
  disease: string;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  percentile: number;
  factors: {
    genetic: number;
    lifestyle: number;
    family: number;
  };
  description: string;
  recommendations: string[];
}

export interface PharmacogenomicsData {
  drugName: string;
  response: 'normal' | 'increased' | 'decreased';
  description: string;
  recommendation?: string;
  genes: string[];
}
```

### Common Types

```typescript
// src/types/common.types.ts

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **File uploads**: 10 uploads per hour

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642252800
```

## Pagination

List endpoints support pagination using query parameters:

```typescript
GET /health/activities?limit=20&offset=40

Response:
{
  "items": [...],
  "total": 150,
  "limit": 20,
  "offset": 40,
  "hasMore": true
}
```

## Caching

The API supports HTTP caching headers:

- `Cache-Control`: Specifies caching directives
- `ETag`: Entity tag for cache validation
- `Last-Modified`: Last modification timestamp

Example:

```
Cache-Control: max-age=300, must-revalidate
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT
```

## WebSocket API (Future)

Real-time updates will be available through WebSocket connections:

```typescript
// Future implementation
const ws = new WebSocket('ws://localhost:5001/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks for all API calls
2. **Use TypeScript types**: Leverage type definitions for type safety
3. **Implement loading states**: Show loading indicators during API calls
4. **Cache responses**: Use TanStack Query for automatic caching
5. **Retry failed requests**: Implement exponential backoff for retries
6. **Validate input**: Validate data before sending to API
7. **Use environment variables**: Never hardcode API URLs
8. **Monitor API usage**: Track API calls and errors

## Testing

### Mocking API Calls

Use MSW (Mock Service Worker) for testing:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/health/data', (req, res, ctx) => {
    return res(
      ctx.json({
        userName: 'Test User',
        healthScore: 85,
        // ...
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Support

For API-related issues or questions:

1. Check this documentation
2. Review error messages and status codes
3. Check backend API logs
4. Create an issue in the project repository
