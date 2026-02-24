#!/bin/bash

# Bookly Mock - Start All Services Script
# This script starts all microservices in background

echo "🚀 Starting Bookly Mock Services..."
echo ""

# Source NVM and use Node 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use v22.15.0

# Clean old logs
rm -f /tmp/bookly-*.log

# Start API Gateway (default project)
echo "📡 Starting API Gateway on port 3000..."
npm run start:dev > /tmp/bookly-gateway.log 2>&1 &
GATEWAY_PID=$!
sleep 10

# Start Auth Service
echo "🔐 Starting Auth Service on port 3001..."
npm run start:dev -- --project auth-service > /tmp/bookly-auth.log 2>&1 &
AUTH_PID=$!
sleep 5

# Start Resources Service
echo "📦 Starting Resources Service on port 3002..."
npm run start:dev -- --project resources-service > /tmp/bookly-resources.log 2>&1 &
RESOURCES_PID=$!
sleep 5

# Start Availability Service
echo "📅 Starting Availability Service on port 3003..."
npm run start:dev -- --project availability-service > /tmp/bookly-availability.log 2>&1 &
AVAILABILITY_PID=$!
sleep 5

# Start Stockpile Service
echo "✅ Starting Stockpile Service on port 3004..."
npm run start:dev -- --project stockpile-service > /tmp/bookly-stockpile.log 2>&1 &
STOCKPILE_PID=$!
sleep 5

# Start Reports Service
echo "📊 Starting Reports Service on port 3005..."
npm run start:dev -- --project reports-service > /tmp/bookly-reports.log 2>&1 &
REPORTS_PID=$!

echo ""
echo "⏳ Waiting for services to initialize (30 seconds)..."
sleep 30

echo ""
echo "🏥 Checking service status..."
echo ""

# Check ports
for port in 3000 3001 3002 3003 3004 3005; do
    if lsof -i :$port | grep -q LISTEN; then
        echo "✅ Port $port is ACTIVE"
    else
        echo "❌ Port $port is NOT active"
    fi
done

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
echo "  pkill -f 'nest start'"
echo ""
echo "✅ All services started!"
