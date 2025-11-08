# AI Insights Module 배포 가이드

## 개요

이 문서는 AI Insights Module을 프로덕션 환경에 배포하는 방법을 설명합니다.

## 목차

1. [사전 요구사항](#사전-요구사항)
2. [환경 변수 설정](#환경-변수-설정)
3. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
4. [배포 단계](#배포-단계)
5. [배포 후 검증](#배포-후-검증)
6. [모니터링 및 로깅](#모니터링-및-로깅)
7. [롤백 절차](#롤백-절차)
8. [문제 해결](#문제-해결)

---

## 사전 요구사항

### 시스템 요구사항

- **Node.js**: 18.0 이상
- **PostgreSQL**: 14.0 이상
- **Redis**: 6.0 이상 (캐싱용)
- **메모리**: 최소 2GB RAM
- **디스크**: 최소 10GB 여유 공간

### 필수 도구

```bash
# Node.js 버전 확인
node --version  # v18.0.0 이상

# npm 버전 확인
npm --version   # 8.0.0 이상

# PostgreSQL 확인
psql --version  # 14.0 이상

# Redis 확인
redis-cli --version  # 6.0 이상
```

### 접근 권한

- 데이터베이스 관리자 권한
- 서버 SSH 접근 권한
- 환경 변수 설정 권한

---

## 환경 변수 설정

### 필수 환경 변수

AI Insights Module이 작동하려면 다음 환경 변수가 설정되어야 합니다:

```bash
# backend/.env 또는 프로덕션 환경 설정

# AI Insights 캐시 설정
AI_INSIGHTS_CACHE_TTL=3600              # 캐시 유효 시간 (초), 기본값: 3600 (1시간)
AI_INSIGHTS_MIN_DATA_POINTS=3           # 분석에 필요한 최소 데이터 포인트, 기본값: 3

# 데이터베이스 (기존)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Redis (캐싱)
REDIS_URL="redis://localhost:6379"

# JWT 인증 (기존)
JWT_SECRET="your-production-jwt-secret"
JWT_EXPIRES_IN=7d

# 서버 설정 (기존)
PORT=5000
NODE_ENV=production
```

### 환경별 설정

#### 개발 환경 (.env.development)

```bash
AI_INSIGHTS_CACHE_TTL=300               # 5분 (빠른 테스트)
AI_INSIGHTS_MIN_DATA_POINTS=1           # 낮은 임계값
NODE_ENV=development
```

#### 스테이징 환경 (.env.staging)

```bash
AI_INSIGHTS_CACHE_TTL=1800              # 30분
AI_INSIGHTS_MIN_DATA_POINTS=3
NODE_ENV=staging
```

#### 프로덕션 환경 (.env.production)

```bash
AI_INSIGHTS_CACHE_TTL=3600              # 1시간
AI_INSIGHTS_MIN_DATA_POINTS=3
NODE_ENV=production
```

### 환경 변수 검증

배포 전 환경 변수가 올바르게 설정되었는지 확인:

```bash
cd backend
npm run check:env
```

또는 수동 확인:

```bash
# .env 파일 확인
cat .env | grep AI_INSIGHTS

# 환경 변수 출력 (민감 정보 주의)
echo $AI_INSIGHTS_CACHE_TTL
echo $AI_INSIGHTS_MIN_DATA_POINTS
```

---

## 데이터베이스 마이그레이션

### 1. 마이그레이션 파일 확인

AI Insights Module은 새로운 데이터베이스 테이블을 추가합니다:

```bash
# 마이그레이션 파일 위치
backend/prisma/migrations/YYYYMMDDHHMMSS_add_ai_insight_cache/
```

### 2. 마이그레이션 실행

#### 프로덕션 데이터베이스 백업

```bash
# PostgreSQL 백업
pg_dump -U username -h hostname dbname > backup_$(date +%Y%m%d_%H%M%S).sql

# 백업 확인
ls -lh backup_*.sql
```

#### 마이그레이션 적용

```bash
cd backend

# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행 (프로덕션)
npx prisma migrate deploy

# 마이그레이션 상태 확인
npx prisma migrate status
```

### 3. 스키마 검증

```bash
# 데이터베이스 연결 및 테이블 확인
psql -U username -h hostname -d dbname -c "\dt"

# AIInsightCache 테이블 확인
psql -U username -h hostname -d dbname -c "\d AIInsightCache"
```

예상 출력:

```
                                Table "public.AIInsightCache"
    Column     |           Type           | Collation | Nullable |      Default
---------------+--------------------------+-----------+----------+-------------------
 id            | text                     |           | not null |
 userId        | text                     |           | not null |
 insightsData  | jsonb                    |           | not null |
 generatedAt   | timestamp(3)             |           | not null | CURRENT_TIMESTAMP
 expiresAt     | timestamp(3)             |           | not null |
Indexes:
    "AIInsightCache_pkey" PRIMARY KEY, btree (id)
    "AIInsightCache_userId_idx" btree ("userId")
    "AIInsightCache_expiresAt_idx" btree ("expiresAt")
```

---

## 배포 단계

### 단계별 배포 프로세스

#### 1. 코드 준비

```bash
# 최신 코드 가져오기
git fetch origin
git checkout main
git pull origin main

# 의존성 설치
cd backend
npm ci  # 프로덕션용 clean install

cd ../frontend
npm ci
```

#### 2. 빌드

```bash
# 백엔드 빌드
cd backend
npm run build

# 빌드 확인
ls -la dist/

# 프론트엔드 빌드
cd ../frontend
npm run build

# 빌드 확인
ls -la dist/
```

#### 3. 테스트 실행

```bash
# 백엔드 테스트
cd backend
npm test

# AI Insights 특정 테스트
npm test -- aiInsights

# 통합 테스트
npm run test:integration
```

#### 4. 배포 실행

##### Docker를 사용하는 경우

```bash
# Docker 이미지 빌드
docker-compose -f docker-compose.prod.yml build

# 컨테이너 시작
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f backend
```

##### PM2를 사용하는 경우

```bash
# 백엔드 배포
cd backend
pm2 start ecosystem.config.js --env production

# 또는
pm2 start dist/server.js --name health-platform-backend

# 프론트엔드 배포 (Nginx)
cd ../frontend
sudo cp -r dist/* /var/www/html/

# Nginx 재시작
sudo systemctl restart nginx
```

##### 수동 배포

```bash
# 백엔드 시작
cd backend
NODE_ENV=production node dist/server.js

# 또는 npm script 사용
npm start
```

---

## 배포 후 검증

### 1. 헬스 체크

```bash
# 서버 상태 확인
curl http://localhost:5000/health

# 예상 응답
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45
}
```

### 2. AI Insights API 테스트

```bash
# 로그인하여 JWT 토큰 획득
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# AI Insights 조회
curl -X GET http://localhost:5000/api/ai-insights \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 건강 점수 조회
curl -X GET http://localhost:5000/api/ai-insights/health-score \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.score'

# 트렌드 조회
curl -X GET "http://localhost:5000/api/ai-insights/trends?period=30" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[0]'
```

### 3. 캐시 동작 확인

```bash
# Redis 연결 확인
redis-cli ping
# 예상 응답: PONG

# 캐시 키 확인
redis-cli KEYS "ai-insights:*"

# 캐시 TTL 확인
redis-cli TTL "ai-insights:user-123"
```

### 4. 데이터베이스 확인

```bash
# AIInsightCache 테이블 레코드 수 확인
psql -U username -h hostname -d dbname -c \
  "SELECT COUNT(*) FROM \"AIInsightCache\";"

# 최근 생성된 캐시 확인
psql -U username -h hostname -d dbname -c \
  "SELECT id, \"userId\", \"generatedAt\", \"expiresAt\" 
   FROM \"AIInsightCache\" 
   ORDER BY \"generatedAt\" DESC 
   LIMIT 5;"
```

### 5. 로그 확인

```bash
# PM2 로그
pm2 logs health-platform-backend --lines 100

# Docker 로그
docker-compose logs -f backend --tail=100

# 시스템 로그
tail -f /var/log/health-platform/backend.log
```

### 6. 성능 테스트

```bash
# 응답 시간 측정 (캐시 미스)
time curl -X POST http://localhost:5000/api/ai-insights/refresh \
  -H "Authorization: Bearer $TOKEN"

# 응답 시간 측정 (캐시 히트)
time curl -X GET http://localhost:5000/api/ai-insights \
  -H "Authorization: Bearer $TOKEN"
```

---

## 모니터링 및 로깅

### 1. 로그 수집

AI Insights Module은 다음 이벤트를 로깅합니다:

```typescript
// 로그 예시
[INFO] AI Insights generated for user: user-123, duration: 523ms
[INFO] Cache hit for user: user-456
[WARN] Insufficient data for user: user-789, data points: 2
[ERROR] Failed to generate insights for user: user-101, error: Database connection timeout
```

### 2. 모니터링 메트릭

추적해야 할 주요 메트릭:

- **응답 시간**
  - 캐시 히트: < 100ms
  - 캐시 미스: < 1000ms
  
- **캐시 히트율**
  - 목표: > 80%
  
- **에러율**
  - 목표: < 1%
  
- **API 호출 수**
  - 분당 요청 수 (RPM)
  
- **데이터베이스 쿼리 시간**
  - 평균: < 200ms

### 3. 알림 설정

중요 이벤트에 대한 알림 설정:

```yaml
# 예시: Prometheus AlertManager 규칙
groups:
  - name: ai_insights
    rules:
      - alert: HighErrorRate
        expr: rate(ai_insights_errors_total[5m]) > 0.05
        annotations:
          summary: "AI Insights 에러율 높음"
          
      - alert: SlowResponse
        expr: histogram_quantile(0.95, ai_insights_duration_seconds) > 2
        annotations:
          summary: "AI Insights 응답 시간 느림"
          
      - alert: LowCacheHitRate
        expr: ai_insights_cache_hit_rate < 0.7
        annotations:
          summary: "캐시 히트율 낮음"
```

### 4. 대시보드

Grafana 또는 유사한 도구로 대시보드 구성:

- AI Insights 요청 수 (시간별)
- 평균 응답 시간
- 캐시 히트율
- 에러율
- 사용자별 인사이트 생성 빈도

---

## 롤백 절차

문제 발생 시 이전 버전으로 롤백:

### 1. 긴급 롤백

```bash
# Docker 사용 시
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# PM2 사용 시
pm2 stop health-platform-backend
git checkout <previous-commit-hash>
cd backend
npm ci
npm run build
pm2 restart health-platform-backend
```

### 2. 데이터베이스 롤백

```bash
# 마이그레이션 롤백 (주의: 데이터 손실 가능)
cd backend
npx prisma migrate resolve --rolled-back <migration-name>

# 또는 백업에서 복원
psql -U username -h hostname -d dbname < backup_YYYYMMDD_HHMMSS.sql
```

### 3. 캐시 초기화

```bash
# Redis 캐시 삭제
redis-cli FLUSHDB

# 또는 AI Insights 캐시만 삭제
redis-cli --scan --pattern "ai-insights:*" | xargs redis-cli DEL
```

---

## 문제 해결

### 일반적인 문제

#### 1. "Insufficient data" 메시지

**증상**: 사용자가 인사이트를 볼 수 없음

**원인**: 데이터 포인트 부족

**해결**:
```bash
# 최소 데이터 포인트 설정 확인
echo $AI_INSIGHTS_MIN_DATA_POINTS

# 임계값 낮추기 (임시)
export AI_INSIGHTS_MIN_DATA_POINTS=1

# 또는 .env 파일 수정
AI_INSIGHTS_MIN_DATA_POINTS=1
```

#### 2. 캐시 미작동

**증상**: 모든 요청이 느림

**원인**: Redis 연결 문제

**해결**:
```bash
# Redis 상태 확인
redis-cli ping

# Redis 재시작
sudo systemctl restart redis

# Redis 로그 확인
sudo journalctl -u redis -f
```

#### 3. 높은 메모리 사용량

**증상**: 서버 메모리 부족

**원인**: 캐시 데이터 과다 축적

**해결**:
```bash
# 캐시 크기 확인
redis-cli INFO memory

# 만료된 캐시 정리
redis-cli --scan --pattern "ai-insights:*" | while read key; do
  redis-cli TTL "$key" | grep -q "^-1$" && redis-cli DEL "$key"
done

# 캐시 TTL 단축
AI_INSIGHTS_CACHE_TTL=1800  # 30분으로 변경
```

#### 4. 데이터베이스 연결 오류

**증상**: "Database connection timeout"

**원인**: 데이터베이스 연결 풀 고갈

**해결**:
```bash
# 연결 풀 설정 확인 (prisma/schema.prisma)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20  # 증가
}

# Prisma 재생성
npx prisma generate

# 서버 재시작
pm2 restart health-platform-backend
```

### 로그 분석

```bash
# 에러 로그 필터링
pm2 logs health-platform-backend | grep ERROR

# 특정 사용자 로그 추적
pm2 logs health-platform-backend | grep "user-123"

# 느린 쿼리 찾기
pm2 logs health-platform-backend | grep "duration:" | awk '$NF > 1000'
```

---

## 성능 최적화

### 1. 데이터베이스 인덱스

```sql
-- 인덱스 확인
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'AIInsightCache';

-- 필요시 추가 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ai_cache_user_expires 
ON "AIInsightCache" ("userId", "expiresAt");
```

### 2. 캐시 전략 조정

```bash
# 피크 시간대에는 캐시 TTL 증가
AI_INSIGHTS_CACHE_TTL=7200  # 2시간

# 야간에는 캐시 TTL 감소
AI_INSIGHTS_CACHE_TTL=1800  # 30분
```

### 3. 연결 풀 최적화

```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 50
  poolTimeout = 30
}
```

---

## 체크리스트

배포 전 확인사항:

- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 백업 완료
- [ ] 마이그레이션 테스트 완료
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 빌드 성공
- [ ] Redis 연결 확인
- [ ] 롤백 계획 수립

배포 후 확인사항:

- [ ] 헬스 체크 통과
- [ ] API 엔드포인트 정상 작동
- [ ] 캐시 동작 확인
- [ ] 로그 정상 출력
- [ ] 모니터링 대시보드 확인
- [ ] 성능 메트릭 정상 범위
- [ ] 사용자 테스트 완료

---

## 추가 리소스

- [AI Insights API 문서](./AI_INSIGHTS_API.md)
- [성능 최적화 가이드](./AI_INSIGHTS_PERFORMANCE_GUIDE.md)
- [전체 프로젝트 문서](../../docs/README.md)
- [배포 설정 요약](../../docs/deployment/DEPLOYMENT_SETUP_SUMMARY.md)

---

## 지원

문제가 발생하면:
1. 로그 확인
2. [문제 해결](#문제-해결) 섹션 참조
3. GitHub Issues 생성
4. 이메일: support@healthplatform.com
