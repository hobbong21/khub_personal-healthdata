-- PostgreSQL 데이터베이스 설정 스크립트
-- 이 스크립트는 PostgreSQL 서버에서 실행해야 합니다

-- 데이터베이스 생성
CREATE DATABASE health_platform_db;

-- 테스트 데이터베이스 생성
CREATE DATABASE health_platform_test_db;

-- 사용자 생성 (선택사항)
-- CREATE USER health_platform_user WITH PASSWORD 'your_password';

-- 권한 부여 (선택사항)
-- GRANT ALL PRIVILEGES ON DATABASE health_platform_db TO health_platform_user;
-- GRANT ALL PRIVILEGES ON DATABASE health_platform_test_db TO health_platform_user;

-- 연결 확인
\l