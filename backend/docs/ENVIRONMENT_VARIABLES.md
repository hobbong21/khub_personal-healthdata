# 환경 변수 문서

## 개요

이 문서는 백엔드 애플리케이션에서 사용하는 모든 환경 변수를 설명합니다.

## 환경 변수 파일

환경별로 다른 설정 파일을 사용합니다:

- `.env.development` - 개발 환경
- `.env.staging` - 스테이징 환경
- `.env.production` - 프로덕션 환경
- `.env.example` - 템플릿 파일 (버전 관리에 포함)

## 필수 환경 변수

### 서버 설정

#### `PORT`
- **설명**: 서버가 실행될 포트 번호
- **타입**: Number
- **기본값**: 3001
- **예시**: `PORT=5000`
- **환경별 권장값**:
  - 개발: 3001
  - 스테이징: 5000
  - 프로덕션: 5000

#### `NODE_ENV`
- **설명**: 실행 환경 모드
- **타입**: String
- **가능한 값**: `development`, `staging`, `production`, `test`
- **기본값**: development
- **예시**: `NODE_ENV=production`
- **영향**:
  - 로깅 레벨
  - 에러 메시지 상세도
  - 캐싱 전략
  - 성능 최적화

---

### 데이터베이스

#### `DATABASE_URL`
- **설명**: PostgreSQL 데이터베이스 연결 문자열
- **타입**: String (Connection URL)
- **필수**: ✅ Yes
- **형식**: `postgresql://[user]:[password]@[host]:[port]/[database]?[options]`
- **예시**: 
  ```
  DATABASE_URL="postgresql://healthuser:securepass@localhost:5432/health_platform_db"
  ```
- **옵션**:
  - `schema=public` - 스키마 지정
  - `connection_limit=20` - 연결 풀 크기
  - `pool_timeout=30` - 연결 타임아웃 (초)
- **보안**: 
  - 프로덕션에서는 강력한 비밀번호 사용
  - SSL 연결 권장: `?sslmode=require`

---

### 인증 및 보안

#### `JWT_SECRET`
- **설명**: JWT 토큰 서명에 사용되는 비밀 키
- **타입**: String
- **필수**: ✅ Yes
- **최소 길이**: 32자 이상 권장
- **예시**: `JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"`
- **생성 방법**:
  ```bash
  # Node.js로 생성
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  
  # OpenSSL로 생성
  openssl rand -hex 64
  ```
- **보안**:
  - 환경별로 다른 키 사용
  - 정기적으로 변경 (키 로테이션)
  - 절대 버전 관리에 포함하지 않음

#### `JWT_EXPIRES_IN`
- **설명**: JWT 토큰 만료 시간
- **타입**: String (시간 표현식)
- **기본값**: 7d
- **예시**: 
  - `JWT_EXPIRES_IN=7d` (7일)
  - `JWT_EXPIRES_IN=24h` (24시간)
  - `JWT_EXPIRES_IN=3600` (3600초)
- **환경별 권장값**:
  - 개발: 30d
  - 스테이징: 7d
  - 프로덕션: 7d

---

### Redis (캐싱)

#### `REDIS_URL`
- **설명**: Redis 서버 연결 URL
- **타입**: String (Connection URL)
- **필수**: ✅ Yes (캐싱 사용 시)
- **형식**: `redis://[user]:[password]@[host]:[port]/[db]`
- **예시**:
  ```
  REDIS_URL="redis://localhost:6379"
  REDIS_URL="redis://:password@redis-server:6379/0"
  ```
- **옵션**:
  - `/0` - 데이터베이스 번호 (0-15)
  - `?tls=true` - TLS 연결
- **용도**:
  - AI Insights 캐싱
  - 세션 저장
  - Rate limiting

---

### AI Insights Module

#### `AI_INSIGHTS_CACHE_TTL`
- **설명**: AI 인사이트 캐시 유효 시간 (초)
- **타입**: Number
- **기본값**: 3600 (1시간)
- **예시**: `AI_INSIGHTS_CACHE_TTL=3600`
- **환경별 권장값**:
  - 개발: 300 (5분) - 빠른 테스트
  - 스테이징: 1800 (30분)
  - 프로덕션: 3600 (1시간)
- **영향**:
  - 짧을수록: 최신 데이터 반영, 높은 서버 부하
  - 길수록: 빠른 응답, 오래된 데이터 가능성
- **권장 범위**: 300 ~ 7200 (5분 ~ 2시간)

