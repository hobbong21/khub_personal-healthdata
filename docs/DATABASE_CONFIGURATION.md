# 데이터베이스 구성 가이드

## 📋 개요

Personal Health Platform은 PostgreSQL 14를 주 데이터베이스로 사용하며, Prisma ORM을 통해 데이터베이스를 관리합니다.

## 🗄️ 데이터베이스 구조

### 주요 테이블 그룹

#### 1. 사용자 및 인증 (User & Auth)
- `users` - 사용자 기본 정보
- `user_roles` - 사용자 역할 관리
- `user_sessions` - 세션 관리
- `user_consents` - 사용자 동의 관리

#### 2. 건강 데이터 (Health Data)
- `health_records` - 건강 기록
- `vital_signs` - 바이탈 사인 (혈압, 심박수 등)
- `medical_records` - 진료 기록
- `test_results` - 검사 결과
- `prescriptions` - 처방전

#### 3. 복약 관리 (Medication Management)
- `medications` - 복약 정보
- `dosage_logs` - 복약 기록
- `side_effects` - 부작용 기록
- `drug_interactions` - 약물 상호작용
- `medication_schedules` - 복약 스케줄

#### 4. 유전체 데이터 (Genomic Data)
- `genomic_data` - 유전체 원본 데이터
- `snp_records` - SNP 레코드
- `risk_assessments` - 질병 위험도 평가
- `family_history` - 가족력
- `genetic_conditions` - 유전 질환 정보
- `family_risk_assessments` - 가족력 기반 위험도

#### 5. AI 및 예측 (AI & Predictions)
- `ai_models` - AI 모델 정보
- `predictions` - AI 예측 결과
- `ai_insight_cache` - AI 인사이트 캐시 ⭐
- `recommendations` - 맞춤형 추천
- `recommendation_effectiveness` - 추천 효과성 추적

#### 6. 웨어러블 연동 (Wearable Integration)
- `wearable_device_configs` - 웨어러블 기기 설정
- `wearable_data_points` - 웨어러블 데이터
- `wearable_data_temp` - 임시 웨어러블 데이터

#### 7. 예약 및 알림 (Appointments & Notifications)
- `appointments` - 병원 예약
- `appointment_notifications` - 예약 알림

#### 8. 보안 및 감사 (Security & Audit)
- `audit_logs` - 감사 로그
- `data_access_logs` - 데이터 접근 로그
- `security_events` - 보안 이벤트
- `encryption_keys` - 암호화 키 관리
- `backup_logs` - 백업 로그
- `compliance_reports` - 규정 준수 보고서

#### 9. 원격 모니터링 (Remote Monitoring)
- `remote_monitoring_sessions` - 원격 모니터링 세션
- `real_time_health_data` - 실시간 건강 데이터
- `health_alerts` - 건강 알림

#### 10. 텔레헬스 (Telehealth)
- `telehealth_integrations` - 텔레헬스 통합
- `telehealth_sessions` - 텔레헬스 세션

#### 11. 연구 참여 (Research Participation)
- `research_participations` - 연구 참여 정보
- `user_incentives` - 사용자 인센티브

## 🔧 데이터베이스 설정

### 1. PostgreSQL 설치

#### Docker 사용 (권장)
```bash
# docker-compose.yml 사용
docker-compose up -d postgres

# 또는 직접 실행
docker run -d \
  --name health-platform-db \
  -e POSTGRES_USER=healthuser \
  -e POSTGRES_PASSWORD=healthpass \
  -e POSTGRES_DB=health_platform \
  -p 5432:5432 \
  postgres:14-alpine
```

#### 로컬 설치
```bash
# Windows (Chocolatey)
choco install postgresql14

# Mac (Homebrew)
brew install postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14
```

### 2. 데이터베이스 생성

```sql
-- PostgreSQL에 접속
psql -U postgres

-- 데이터베이스 생성
CREATE DATABASE health_platform;

-- 사용자 생성 및 권한 부여
CREATE USER healthuser WITH PASSWORD 'healthpass';
GRANT ALL PRIVILEGES ON DATABASE health_platform TO healthuser;

-- 확장 기능 활성화
\c health_platform
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### 3. 환경 변수 설정

#### backend/.env
```bash
# PostgreSQL 연결 문자열
DATABASE_URL="postgresql://healthuser:healthpass@localhost:5432/health_platform"

