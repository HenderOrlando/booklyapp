#!/usr/bin/env pwsh
# Script maestro para iniciar todo el stack de Bookly en modo local híbrido
# - Infraestructura en Docker
# - Microservicios localmente (Node.js)
# - Frontend localmente (Next.js)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Bookly - Inicio Completo (Local)     ║" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host ""

# Función para verificar Docker
function Test-Docker {
    try {
        docker --version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# 1. Verificar Docker
Write-Host "📋 Paso 1/3: Verificando Docker..." -ForegroundColor Yellow
if (-not (Test-Docker)) {
    Write-Host "❌ Docker no está disponible" -ForegroundColor Red
    Write-Host "   Por favor, inicia Docker Desktop primero" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ Docker OK" -ForegroundColor Green
Write-Host ""

# 2. Levantar infraestructura en Docker
Write-Host "📋 Paso 2/3: Levantando infraestructura en Docker..." -ForegroundColor Yellow
Write-Host "   (MongoDB, Redis, Kafka, Zookeeper)" -ForegroundColor Gray

Push-Location "$PSScriptRoot\..\..\..\..\bookly-mock"
try {
    $output = docker-compose up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al levantar infraestructura" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
    
    Write-Host "   ✅ Infraestructura Docker levantada" -ForegroundColor Green
}
finally {
    Pop-Location
}

# Esperar a que los contenedores estén saludables
Write-Host "   ⏳ Esperando que la infraestructura esté lista (30 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

Write-Host ""

# 3. Mostrar instrucciones para servicios
Write-Host "📋 Paso 3/3: Listos para iniciar servicios locales" -ForegroundColor Yellow
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         INFRAESTRUCTURA ACTIVA         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ MongoDB Auth        → localhost:27017" -ForegroundColor Cyan
Write-Host "✅ MongoDB Resources   → localhost:27018" -ForegroundColor Cyan
Write-Host "✅ MongoDB Availability → localhost:27019" -ForegroundColor Cyan
Write-Host "✅ MongoDB Stockpile   → localhost:27020" -ForegroundColor Cyan
Write-Host "✅ MongoDB Reports     → localhost:27021" -ForegroundColor Cyan
Write-Host "✅ MongoDB Gateway     → localhost:27022" -ForegroundColor Cyan
Write-Host "✅ Redis               → localhost:6379" -ForegroundColor Cyan
Write-Host "✅ Kafka               → localhost:9092" -ForegroundColor Cyan
Write-Host "✅ Zookeeper           → localhost:2181" -ForegroundColor Cyan
Write-Host ""

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║    SIGUIENTE: INICIAR MICROSERVICIOS   ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""
Write-Host "Abre 2 terminales nuevas:" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 1 - Backend (Microservicios):" -ForegroundColor Green
Write-Host "  cd bookly-mock" -ForegroundColor White
Write-Host "  .\start-backend-local.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 2 - Frontend (Next.js):" -ForegroundColor Green
Write-Host "  cd bookly-mock-frontend" -ForegroundColor White
Write-Host "  .\start-frontend-local.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "Una vez iniciados, accede a:" -ForegroundColor Yellow
Write-Host "  🌐 Frontend:    http://localhost:4200" -ForegroundColor Green
Write-Host "  📡 API Gateway: http://localhost:3000" -ForegroundColor Green
Write-Host "  📚 Swagger:     http://localhost:3000/api/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Para detener la infraestructura Docker:" -ForegroundColor Yellow
Write-Host "  cd bookly-mock" -ForegroundColor White
Write-Host "  docker-compose down" -ForegroundColor Cyan
Write-Host ""
