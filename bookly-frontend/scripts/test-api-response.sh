#!/bin/bash

# Script para probar la estructura del response del API

echo "🧪 Probando estructura de responses del API..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_GATEWAY="http://localhost:3000"
RESOURCES_SERVICE="http://localhost:3002"
AUTH_SERVICE="http://localhost:3001"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Probando Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${YELLOW}API Gateway:${NC}"
curl -s "$API_GATEWAY/api/v1/health" | jq '.' || echo -e "${RED}❌ No disponible${NC}"
echo ""

echo -e "${YELLOW}Resources Service (directo):${NC}"
curl -s "$RESOURCES_SERVICE/api/v1/health" | jq '.' || echo -e "${RED}❌ No disponible${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Login para obtener token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGIN_RESPONSE=$(curl -s -X POST "$API_GATEWAY/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ufps.edu.co",
    "password": "123456"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

# Extraer token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .data.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}❌ No se pudo obtener token de acceso${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token obtenido: ${TOKEN:0:20}...${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Probando GET /resources (API Gateway)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESOURCES_RESPONSE=$(curl -s "$API_GATEWAY/api/v1/resources" \
  -H "Authorization: Bearer $TOKEN")

echo "$RESOURCES_RESPONSE" | jq '.'
echo ""

# Verificar estructura
echo -e "${YELLOW}Estructura del response:${NC}"
echo "$RESOURCES_RESPONSE" | jq 'keys'
echo ""

echo -e "${YELLOW}Tipo de .data:${NC}"
echo "$RESOURCES_RESPONSE" | jq '.data | type'
echo ""

if echo "$RESOURCES_RESPONSE" | jq -e '.data.items' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Tiene .data.items (Paginado)${NC}"
  ITEMS_COUNT=$(echo "$RESOURCES_RESPONSE" | jq '.data.items | length')
  echo "   Cantidad de items: $ITEMS_COUNT"
elif echo "$RESOURCES_RESPONSE" | jq -e '.data | if type == "array" then true else false end' | grep -q true; then
  echo -e "${GREEN}✅ .data es un array directo${NC}"
  ITEMS_COUNT=$(echo "$RESOURCES_RESPONSE" | jq '.data | length')
  echo "   Cantidad de items: $ITEMS_COUNT"
else
  echo -e "${RED}❌ Estructura desconocida${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Probando GET /categories (API Gateway)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CATEGORIES_RESPONSE=$(curl -s "$API_GATEWAY/api/v1/categories" \
  -H "Authorization: Bearer $TOKEN")

echo "$CATEGORIES_RESPONSE" | jq '.'
echo ""

echo -e "${YELLOW}Estructura del response:${NC}"
echo "$CATEGORIES_RESPONSE" | jq 'keys'
echo ""

echo -e "${YELLOW}Tipo de .data:${NC}"
echo "$CATEGORIES_RESPONSE" | jq '.data | type'
echo ""

if echo "$CATEGORIES_RESPONSE" | jq -e '.data.items' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Tiene .data.items (Paginado)${NC}"
  ITEMS_COUNT=$(echo "$CATEGORIES_RESPONSE" | jq '.data.items | length')
  echo "   Cantidad de items: $ITEMS_COUNT"
elif echo "$CATEGORIES_RESPONSE" | jq -e '.data | if type == "array" then true else false end' | grep -q true; then
  echo -e "${GREEN}✅ .data es un array directo${NC}"
  ITEMS_COUNT=$(echo "$CATEGORIES_RESPONSE" | jq '.data | length')
  echo "   Cantidad de items: $ITEMS_COUNT"
else
  echo -e "${RED}❌ Estructura desconocida${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Probando GET /resources (Servicio Directo)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESOURCES_DIRECT=$(curl -s "$RESOURCES_SERVICE/api/v1/resources" \
  -H "Authorization: Bearer $TOKEN")

echo "$RESOURCES_DIRECT" | jq '.'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Diagnóstico Completo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

