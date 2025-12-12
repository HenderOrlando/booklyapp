# ===================================
# Bookly Docker Deployment Script
# ===================================
# Options:
#   -Action start   : Start deployment (default)
#   -Action stop    : Stop deployment
#   -Action restart : Restart deployment
#   -Mode full      : Deploy infrastructure + microservices + frontend (default)
#   -Mode partial   : Deploy only microservices + frontend (uses .env files)
# ===================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "restart")]
    [string]$Action = "start",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("full", "partial")]
    [string]$Mode = ""
)

# Configuration
$BOOKLY_MOCK_PATH = "..\..\..\..\bookly-mock"
$DOCKER_COMPOSE_FULL = "docker-compose.yml"
$DOCKER_COMPOSE_PARTIAL = "docker-compose.microservices.yml"
$DEPLOY_MODE_FILE = ".deploy-mode"

# Function to get saved mode
function Get-SavedMode {
    $modeFilePath = Join-Path $BOOKLY_MOCK_PATH $DEPLOY_MODE_FILE
    if (Test-Path $modeFilePath) {
        return Get-Content $modeFilePath -Raw
    }
    return $null
}

# Function to save mode
function Save-Mode {
    param([string]$ModeToSave)
    $modeFilePath = Join-Path $BOOKLY_MOCK_PATH $DEPLOY_MODE_FILE
    $ModeToSave | Out-File -FilePath $modeFilePath -NoNewline
}

