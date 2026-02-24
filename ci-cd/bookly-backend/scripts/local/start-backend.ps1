#!/usr/bin/env pwsh
# Script para ejecutar todos los microservicios localmente
# Requiere que la infraestructura Docker este corriendo

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Bookly Backend - Modo Local" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar infraestructura Docker
Write-Host "[*] Verificando infraestructura Docker..." -ForegroundColor Yellow

$requiredContainers = @(
    "bookly-mock-mongodb-auth",
    "bookly-mock-mongodb-resources",
    "bookly-mock-mongodb-availability",
    "bookly-mock-mongodb-stockpile",
    "bookly-mock-mongodb-reports",
    "bookly-mock-mongodb-gateway",
    "bookly-mock-redis",
    "bookly-mock-kafka",
    "bookly-mock-zookeeper"
)

$runningContainers = docker ps --filter "name=bookly-mock" --format "{{.Names}}" 2>$null

if (-not $runningContainers) {
    Write-Host "[ERROR] La infraestructura Docker no esta corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ejecuta primero:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway" -ForegroundColor White
    Write-Host ""
    exit 1
}

$missingContainers = @()
foreach ($container in $requiredContainers) {
    if ($runningContainers -notcontains $container) {
        $missingContainers += $container
    }
}

if ($missingContainers.Count -gt 0) {
    Write-Host "[WARN] Faltan algunos contenedores:" -ForegroundColor Yellow
    $missingContainers | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
}

Write-Host "[OK] Infraestructura Docker OK" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Microservicios" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] API Gateway         -> http://localhost:3000" -ForegroundColor Green
Write-Host "    Swagger Docs        -> http://localhost:3000/api/docs" -ForegroundColor Cyan
Write-Host "[*] Auth Service        -> http://localhost:3001" -ForegroundColor Green
Write-Host "[*] Resources Service   -> http://localhost:3002" -ForegroundColor Green
Write-Host "[*] Availability Service -> http://localhost:3003" -ForegroundColor Green
Write-Host "[*] Stockpile Service   -> http://localhost:3004" -ForegroundColor Green
Write-Host "[*] Reports Service     -> http://localhost:3005" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para detener todos los servicios" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar todos los servicios
npm run start:all
