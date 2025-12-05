#!/usr/bin/env pwsh
# Script para ejecutar todos los microservicios localmente
# La infraestructura debe estar corriendo en Docker

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Bookly - Inicio de Microservicios" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que la infraestructura esté corriendo
Write-Host "Verificando infraestructura Docker..." -ForegroundColor Yellow
$containers = docker ps --filter "name=bookly-mock" --format "{{.Names}}"
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

$missingContainers = @()
foreach ($container in $requiredContainers) {
    if ($containers -notcontains $container) {
        $missingContainers += $container
    }
}

if ($missingContainers.Count -gt 0) {
    Write-Host "❌ Faltan contenedores de infraestructura:" -ForegroundColor Red
    $missingContainers | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Ejecuta primero: docker-compose up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Infraestructura Docker OK" -ForegroundColor Green
Write-Host ""

# Verificar que node_modules esté instalado
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Microservicios" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 API Gateway         → http://localhost:3000" -ForegroundColor Green
Write-Host "🔐 Auth Service        → http://localhost:3001" -ForegroundColor Green
Write-Host "📦 Resources Service   → http://localhost:3002" -ForegroundColor Green
Write-Host "📅 Availability Service → http://localhost:3003" -ForegroundColor Green
Write-Host "✅ Stockpile Service   → http://localhost:3004" -ForegroundColor Green
Write-Host "📊 Reports Service     → http://localhost:3005" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para detener todos los servicios" -ForegroundColor Yellow
Write-Host ""

# Ejecutar todos los servicios en paralelo
$jobs = @()

# API Gateway
$jobs += Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "3000"
    npm run start:dev api-gateway
}

# Auth Service
$jobs += Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "3001"
    npm run start:dev auth-service
}

# Resources Service
$jobs += Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "3002"
    npm run start:dev resources-service
}

# Availability Service
$jobs += Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "3003"
    npm run start:dev availability-service
}

# Stockpile Service
$jobs += Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "3004"
    npm run start:dev stockpile-service
}

# Reports Service
$jobs += Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "3005"
    npm run start:dev reports-service
}

# Esperar y mostrar logs
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Mostrar output de los jobs
        foreach ($job in $jobs) {
            $output = Receive-Job -Job $job
            if ($output) {
                Write-Host $output
            }
        }
        
        # Verificar si algún job terminó con error
        $failedJobs = $jobs | Where-Object { $_.State -eq "Failed" }
        if ($failedJobs.Count -gt 0) {
            Write-Host "❌ Algunos servicios fallaron" -ForegroundColor Red
            break
        }
    }
}
finally {
    Write-Host ""
    Write-Host "Deteniendo todos los servicios..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
}
