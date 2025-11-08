#!/bin/bash

# Docker Build Script for Personal Health Platform
# This script builds Docker images for backend and frontend services

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_IMAGE="health-platform-backend"
FRONTEND_IMAGE="health-platform-frontend"
VERSION="${1:-latest}"
REGISTRY="${DOCKER_REGISTRY:-}"

echo -e "${GREEN}🐳 Personal Health Platform - Docker Build Script${NC}"
echo -e "${GREEN}================================================${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to build backend
build_backend() {
    echo -e "${YELLOW}📦 Building Backend Image...${NC}"
    cd backend
    
    if [ -n "$REGISTRY" ]; then
        docker build -t "${REGISTRY}/${BACKEND_IMAGE}:${VERSION}" .
        docker tag "${REGISTRY}/${BACKEND_IMAGE}:${VERSION}" "${REGISTRY}/${BACKEND_IMAGE}:latest"
    else
        docker build -t "${BACKEND_IMAGE}:${VERSION}" .
        docker tag "${BACKEND_IMAGE}:${VERSION}" "${BACKEND_IMAGE}:latest"
    fi
    
    cd ..
    echo -e "${GREEN}✅ Backend image built successfully${NC}\n"
}

# Function to build frontend
build_frontend() {
    echo -e "${YELLOW}📦 Building Frontend Image...${NC}"
    cd frontend
    
    if [ -n "$REGISTRY" ]; then
        docker build -t "${REGISTRY}/${FRONTEND_IMAGE}:${VERSION}" .
        docker tag "${REGISTRY}/${FRONTEND_IMAGE}:${VERSION}" "${REGISTRY}/${FRONTEND_IMAGE}:latest"
    else
        docker build -t "${FRONTEND_IMAGE}:${VERSION}" .
        docker tag "${FRONTEND_IMAGE}:${VERSION}" "${FRONTEND_IMAGE}:latest"
    fi
    
    cd ..
    echo -e "${GREEN}✅ Frontend image built successfully${NC}\n"
}

# Function to build all services using docker-compose
build_all_compose() {
    echo -e "${YELLOW}📦 Building All Services with Docker Compose...${NC}"
    docker-compose build
    echo -e "${GREEN}✅ All services built successfully${NC}\n"
}

# Function to push images
push_images() {
    if [ -z "$REGISTRY" ]; then
        echo -e "${YELLOW}⚠️  No registry specified. Skipping push.${NC}"
        echo -e "${YELLOW}   Set DOCKER_REGISTRY environment variable to push images.${NC}\n"
        return
    fi
    
    echo -e "${YELLOW}📤 Pushing Images to Registry...${NC}"
    docker push "${REGISTRY}/${BACKEND_IMAGE}:${VERSION}"
    docker push "${REGISTRY}/${BACKEND_IMAGE}:latest"
    docker push "${REGISTRY}/${FRONTEND_IMAGE}:${VERSION}"
    docker push "${REGISTRY}/${FRONTEND_IMAGE}:latest"
    echo -e "${GREEN}✅ Images pushed successfully${NC}\n"
}

# Function to show image sizes
show_image_sizes() {
    echo -e "${YELLOW}📊 Image Sizes:${NC}"
    if [ -n "$REGISTRY" ]; then
        docker images | grep "${REGISTRY}/${BACKEND_IMAGE}\|${REGISTRY}/${FRONTEND_IMAGE}"
    else
        docker images | grep "${BACKEND_IMAGE}\|${FRONTEND_IMAGE}"
    fi
    echo ""
}

# Main execution
main() {
    echo -e "${YELLOW}Building version: ${VERSION}${NC}"
    if [ -n "$REGISTRY" ]; then
        echo -e "${YELLOW}Registry: ${REGISTRY}${NC}"
    fi
    echo ""
    
    # Parse arguments
    case "${2:-all}" in
        backend)
            build_backend
            ;;
        frontend)
            build_frontend
            ;;
        all)
            build_all_compose
            ;;
        *)
            echo -e "${RED}❌ Invalid argument: ${2}${NC}"
            echo -e "${YELLOW}Usage: $0 [version] [backend|frontend|all]${NC}"
            exit 1
            ;;
    esac
    
    show_image_sizes
    
    # Ask if user wants to push
    if [ -n "$REGISTRY" ]; then
        read -p "Do you want to push images to registry? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            push_images
        fi
    fi
    
    echo -e "${GREEN}🎉 Build completed successfully!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "  1. Run: ${GREEN}docker-compose up -d${NC} to start services"
    echo -e "  2. Check logs: ${GREEN}docker-compose logs -f${NC}"
    echo -e "  3. Access frontend: ${GREEN}http://localhost${NC}"
    echo -e "  4. Access backend: ${GREEN}http://localhost:5001${NC}\n"
}

# Run main function
main "$@"
