# Docker Deployment Script for Health Platform (PowerShell)
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development"
)

# Configuration
$ComposeFile = switch ($Environment) {
    "development" { "docker-compose.dev.yml" }
    "staging" { "docker-compose.yml" }
    "production" { "docker-compose.prod.yml" }
}

Write-Host "🚀 Deploying Health Platform to $Environment environment" -ForegroundColor Green
Write-Host "Using compose file: $ComposeFile" -ForegroundColor Yellow

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Host "✅ Docker is running" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
        return $false
    }
}

# Function to check environment file
function Test-EnvFile {
    $envFile = ".env.$Environment"
    if (-not (Test-Path $envFile)) {
        Write-Host "⚠️  Environment file $envFile not found. Using .env.example as template." -ForegroundColor Yellow
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" $envFile
            Write-Host "📝 Please edit $envFile with your configuration before deploying." -ForegroundColor Yellow
            Read-Host "Press Enter to continue after editing the environment file"
        }
    }
}

# Function to create necessary directories
function New-Directories {
    Write-Host "📁 Creating necessary directories..." -ForegroundColor Blue
    New-Item -ItemType Directory -Force -Path "backend/uploads" | Out-Null
    New-Item -ItemType Directory -Force -Path "nginx/ssl" | Out-Null
    
    # Create self-signed SSL certificates for development/staging
    if ($Environment -ne "production" -and -not (Test-Path "nginx/ssl/cert.pem")) {
        Write-Host "🔐 Creating self-signed SSL certificates..." -ForegroundColor Yellow
        
        # Use OpenSSL if available, otherwise skip SSL setup
        try {
            & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
                -keyout nginx/ssl/key.pem `
                -out nginx/ssl/cert.pem `
                -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            Write-Host "✅ SSL certificates created" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  OpenSSL not found. Skipping SSL certificate creation." -ForegroundColor Yellow
            Write-Host "You may need to create SSL certificates manually for HTTPS." -ForegroundColor Yellow
        }
    }
}

# Function to start services
function Start-Services {
    Write-Host "🚀 Starting services..." -ForegroundColor Blue
    
    try {
        docker-compose -f $ComposeFile --env-file ".env.$Environment" up -d
        Write-Host "✅ Services started successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to start services" -ForegroundColor Red
        throw
    }
}

# Function to wait for services to be healthy
function Wait-ForServices {
    Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Blue
    
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        Write-Host "Attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend is healthy" -ForegroundColor Green
                return
            }
        }
        catch {
            # Service not ready yet
        }
        
        if ($attempt -eq $maxAttempts) {
            Write-Host "❌ Services failed to become healthy" -ForegroundColor Red
            docker-compose -f $ComposeFile logs
            throw "Services health check failed"
        }
        
        Start-Sleep -Seconds 10
        $attempt++
    }
}

# Function to run database migrations
function Invoke-Migrations {
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
    
    try {
        if ($Environment -eq "development") {
            docker-compose -f $ComposeFile exec backend-dev npm run db:migrate
        }
        else {
            docker-compose -f $ComposeFile exec backend npm run db:migrate
        }
        Write-Host "✅ Database migrations completed" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Database migrations failed or not needed" -ForegroundColor Yellow
    }
}

# Function to show deployment status
function Show-Status {
    Write-Host ""
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Blue
    docker-compose -f $ComposeFile ps
    
    Write-Host ""
    Write-Host "🌐 Application URLs:" -ForegroundColor Blue
    if ($Environment -eq "production") {
        Write-Host "Frontend: https://localhost" -ForegroundColor Green
        Write-Host "Backend API: https://localhost/api" -ForegroundColor Green
    }
    else {
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
        Write-Host "Backend API: http://localhost:5000/api" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📋 Useful Commands:" -ForegroundColor Blue
    Write-Host "View logs: docker-compose -f $ComposeFile logs -f" -ForegroundColor Yellow
    Write-Host "Stop services: docker-compose -f $ComposeFile down" -ForegroundColor Yellow
    Write-Host "Restart services: docker-compose -f $ComposeFile restart" -ForegroundColor Yellow
}

# Main deployment flow
try {
    Write-Host "🔍 Pre-deployment checks..." -ForegroundColor Blue
    if (-not (Test-Docker)) { exit 1 }
    Test-EnvFile
    New-Directories
    
    Write-Host ""
    Write-Host "🚀 Deploying services..." -ForegroundColor Blue
    Start-Services
    Wait-ForServices
    
    Write-Host ""
    Write-Host "🗄️  Database setup..." -ForegroundColor Blue
    Invoke-Migrations
    
    Show-Status
}
catch {
    Write-Host ""
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}