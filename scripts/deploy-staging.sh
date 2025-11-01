#!/bin/bash

# Staging Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Deploying to Staging Environment${NC}"

# Configuration
STAGING_HOST=${STAGING_HOST:-"staging.health-platform.com"}
STAGING_USER=${STAGING_USER:-"deploy"}
DEPLOY_PATH="/opt/health-platform"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if SSH key exists
    if [ ! -f ~/.ssh/id_rsa ]; then
        echo -e "${RED}❌ SSH key not found. Please set up SSH access to staging server.${NC}"
        exit 1
    fi
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to build and push images
build_and_push() {
    echo -e "${YELLOW}🏗️  Building and pushing Docker images...${NC}"
    
    # Build images
    docker build -t health-platform-frontend:staging ./frontend
    docker build -t health-platform-backend:staging ./backend
    
    # Tag for registry (if using a registry)
    if [ -n "$DOCKER_REGISTRY" ]; then
        docker tag health-platform-frontend:staging $DOCKER_REGISTRY/health-platform-frontend:staging
        docker tag health-platform-backend:staging $DOCKER_REGISTRY/health-platform-backend:staging
        
        # Push to registry
        docker push $DOCKER_REGISTRY/health-platform-frontend:staging
        docker push $DOCKER_REGISTRY/health-platform-backend:staging
    fi
    
    echo -e "${GREEN}✅ Images built and pushed${NC}"
}

# Function to deploy to staging
deploy_to_staging() {
    echo -e "${YELLOW}🚀 Deploying to staging server...${NC}"
    
    ssh $STAGING_USER@$STAGING_HOST << 'ENDSSH'
        set -e
        
        # Navigate to deployment directory
        cd /opt/health-platform
        
        # Pull latest code
        git pull origin main
        
        # Update environment configuration
        cp .env.staging.template .env.staging
        
        # Pull latest images (if using registry)
        if [ -n "$DOCKER_REGISTRY" ]; then
            docker pull $DOCKER_REGISTRY/health-platform-frontend:staging
            docker pull $DOCKER_REGISTRY/health-platform-backend:staging
        fi
        
        # Stop existing services
        docker-compose -f docker-compose.yml --env-file .env.staging down
        
        # Start new services
        docker-compose -f docker-compose.yml --env-file .env.staging up -d
        
        # Wait for services to be healthy
        echo "Waiting for services to be ready..."
        timeout 300 bash -c 'until curl -f http://localhost:5000/health; do sleep 5; done'
        
        # Run database migrations
        docker-compose -f docker-compose.yml --env-file .env.staging exec -T backend npm run db:migrate
        
        echo "✅ Staging deployment completed successfully"
ENDSSH
    
    echo -e "${GREEN}✅ Deployment to staging completed${NC}"
}

# Function to run smoke tests
run_smoke_tests() {
    echo -e "${YELLOW}🧪 Running smoke tests...${NC}"
    
    # Test health endpoints
    if curl -f http://$STAGING_HOST/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend health check passed${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
        exit 1
    fi
    
    if curl -f http://$STAGING_HOST/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Smoke tests passed${NC}"
}

# Function to notify team
notify_deployment() {
    echo -e "${YELLOW}📢 Notifying team...${NC}"
    
    # Send Slack notification (if webhook is configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Staging deployment completed successfully! \nCommit: $(git rev-parse --short HEAD) \nBranch: $(git branch --show-current) \nURL: http://$STAGING_HOST\"}" \
            $SLACK_WEBHOOK_URL
    fi
    
    echo -e "${GREEN}✅ Team notified${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    build_and_push
    deploy_to_staging
    run_smoke_tests
    notify_deployment
    
    echo -e "\n${GREEN}🎉 Staging deployment completed successfully!${NC}"
    echo -e "${YELLOW}Staging URL: http://$STAGING_HOST${NC}"
    echo -e "${YELLOW}API URL: http://$STAGING_HOST/api${NC}"
}

# Handle script interruption
trap 'echo -e "\n${RED}❌ Deployment interrupted${NC}"; exit 1' INT TERM

# Run main function
main "$@"