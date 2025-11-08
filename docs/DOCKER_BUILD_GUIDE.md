# Docker 이미지 빌드 가이드

## 📋 개요

이 가이드는 Personal Health Platform의 Docker 이미지를 빌드하고 배포하는 방법을 설명합니다.

## 🔧 사전 요구사항

- Docker 20.10 이상
- Docker Compose 2.0 이상
- 최소 4GB RAM
- 최소 10GB 디스크 공간

## 📦 프로젝트 구조

```
.
├── backend/
│   ├── Dockerfile              # 백엔드 이미지 빌드 파일
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # 프론트엔드 이미지 빌드 파일
│   └── .dockerignore
├── docker-compose.yml          # 전체 스택 오케스트레이션
├── docker-compose.dev.yml      # 개발 환경 설정
├── docker-compose.prod.yml     # 프로덕션 환경 설정
└── .env.docker                 # 환경 변수 템플릿
```

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# .env.docker를 .env로 복사
cp .env.docker .env

# .env 파일을 편집하여 실제 값으로 변경
# 특히 다음 값들을 반드시 변경하세요:
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD
# - JWT_SECRET
```

### 2. 전체 스택 빌드 및 실행

```bash
# 모든 서비스 빌드 및 시작
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 서비스 상태 확인
docker-compose ps
```

### 3. 개별 서비스 빌드

#### 백엔드만 빌드
```bash
cd backend
docker build -t health-platform-backend:latest .
```

#### 프론트엔드만 빌드
```bash
cd frontend
docker build -t health-platform-frontend:latest .
```

## 🏗️ 빌드 옵션

### 개발 환경 빌드

```bash
# 개발 환경으로 빌드 (핫 리로드 포함)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### 프로덕션 환경 빌드

```bash
# 프로덕션 최적화 빌드
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 캐시 없이 빌드

```bash
# 캐시를 사용하지 않고 처음부터 빌드
docker-compose build --no-cache
```

## 📊 이미지 최적화

### Multi-stage 빌드

두 Dockerfile 모두 multi-stage 빌드를 사용하여 이미지 크기를 최소화합니다:

**백엔드 이미지:**
- Stage 1 (builder): TypeScript 컴파일
- Stage 2 (production): 프로덕션 의존성만 포함
- 최종 이미지 크기: ~150MB

**프론트엔드 이미지:**
- Stage 1 (builder): React 앱 빌드
- Stage 2 (production): Nginx + 정적 파일만
- 최종 이미지 크기: ~25MB

### 이미지 크기 확인

```bash
# 빌드된 이미지 크기 확인
docker images | grep health-platform

# 예상 출력:
# health-platform-backend    latest    abc123    150MB
# health-platform-frontend   latest    def456    25MB
```

## 🔍 트러블슈팅

### TypeScript 컴파일 오류

백엔드 빌드 시 TypeScript 오류가 발생하면:

```bash
# 로컬에서 먼저 빌드 테스트
cd backend
npm install
npm run build

# 오류 수정 후 다시 Docker 빌드
```

### 메모리 부족 오류

```bash
# Docker에 더 많은 메모리 할당
# Docker Desktop > Settings > Resources > Memory를 4GB 이상으로 설정
```

### 포트 충돌

```bash
# 사용 중인 포트 확인
netstat -ano | findstr :5001
netstat -ano | findstr :80

# .env 파일에서 포트 변경
BACKEND_PORT=5002
FRONTEND_PORT=8080
```

## 🐳 Docker Compose 명령어

### 서비스 관리

```bash
# 모든 서비스 시작
docker-compose up -d

# 특정 서비스만 시작
docker-compose up -d backend

# 서비스 중지
docker-compose stop

# 서비스 재시작
docker-compose restart

# 서비스 및 볼륨 삭제
docker-compose down -v
```

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend

# 최근 100줄만 보기
docker-compose logs --tail=100 backend
```

### 컨테이너 접속

```bash
# 백엔드 컨테이너 접속
docker-compose exec backend sh

# 프론트엔드 컨테이너 접속
docker-compose exec frontend sh

# PostgreSQL 접속
docker-compose exec postgres psql -U healthuser -d health_platform
```

## 📤 이미지 배포

### Docker Hub에 푸시

```bash
# Docker Hub 로그인
docker login

# 이미지 태그
docker tag health-platform-backend:latest yourusername/health-platform-backend:latest
docker tag health-platform-frontend:latest yourusername/health-platform-frontend:latest

# 이미지 푸시
docker push yourusername/health-platform-backend:latest
docker push yourusername/health-platform-frontend:latest
```

### 프라이빗 레지스트리에 푸시

```bash
# 프라이빗 레지스트리 로그인
docker login registry.example.com

# 이미지 태그
docker tag health-platform-backend:latest registry.example.com/health-platform-backend:latest

# 이미지 푸시
docker push registry.example.com/health-platform-backend:latest
```

## 🔐 보안 고려사항

### 1. 환경 변수 보안

```bash
# .env 파일을 절대 Git에 커밋하지 마세요
# .gitignore에 .env가 포함되어 있는지 확인

# 프로덕션에서는 Docker Secrets 사용
docker secret create jwt_secret jwt_secret.txt
```

### 2. 이미지 스캔

```bash
# Docker Scout로 취약점 스캔
docker scout cves health-platform-backend:latest

# Trivy로 스캔
trivy image health-platform-backend:latest
```

### 3. 최소 권한 원칙

- 백엔드 컨테이너는 non-root 사용자(nodejs)로 실행
- 프론트엔드는 Nginx alpine 이미지 사용
- 불필요한 패키지 제외

## 📈 성능 최적화

### 1. 빌드 캐시 활용

```bash
# BuildKit 활성화 (더 빠른 빌드)
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

docker-compose build
```

### 2. 레이어 최적화

- 자주 변경되지 않는 레이어를 먼저 배치
- package.json 복사 → npm install → 소스 코드 복사 순서 유지

### 3. 멀티 플랫폼 빌드

```bash
# ARM64와 AMD64 모두 지원하는 이미지 빌드
docker buildx build --platform linux/amd64,linux/arm64 -t health-platform-backend:latest .
```

## 🧪 헬스체크

모든 컨테이너에 헬스체크가 구성되어 있습니다:

```bash
# 헬스체크 상태 확인
docker-compose ps

# 수동 헬스체크
curl http://localhost:5001/health  # 백엔드
curl http://localhost/health       # 프론트엔드
```

## 📝 CI/CD 통합

### GitHub Actions 예제

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Backend
        run: |
          cd backend
          docker build -t ${{ secrets.DOCKER_USERNAME }}/health-platform-backend:${{ github.sha }} .
          docker push ${{ secrets.DOCKER_USERNAME }}/health-platform-backend:${{ github.sha }}
      
      - name: Build Frontend
        run: |
          cd frontend
          docker build -t ${{ secrets.DOCKER_USERNAME }}/health-platform-frontend:${{ github.sha }} .
          docker push ${{ secrets.DOCKER_USERNAME }}/health-platform-frontend:${{ github.sha }}
```

## 🆘 지원

문제가 발생하면:
1. [트러블슈팅 섹션](#-트러블슈팅) 확인
2. `docker-compose logs -f` 로그 확인
3. GitHub Issues에 문의
4. [Docker 문서](https://docs.docker.com/) 참조

## 📚 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [프로젝트 배포 가이드](./ai-insights/AI_INSIGHTS_DEPLOYMENT.md)
- [환경 변수 가이드](./ai-insights/ENVIRONMENT_VARIABLES.md)

---

**마지막 업데이트**: 2024-11-08  
**버전**: 1.0.0
