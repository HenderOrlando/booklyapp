# ===================================
# Bookly Docker Services Verification Script
# ===================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Bookly Services Verification" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to check service health
function Test-ServiceHealth {
    param (
        [string]$ServiceName,
        [string]$Url,
        [string]$HealthEndpoint = "/health"
    )
    
    Write-Host "Checking $ServiceName..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "$Url$HealthEndpoint" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " [OK]" -ForegroundColor Green
            return $true
        } else {
            Write-Host " [FAILED] Status: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host " [FAILED] Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check Docker containers status
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Docker Containers Status" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Check infrastructure services
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Infrastructure Services" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "Checking Redis..." -NoNewline
$redisStatus = docker exec bookly-mock-redis redis-cli ping 2>&1
if ($redisStatus -eq "PONG") {
    Write-Host " [OK]" -ForegroundColor Green
} else {
    Write-Host " [FAILED]" -ForegroundColor Red
}

Write-Host "Checking MongoDB Auth..." -NoNewline
$mongoAuthStatus = docker exec bookly-mock-mongodb-auth mongosh --eval "db.adminCommand('ping')" --quiet 2>&1
if ($mongoAuthStatus -like "*ok*") {
    Write-Host " [OK]" -ForegroundColor Green
} else {
    Write-Host " [FAILED]" -ForegroundColor Red
}

Write-Host "Checking Kafka..." -NoNewline
$kafkaStatus = docker exec bookly-mock-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " [OK]" -ForegroundColor Green
} else {
    Write-Host " [FAILED]" -ForegroundColor Red
}
Write-Host ""

# Check microservices HTTP health endpoints
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Microservices Health Checks" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Test-ServiceHealth "API Gateway" "http://localhost:3000"
Test-ServiceHealth "Auth Service" "http://localhost:3001"
Test-ServiceHealth "Resources Service" "http://localhost:3002"
Test-ServiceHealth "Availability Service" "http://localhost:3003"
Test-ServiceHealth "Stockpile Service" "http://localhost:3004"
Test-ServiceHealth "Reports Service" "http://localhost:3005"
Write-Host ""

# Check frontend
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Frontend" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Checking Frontend..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host " [OK]" -ForegroundColor Green
    } else {
        Write-Host " [FAILED] Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host " [FAILED] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Resource usage summary
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Resource Usage" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | Select-Object -First 15
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Verification complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
