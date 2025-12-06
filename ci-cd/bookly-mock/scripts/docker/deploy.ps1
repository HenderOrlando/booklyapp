# ===================================
# Bookly Docker Deployment Script
# ===================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Bookly Docker Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
$dockerStatus = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running!" -ForegroundColor Green
Write-Host ""

# Stop and remove existing containers
Write-Host "Stopping and removing existing containers..." -ForegroundColor Yellow
docker-compose down -v
Write-Host ""

# Build and start infrastructure services first
Write-Host "Starting infrastructure services (MongoDB, Redis, Kafka)..." -ForegroundColor Yellow
docker-compose up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway
Write-Host ""

# Wait for infrastructure to be ready
Write-Host "Waiting for infrastructure services to be healthy (60 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60
Write-Host ""

# Build and start microservices
Write-Host "Building and starting microservices..." -ForegroundColor Yellow
docker-compose up -d --build api-gateway auth-service resources-service availability-service stockpile-service reports-service
Write-Host ""

# Wait for microservices to be ready
Write-Host "Waiting for microservices to be ready (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host ""

# Build and start frontend
Write-Host "Building and starting frontend..." -ForegroundColor Yellow
docker-compose up -d --build bookly-web
Write-Host ""

# Show status
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Deployment Status" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Show access URLs
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Access URLs" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "API Gateway:          http://localhost:3000" -ForegroundColor Green
Write-Host "API Docs (Swagger):   http://localhost:3000/api/docs" -ForegroundColor Green
Write-Host "Auth Service:         http://localhost:3001" -ForegroundColor Green
Write-Host "Resources Service:    http://localhost:3002" -ForegroundColor Green
Write-Host "Availability Service: http://localhost:3003" -ForegroundColor Green
Write-Host "Stockpile Service:    http://localhost:3004" -ForegroundColor Green
Write-Host "Reports Service:      http://localhost:3005" -ForegroundColor Green
Write-Host "Frontend:             http://localhost:4200" -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "To view logs, run: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop all services, run: docker-compose down" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
