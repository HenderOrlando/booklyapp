#!/bin/bash

##############################################################################
# Script de Verificación de Conectividad Backend
# 
# Verifica que todos los microservicios del backend estén levantados
# y respondiendo correctamente antes de iniciar el frontend.
#
# Uso:
#   ./scripts/verify-backend-connectivity.sh
#
# Códigos de salida:
#   0 - Todos los servicios están operativos
#   1 - Uno o más servicios no están disponibles
##############################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_GATEWAY_URL="${NEXT_PUBLIC_API_GATEWAY_URL:-http://localhost:3000}"
AUTH_SERVICE_URL="${NEXT_PUBLIC_AUTH_SERVICE_URL:-http://localhost:3001}"
RESOURCES_SERVICE_URL="${NEXT_PUBLIC_RESOURCES_SERVICE_URL:-http://localhost:3002}"
AVAILABILITY_SERVICE_URL="${NEXT_PUBLIC_AVAILABILITY_SERVICE_URL:-http://localhost:3003}"
STOCKPILE_SERVICE_URL="${NEXT_PUBLIC_STOCKPILE_SERVICE_URL:-http://localhost:3004}"
REPORTS_SERVICE_URL="${NEXT_PUBLIC_REPORTS_SERVICE_URL:-http://localhost:3005}"
TIMEOUT=5

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Verificación de Conectividad Backend Bookly       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# Función para verificar un endpoint
##############################################################################
check_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    printf "%-40s " "Verificando $name..."
    
    # Realizar petición con timeout
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null) || response="000"
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} ($response)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (esperado: $expected_status, recibido: $response)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

##############################################################################
# Función para verificar JSON response
##############################################################################
check_json_endpoint() {
    local name="$1"
    local url="$2"
    local json_key="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    printf "%-40s " "Verificando $name..."
    
    # Realizar petición y extraer JSON
    response=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null) || response=""
    
    if [ -z "$response" ]; then
        echo -e "${RED}✗ FAIL${NC} (sin respuesta)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
    
    # Verificar si contiene la clave JSON esperada
    if echo "$response" | grep -q "\"$json_key\""; then
        echo -e "${GREEN}✓ OK${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (JSON inválido)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

##############################################################################
# 1. Verificar API Gateway
##############################################################################
echo -e "${YELLOW}[1/6] API Gateway${NC}"
echo "────────────────────────────────────────────────────────"

check_endpoint "API Gateway Health" "$API_GATEWAY_URL/health"
check_json_endpoint "Health Services" "$API_GATEWAY_URL/health/services" "services"

echo ""

##############################################################################
# 2. Verificar Auth Service
##############################################################################
echo -e "${YELLOW}[2/6] Auth Service${NC}"
echo "────────────────────────────────────────────────────────"

check_endpoint "Auth Service" "$AUTH_SERVICE_URL/api/v1/health" 200

echo ""

##############################################################################
# 3. Verificar Resources Service
##############################################################################
echo -e "${YELLOW}[3/6] Resources Service${NC}"
echo "────────────────────────────────────────────────────────"

check_endpoint "Resources Health" "$RESOURCES_SERVICE_URL/api/v1/health" 200

echo ""

##############################################################################
# 4. Verificar Availability Service
##############################################################################
echo -e "${YELLOW}[4/6] Availability Service${NC}"
echo "────────────────────────────────────────────────────────"

check_endpoint "Availability Health" "$AVAILABILITY_SERVICE_URL/api/v1/health" 200

echo ""

##############################################################################
# 5. Verificar Stockpile Service
##############################################################################
echo -e "${YELLOW}[5/6] Stockpile Service${NC}"
echo "────────────────────────────────────────────────────────"

check_endpoint "Stockpile Health" "$STOCKPILE_SERVICE_URL/api/v1/health" 200

echo ""

##############################################################################
# 6. Verificar Reports Service
##############################################################################
echo -e "${YELLOW}[6/6] Reports Service${NC}"
echo "────────────────────────────────────────────────────────"

check_endpoint "Reports Health" "$REPORTS_SERVICE_URL/api/v1/health" 200

echo ""

##############################################################################
# Resumen Final
##############################################################################
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                      RESUMEN                           ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo "Total de verificaciones: $TOTAL_CHECKS"
echo -e "${GREEN}Exitosas: $PASSED_CHECKS${NC}"
echo -e "${RED}Fallidas: $FAILED_CHECKS${NC}"
echo ""

##############################################################################
# Determinar código de salida
##############################################################################
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los servicios están operativos${NC}"
    echo -e "${GREEN}✓ El frontend puede conectarse correctamente${NC}"
    echo ""
    echo -e "Puedes iniciar el frontend con: ${BLUE}npm run dev${NC}"
    exit 0
else
    echo -e "${RED}✗ Algunos servicios no están disponibles${NC}"
    echo ""
    echo -e "${YELLOW}Acciones recomendadas:${NC}"
    echo "  1. Verifica que Docker esté corriendo"
    echo "  2. Inicia los servicios: cd bookly-mock && npm run dev:all"
    echo "  3. Revisa los logs de los servicios fallidos"
    echo ""
    exit 1
fi
