#!/bin/bash

# Docker Deployment Script for Health Platform
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
COMPOSE_FILE=""

case $ENVIRONMENT in
    "development")
        COMPOSE_FILE="config/docker-compose.dev.yml"
        ;;
    "staging")
        COMPOSE_FILE="config/docker-compose.yml"
        ;;
    "production")
        COMPOSE_FILE="config/docker-compose.prod.yml"
        ;;
    *)
        echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
        echo -e "${YELLOW}Usage: $0 [development|staging|production]${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🚀 Deploying Health Platform to ${ENVIRONMENT} environment${NC}"
echo -e "${YELLOW}Using compose file: ${COMPOSE_FILE}${NC}"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Function to check environment file
check_env_file() {
    local env_file=".env.${ENVIRONMENT}"
    if [ ! -f "$env_file" ]; then
        echo -e "${YELLOW}⚠️  Environment file $env_file not found. Using .env.example as template.${NC}"
        if [ -f ".env.example" ]; then
            cp ".env.example" "$env_file"
            echo -e "${YELLOW}📝 Please edit $env_file with your configuration before deploying.${NC}"
            read -p "Press Enter to continue after editing the environment file..."
        fi
    fi
}

# Function to create necessary directories
create_directories() {
    echo -e "${BLUE}📁 Creating necessary directories...${NC}"
    mkdir -p backend/uploads
    mkdir -p nginx/ssl
    
    # Create self-signed SSL certificates for development/staging
    if [ "$ENVIRONMENT" != "production" ] && [ ! -f "nginx/ssl/cert.pem" ]; then
        echo -e "${YELLOW}🔐 Creating self-signed SSL certificates...${NC}"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        echo -e "${GREEN}✅ SSL certificates created${NC}"
    fi
}

# Function to pull/build images
prepare_images() {
    echo -e "${BLUE}🔄 Preparing Docker images...${NC}"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        # Build images for development
        ./scripts/docker-build.sh latest development
    else
        # Pull or build images for staging/production
        docker-compose -f "$COMPOSE_FILE" build --no-cache
    fi
}

# Function to start services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"
    
    # Set environment file
    export COMPOSE_FILE_ENV=".env.${ENVIRONMENT}"
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" --env-file ".env.${ENVIRONMENT}" up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Services started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start services${NC}"
        exit 1
    fi
}

# Function to wait for services to be healthy
wait_for_services() {
    echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Attempt $attempt/$max_attempts...${NC}"
        
        # Check backend health
        if curl -f http://localhost:5000/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is healthy${NC}"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED}❌ Services failed to become healthy${NC}"
            docker-compose -f "$COMPOSE_FILE" logs
            exit 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Function to run database migrations
run_migrations() {
    echo -e "${BLUE}🗄️  Running database migrations...${NC}"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        docker-compose -f "$COMPOSE_FILE" exec backend-dev npm run db:migrate
    else
        docker-compose -f "$COMPOSE_FILE" exec backend npm run db:migrate
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database migrations completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Database migrations failed or not needed${NC}"
    fi
}

# Function to show deployment status
show_status() {
    echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "\n${BLUE}📊 Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo -e "\n${BLUE}🌐 Application URLs:${NC}"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${GREEN}Frontend: https://localhost${NC}"
        echo -e "${GREEN}Backend API: https://localhost/api${NC}"
    else
        echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
        echo -e "${GREEN}Backend API: http://localhost:5000/api${NC}"
    fi
    
    echo -e "\n${BLUE}📋 Useful Commands:${NC}"
    echo -e "${YELLOW}View logs: docker-compose -f $COMPOSE_FILE logs -f${NC}"
    echo -e "${YELLOW}Stop services: docker-compose -f $COMPOSE_FILE down${NC}"
    echo -e "${YELLOW}Restart services: docker-compose -f $COMPOSE_FILE restart${NC}"
}

# Main deployment flow
main() {
    echo -e "${BLUE}🔍 Pre-deployment checks...${NC}"
    check_docker
    check_env_file
    create_directories
    
    echo -e "\n${BLUE}🏗️  Building and preparing...${NC}"
    prepare_images
    
    echo -e "\n${BLUE}🚀 Deploying services...${NC}"
    start_services
    wait_for_services
    
    echo -e "\n${BLUE}🗄️  Database setup...${NC}"
    run_migrations
    
    show_status
}

# Handle script interruption
trap 'echo -e "\n${RED}❌ Deployment interrupted${NC}"; exit 1' INT TERM

# Run main function
main