# 또는 개별 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=health_platform
DB_USER=healthuser
DB_PASSWORD=healthpass
```

#### Docker 환경
```bash
# .env 파일
DATABASE_URL="postgresql://healthuser:healthpass@postgres:5432/health_platform"
```

## 🚀 Prisma 마이그레이션

### 초기 설정

```bash
cd backend

# Prisma Client 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate deploy

# 또는 개발 환경에서
npx prisma migrate dev
```

### 마이그레이션 히스토리

#### 1. Initial Migration (20241101000000_init)
- 모든 기본 테이블 생성
- 인덱스 및 관계 설정
- 초기 스키마 구성

#### 2. AI Insight Cache (20251107120903_add_ai_insight_cache)
- `ai_insight_cache` 테이블 추가
- AI 인사이트 캐싱 기능 지원
- 성능 최적화를 위한 인덱스 추가

### 새 마이그레이션 생성

```bash
# 스키마 변경 후 마이그레이션 생성
npx prisma migrate dev --name your_migration_name

# 예: 새 테이블 추가
npx prisma migrate dev --name add_new_feature_table
```

### 마이그레이션 롤백

```bash
# 마지막 마이그레이션 취소 (개발 환경만)
npx prisma migrate reset

# 프로덕션에서는 수동 롤백 필요
```

## 📊 데이터베이스 스키마 다이어그램

### 핵심 관계도

```
User (users)
├── HealthRecord (health_records)
│   └── VitalSign (vital_signs)
├── MedicalRecord (medical_records)
│   ├── TestResult (test_results)
│   └── Prescription (prescriptions)
├── Medication (medications)
│   ├── DosageLog (dosage_logs)
│   ├── SideEffect (side_effects)
│   └── MedicationSchedule (medication_schedules)
├── GenomicData (genomic_data)
│   ├── SNPRecord (snp_records)
│   └── RiskAssessment (risk_assessments)
├── FamilyHistory (family_history)
├── AIInsightCache (ai_insight_cache) ⭐
├── Prediction (predictions)
├── Recommendation (recommendations)
├── WearableDeviceConfig (wearable_device_configs)
│   └── WearableDataPoint (wearable_data_points)
└── Appointment (appointments)
    └── AppointmentNotification (appointment_notifications)
```

## 🔍 주요 테이블 상세

### users (사용자)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_date TIMESTAMP NOT NULL,
  gender TEXT NOT NULL,
  blood_type TEXT,
  height FLOAT,
  weight FLOAT,
  lifestyle_habits JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**주요 필드:**
- `id`: CUID 기반 고유 식별자
- `email`: 로그인 이메일 (unique)
- `lifestyle_habits`: JSON 형태의 생활습관 데이터

### ai_insight_cache (AI 인사이트 캐시) ⭐

```sql
CREATE TABLE ai_insight_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insights_data JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

**주요 필드:**
- `insights_data`: 완전한 AI 인사이트 응답 (JSON)
- `generated_at`: 생성 시간
- `expires_at`: 만료 시간 (TTL)

**캐시 전략:**
- 기본 TTL: 1시간 (프로덕션)
- 사용자별 캐시 관리
- 만료된 캐시 자동 정리

### genomic_data (유전체 데이터)

```sql
CREATE TABLE genomic_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL,
  file_path TEXT,
  snp_data JSONB,  -- 암호화됨
  analysis_results JSONB,  -- 암호화됨
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

**보안:**
- SNP 데이터 암호화 저장
- 분석 결과 암호화
- 접근 로그 기록

## 🔐 보안 고려사항

### 1. 데이터 암호화

#### 저장 시 암호화 (Encryption at Rest)
```sql
-- 민감한 데이터는 애플리케이션 레벨에서 암호화
-- genomic_data.snp_data
-- genomic_data.analysis_results
```

#### 전송 시 암호화 (Encryption in Transit)
```bash
# SSL/TLS 연결 사용
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### 2. 접근 제어

```sql
-- 읽기 전용 사용자 (분석용)
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE health_platform TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 백업 사용자
CREATE USER backup_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
```

### 3. 감사 로그

모든 데이터 접근은 `audit_logs` 및 `data_access_logs` 테이블에 기록됩니다:

```typescript
// 자동 로깅 예제
await prisma.dataAccessLog.create({
  data: {
    userId: user.id,
    resourceType: 'genomic_data',
    resourceId: genomicData.id,
    accessType: 'read',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  }
});
```

## 🔧 유지보수

### 1. 백업

