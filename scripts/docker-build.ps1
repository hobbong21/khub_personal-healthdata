# Docker Build Script for Health Platform (PowerShell)
param(
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development"
)

# Configuration
$ProjectName = "health-platform"

Write-Host "🐳 Building Docker images for Health Platform" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Function to build image
function Build-Image {
    param(
        [string]$Service,
        [string]$Dockerfile,
        [string]$Context
    )
    
    Write-Host ""
    Write-Host "Building $Service image..." -ForegroundColor Yellow
    
    try {
        if ($Environment -eq "development") {
            docker build -f "$Context/$Dockerfile" -t "$ProjectName-$Service`:$Version" $Context
        }
        else {
            docker build -f "$Context/Dockerfile" -t "$ProjectName-$Service`:$Version" $Context
        }
        
        Write-Host "✅ $Service image built successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to build $Service image" -ForegroundColor Red
        throw
    }
}

try {
    # Build backend image
    if ($Environment -eq "development") {
        Build-Image -Service "backend" -Dockerfile "Dockerfile.dev" -Context "backend"
    }
    else {
        Build-Image -Service "backend" -Dockerfile "Dockerfile" -Context "backend"
    }

    # Build frontend image
    if ($Environment -eq "development") {
        Build-Image -Service "frontend" -Dockerfile "Dockerfile.dev" -Context "frontend"
    }
    else {
        Build-Image -Service "frontend" -Dockerfile "Dockerfile" -Context "frontend"
    }

    Write-Host ""
    Write-Host "🎉 All images built successfully!" -ForegroundColor Green

    # List built images
    Write-Host ""
    Write-Host "Built images:" -ForegroundColor Yellow
    docker images | Select-String $ProjectName

    # Optional: Tag images for registry
    if ($Environment -eq "production") {
        Write-Host ""
        Write-Host "Tagging images for production..." -ForegroundColor Yellow
        docker tag "$ProjectName-backend:$Version" "$ProjectName-backend:latest"
        docker tag "$ProjectName-frontend:$Version" "$ProjectName-frontend:latest"
        Write-Host "✅ Images tagged for production" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "🚀 Build completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}