#!/bin/bash

# Bookly Mock - Start All Services (Production Mode)
# This script starts all microservices from compiled dist/ directory

echo "🚀 Starting Bookly Mock Services (Production Mode)..."
echo ""

# Source NVM and use Node 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use v22.15.0

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Build if dist doesn't exist or is empty
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "📦 Building services..."
    npm run build
    echo ""
fi

# Clean old logs
rm -f /tmp/bookly-*.log

# Start API Gateway
echo "📡 Starting API Gateway on port ${GATEWAY_PORT:-3000}..."
node dist/apps/api-gateway/src/main.js > /tmp/bookly-gateway.log 2>&1 &
GATEWAY_PID=$!
sleep 3

# Start Auth Service  
echo "🔐 Starting Auth Service on port ${AUTH_PORT:-3001}..."
node dist/apps/auth-service/src/main.js > /tmp/bookly-auth.log 2>&1 &
AUTH_PID=$!
sleep 2

# Start Resources Service
echo "📦 Starting Resources Service on port ${RESOURCES_PORT:-3002}..."
node dist/apps/resources-service/src/main.js > /tmp/bookly-resources.log 2>&1 &
RESOURCES_PID=$!
sleep 2

# Start Availability Service
echo "📅 Starting Availability Service on port ${AVAILABILITY_PORT:-3003}..."
node dist/apps/availability-service/src/main.js > /tmp/bookly-availability.log 2>&1 &
AVAILABILITY_PID=$!
sleep 2

# Start Stockpile Service
echo "✅ Starting Stockpile Service on port ${STOCKPILE_PORT:-3004}..."
node dist/apps/stockpile-service/src/main.js > /tmp/bookly-stockpile.log 2>&1 &
STOCKPILE_PID=$!
sleep 2

# Start Reports Service
echo "📊 Starting Reports Service on port ${REPORTS_PORT:-3005}..."
node dist/apps/reports-service/src/main.js > /tmp/bookly-reports.log 2>&1 &
REPORTS_PID=$!

echo ""
echo "⏳ Waiting for services to initialize (15 seconds)..."
sleep 15

echo ""
echo "🏥 Checking service status..."
echo ""

# Function to check if service is running
check_service() {
    local port=$1
    local name=$2
    
    if lsof -i :$port | grep -q LISTEN; then
        echo "✅ $name (port $port) is ACTIVE"
        return 0
    else
        echo "❌ $name (port $port) is NOT active"
        return 1
    fi
}

# Check all services
ACTIVE_COUNT=0

check_service ${GATEWAY_PORT:-3000} "API Gateway" && ((ACTIVE_COUNT++))
check_service ${AUTH_PORT:-3001} "Auth Service" && ((ACTIVE_COUNT++))
check_service ${RESOURCES_PORT:-3002} "Resources Service" && ((ACTIVE_COUNT++))
check_service ${AVAILABILITY_PORT:-3003} "Availability Service" && ((ACTIVE_COUNT++))
check_service ${STOCKPILE_PORT:-3004} "Stockpile Service" && ((ACTIVE_COUNT++))
check_service ${REPORTS_PORT:-3005} "Reports Service" && ((ACTIVE_COUNT++))

echo ""
echo "📊 Summary: $ACTIVE_COUNT/6 services active"
echo ""

if [ $ACTIVE_COUNT -eq 6 ]; then
    echo "✅ All services started successfully!"
    echo ""
    echo "🌐 Service URLs:"
    echo "  - API Gateway:         http://localhost:${GATEWAY_PORT:-3000}"
    echo "  - API Gateway Swagger: http://localhost:${GATEWAY_PORT:-3000}/api/docs"
    echo "  - Auth Service:        http://localhost:${AUTH_PORT:-3001}/api/v1"
    echo "  - Resources Service:   http://localhost:${RESOURCES_PORT:-3002}/api/v1"
    echo "  - Availability Service: http://localhost:${AVAILABILITY_PORT:-3003}/api/v1"
    echo "  - Stockpile Service:   http://localhost:${STOCKPILE_PORT:-3004}/api/v1"
    echo "  - Reports Service:     http://localhost:${REPORTS_PORT:-3005}/api/v1"
else
    echo "⚠️  Some services failed to start. Check logs for details."
fi

echo ""
echo "📝 Logs location: /tmp/bookly-*.log"
echo ""
echo "To view logs:"
echo "  tail -f /tmp/bookly-gateway.log"
echo "  tail -f /tmp/bookly-auth.log"
echo "  tail -f /tmp/bookly-resources.log"
echo "  tail -f /tmp/bookly-availability.log"
echo "  tail -f /tmp/bookly-stockpile.log"
echo "  tail -f /tmp/bookly-reports.log"
echo ""
echo "To stop all services:"
echo "  pkill -f 'node dist'"
echo ""
