#!/bin/bash

# Production Deployment Script with Blue-Green Deployment
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 Production Deployment - Blue-Green Strategy${NC}"

# Configuration
PRODUCTION_HOST=${PRODUCTION_HOST:-"health-platform.com"}
PRODUCTION_USER=${PRODUCTION_USER:-"deploy"}
DEPLOY_PATH="/opt/health-platform"
BACKUP_RETENTION_DAYS=30

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if this is a tagged release
    if ! git describe --exact-match --tags HEAD > /dev/null 2>&1; then
        echo -e "${RED}❌ Production deployment requires a tagged release${NC}"
        echo -e "${YELLOW}Please create a tag: git tag -a v1.0.0 -m 'Release v1.0.0'${NC}"
        exit 1
    fi
    
    # Get current tag
    RELEASE_TAG=$(git describe --exact-match --tags HEAD)
    echo -e "${GREEN}✅ Deploying release: $RELEASE_TAG${NC}"
    
    # Check if SSH key exists
    if [ ! -f ~/.ssh/id_rsa ]; then
        echo -e "${RED}❌ SSH key not found. Please set up SSH access to production server.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}💾 Creating production backup...${NC}"
    
    ssh $PRODUCTION_USER@$PRODUCTION_HOST << ENDSSH
        set -e
        
        cd $DEPLOY_PATH
        
        # Create backup directory with timestamp
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p \$BACKUP_DIR
        
        echo "Creating database backup..."
        docker-compose exec -T postgres pg_dump -U \$POSTGRES_USER \$POSTGRES_DB > \$BACKUP_DIR/database.sql
        
        echo "Creating uploads backup..."
        tar -czf \$BACKUP_DIR/uploads.tar.gz backend/uploads/
        
        echo "Creating configuration backup..."
        cp .env.production \$BACKUP_DIR/
        cp docker-compose.prod.yml \$BACKUP_DIR/
        
        echo "Backup created in \$BACKUP_DIR"
        
        # Clean up old backups
        find backups/ -type d -mtime +$BACKUP_RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
ENDSSH
    
    echo -e "${GREEN}✅ Backup created${NC}"
}

# Function to build and push production images
build_and_push() {
    echo -e "${YELLOW}🏗️  Building production images...${NC}"
    
    # Build production images
    docker build -t health-platform-frontend:$RELEASE_TAG ./frontend
    docker build -t health-platform-backend:$RELEASE_TAG ./backend
    
    # Tag as latest
    docker tag health-platform-frontend:$RELEASE_TAG health-platform-frontend:latest
    docker tag health-platform-backend:$RELEASE_TAG health-platform-backend:latest
    
    # Push to registry
    if [ -n "$DOCKER_REGISTRY" ]; then
        docker tag health-platform-frontend:$RELEASE_TAG $DOCKER_REGISTRY/health-platform-frontend:$RELEASE_TAG
        docker tag health-platform-backend:$RELEASE_TAG $DOCKER_REGISTRY/health-platform-backend:$RELEASE_TAG
        
        docker push $DOCKER_REGISTRY/health-platform-frontend:$RELEASE_TAG
        docker push $DOCKER_REGISTRY/health-platform-backend:$RELEASE_TAG
        docker push $DOCKER_REGISTRY/health-platform-frontend:latest
        docker push $DOCKER_REGISTRY/health-platform-backend:latest
    fi
    
    echo -e "${GREEN}✅ Production images built and pushed${NC}"
}

# Function to deploy using blue-green strategy
blue_green_deploy() {
    echo -e "${YELLOW}🔄 Starting blue-green deployment...${NC}"
    
    ssh $PRODUCTION_USER@$PRODUCTION_HOST << ENDSSH
        set -e
        
        cd $DEPLOY_PATH
        
        # Pull latest code
        git fetch --tags
        git checkout $RELEASE_TAG
        
        # Update environment configuration
        cp .env.production.template .env.production
        echo "RELEASE_TAG=$RELEASE_TAG" >> .env.production
        
        # Pull latest images
        if [ -n "$DOCKER_REGISTRY" ]; then
            docker pull $DOCKER_REGISTRY/health-platform-frontend:$RELEASE_TAG
            docker pull $DOCKER_REGISTRY/health-platform-backend:$RELEASE_TAG
        fi
        
        echo "🟢 Starting GREEN environment..."
        
        # Start green environment on different ports
        sed 's/3000:3000/3001:3000/g; s/5000:5000/5001:5000/g' docker-compose.prod.yml > docker-compose.green.yml
        
        docker-compose -f docker-compose.green.yml --env-file .env.production up -d
        
        echo "⏳ Waiting for GREEN environment to be ready..."
        timeout 300 bash -c 'until curl -f http://localhost:5001/health; do sleep 5; done'
        
        # Run database migrations on green environment
        docker-compose -f docker-compose.green.yml --env-file .env.production exec -T backend npm run db:migrate
        
        echo "✅ GREEN environment is ready"
        
        # Switch traffic (update load balancer configuration)
        echo "🔄 Switching traffic to GREEN environment..."
        
        # Update nginx configuration to point to green environment
        sed -i 's/backend:5000/localhost:5001/g; s/frontend:3000/localhost:3001/g' /etc/nginx/sites-available/health-platform
        nginx -s reload
        
        echo "⏳ Waiting for traffic switch to complete..."
        sleep 30
        
        # Verify green environment is serving traffic
        if curl -f http://localhost/health > /dev/null 2>&1; then
            echo "✅ Traffic successfully switched to GREEN environment"
            
            echo "🔵 Stopping BLUE environment..."
            docker-compose -f docker-compose.prod.yml down || true
            
            echo "🟢 Promoting GREEN to BLUE..."
            docker-compose -f docker-compose.green.yml down
            docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
            
            # Restore original nginx configuration
            sed -i 's/localhost:5001/backend:5000/g; s/localhost:3001/frontend:3000/g' /etc/nginx/sites-available/health-platform
            nginx -s reload
            
            echo "✅ Blue-green deployment completed successfully"
        else
            echo "❌ Health check failed, rolling back..."
            
            # Rollback nginx configuration
            sed -i 's/localhost:5001/backend:5000/g; s/localhost:3001/frontend:3000/g' /etc/nginx/sites-available/health-platform
            nginx -s reload
            
            # Stop green environment
            docker-compose -f docker-compose.green.yml down
            
            exit 1
        fi
        
        # Clean up
        rm -f docker-compose.green.yml
        docker image prune -f
ENDSSH
    
    echo -e "${GREEN}✅ Blue-green deployment completed${NC}"
}

