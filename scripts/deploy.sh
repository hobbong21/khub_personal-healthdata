#!/bin/bash

# K-hub 배포 스크립트
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로고 출력
echo -e "${BLUE}"
echo "  _  __      _           _     "
echo " | |/ /     | |         | |    "
echo " | ' / ______| |__  _   _| |__  "
echo " |  < |______| '_ \| | | | '_ \ "
echo " | . \       | | | | |_| | |_) |"
echo " |_|\_\      |_| |_|\__,_|_.__/ "
echo ""
echo "개인 건강 관리 플랫폼 배포 스크립트"
echo -e "${NC}"

# 함수 정의
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 사전 요구사항 확인
check_requirements() {
    log_info "사전 요구사항 확인 중..."
    
    # Docker 확인
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다."
        exit 1
    fi
    
    # Docker Compose 확인
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다."
        exit 1
    fi
    
    # Make 확인 (선택사항)
    if ! command -v make &> /dev/null; then
        log_warning "Make가 설치되지 않았습니다. 직접 docker-compose 명령어를 사용해야 합니다."
    fi
    
    log_success "사전 요구사항 확인 완료"
}

# 환경 설정
setup_environment() {
    log_info "환경 설정 중..."
    
    # .env 파일 확인
    if [ ! -f .env ]; then
        log_info ".env 파일이 없습니다. .env.example에서 복사합니다."
        cp .env.example .env
        log_warning ".env 파일을 편집하여 필요한 환경 변수를 설정해주세요."
        echo "계속하려면 Enter를 누르세요..."
        read
    fi
    
    log_success "환경 설정 완료"
}

# 개발 환경 배포
deploy_development() {
    log_info "개발 환경 배포 시작..."
    
    # 개발 환경 시작
    docker-compose -f config/docker-compose.dev.yml up -d
    
    # 서비스 상태 확인
    sleep 10
    docker-compose -f config/docker-compose.dev.yml ps
    
    log_success "개발 환경 배포 완료!"
    echo ""
    echo "접속 정보:"
    echo "  프론트엔드: http://localhost:5173"
    echo "  백엔드 API: http://localhost:3001"
    echo "  PostgreSQL: localhost:5433"
    echo "  Redis: localhost:6380"
}

# 프로덕션 환경 배포
deploy_production() {
    log_info "프로덕션 환경 배포 시작..."
    
    # 이미지 빌드
    log_info "Docker 이미지 빌드 중..."
    docker-compose -f config/docker-compose.prod.yml build --no-cache
    
    # 프로덕션 환경 시작
    log_info "서비스 시작 중..."
    docker-compose -f config/docker-compose.prod.yml up -d
    
    # 서비스 상태 확인
    sleep 15
    docker-compose -f config/docker-compose.prod.yml ps
    
    # 헬스체크 대기
    log_info "헬스체크 대기 중..."
    for i in {1..30}; do
        if docker-compose -f config/docker-compose.prod.yml exec -T backend node healthcheck.js &> /dev/null; then
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""
    
    log_success "프로덕션 환경 배포 완료!"
    echo ""
    echo "접속 정보:"
    echo "  웹사이트: http://localhost"
    echo "  API: http://localhost:3000"
}

# 서비스 중지
stop_services() {
    log_info "서비스 중지 중..."
    
    if [ "$1" = "dev" ]; then
        docker-compose -f config/docker-compose.dev.yml down
    else
        docker-compose -f config/docker-compose.prod.yml down
    fi
    
    log_success "서비스가 중지되었습니다."
}

# 로그 확인
show_logs() {
    if [ "$1" = "dev" ]; then
        docker-compose -f config/docker-compose.dev.yml logs -f
    else
        docker-compose -f config/docker-compose.prod.yml logs -f
    fi
}

# 상태 확인
check_status() {
    log_info "서비스 상태 확인 중..."
    
    if [ "$1" = "dev" ]; then
        docker-compose -f config/docker-compose.dev.yml ps
    else
        docker-compose -f config/docker-compose.prod.yml ps
    fi
}

# 정리
cleanup() {
    log_info "Docker 리소스 정리 중..."
    
    docker system prune -f
    docker volume prune -f
    docker network prune -f
    
    log_success "정리 완료"
}

# 메인 메뉴
show_menu() {
    echo ""
    echo "K-hub 배포 관리"
    echo "================="
    echo "1) 개발 환경 배포"
    echo "2) 프로덕션 환경 배포"
    echo "3) 개발 환경 중지"
    echo "4) 프로덕션 환경 중지"
    echo "5) 개발 환경 로그 확인"
    echo "6) 프로덕션 환경 로그 확인"
    echo "7) 개발 환경 상태 확인"
    echo "8) 프로덕션 환경 상태 확인"
    echo "9) Docker 리소스 정리"
    echo "0) 종료"
    echo ""
    read -p "선택하세요 (0-9): " choice
}

# 메인 실행 로직
main() {
    check_requirements
    setup_environment
    
    while true; do
        show_menu
        
        case $choice in
            1)
                deploy_development
                ;;
            2)
                deploy_production
                ;;
            3)
                stop_services "dev"
                ;;
            4)
                stop_services "prod"
                ;;
            5)
                show_logs "dev"
                ;;
            6)
                show_logs "prod"
                ;;
            7)
                check_status "dev"
                ;;
            8)
                check_status "prod"
                ;;
            9)
                cleanup
                ;;
            0)
                log_info "배포 스크립트를 종료합니다."
                exit 0
                ;;
            *)
                log_error "잘못된 선택입니다. 다시 선택해주세요."
                ;;
        esac
        
        echo ""
        read -p "계속하려면 Enter를 누르세요..."
    done
}

# 명령행 인수 처리
if [ $# -eq 0 ]; then
    main
else
    case $1 in
        "dev")
            check_requirements
            setup_environment
            deploy_development
            ;;
        "prod")
            check_requirements
            setup_environment
            deploy_production
            ;;
        "stop-dev")
            stop_services "dev"
            ;;
        "stop-prod")
            stop_services "prod"
            ;;
        "logs-dev")
            show_logs "dev"
            ;;
        "logs-prod")
            show_logs "prod"
            ;;
        "status-dev")
            check_status "dev"
            ;;
        "status-prod")
            check_status "prod"
            ;;
        "clean")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "사용법: $0 [명령어]"
            echo ""
            echo "명령어:"
            echo "  dev         개발 환경 배포"
            echo "  prod        프로덕션 환경 배포"
            echo "  stop-dev    개발 환경 중지"
            echo "  stop-prod   프로덕션 환경 중지"
            echo "  logs-dev    개발 환경 로그"
            echo "  logs-prod   프로덕션 환경 로그"
            echo "  status-dev  개발 환경 상태"
            echo "  status-prod 프로덕션 환경 상태"
            echo "  clean       Docker 리소스 정리"
            echo "  help        도움말 표시"
            echo ""
            echo "명령어 없이 실행하면 대화형 메뉴가 표시됩니다."
            ;;
        *)
            log_error "알 수 없는 명령어: $1"
            echo "도움말을 보려면 '$0 help'를 실행하세요."
            exit 1
            ;;
    esac
fi
