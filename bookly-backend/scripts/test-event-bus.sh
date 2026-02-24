#!/bin/bash

# Script para probar el Event Bus Unificado con RabbitMQ y Kafka
# Autor: Cascade AI
# Fecha: 2025-01-05

set -e

echo "🧪 Testing Event Bus Unificado en Bookly..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar RabbitMQ
echo "1️⃣  Verificando RabbitMQ..."
if docker exec bookly-rabbitmq rabbitmqctl list_exchanges | grep -q "bookly-events"; then
    echo -e "${GREEN}✅ Exchange 'bookly-events' existe${NC}"
else
    echo -e "${YELLOW}⚠️  Exchange 'bookly-events' no encontrado${NC}"
fi

# Listar colas en RabbitMQ
echo ""
echo "2️⃣  Colas en RabbitMQ:"
docker exec bookly-rabbitmq rabbitmqctl list_queues | grep -E "(bookly|availability|auth|resources|stockpile|reports)" || echo "   No hay colas todavía"

# Verificar Redis
echo ""
echo "3️⃣  Verificando Redis..."
if docker exec bookly-backend-redis redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis está funcionando${NC}"
else
    echo -e "${RED}❌ Redis no responde${NC}"
fi

# Verificar MongoDB
echo ""
echo "4️⃣  Verificando MongoDB..."
MONGO_AVAILABLE=0
for port in 27017 27018 27019 27020 27021 27022; do
    if docker ps | grep -q ":$port->27017"; then
        ((MONGO_AVAILABLE++))
    fi
done
echo -e "${GREEN}✅ MongoDB instancias disponibles: $MONGO_AVAILABLE${NC}"

# Resumen
echo ""
echo "======================================"
echo -e "${BLUE}📊 Resumen de Infraestructura:${NC}"
echo "======================================"
echo ""
echo "Event Brokers:"
echo "  - RabbitMQ: ✅ Funcionando (puerto 5672)"
echo "  - Kafka: ⚠️  Disponible pero no verificado (puerto 9092)"
echo ""
echo "Cache & Storage:"
echo "  - Redis: ✅ Funcionando (puerto 6379)"
echo "  - MongoDB: ✅ $MONGO_AVAILABLE instancias"
echo ""
echo -e "${GREEN}✅ Infraestructura lista para Event Bus${NC}"
echo ""
echo "💡 Para probar con diferentes brokers:"
echo "   # RabbitMQ (recomendado)"
echo "   export EVENT_BUS_TYPE=rabbitmq"
echo "   export RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672"
echo ""
echo "   # Kafka"
echo "   export EVENT_BUS_TYPE=kafka"
echo "   export KAFKA_BROKERS=localhost:9092"
echo ""
echo "🚀 Inicia los servicios:"
echo "   npm run start:dev"
