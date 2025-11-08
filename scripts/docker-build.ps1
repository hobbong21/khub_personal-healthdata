# Docker Build Script for Personal Health Platform (PowerShell)
# This script builds Docker images for backend and frontend services

param(
    [string]$Version = "latest",
    [string]$Service = "all",
    [string]$Registry = $env:DOCKER_REGISTRY
)

# Configuration
$BackendImage = "health-platform-backend"
$FrontendImage = "health-platform-frontend"

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "🐳 Personal Health Platform - Docker Build Script" -ForegroundColor $Green
Write-Host "================================================" -ForegroundColor $Green
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor $Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor $Red
    exit 1
}

# Function to build backend
function Build-Backend {
    Write-Host "📦 Building Backend Image..." -ForegroundColor $Yellow
    Push-Location backend
    
    if ($Registry) {
        docker build -t "${Registry}/${BackendImage}:${Version}" .
        docker tag "${Registry}/${BackendImage}:${Version}" "${Registry}/${BackendImage}:latest"
    } else {
        docker build -t "${BackendImage}:${Version}" .
        docker tag "${BackendImage}:${Version}" "${BackendImage}:latest"
    }
    
    Pop-Location
    Write-Host "✅ Backend image built successfully" -ForegroundColor $Green
    Write-Host ""
}

# Function to build frontend
function Build-Frontend {
    Write-Host "📦 Building Frontend Image..." -ForegroundColor $Yellow
    Push-Location frontend
    
    if ($Registry) {
        docker build -t "${Registry}/${FrontendImage}:${Version}" .
        docker tag "${Registry}/${FrontendImage}:${Version}" "${Registry}/${FrontendImage}:latest"
    } else {
        docker build -t "${FrontendImage}:${Version}" .
        docker tag "${FrontendImage}:${Version}" "${FrontendImage}:latest"
    }
    
    Pop-Location
    Write-Host "✅ Frontend image built successfully" -ForegroundColor $Green
    Write-Host ""
}

# Function to build all services using docker-compose
function Build-AllCompose {
    Write-Host "📦 Building All Services with Docker Compose..." -ForegroundColor $Yellow
    docker-compose build
    Write-Host "✅ All services built successfully" -ForegroundColor $Green
    Write-Host ""
}

# Function to push images
function Push-Images {
    if (-not $Registry) {
        Write-Host "⚠️  No registry specified. Skipping push." -ForegroundColor $Yellow
        Write-Host "   Set DOCKER_REGISTRY environment variable to push images." -ForegroundColor $Yellow
        Write-Host ""
        return
    }
    
    Write-Host "📤 Pushing Images to Registry..." -ForegroundColor $Yellow
    docker push "${Registry}/${BackendImage}:${Version}"
    docker push "${Registry}/${BackendImage}:latest"
    docker push "${Registry}/${FrontendImage}:${Version}"
    docker push "${Registry}/${FrontendImage}:latest"
    Write-Host "✅ Images pushed successfully" -ForegroundColor $Green
    Write-Host ""
}

# Function to show image sizes
function Show-ImageSizes {
    Write-Host "📊 Image Sizes:" -ForegroundColor $Yellow
    if ($Registry) {
        docker images | Select-String -Pattern "${Registry}/${BackendImage}|${Registry}/${FrontendImage}"
    } else {
        docker images | Select-String -Pattern "${BackendImage}|${FrontendImage}"
    }
    Write-Host ""
}

# Main execution
Write-Host "Building version: $Version" -ForegroundColor $Yellow
if ($Registry) {
    Write-Host "Registry: $Registry" -ForegroundColor $Yellow
}
Write-Host ""

# Build based on service parameter
switch ($Service.ToLower()) {
    "backend" {
        Build-Backend
    }
    "frontend" {
        Build-Frontend
    }
    "all" {
        Build-AllCompose
    }
    default {
        Write-Host "❌ Invalid service: $Service" -ForegroundColor $Red
        Write-Host "Usage: .\docker-build.ps1 [-Version <version>] [-Service <backend|frontend|all>] [-Registry <registry>]" -ForegroundColor $Yellow
        exit 1
    }
}

Show-ImageSizes

# Ask if user wants to push
if ($Registry) {
    $response = Read-Host "Do you want to push images to registry? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Push-Images
    }
}

Write-Host "🎉 Build completed successfully!" -ForegroundColor $Green
Write-Host "================================================" -ForegroundColor $Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $Yellow
Write-Host "  1. Run: " -NoNewline; Write-Host "docker-compose up -d" -ForegroundColor $Green -NoNewline; Write-Host " to start services"
Write-Host "  2. Check logs: " -NoNewline; Write-Host "docker-compose logs -f" -ForegroundColor $Green
Write-Host "  3. Access frontend: " -NoNewline; Write-Host "http://localhost" -ForegroundColor $Green
Write-Host "  4. Access backend: " -NoNewline; Write-Host "http://localhost:5001" -ForegroundColor $Green
Write-Host ""
