# K-hub Docker 배포 가이드

## 📋 개요

K-hub 개인 건강 플랫폼을 Docker를 사용하여 쉽게 배포하고 관리할 수 있는 가이드입니다.

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 환경 변수 파일 생성
cp .env.example .env

# .env 파일을 편집하여 필요한 값들을 설정
nano .env
```

### 2. 개발 환경 실행

```bash
# 개발 환경 시작
make dev-up

# 또는 직접 docker-compose 사용
docker-compose -f docker-compose.dev.yml up -d
```

**개발 환경 접속:**
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3001
- PostgreSQL: localhost:5433
- Redis: localhost:6380

### 3. 프로덕션 환경 실행

```bash
# 프로덕션 환경 시작
make up

# 또는 직접 docker-compose 사용
docker-compose up -d
```

**프로덕션 환경 접속:**
- 웹사이트: http://localhost
- API: http://localhost:3000

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Nginx)       │◄──►│   (Node.js)     │
│   Port: 80      │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │   PostgreSQL    │
         │              │   Port: 5432    │
         │              └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────│     Redis       │
                        │   Port: 6379    │
                        └─────────────────┘
```

## 📦 서비스 구성

### 프론트엔드 (frontend)
- **기술**: React + TypeScript + Vite
- **웹서버**: Nginx
- **포트**: 80 (HTTP), 443 (HTTPS)
- **기능**: 
  - 정적 파일 서빙
  - SPA 라우팅 지원
  - API 프록시
  - Gzip 압축
  - 보안 헤더

### 백엔드 (backend)
- **기술**: Node.js + Express + TypeScript
- **포트**: 3000
- **기능**:
  - REST API
  - JWT 인증
  - 파일 업로드
  - 헬스체크

### 데이터베이스 (postgres)
- **기술**: PostgreSQL 15
- **포트**: 5432
- **기능**:
  - 주 데이터 저장소
  - 자동 백업
  - 헬스체크

### 캐시 (redis)
- **기술**: Redis 7
- **포트**: 6379
- **기능**:
  - 세션 저장
  - 캐싱
  - 실시간 데이터

## 🛠️ 관리 명령어

### Makefile 사용

```bash
# 도움말 보기
make help

# 개발 환경
make dev-up        # 개발 환경 시작
make dev-down      # 개발 환경 중지
make dev-logs      # 개발 환경 로그 확인

# 프로덕션 환경
make up            # 프로덕션 환경 시작
make down          # 프로덕션 환경 중지
make logs          # 로그 확인
make restart       # 재시작

# 빌드
make build         # 모든 이미지 빌드
make build-backend # 백엔드만 빌드
make build-frontend # 프론트엔드만 빌드

# 데이터베이스
make db-migrate    # 마이그레이션 실행
make db-seed       # 시드 데이터 삽입
make db-backup     # 백업 생성

# 유틸리티
make clean         # 사용하지 않는 리소스 정리
make status        # 서비스 상태 확인
make shell         # 백엔드 컨테이너 쉘 접속
```

### Docker Compose 직접 사용

```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f [서비스명]

# 특정 서비스 재시작
docker-compose restart [서비스명]

# 컨테이너 쉘 접속
docker-compose exec [서비스명] sh
```

## 🔧 환경 변수

### 필수 환경 변수

```bash
# 데이터베이스
POSTGRES_DB=khub_db
POSTGRES_USER=khub_user
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://khub_user:password@postgres:5432/khub_db

# Redis
REDIS_PASSWORD=your-redis-password
REDIS_URL=redis://:password@redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
```

### 선택적 환경 변수

```bash
# 외부 API
GOOGLE_VISION_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket

# 모니터링
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-key
```

## 📊 모니터링 및 로깅

### 헬스체크

모든 서비스에는 헬스체크가 구성되어 있습니다:

```bash
# 서비스 상태 확인
docker-compose ps

# 헬스체크 로그 확인
docker inspect --format='{{json .State.Health}}' khub-backend
```

### 로그 관리

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend

# 로그 파일 위치
./backend/logs/     # 백엔드 로그
/var/log/nginx/     # Nginx 로그 (컨테이너 내부)
```

## 🔒 보안 설정

### SSL/TLS 설정

프로덕션 환경에서 HTTPS를 사용하려면:

1. SSL 인증서 준비
2. `nginx.conf` 수정
3. 환경 변수 설정

```bash
# SSL 인증서 디렉토리 생성
mkdir -p nginx/ssl

# 인증서 파일 복사
cp your-cert.pem nginx/ssl/
cp your-key.pem nginx/ssl/
```

### 방화벽 설정

```bash
# 필요한 포트만 열기
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 22/tcp    # SSH
```

## 📈 성능 최적화

### 리소스 제한

`docker-compose.yml`에서 리소스 제한 설정:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 캐싱 전략

- Nginx에서 정적 파일 캐싱
- Redis를 통한 API 응답 캐싱
- PostgreSQL 쿼리 최적화

## 🚨 트러블슈팅

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 사용 중인 포트 확인
   netstat -tulpn | grep :80
   
   # 포트 변경 (docker-compose.yml)
   ports:
     - "8080:80"  # 80 대신 8080 사용
   ```

2. **메모리 부족**
   ```bash
   # Docker 메모리 사용량 확인
   docker stats
   
   # 불필요한 컨테이너 정리
   make clean
   ```

3. **데이터베이스 연결 실패**
   ```bash
   # 데이터베이스 상태 확인
   docker-compose exec postgres pg_isready
   
   # 연결 테스트
   docker-compose exec backend npm run db:check
   ```

### 로그 분석

```bash
# 에러 로그만 필터링
docker-compose logs backend | grep ERROR

# 특정 시간대 로그
docker-compose logs --since="2024-01-01T00:00:00" backend
```

## 🔄 업데이트 및 배포

### 롤링 업데이트

```bash
# 1. 새 이미지 빌드
make build

# 2. 서비스별 순차 업데이트
docker-compose up -d --no-deps backend
docker-compose up -d --no-deps frontend

# 3. 헬스체크 확인
make status
```

### 백업 및 복구

```bash
# 데이터베이스 백업
make db-backup

# 볼륨 백업
docker run --rm -v khub_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# 복구
docker run --rm -v khub_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

## 📞 지원

문제가 발생하거나 도움이 필요한 경우:

1. 이슈 트래커에 문제 보고
2. 로그 파일과 함께 상세한 설명 제공
3. 환경 정보 (OS, Docker 버전 등) 포함

---

**참고**: 이 가이드는 K-hub 개인 건강 플랫폼의 Docker 배포를 위한 것입니다. 프로덕션 환경에서는 추가적인 보안 설정과 모니터링이 필요할 수 있습니다.