#### `AI_INSIGHTS_MIN_DATA_POINTS`
- **설명**: 인사이트 생성에 필요한 최소 데이터 포인트 수
- **타입**: Number
- **기본값**: 3
- **예시**: `AI_INSIGHTS_MIN_DATA_POINTS=3`
- **환경별 권장값**:
  - 개발: 1 (테스트 용이)
  - 스테이징: 3
  - 프로덕션: 3
- **영향**:
  - 낮을수록: 더 많은 사용자에게 인사이트 제공, 정확도 낮음
  - 높을수록: 정확한 인사이트, 일부 사용자 제외
- **권장 범위**: 1 ~ 7

---

### 외부 서비스 API

#### `GOOGLE_APPLICATION_CREDENTIALS`
- **설명**: Google Cloud 서비스 계정 키 파일 경로
- **타입**: String (파일 경로)
- **필수**: ⚠️ Optional (OCR/NLP 사용 시 필요)
- **예시**: `GOOGLE_APPLICATION_CREDENTIALS="./config/google-service-account.json"`
- **용도**:
  - Google Cloud Vision API (OCR)
  - Google Cloud Natural Language API
- **설정 방법**:
  1. Google Cloud Console에서 서비스 계정 생성
  2. JSON 키 다운로드
  3. 안전한 위치에 저장
  4. 경로 설정

#### `OPENAI_API_KEY`
- **설명**: OpenAI API 키
- **타입**: String
- **필수**: ⚠️ Optional (AI 기능 사용 시 필요)
- **예시**: `OPENAI_API_KEY="sk-..."`
- **용도**:
  - GPT 기반 건강 분석
  - 자연어 요약 생성
- **획득 방법**: https://platform.openai.com/api-keys

#### `GOOGLE_FIT_CLIENT_ID`
- **설명**: Google Fit API 클라이언트 ID
- **타입**: String
- **필수**: ⚠️ Optional (Google Fit 연동 시 필요)
- **예시**: `GOOGLE_FIT_CLIENT_ID="123456789-abc.apps.googleusercontent.com"`

#### `GOOGLE_FIT_CLIENT_SECRET`
- **설명**: Google Fit API 클라이언트 시크릿
- **타입**: String
- **필수**: ⚠️ Optional (Google Fit 연동 시 필요)
- **예시**: `GOOGLE_FIT_CLIENT_SECRET="GOCSPX-..."`

#### `GOOGLE_FIT_REDIRECT_URI`
- **설명**: Google Fit OAuth 리다이렉트 URI
- **타입**: String (URL)
- **필수**: ⚠️ Optional (Google Fit 연동 시 필요)
- **예시**: `GOOGLE_FIT_REDIRECT_URI="http://localhost:3000/google-fit/callback"`

#### `APPLE_HEALTH_WEBHOOK_SECRET`
- **설명**: Apple Health 웹훅 검증 시크릿
- **타입**: String
- **필수**: ⚠️ Optional (Apple Health 연동 시 필요)
- **예시**: `APPLE_HEALTH_WEBHOOK_SECRET="your-webhook-secret"`

---

### 파일 업로드

#### `MAX_FILE_SIZE`
- **설명**: 업로드 가능한 최대 파일 크기
- **타입**: String (크기 표현식)
- **기본값**: 10mb
- **예시**: 
  - `MAX_FILE_SIZE="10mb"`
  - `MAX_FILE_SIZE="5242880"` (5MB in bytes)
- **환경별 권장값**:
  - 개발: 50mb
  - 프로덕션: 10mb

#### `UPLOAD_PATH`
- **설명**: 업로드된 파일 저장 경로
- **타입**: String (디렉토리 경로)
- **기본값**: ./uploads
- **예시**: `UPLOAD_PATH="./uploads"`
- **주의**: 
  - 디렉토리 쓰기 권한 필요
  - 프로덕션에서는 S3 등 클라우드 스토리지 권장

---

### Rate Limiting

#### `RATE_LIMIT_WINDOW_MS`
- **설명**: Rate limit 시간 윈도우 (밀리초)
- **타입**: Number
- **기본값**: 900000 (15분)
- **예시**: `RATE_LIMIT_WINDOW_MS=900000`
- **환경별 권장값**:
  - 개발: 60000 (1분)
  - 프로덕션: 900000 (15분)

#### `RATE_LIMIT_MAX_REQUESTS`
- **설명**: 시간 윈도우 내 최대 요청 수
- **타입**: Number
- **기본값**: 100
- **예시**: `RATE_LIMIT_MAX_REQUESTS=100`
- **환경별 권장값**:
  - 개발: 1000
  - 프로덕션: 100

---

## 환경별 설정 예시

### 개발 환경 (.env.development)

