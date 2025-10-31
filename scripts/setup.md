# 프로젝트 설정 가이드

## 1. PostgreSQL 설치 및 설정

### Windows
1. PostgreSQL 공식 웹사이트에서 설치 프로그램 다운로드
2. 설치 중 포트 5432, 사용자명 postgres 설정
3. 비밀번호 설정 (예: password)

### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2. 데이터베이스 생성

PostgreSQL에 연결하여 데이터베이스를 생성합니다:

```bash
# PostgreSQL에 연결
psql -U postgres

# 또는 스크립트 실행
psql -U postgres -f scripts/setup-database.sql
```

## 3. 환경 변수 설정

`backend/.env` 파일에서 데이터베이스 연결 정보를 수정합니다:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/health_platform_db"
```

## 4. 프로젝트 설치 및 실행

```bash
# 루트 디렉토리에서
npm run install:all

# 데이터베이스 마이그레이션
cd backend
npm run db:generate
npm run db:migrate

# 개발 서버 실행
cd ..
npm run dev
```

## 5. 접속 확인

- 프론트엔드: http://localhost:3000
- 백엔드: http://localhost:5000/health

## 문제 해결

### 데이터베이스 연결 오류
1. PostgreSQL 서비스가 실행 중인지 확인
2. 포트 5432가 사용 가능한지 확인
3. 사용자명과 비밀번호가 올바른지 확인

### 포트 충돌
- 프론트엔드 포트 변경: `frontend/vite.config.ts`에서 port 수정
- 백엔드 포트 변경: `backend/.env`에서 PORT 수정