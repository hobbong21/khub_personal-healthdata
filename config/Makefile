# K-hub Docker 관리 Makefile

# 기본 설정
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml
PROJECT_NAME = khub

# 도움말
.PHONY: help
help:
	@echo "K-hub Docker 관리 명령어:"
	@echo ""
	@echo "개발 환경:"
	@echo "  dev-up        개발 환경 시작"
	@echo "  dev-down      개발 환경 중지"
	@echo "  dev-logs      개발 환경 로그 확인"
	@echo "  dev-shell     백엔드 개발 컨테이너 쉘 접속"
	@echo ""
	@echo "프로덕션 환경:"
	@echo "  up            프로덕션 환경 시작"
	@echo "  down          프로덕션 환경 중지"
	@echo "  logs          프로덕션 환경 로그 확인"
	@echo "  restart       프로덕션 환경 재시작"
	@echo ""
	@echo "빌드 및 배포:"
	@echo "  build         모든 이미지 빌드"
	@echo "  build-backend 백엔드 이미지만 빌드"
	@echo "  build-frontend 프론트엔드 이미지만 빌드"
	@echo "  push          이미지를 레지스트리에 푸시"
	@echo ""
	@echo "데이터베이스:"
	@echo "  db-migrate    데이터베이스 마이그레이션"
	@echo "  db-seed       시드 데이터 삽입"
	@echo "  db-reset      데이터베이스 초기화"
	@echo "  db-backup     데이터베이스 백업"
	@echo ""
	@echo "유틸리티:"
	@echo "  clean         사용하지 않는 Docker 리소스 정리"
	@echo "  status        서비스 상태 확인"
	@echo "  shell         백엔드 컨테이너 쉘 접속"

# 개발 환경
.PHONY: dev-up dev-down dev-logs dev-shell
dev-up:
	docker-compose -f $(COMPOSE_DEV_FILE) up -d
	@echo "개발 환경이 시작되었습니다:"
	@echo "  프론트엔드: http://localhost:5173"
	@echo "  백엔드 API: http://localhost:3001"
	@echo "  PostgreSQL: localhost:5433"
	@echo "  Redis: localhost:6380"

dev-down:
	docker-compose -f $(COMPOSE_DEV_FILE) down

dev-logs:
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

dev-shell:
	docker-compose -f $(COMPOSE_DEV_FILE) exec backend-dev sh

# 프로덕션 환경
.PHONY: up down logs restart
up:
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "프로덕션 환경이 시작되었습니다:"
	@echo "  웹사이트: http://localhost"
	@echo "  API: http://localhost:3000"

down:
	docker-compose -f $(COMPOSE_FILE) down

logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

restart:
	docker-compose -f $(COMPOSE_FILE) restart

# 빌드 및 배포
.PHONY: build build-backend build-frontend push
build:
	docker-compose -f $(COMPOSE_FILE) build --no-cache

build-backend:
	docker-compose -f $(COMPOSE_FILE) build --no-cache backend

build-frontend:
	docker-compose -f $(COMPOSE_FILE) build --no-cache frontend

push:
	docker-compose -f $(COMPOSE_FILE) push

# 데이터베이스
.PHONY: db-migrate db-seed db-reset db-backup
db-migrate:
	docker-compose -f $(COMPOSE_FILE) exec backend npx prisma migrate deploy

db-seed:
	docker-compose -f $(COMPOSE_FILE) exec backend npm run db:seed

db-reset:
	docker-compose -f $(COMPOSE_FILE) exec backend npm run db:reset

db-backup:
	docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U khub_user khub_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

# 유틸리티
.PHONY: clean status shell
clean:
	docker system prune -f
	docker volume prune -f
	docker network prune -f

status:
	docker-compose -f $(COMPOSE_FILE) ps

shell:
	docker-compose -f $(COMPOSE_FILE) exec backend sh

# 초기 설정
.PHONY: init
init:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env 파일이 생성되었습니다. 필요한 환경 변수를 설정해주세요."; \
	fi
	@echo "초기 설정이 완료되었습니다."