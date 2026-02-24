#!/bin/bash

# Script de verificación del fix DLQ + MongoDB
# Verifica que el DLQ puede conectarse correctamente a MongoDB

set -e

echo "🔍 Verificación del Fix DLQ + MongoDB"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar un servicio MongoDB
check_mongodb() {
    local port=$1
    local service=$2
    
    echo -n "Verificando MongoDB en puerto $port ($service)... "
    if docker ps | grep -q "27017->27017.*bookly-mongodb-$service" || \
       docker ps | grep -q "$port:27017.*bookly-mongodb-$service" || \
       docker ps | grep -q "bookly-backend-mongodb-$service"; then
        echo -e "${GREEN}✓ Corriendo${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ No encontrado${NC}"
        return 1
    fi
}

# 1. Verificar compilación
echo "1️⃣ Verificando compilación..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Proyecto compilado${NC}"
else
    echo -e "${RED}✗ Proyecto no compilado. Ejecuta: npm run build${NC}"
    exit 1
fi
echo ""

# 2. Verificar MongoDB
echo "2️⃣ Verificando instancias MongoDB..."
mongodb_count=0
check_mongodb "27017" "auth" && ((mongodb_count++)) || true
check_mongodb "27018" "resources" && ((mongodb_count++)) || true
check_mongodb "27019" "availability" && ((mongodb_count++)) || true
check_mongodb "27020" "stockpile" && ((mongodb_count++)) || true
check_mongodb "27021" "reports" && ((mongodb_count++)) || true
check_mongodb "27022" "gateway" && ((mongodb_count++)) || true

echo ""
if [ $mongodb_count -eq 0 ]; then
    echo -e "${YELLOW}⚠️ Ninguna instancia MongoDB encontrada${NC}"
    echo "   Para iniciar: docker-compose up -d mongodb-auth mongodb-resources mongodb-availability"
    echo ""
    echo "📋 Opciones:"
    echo "   A) Probar sin MongoDB (modo degradado)"
    echo "   B) Iniciar MongoDB primero"
    echo ""
    read -p "¿Deseas continuar sin MongoDB? (s/n): " choice
    if [[ ! $choice =~ ^[Ss]$ ]]; then
        exit 0
    fi
elif [ $mongodb_count -lt 6 ]; then
    echo -e "${YELLOW}⚠️ Solo $mongodb_count/6 instancias MongoDB corriendo${NC}"
else
    echo -e "${GREEN}✓ Todas las instancias MongoDB corriendo ($mongodb_count/6)${NC}"
fi
echo ""

# 3. Verificar archivo de servicio
echo "3️⃣ Verificando cambios en DLQ service..."
if grep -q "countDocuments().limit(1)" libs/event-bus/src/dlq/dead-letter-queue.service.ts; then
    echo -e "${GREEN}✓ Verificación mejorada implementada${NC}"
else
    echo -e "${RED}✗ Verificación no encontrada${NC}"
fi

if grep -q "stopAutoRetry()" libs/event-bus/src/dlq/dead-letter-queue.service.ts; then
    echo -e "${GREEN}✓ Auto-detención implementada${NC}"
else
    echo -e "${RED}✗ Auto-detención no encontrada${NC}"
fi
echo ""

# 4. Verificar URLs con credenciales
echo "4️⃣ Verificando URLs MongoDB con autenticación..."
urls_ok=0
if grep -q "mongodb://bookly:bookly123@localhost:27017" apps/auth-service/src/auth.module.ts; then
    echo -e "${GREEN}✓ auth-service con credenciales${NC}"
    ((urls_ok++))
fi
if grep -q "mongodb://bookly:bookly123@localhost:27018" apps/resources-service/src/resources.module.ts; then
    echo -e "${GREEN}✓ resources-service con credenciales${NC}"
    ((urls_ok++))
fi
if grep -q "mongodb://bookly:bookly123@localhost:27021" apps/reports-service/src/reports.module.ts; then
    echo -e "${GREEN}✓ reports-service con credenciales${NC}"
    ((urls_ok++))
fi
echo ""

# 5. Prueba rápida
echo "5️⃣ Prueba rápida de inicio..."
echo "Iniciando auth-service por 5 segundos para verificar logs..."
echo ""

# Iniciar en background y capturar logs
npm run start:auth 2>&1 | tee /tmp/bookly-dlq-test.log &
PID=$!