# Determine mode to use
$savedMode = Get-SavedMode
if ($Mode -eq "") {
    if ($Action -eq "start") {
        $Mode = "full"
    } elseif ($savedMode) {
        $Mode = $savedMode.Trim()
    } else {
        Write-Host "ERROR: No previous deployment found. Please run with -Mode (full|partial) first." -ForegroundColor Red
        exit 1
    }
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Bookly Docker Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Magenta
Write-Host "Mode: $Mode" -ForegroundColor Magenta
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running!" -ForegroundColor Green
Write-Host ""

# Change to bookly-mock directory
Push-Location $BOOKLY_MOCK_PATH

# Determine which docker-compose file to use
$dockerComposeFile = if ($Mode -eq "full") { $DOCKER_COMPOSE_FULL } else { $DOCKER_COMPOSE_PARTIAL }

try {
    # ===============================================
    # STOP ACTION
    # ===============================================
    if ($Action -eq "stop") {
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  STOPPING DEPLOYMENT ($Mode)" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ""
        
        if ($Mode -eq "full") {
            docker-compose -f $dockerComposeFile down -v
        } else {
            docker-compose -f $dockerComposeFile down
        }
        
        Write-Host ""
        Write-Host "Deployment stopped successfully!" -ForegroundColor Green
        exit 0
    }
    
    # ===============================================
    # RESTART ACTION
    # ===============================================
    if ($Action -eq "restart") {
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  RESTARTING DEPLOYMENT ($Mode)" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Stopping containers..." -ForegroundColor Yellow
        docker-compose -f $dockerComposeFile down
        Write-Host ""
        
        Write-Host "Starting containers..." -ForegroundColor Yellow
        docker-compose -f $dockerComposeFile up -d
        Write-Host ""
        
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  Deployment Status" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        docker-compose -f $dockerComposeFile ps
        Write-Host ""
        
        Write-Host "Deployment restarted successfully!" -ForegroundColor Green
        exit 0
    }

    # ===============================================
    # START ACTION (default)
    # ===============================================
    
    # Save the mode for future stop/restart commands
    Save-Mode $Mode
    
    if ($Mode -eq "full") {
        # ===============================================
        # FULL DEPLOYMENT: Infrastructure + Microservices + Frontend
        # Uses inline environment variables from docker-compose.yml
        # ===============================================
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  FULL DEPLOYMENT" -ForegroundColor Cyan
        Write-Host "  (Infrastructure + Microservices + Frontend)" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ""

        # Stop and remove existing containers
        Write-Host "Stopping and removing existing containers..." -ForegroundColor Yellow
        docker-compose -f $DOCKER_COMPOSE_FULL down -v
        Write-Host ""

        # Build and start infrastructure services first
        Write-Host "Starting infrastructure services (MongoDB, Redis, Kafka)..." -ForegroundColor Yellow
        docker-compose -f $DOCKER_COMPOSE_FULL up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway
        Write-Host ""

        # Wait for infrastructure to be ready
        Write-Host "Waiting for infrastructure services to be healthy (60 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
        Write-Host ""

        # Build and start microservices
        Write-Host "Building and starting microservices..." -ForegroundColor Yellow
        docker-compose -f $DOCKER_COMPOSE_FULL up -d --build api-gateway auth-service resources-service availability-service stockpile-service reports-service
        Write-Host ""

        # Wait for microservices to be ready
        Write-Host "Waiting for microservices to be ready (30 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        Write-Host ""

        # Build and start frontend
        Write-Host "Building and starting frontend..." -ForegroundColor Yellow
        docker-compose -f $DOCKER_COMPOSE_FULL up -d --build bookly-web
        Write-Host ""

        # Show status
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  Deployment Status" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        docker-compose -f $DOCKER_COMPOSE_FULL ps
        Write-Host ""

    } else {
        # ===============================================
        # PARTIAL DEPLOYMENT: Only Microservices + Frontend
        # Uses .env files from each microservice and frontend
        # Assumes infrastructure is already running externally
        # ===============================================
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  PARTIAL DEPLOYMENT" -ForegroundColor Cyan
        Write-Host "  (Microservices + Frontend only)" -ForegroundColor Cyan
        Write-Host "  Using .env files for configuration" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ""

        # Verify .env files exist
        Write-Host "Verifying .env files exist..." -ForegroundColor Yellow
        $envFiles = @(
            "apps/api-gateway/.env",
            "apps/auth-service/.env",
            "apps/resources-service/.env",
            "apps/availability-service/.env",
            "apps/stockpile-service/.env",
            "apps/reports-service/.env",
            "../bookly-mock-frontend/.env"
        )
        
        $missingFiles = @()
        foreach ($envFile in $envFiles) {
            if (-not (Test-Path $envFile)) {
                $missingFiles += $envFile
            }
        }
        
        if ($missingFiles.Count -gt 0) {
            Write-Host "WARNING: The following .env files are missing:" -ForegroundColor Red
            foreach ($file in $missingFiles) {
                Write-Host "  - $file" -ForegroundColor Red
            }
            Write-Host ""
            Write-Host "Please create these files from their .env.example templates." -ForegroundColor Yellow
            Write-Host "Do you want to continue anyway? (y/N)" -ForegroundColor Yellow
            $response = Read-Host
            if ($response -ne "y" -and $response -ne "Y") {
                Write-Host "Deployment cancelled." -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "All .env files found!" -ForegroundColor Green
        }
        Write-Host ""

        # Stop existing microservices containers
        Write-Host "Stopping existing microservices containers..." -ForegroundColor Yellow
        docker-compose -f $DOCKER_COMPOSE_PARTIAL down
        Write-Host ""

        # Build and start microservices
        Write-Host "Building and starting microservices..." -ForegroundColor Yellow
        docker-compose -f $DOCKER_COMPOSE_PARTIAL up -d --build api-gateway auth-service resources-service availability-service stockpile-service reports-service
        Write-Host ""

        # Wait for microservices to be ready
        Write-Host "Waiting for microservices to be ready (30 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        Write-Host ""

        # Build and start frontend
        Write-Host "Building and starting frontend..." -ForegroundColor Yellow
        docker-compose -f $DOCKER_COMPOSE_PARTIAL up -d --build bookly-web
        Write-Host ""

        # Show status
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  Deployment Status" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        docker-compose -f $DOCKER_COMPOSE_PARTIAL ps
        Write-Host ""
    }

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
    
    # Show appropriate commands based on mode
    Write-Host "=====================================" -ForegroundColor Cyan
    if ($Mode -eq "full") {
        Write-Host "To view logs, run: docker-compose logs -f" -ForegroundColor Yellow
        Write-Host "To stop all services, run: docker-compose down" -ForegroundColor Yellow
    } else {
        Write-Host "To view logs, run: docker-compose -f $DOCKER_COMPOSE_PARTIAL logs -f" -ForegroundColor Yellow
        Write-Host "To stop services, run: docker-compose -f $DOCKER_COMPOSE_PARTIAL down" -ForegroundColor Yellow
    }
    Write-Host "=====================================" -ForegroundColor Cyan

} finally {
    # Return to original directory
    Pop-Location
}