#### 자동 백업 (Docker)
```bash
# docker-compose.yml에 백업 볼륨 설정
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./backups:/backups

# 백업 스크립트
docker exec health-platform-db pg_dump -U healthuser health_platform > backup_$(date +%Y%m%d).sql
```

#### 수동 백업
```bash
# 전체 백업
pg_dump -U healthuser -h localhost health_platform > backup.sql

# 스키마만 백업
pg_dump -U healthuser -h localhost --schema-only health_platform > schema.sql

# 데이터만 백업
pg_dump -U healthuser -h localhost --data-only health_platform > data.sql
```

### 2. 복원

```bash
# 백업 복원
psql -U healthuser -h localhost health_platform < backup.sql

# Docker 환경
docker exec -i health-platform-db psql -U healthuser health_platform < backup.sql
```

### 3. 데이터베이스 최적화

#### 인덱스 재구성
```sql
-- 모든 인덱스 재구성
REINDEX DATABASE health_platform;

-- 특정 테이블만
REINDEX TABLE users;
```

#### VACUUM 실행
```sql
-- 전체 데이터베이스
VACUUM ANALYZE;

-- 특정 테이블
VACUUM ANALYZE users;
VACUUM ANALYZE ai_insight_cache;
```

#### 통계 업데이트
```sql
ANALYZE;
```

### 4. 모니터링

#### 연결 수 확인
```sql
SELECT count(*) FROM pg_stat_activity;
```

#### 느린 쿼리 확인
```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### 테이블 크기 확인
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📈 성능 최적화

### 1. 인덱스 전략

주요 인덱스가 이미 스키마에 정의되어 있습니다:

```sql
-- 사용자 조회 최적화
CREATE INDEX idx_users_email ON users(email);

-- AI 인사이트 캐시 조회 최적화
CREATE INDEX idx_ai_insight_cache_user_id ON ai_insight_cache(user_id);
CREATE INDEX idx_ai_insight_cache_expires_at ON ai_insight_cache(expires_at);

-- 건강 기록 조회 최적화
CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_vital_signs_measured_at ON vital_signs(measured_at);
```

### 2. 쿼리 최적화

#### N+1 문제 해결
```typescript
// Bad: N+1 쿼리
const users = await prisma.user.findMany();
for (const user of users) {
  const records = await prisma.healthRecord.findMany({
    where: { userId: user.id }
  });
}

// Good: Include 사용
const users = await prisma.user.findMany({
  include: {
    healthRecords: true
  }
});
```

#### 페이지네이션
```typescript
// 커서 기반 페이지네이션
const results = await prisma.healthRecord.findMany({
  take: 20,
  skip: 1,
  cursor: {
    id: lastRecordId
  },
  orderBy: {
    recordedDate: 'desc'
  }
});
```

### 3. 연결 풀링

```typescript
// Prisma Client 설정
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // 연결 풀 설정
  // connection_limit=10&pool_timeout=20
});
```

## 🧪 테스트 데이터베이스

### 테스트 환경 설정

```bash
# 테스트 데이터베이스 생성
createdb health_platform_test

# 테스트용 환경 변수
DATABASE_URL="postgresql://healthuser:healthpass@localhost:5432/health_platform_test"

# 마이그레이션 실행
npx prisma migrate deploy
```

### 시드 데이터

```bash
# 시드 데이터 실행
npx prisma db seed
```

## 📚 추가 리소스

- [Prisma 공식 문서](https://www.prisma.io/docs/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [AI Insights API 문서](./ai-insights/AI_INSIGHTS_API.md)
- [환경 변수 가이드](./ai-insights/ENVIRONMENT_VARIABLES.md)

## 🆘 트러블슈팅

### 연결 오류

```bash
# PostgreSQL 서비스 상태 확인
docker-compose ps postgres

# 로그 확인
docker-compose logs postgres

# 연결 테스트
psql -U healthuser -h localhost -d health_platform
```

### 마이그레이션 오류

```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 재시도
npx prisma migrate resolve --applied "migration_name"
```

### 성능 문제

```sql
-- 느린 쿼리 로깅 활성화
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 1초 이상
SELECT pg_reload_conf();

-- 로그 확인
tail -f /var/log/postgresql/postgresql-14-main.log
```

---

**마지막 업데이트**: 2024-11-08  
**버전**: 1.0.0  
**Prisma 버전**: 5.x  
**PostgreSQL 버전**: 14.x