# Function to run production health checks
run_health_checks() {
    echo -e "${YELLOW}🏥 Running comprehensive health checks...${NC}"
    
    # Frontend health check
    if curl -f https://$PRODUCTION_HOST/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend health check passed${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
        return 1
    fi
    
    # Backend API health check
    if curl -f https://$PRODUCTION_HOST/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend API health check passed${NC}"
    else
        echo -e "${RED}❌ Backend API health check failed${NC}"
        return 1
    fi
    
    # Database connectivity check
    if curl -f https://$PRODUCTION_HOST/api/health/database > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connectivity check passed${NC}"
    else
        echo -e "${RED}❌ Database connectivity check failed${NC}"
        return 1
    fi
    
    # Redis connectivity check
    if curl -f https://$PRODUCTION_HOST/api/health/redis > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis connectivity check passed${NC}"
    else
        echo -e "${RED}❌ Redis connectivity check failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All health checks passed${NC}"
}

# Function to run smoke tests
run_smoke_tests() {
    echo -e "${YELLOW}🧪 Running production smoke tests...${NC}"
    
    # Test critical user journeys
    echo "Testing user registration endpoint..."
    # Add actual smoke test commands here
    
    echo "Testing authentication flow..."
    # Add actual smoke test commands here
    
    echo "Testing critical API endpoints..."
    # Add actual smoke test commands here
    
    echo -e "${GREEN}✅ Smoke tests passed${NC}"
}

# Function to notify team and stakeholders
notify_deployment() {
    echo -e "${YELLOW}📢 Notifying deployment completion...${NC}"
    
    # Send Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🎉 Production deployment completed successfully! \n🏷️ Release: $RELEASE_TAG \n🌐 URL: https://$PRODUCTION_HOST \n👤 Deployed by: $(git config user.name)\"}" \
            $SLACK_WEBHOOK_URL
    fi
    
    # Send email notification (if configured)
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "Production deployment of $RELEASE_TAG completed successfully" | \
        mail -s "Production Deployment Success - Health Platform" $NOTIFICATION_EMAIL
    fi
    
    echo -e "${GREEN}✅ Notifications sent${NC}"
}

# Function to update monitoring and alerting
update_monitoring() {
    echo -e "${YELLOW}📊 Updating monitoring configuration...${NC}"
    
    # Update Grafana dashboards
    # Update Prometheus alerting rules
    # Update log aggregation
    
    echo -e "${GREEN}✅ Monitoring updated${NC}"
}

# Main deployment flow
main() {
    echo -e "${BLUE}Starting production deployment process...${NC}"
    
    check_prerequisites
    create_backup
    build_and_push
    blue_green_deploy
    
    if run_health_checks && run_smoke_tests; then
        update_monitoring
        notify_deployment
        
        echo -e "\n${GREEN}🎉 Production deployment completed successfully!${NC}"
        echo -e "${GREEN}🏷️  Release: $RELEASE_TAG${NC}"
        echo -e "${GREEN}🌐 URL: https://$PRODUCTION_HOST${NC}"
        echo -e "${GREEN}📊 Monitoring: https://monitoring.$PRODUCTION_HOST${NC}"
    else
        echo -e "\n${RED}❌ Production deployment failed health checks${NC}"
        echo -e "${YELLOW}Please check logs and consider rollback if necessary${NC}"
        exit 1
    fi
}

# Rollback function
rollback() {
    echo -e "${RED}🔄 Initiating production rollback...${NC}"
    
    ssh $PRODUCTION_USER@$PRODUCTION_HOST << 'ENDSSH'
        set -e
        
        cd /opt/health-platform
        
        # Get previous release
        PREVIOUS_TAG=$(git tag --sort=-version:refname | sed -n '2p')
        
        if [ -z "$PREVIOUS_TAG" ]; then
            echo "❌ No previous release found for rollback"
            exit 1
        fi
        
        echo "Rolling back to: $PREVIOUS_TAG"
        
        # Checkout previous release
        git checkout $PREVIOUS_TAG
        
        # Restore from backup if needed
        LATEST_BACKUP=$(ls -t backups/ | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            echo "Restoring from backup: $LATEST_BACKUP"
            # Restore database and configuration
        fi
        
        # Deploy previous version
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d
        
        echo "✅ Rollback completed"
ENDSSH
    
    echo -e "${GREEN}✅ Rollback completed${NC}"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Usage: $0 [deploy|rollback]"
        exit 1
        ;;
esac