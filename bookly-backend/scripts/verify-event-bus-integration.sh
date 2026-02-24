#!/bin/bash

# Script para verificar la integración del Event Bus en todos los servicios
# Autor: Cascade AI
# Fecha: 2025-01-05

set -e

echo "🔍 Verificando integración del Event Bus Unificado..."
echo ""

# Directorio base
BASE_DIR="/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-backend"
cd "$BASE_DIR"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Función para verificar si un archivo usa KafkaService
check_kafka_service() {
    local file=$1
    local service_name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if grep -q "KafkaService" "$file" 2>/dev/null; then
        echo -e "${RED}❌ FAIL${NC}: $service_name todavía usa KafkaService"
        echo "   Archivo: $file"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    else
        echo -e "${GREEN}✅ PASS${NC}: $service_name no usa KafkaService"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    fi
}

# Función para verificar si un archivo usa EventBusService
check_event_bus_service() {
    local file=$1
    local service_name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if grep -q "EventBusService" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}: $service_name usa EventBusService"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: $service_name no parece usar EventBusService"
        echo "   Archivo: $file"
        return 0
    fi
}

echo "📦 Verificando servicios..."
echo "======================================"
echo ""

# 1. Resources Service
echo "1️⃣  Resources Service"
check_kafka_service "apps/resources-service/src/application/services/resource.service.ts" "ResourceService"
check_event_bus_service "apps/resources-service/src/application/services/resource.service.ts" "ResourceService"
echo ""

# 2. Availability Service
echo "2️⃣  Availability Service"
check_kafka_service "apps/availability-service/src/application/services/recurring-reservation-event-publisher.service.ts" "RecurringReservationEventPublisher"
check_event_bus_service "apps/availability-service/src/application/services/recurring-reservation-event-publisher.service.ts" "RecurringReservationEventPublisher"
echo ""

# 3. Auth Service
echo "3️⃣  Auth Service"
if [ -f "apps/auth-service/src/application/services/audit.service.ts" ]; then
    check_kafka_service "apps/auth-service/src/application/services/audit.service.ts" "AuditService"
    check_event_bus_service "apps/auth-service/src/application/services/audit.service.ts" "AuditService"
else
    echo -e "${YELLOW}⚠️  SKIP${NC}: audit.service.ts no encontrado"
fi
echo ""

# 4. Stockpile Service
echo "4️⃣  Stockpile Service"
check_kafka_service "apps/stockpile-service/src/infrastructure/event-handlers/user-info.event-handler.ts" "UserInfoEventHandler"
check_event_bus_service "apps/stockpile-service/src/infrastructure/event-handlers/user-info.event-handler.ts" "UserInfoEventHandler"
check_kafka_service "apps/stockpile-service/src/infrastructure/event-handlers/resource-info.event-handler.ts" "ResourceInfoEventHandler"
check_event_bus_service "apps/stockpile-service/src/infrastructure/event-handlers/resource-info.event-handler.ts" "ResourceInfoEventHandler"
echo ""

# 5. Reports Service
echo "5️⃣  Reports Service"
if [ -f "apps/reports-service/src/infrastructure/consumers/audit-events.consumer.ts" ]; then
    check_kafka_service "apps/reports-service/src/infrastructure/consumers/audit-events.consumer.ts" "AuditEventsConsumer"
    check_event_bus_service "apps/reports-service/src/infrastructure/consumers/audit-events.consumer.ts" "AuditEventsConsumer"
else
    echo -e "${YELLOW}⚠️  SKIP${NC}: audit-events.consumer.ts no encontrado"
fi
echo ""

# 6. API Gateway
echo "6️⃣  API Gateway"
check_kafka_service "apps/api-gateway/src/application/services/proxy.service.ts" "ProxyService"
check_kafka_service "apps/api-gateway/src/application/services/request-reply.service.ts" "RequestReplyService"
check_kafka_service "apps/api-gateway/src/application/services/saga.service.ts" "SagaService"
echo ""

echo "======================================"
echo ""
echo "📊 Resultados:"
echo "   Total de checks: $TOTAL_CHECKS"
echo -e "   ${GREEN}Pasados: $PASSED_CHECKS${NC}"
echo -e "   ${RED}Fallados: $FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los servicios están actualizados!${NC}"
    echo ""
    echo "🎯 Próximo paso: Compilar el proyecto"
    echo "   npm run build"
    exit 0
else
    echo -e "${RED}❌ Algunos servicios todavía usan KafkaService directamente${NC}"
    echo ""
    echo "📝 Por hacer:"
    echo "   - Actualizar los archivos marcados como FAIL"
    echo "   - Reemplazar KafkaService por EventBusService"
    echo "   - Agregar metadata de Event Sourcing a eventos"
    exit 1
fi
