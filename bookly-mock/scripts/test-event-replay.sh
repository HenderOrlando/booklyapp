#!/bin/bash

# Script para testing de Event Replay
# Verifica funcionalidad de replay con filtros y snapshots

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
API_URL=${API_URL:-"http://localhost:3000"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@ufps.edu.co"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"123456"}
TOKEN=""

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Event Replay Testing Suite           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to get auth token
get_token() {
    echo -e "${YELLOW}🔑 Authenticating...${NC}"
    
    TOKEN=$(curl -s -X POST "${API_URL}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
        | jq -r '.accessToken')
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
        echo -e "${RED}❌ Failed to get authentication token${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Authenticated successfully${NC}"
    echo ""
}

# Test 1: Replay all events (no filter)
test_replay_all() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Test 1: Replay All Events${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/events/replay" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{}')
    
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Replayed $COUNT events${NC}"
    else
        echo -e "${RED}❌ No events replayed${NC}"
    fi
    echo ""
}

# Test 2: Replay by date range
test_replay_by_date() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Test 2: Replay by Date Range${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    START_DATE="2024-01-01"
    END_DATE="2024-12-31"
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/events/replay" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"startDate\":\"${START_DATE}\",\"endDate\":\"${END_DATE}\"}")
    
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Replayed $COUNT events from ${START_DATE} to ${END_DATE}${NC}"
    else
        echo -e "${YELLOW}⚠️  No events found in date range${NC}"
    fi
    echo ""
}

# Test 3: Replay by event type
test_replay_by_event_type() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Test 3: Replay by Event Type${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    EVENT_TYPE="RESOURCE_CREATED"
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/events/replay" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"eventTypes\":[\"${EVENT_TYPE}\"]}")
    
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Replayed $COUNT events of type ${EVENT_TYPE}${NC}"
    else
        echo -e "${YELLOW}⚠️  No events of type ${EVENT_TYPE} found${NC}"
    fi
    echo ""
}

# Test 4: Replay by aggregate type
test_replay_by_aggregate() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Test 4: Replay by Aggregate Type${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    AGGREGATE_TYPE="Resource"
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/events/replay" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"aggregateTypes\":[\"${AGGREGATE_TYPE}\"]}")
    
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Replayed $COUNT events for aggregate type ${AGGREGATE_TYPE}${NC}"
    else
        echo -e "${YELLOW}⚠️  No events for aggregate type ${AGGREGATE_TYPE} found${NC}"
    fi
    echo ""
}

# Test 5: Replay by service
test_replay_by_service() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Test 5: Replay by Service${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    SERVICE="resources-service"
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/events/replay" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"services\":[\"${SERVICE}\"]}")
    
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Replayed $COUNT events from service ${SERVICE}${NC}"
    else
        echo -e "${YELLOW}⚠️  No events from service ${SERVICE} found${NC}"
    fi
    echo ""
}

# Test 6: Combined filters
test_replay_combined() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Test 6: Replay with Combined Filters${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/events/replay" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "startDate": "2024-01-01",
            "endDate": "2024-12-31",
            "eventTypes": ["RESOURCE_CREATED", "RESOURCE_UPDATED"],
            "aggregateTypes": ["Resource"],
            "services": ["resources-service"]
        }')
    
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Replayed $COUNT events with combined filters${NC}"
    else
        echo -e "${YELLOW}⚠️  No events matched combined filters${NC}"
    fi
    echo ""
}

# Test 7: Performance test with large dataset
test_replay_performance() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Test 7: Performance Test${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    echo "Testing replay performance with all events..."
    
    START_TIME=$(date +%s%N)
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/events/replay" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{}')
    
    END_TIME=$(date +%s%N)
    
    ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -gt 0 ]; then
        EVENTS_PER_SEC=$(( COUNT * 1000 / ELAPSED_MS ))
        echo -e "${GREEN}✅ Replayed $COUNT events in ${ELAPSED_MS}ms${NC}"
        echo -e "${GREEN}   Throughput: ~${EVENTS_PER_SEC} events/second${NC}"
    else
        echo -e "${RED}❌ Performance test failed${NC}"
    fi
    echo ""
}

# Test 8: Get events by aggregate
test_get_by_aggregate() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Test 8: Get Events by Specific Aggregate${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    
    AGGREGATE_TYPE="Resource"
    AGGREGATE_ID="aggregate-0"
    
    RESPONSE=$(curl -s -X GET "${API_URL}/api/v1/events/aggregate/${AGGREGATE_TYPE}/${AGGREGATE_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Retrieved $COUNT events for ${AGGREGATE_TYPE}:${AGGREGATE_ID}${NC}"
        
        # Show version progression
        VERSIONS=$(echo "$RESPONSE" | jq -r '.[].version' | sort -n | tr '\n' ',' | sed 's/,$//')
        echo -e "${BLUE}   Versions: ${VERSIONS}${NC}"
    else
        echo -e "${YELLOW}⚠️  No events for aggregate ${AGGREGATE_TYPE}:${AGGREGATE_ID}${NC}"
    fi
    echo ""
}

# Run all tests
run_all_tests() {
    get_token
    
    test_replay_all
    test_replay_by_date
    test_replay_by_event_type
    test_replay_by_aggregate
    test_replay_by_service
    test_replay_combined
    test_replay_performance
    test_get_by_aggregate
    
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ All tests completed!${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq is not installed. Please install it first.${NC}"
    echo "   macOS: brew install jq"
    echo "   Ubuntu: sudo apt-get install jq"
    exit 1
fi

# Run tests
run_all_tests