# Esperar 5 segundos
sleep 5

# Matar el proceso
kill $PID 2>/dev/null || true
wait $PID 2>/dev/null || true

echo ""
echo "📊 Análisis de logs:"
echo "-------------------"

# Analizar logs
if grep -q "DLQ Service initialized with auto-retry enabled" /tmp/bookly-dlq-test.log; then
    echo -e "${GREEN}✓ DLQ iniciado correctamente con auto-retry${NC}"
    echo -e "${GREEN}✓ MongoDB disponible y autenticado${NC}"
    result="success_with_mongodb"
elif grep -q "DLQ Service initialized without auto-retry (MongoDB authentication required)" /tmp/bookly-dlq-test.log; then
    echo -e "${YELLOW}⚠️ DLQ iniciado sin auto-retry (autenticación requerida)${NC}"
    echo -e "${YELLOW}⚠️ MongoDB requiere credenciales o no está disponible${NC}"
    result="success_without_mongodb"
elif grep -q "DLQ Service initialized without auto-retry (MongoDB not available)" /tmp/bookly-dlq-test.log; then
    echo -e "${YELLOW}⚠️ DLQ iniciado sin auto-retry (MongoDB no disponible)${NC}"
    result="success_without_mongodb"
elif grep -q "Error in auto-retry processing" /tmp/bookly-dlq-test.log; then
    echo -e "${RED}✗ Errores recurrentes detectados${NC}"
    echo -e "${RED}✗ El fix no está funcionando correctamente${NC}"
    result="failure"
else
    echo -e "${YELLOW}⚠️ No se pudo determinar el estado del DLQ${NC}"
    result="unknown"
fi

# Verificar errores recurrentes
error_count=$(grep -c "Error in auto-retry processing" /tmp/bookly-dlq-test.log || echo "0")
if [ "$error_count" -gt 0 ]; then
    echo -e "${RED}✗ $error_count errores recurrentes encontrados${NC}"
    result="failure"
else
    echo -e "${GREEN}✓ Sin errores recurrentes${NC}"
fi

echo ""
echo "======================================"
echo "📝 Resumen Final"
echo "======================================"
echo ""

case $result in
    success_with_mongodb)
        echo -e "${GREEN}✅ FIX FUNCIONANDO CORRECTAMENTE CON MONGODB${NC}"
        echo ""
        echo "El DLQ está completamente funcional:"
        echo "  • MongoDB autenticado correctamente"
        echo "  • Auto-retry habilitado"
        echo "  • Sin errores recurrentes"
        echo ""
        echo "Próximos pasos:"
        echo "  • Iniciar todos los servicios: npm run start:dev"
        echo "  • Verificar otros servicios con: npm run start:resources, etc."
        ;;
    success_without_mongodb)
        echo -e "${GREEN}✅ FIX FUNCIONANDO EN MODO DEGRADADO${NC}"
        echo ""
        echo "El DLQ maneja correctamente la ausencia de MongoDB:"
        echo "  • Solo 1 warning al iniciar"
        echo "  • Sin errores recurrentes"
        echo "  • Servicio funcional (sin DLQ)"
        echo ""
        echo "Para habilitar DLQ completo:"
        echo "  • docker-compose up -d mongodb-auth"
        echo "  • Reiniciar servicio: npm run start:auth"
        ;;
    failure)
        echo -e "${RED}❌ FIX NO FUNCIONANDO CORRECTAMENTE${NC}"
        echo ""
        echo "Se detectaron errores recurrentes."
        echo "Verificar:"
        echo "  • npm run build"
        echo "  • Revisar logs: cat /tmp/bookly-dlq-test.log"
        ;;
    *)
        echo -e "${YELLOW}⚠️ ESTADO INDETERMINADO${NC}"
        echo ""
        echo "Revisar logs manualmente:"
        echo "  • cat /tmp/bookly-dlq-test.log"
        ;;
esac

echo ""
echo "📄 Documentación:"
echo "  • docs/FIX_DLQ_MONGODB_AUTH.md"
echo "  • docs/MONGODB_CONFIGURATION.md"
echo "  • docs/RESUMEN_FIX_DLQ_MONGODB.md"
echo ""

# Limpiar
rm -f /tmp/bookly-dlq-test.log
