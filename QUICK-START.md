# 🚀 K-hub 빠른 시작 가이드

## 📋 사전 준비사항

1. **Docker 설치** (필수)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
   - Docker가 정상적으로 실행되는지 확인: `docker --version`

2. **Docker Compose 설치** (Docker Desktop에 포함됨)
   - 확인: `docker-compose --version`

## ⚡ 30초 만에 시작하기

### 1단계: 프로젝트 클론 및 이동
```bash
git clone <repository-url>
cd knowledge-hub-for-personal-healthcare
```

### 2단계: 환경 설정
```bash
# 환경 변수 파일 생성
copy .env.example .env

# Windows에서 배포 스크립트 실행
.\deploy.sh
```

### 3단계: 개발 환경 시작
배포 스크립트에서 **1번 (개발 환경 배포)** 선택

또는 직접 명령어 실행:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4단계: 접속 확인
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:3001
- **데이터베이스**: localhost:5433

## 🎯 프로덕션 배포

### 빠른 프로덕션 배포
```bash
# 배포 스크립트 사용
.\deploy.sh prod

# 또는 직접 명령어
docker-compose up -d
```

### 접속 정보
- **웹사이트**: http://localhost
- **API**: http://localhost:3000

## 🛠️ 주요 명령어

### Make 사용 (Linux/Mac)
```bash
make dev-up        # 개발 환경 시작
make dev-down      # 개발 환경 중지
make up            # 프로덕션 환경 시작
make down          # 프로덕션 환경 중지
make logs          # 로그 확인
make status        # 상태 확인
```

### Docker Compose 직접 사용
```bash
# 개발 환경
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down

# 프로덕션 환경
docker-compose up -d
docker-compose down

# 로그 확인
docker-compose logs -f
```

### 배포 스크립트 사용 (Windows)
```bash
.\deploy.sh dev          # 개발 환경 배포
.\deploy.sh prod         # 프로덕션 환경 배포
.\deploy.sh stop-dev     # 개발 환경 중지
.\deploy.sh logs-dev     # 개발 환경 로그
.\deploy.sh clean        # 리소스 정리
```

## 🔧 환경 변수 설정

`.env` 파일에서 다음 값들을 설정하세요:

### 필수 설정
```bash
# 데이터베이스
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_PASSWORD=your-redis-password

# JWT 보안
JWT_SECRET=your-super-secret-jwt-key
```

### 선택적 설정 (고급 기능용)
```bash
# AI 기능
OPENAI_API_KEY=your-openai-key
GOOGLE_VISION_API_KEY=your-google-vision-key

# 클라우드 저장소
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-s3-bucket
```

## 📊 서비스 상태 확인

### 헬스체크
```bash
# 모든 서비스 상태
docker-compose ps

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend
```

### 웹 접속 테스트
```bash
# API 헬스체크
curl http://localhost:3000/api/health

# 프론트엔드 접속
curl http://localhost:5173  # 개발환경
curl http://localhost       # 프로덕션환경
```

## 🚨 문제 해결

### 포트 충돌 시
```bash
# 사용 중인 포트 확인
netstat -ano | findstr :80
netstat -ano | findstr :3000

# 다른 포트 사용 (docker-compose.yml 수정)
ports:
  - "8080:80"    # 80 대신 8080 사용
  - "3001:3000"  # 3000 대신 3001 사용
```

### 메모리 부족 시
```bash
# Docker 리소스 정리
docker system prune -f
docker volume prune -f

# 또는 배포 스크립트 사용
.\deploy.sh clean
```

### 데이터베이스 연결 실패 시
```bash
# 데이터베이스 컨테이너 재시작
docker-compose restart postgres

# 연결 테스트
docker-compose exec postgres pg_isready -U khub_user
```

## 📱 기능 테스트

### 1. 웹사이트 접속
- http://localhost (프로덕션) 또는 http://localhost:5173 (개발)
- 메인 페이지가 정상적으로 로드되는지 확인

### 2. 회원가입/로그인
- 회원가입 페이지에서 계정 생성
- 로그인 페이지에서 로그인 테스트

### 3. 대시보드 확인
- 로그인 후 대시보드 접속
- 건강 데이터 차트가 표시되는지 확인

### 4. API 테스트
```bash
# 헬스체크 API
curl http://localhost:3000/api/health

# 사용자 등록 API (예시)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔄 업데이트 및 재배포

### 코드 변경 후 재배포
```bash
# 개발 환경 (핫 리로드 지원)
# 코드 변경 시 자동으로 반영됨

# 프로덕션 환경
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 데이터베이스 마이그레이션
```bash
# 마이그레이션 실행
docker-compose exec backend npx prisma migrate deploy

# 시드 데이터 삽입
docker-compose exec backend npm run db:seed
```

## 📞 지원 및 문의

- **문서**: README-Docker.md 참조
- **이슈 리포트**: GitHub Issues
- **로그 확인**: `docker-compose logs -f`

---

🎉 **축하합니다!** K-hub 개인 건강 관리 플랫폼이 성공적으로 실행되었습니다.

더 자세한 설정 및 고급 기능은 `README-Docker.md` 파일을 참조하세요.