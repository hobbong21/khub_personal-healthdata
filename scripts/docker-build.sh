#!/bin/bash

# Docker Build Script for Health Platform
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="health-platform"
VERSION=${1:-latest}
ENVIRONMENT=${2:-development}

echo -e "${GREEN}🐳 Building Docker images for Health Platform${NC}"
echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"

# Function to build image
build_image() {
    local service=$1
    local dockerfile=$2
    local context=$3
    
    echo -e "\n${YELLOW}Building ${service} image...${NC}"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        docker build -f "${context}/${dockerfile}" -t "${PROJECT_NAME}-${service}:${VERSION}" "${context}"
    else
        docker build -f "${context}/Dockerfile" -t "${PROJECT_NAME}-${service}:${VERSION}" "${context}"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${service} image built successfully${NC}"
    else
        echo -e "${RED}❌ Failed to build ${service} image${NC}"
        exit 1
    fi
}

# Build backend image
if [ "$ENVIRONMENT" = "development" ]; then
    build_image "backend" "Dockerfile.dev" "backend"
else
    build_image "backend" "Dockerfile" "backend"
fi

# Build frontend image
if [ "$ENVIRONMENT" = "development" ]; then
    build_image "frontend" "Dockerfile.dev" "frontend"
else
    build_image "frontend" "Dockerfile" "frontend"
fi

echo -e "\n${GREEN}🎉 All images built successfully!${NC}"

# List built images
echo -e "\n${YELLOW}Built images:${NC}"
docker images | grep "${PROJECT_NAME}"

# Optional: Tag images for registry
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "\n${YELLOW}Tagging images for production...${NC}"
    docker tag "${PROJECT_NAME}-backend:${VERSION}" "${PROJECT_NAME}-backend:latest"
    docker tag "${PROJECT_NAME}-frontend:${VERSION}" "${PROJECT_NAME}-frontend:latest"
    echo -e "${GREEN}✅ Images tagged for production${NC}"
fi

echo -e "\n${GREEN}🚀 Build completed successfully!${NC}"