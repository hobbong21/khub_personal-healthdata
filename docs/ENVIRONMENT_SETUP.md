# 환경 설정 가이드

개인 건강 플랫폼을 실행하기 위한 환경 설정 가이드입니다.

## 필수 요구사항

### 시스템 요구사항
- Node.js 18.0 이상
- PostgreSQL 14.0 이상
- Redis 6.0 이상 (캐싱용)
- Git

### 외부 서비스 계정
다음 서비스들의 API 키가 필요합니다:
- Google Cloud Platform (Vision API, Natural Language API)
- OpenAI (GPT API)
- AWS (S3 파일 저장소)
- Google Fit API (웨어러블 연동)
- Apple Health (iOS 앱 연동 시)

## 환경 변수 설정

### 백엔드 환경 변수 (.env)

`backend/.env` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# 서버 설정
PORT=5000
NODE_ENV=development

# 데이터베이스 설정
DATABASE_URL="postgresql://username:password@localhost:5432/health_platform_db"

# JWT 인증 설정
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d

# Redis 캐싱 설정
REDIS_URL=redis://localhost:6379

# Google Cloud Platform 설정
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
GOOGLE_VISION_API_KEY=your-google-vision-api-key

# OpenAI API 설정
OPENAI_API_KEY=your-openai-api-key

# AWS S3 설정 (파일 업로드용)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1

# Google Fit API 설정
GOOGLE_FIT_CLIENT_ID=your-google-fit-client-id
GOOGLE_FIT_CLIENT_SECRET=your-google-fit-client-secret
GOOGLE_FIT_REDIRECT_URI=http://localhost:3000/google-fit/callback

# Apple Health 설정 (선택사항)
APPLE_HEALTH_WEBHOOK_SECRET=your-apple-health-webhook-secret

# 파일 업로드 설정
MAX_FILE_SIZE=10mb
UPLOAD_PATH=./uploads

# Rate Limiting 설정
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 이메일 서비스 설정 (알림용)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 암호화 설정 (민감한 데이터용)
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### 프론트엔드 환경 변수 (.env)

`frontend/.env` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# API 서버 URL
VITE_API_BASE_URL=http://localhost:5000/api

# 앱 정보
VITE_APP_NAME=Personal Health Platform
VITE_APP_VERSION=1.0.0

# Google Fit 클라이언트 설정
VITE_GOOGLE_FIT_CLIENT_ID=your-google-fit-client-id

# 환경 설정
VITE_NODE_ENV=development
```

## 외부 서비스 API 키 설정 가이드

### 1. Google Cloud Platform 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 다음 API들을 활성화:
   - Cloud Vision API (OCR 기능용)
   - Natural Language API (텍스트 분석용)
   - Google Fit API (웨어러블 연동용)
4. 서비스 계정 생성:
   - IAM & Admin > Service Accounts
   - "Create Service Account" 클릭
   - 역할: Editor 또는 필요한 API별 권한 부여
   - JSON 키 파일 다운로드
5. 다운로드한 JSON 파일을 `backend/config/` 폴더에 저장
6. `GOOGLE_APPLICATION_CREDENTIALS` 환경 변수에 파일 경로 설정

### 2. OpenAI API 설정

1. [OpenAI Platform](https://platform.openai.com/)에 가입
2. API Keys 섹션에서 새 API 키 생성
3. `OPENAI_API_KEY` 환경 변수에 설정

### 3. AWS S3 설정

1. [AWS Console](https://aws.amazon.com/console/)에 로그인
2. S3 서비스에서 새 버킷 생성
3. IAM에서 새 사용자 생성 및 S3 권한 부여
4. Access Key와 Secret Key를 환경 변수에 설정

### 4. Google Fit API 설정

1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
2. 승인된 리디렉션 URI 추가: `http://localhost:3000/google-fit/callback`
3. 클라이언트 ID와 시크릿을 환경 변수에 설정

## 데이터베이스 설정

### PostgreSQL 설치 및 설정

1. PostgreSQL 설치:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS (Homebrew)
   brew install postgresql
   
   # Windows
   # PostgreSQL 공식 웹사이트에서 설치 프로그램 다운로드
   ```

2. 데이터베이스 생성:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE health_platform_db;
   CREATE USER health_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE health_platform_db TO health_user;
   \q
   ```

3. 환경 변수 업데이트:
   ```bash
   DATABASE_URL="postgresql://health_user:your_password@localhost:5432/health_platform_db"
   ```

### Redis 설치 및 설정

1. Redis 설치:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS (Homebrew)
   brew install redis
   
   # Windows
   # Redis 공식 웹사이트에서 설치 프로그램 다운로드
   ```

2. Redis 서비스 시작:
   ```bash
   # Linux/macOS
   redis-server
   
   # 또는 백그라운드 서비스로 실행
   sudo systemctl start redis
   ```

## 프로젝트 설정

### 1. 의존성 설치

```bash
# 루트 디렉토리에서
npm install

# 백엔드 의존성 설치
cd backend
npm install

# 프론트엔드 의존성 설치
cd ../frontend
npm install
```

### 2. 데이터베이스 마이그레이션

```bash
cd backend
npm run migrate
```

### 3. 시드 데이터 생성 (선택사항)

```bash
cd backend
npm run seed
```

## 개발 서버 실행

### 백엔드 서버 실행

```bash
cd backend
npm run dev
```

서버가 http://localhost:5000에서 실행됩니다.

### 프론트엔드 서버 실행

```bash
cd frontend
npm run dev
```

프론트엔드가 http://localhost:3000에서 실행됩니다.

## 보안 고려사항

### 1. JWT Secret 설정
- 최소 32자 이상의 복잡한 문자열 사용
- 프로덕션에서는 환경별로 다른 키 사용

### 2. 데이터베이스 보안
- 강력한 비밀번호 사용
- 프로덕션에서는 SSL 연결 사용

### 3. API 키 보안
- .env 파일을 .gitignore에 추가
- 프로덕션에서는 환경 변수로 관리
- 정기적으로 API 키 로테이션

### 4. HTTPS 설정
- 프로덕션에서는 반드시 HTTPS 사용
- SSL 인증서 설정

## 문제 해결

### 일반적인 문제들

1. **데이터베이스 연결 오류**
   - PostgreSQL 서비스가 실행 중인지 확인
   - DATABASE_URL이 올바른지 확인
   - 방화벽 설정 확인

2. **Redis 연결 오류**
   - Redis 서비스가 실행 중인지 확인
   - REDIS_URL이 올바른지 확인

3. **API 키 오류**
   - 모든 필수 API 키가 설정되었는지 확인
   - API 키가 유효한지 확인
   - 서비스별 사용량 제한 확인

4. **파일 업로드 오류**
   - uploads 디렉토리 권한 확인
   - MAX_FILE_SIZE 설정 확인
   - AWS S3 권한 설정 확인

### 로그 확인

```bash
# 백엔드 로그
cd backend
npm run logs

# 프론트엔드 개발 서버 로그
cd frontend
npm run dev
```

## 프로덕션 배포

프로덕션 환경에서는:
1. NODE_ENV=production 설정
2. 모든 API 키를 환경 변수로 설정
3. HTTPS 사용
4. 데이터베이스 백업 설정
5. 모니터링 및 로깅 설정

자세한 배포 가이드는 `DEPLOYMENT.md`를 참조하세요.