```bash
# 서버
PORT=3001
NODE_ENV=development

# 데이터베이스
DATABASE_URL="postgresql://devuser:devpass@localhost:5432/health_dev"

# 인증
JWT_SECRET="dev-secret-key-not-for-production"
JWT_EXPIRES_IN=30d

# Redis
REDIS_URL="redis://localhost:6379"

# AI Insights
AI_INSIGHTS_CACHE_TTL=300
AI_INSIGHTS_MIN_DATA_POINTS=1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# 파일 업로드
MAX_FILE_SIZE="50mb"
UPLOAD_PATH="./uploads"
```

### 스테이징 환경 (.env.staging)

```bash
# 서버
PORT=5000
NODE_ENV=staging

# 데이터베이스
DATABASE_URL="postgresql://staginguser:stagingpass@staging-db:5432/health_staging?sslmode=require"

# 인증
JWT_SECRET="staging-secret-key-change-this"
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL="redis://:stagingpass@staging-redis:6379/0"

# AI Insights
AI_INSIGHTS_CACHE_TTL=1800
AI_INSIGHTS_MIN_DATA_POINTS=3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200

# 파일 업로드
MAX_FILE_SIZE="10mb"
UPLOAD_PATH="./uploads"
```

### 프로덕션 환경 (.env.production)

```bash
# 서버
PORT=5000
NODE_ENV=production

# 데이터베이스
DATABASE_URL="postgresql://produser:strongpassword@prod-db:5432/health_prod?sslmode=require&connection_limit=50"

# 인증
JWT_SECRET="production-super-secret-key-64-chars-minimum-change-this-immediately"
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL="redis://:prodredispass@prod-redis:6379/0?tls=true"

# AI Insights
AI_INSIGHTS_CACHE_TTL=3600
AI_INSIGHTS_MIN_DATA_POINTS=3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 파일 업로드
MAX_FILE_SIZE="10mb"
UPLOAD_PATH="/var/app/uploads"

# 외부 서비스 (프로덕션 키 사용)
GOOGLE_APPLICATION_CREDENTIALS="/var/app/config/google-prod-service-account.json"
OPENAI_API_KEY="sk-prod-..."
```

---

## 환경 변수 검증

### 시작 시 검증

애플리케이션 시작 시 필수 환경 변수를 검증합니다:

```typescript
// src/config/validateEnv.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REDIS_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### 수동 검증

```bash
# 환경 변수 확인 스크립트
npm run check:env

# 또는 수동 확인
node -e "
const required = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL'];
required.forEach(v => {
  if (!process.env[v]) console.error('Missing:', v);
  else console.log('✓', v);
});
"
```

---

## 보안 모범 사례

### 1. 환경 변수 관리

- ✅ `.env` 파일을 `.gitignore`에 추가
- ✅ `.env.example`만 버전 관리에 포함
- ✅ 환경별로 다른 값 사용
- ✅ 프로덕션 키는 별도 관리 (AWS Secrets Manager, HashiCorp Vault 등)

### 2. 비밀 키 생성

```bash
# 강력한 JWT 시크릿 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 또는
openssl rand -base64 64
```

### 3. 접근 제한

```bash
# .env 파일 권한 설정 (Linux/Mac)
chmod 600 .env

# 소유자만 읽기/쓰기 가능
ls -la .env
# -rw------- 1 user user 1234 Jan 15 10:30 .env
```

### 4. 정기 로테이션

- JWT_SECRET: 3-6개월마다 변경
- API 키: 서비스 제공자 권장사항 따름
- 데이터베이스 비밀번호: 6개월마다 변경

---

## 문제 해결

### 환경 변수가 로드되지 않음

```bash
# dotenv 패키지 확인
npm list dotenv

# .env 파일 위치 확인
ls -la .env

# 환경 변수 출력 (디버깅)
node -e "require('dotenv').config(); console.log(process.env.PORT)"
```

### 데이터베이스 연결 실패

```bash
# DATABASE_URL 형식 확인
echo $DATABASE_URL

# PostgreSQL 연결 테스트
psql "$DATABASE_URL" -c "SELECT 1"

# 또는 npm 스크립트
npm run db:check
```

### Redis 연결 실패

```bash
# REDIS_URL 확인
echo $REDIS_URL

# Redis 연결 테스트
redis-cli -u "$REDIS_URL" ping
```

---

## 추가 리소스

- [환경 설정 가이드](../../docs/ENVIRONMENT_SETUP.md)
- [배포 가이드](./AI_INSIGHTS_DEPLOYMENT.md)
- [보안 가이드](../../docs/SECURITY_PERFORMANCE_GUIDE.md)

---

## 지원

환경 변수 관련 문제:
- GitHub Issues
- 이메일: support@healthplatform.com
- 문서: [전체 문서](../../docs/README.md)
