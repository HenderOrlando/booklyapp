#!/bin/bash

# Script para iniciar y verificar Kafka y RabbitMQ para pruebas de Event Bus
# Autor: Cascade AI
# Fecha: 2025-01-05

set -e

echo "🚀 Iniciando Event Brokers para pruebas de Event Bus..."
echo ""

# Directorio base
BASE_DIR="/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-backend"
cd "$BASE_DIR"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si Kafka está corriendo
echo "📡 Verificando Kafka..."
if docker ps | grep -q "bookly-backend-kafka"; then
    echo -e "${GREEN}✅ Kafka ya está corriendo${NC}"
else
    echo -e "${YELLOW}⚠️  Kafka no está corriendo. Iniciando...${NC}"
    docker start bookly-backend-kafka bookly-backend-zookeeper 2>/dev/null || {
        echo -e "${RED}❌ Error: No se pudo iniciar Kafka${NC}"
        echo "   Ejecuta: docker-compose up -d kafka zookeeper"
        exit 1
    }
    sleep 5
    echo -e "${GREEN}✅ Kafka iniciado${NC}"
fi

# Verificar si RabbitMQ está corriendo
echo ""
echo "🐰 Verificando RabbitMQ..."
if docker ps | grep -q "bookly-rabbitmq"; then
    echo -e "${GREEN}✅ RabbitMQ ya está corriendo${NC}"
else
    echo -e "${YELLOW}⚠️  RabbitMQ no está corriendo. Iniciando...${NC}"
    docker start bookly-rabbitmq 2>/dev/null || {
        echo -e "${RED}❌ Error: No se pudo iniciar RabbitMQ${NC}"
        echo "   Ejecuta: docker-compose up -d rabbitmq"
        exit 1
    }
    sleep 5
    echo -e "${GREEN}✅ RabbitMQ iniciado${NC}"
fi

# Verificar salud de Kafka
echo ""
echo "🔍 Verificando salud de Kafka..."
sleep 2
if docker exec bookly-backend-kafka kafka-topics.sh --list --bootstrap-server localhost:9092 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Kafka está funcionando correctamente${NC}"
    echo "   Puerto: 9092"
else
    echo -e "${RED}❌ Kafka no responde correctamente${NC}"
    echo "   Verifica los logs: docker logs bookly-backend-kafka"
fi

# Verificar salud de RabbitMQ
echo ""
echo "🔍 Verificando salud de RabbitMQ..."
sleep 2
if docker exec bookly-rabbitmq rabbitmqctl status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ RabbitMQ está funcionando correctamente${NC}"
    echo "   Puerto AMQP: 5672"
    echo "   Management UI: http://localhost:15672"
    echo "   Usuario: bookly / Contraseña: bookly123"
else
    echo -e "${RED}❌ RabbitMQ no responde correctamente${NC}"
    echo "   Verifica los logs: docker logs bookly-rabbitmq"
fi

# Mostrar resumen
echo ""
echo "======================================"
echo -e "${BLUE}📊 Resumen de Event Brokers:${NC}"
echo "======================================"
echo ""
echo "Kafka:"
echo "  - Bootstrap Server: localhost:9092"
echo "  - Zookeeper: localhost:2181"
echo ""
echo "RabbitMQ:"
echo "  - AMQP URL: amqp://bookly:bookly123@localhost:5672"
echo "  - Management: http://localhost:15672"
echo ""
echo -e "${GREEN}✅ Event Brokers listos para pruebas${NC}"
echo ""
echo "💡 Próximo paso: Probar eventos con diferentes configuraciones"
echo "   export EVENT_BUS_TYPE=kafka   # Para usar Kafka"
echo "   export EVENT_BUS_TYPE=rabbitmq # Para usar RabbitMQ"
