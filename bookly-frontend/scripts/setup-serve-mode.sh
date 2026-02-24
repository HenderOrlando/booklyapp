#!/bin/bash

##############################################################################
# Script de Configuración de Modo SERVE
# 
# Configura el frontend para consumir datos del backend real
#
# Uso:
#   ./scripts/setup-serve-mode.sh
##############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Configuración de Modo SERVE - Bookly Frontend     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

ENV_FILE=".env.local"
ENV_EXAMPLE=".env.local.example"

##############################################################################
# 1. Verificar si existe .env.local.example
##############################################################################
if [ ! -f "$ENV_EXAMPLE" ]; then
    echo -e "${RED}✗ Error: No se encontró $ENV_EXAMPLE${NC}"
    exit 1
fi

##############################################################################
# 2. Crear o actualizar .env.local
##############################################################################
echo -e "${YELLOW}Configurando $ENV_FILE...${NC}"

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}  ⚠️  $ENV_FILE ya existe. Creando backup...${NC}"
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}  ✓ Backup creado${NC}"
fi

# Crear .env.local desde el ejemplo
cp "$ENV_EXAMPLE" "$ENV_FILE"

# Actualizar NEXT_PUBLIC_DATA_MODE a 'serve'
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/NEXT_PUBLIC_DATA_MODE=mock/NEXT_PUBLIC_DATA_MODE=serve/' "$ENV_FILE"
else
    # Linux
    sed -i 's/NEXT_PUBLIC_DATA_MODE=mock/NEXT_PUBLIC_DATA_MODE=serve/' "$ENV_FILE"
fi

# Generar NEXTAUTH_SECRET si no está configurado
if grep -q "NEXTAUTH_SECRET=your-secret-key-here-change-in-production" "$ENV_FILE"; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|NEXTAUTH_SECRET=your-secret-key-here-change-in-production|NEXTAUTH_SECRET=${NEXTAUTH_SECRET}|" "$ENV_FILE"
    else
        sed -i "s|NEXTAUTH_SECRET=your-secret-key-here-change-in-production|NEXTAUTH_SECRET=${NEXTAUTH_SECRET}|" "$ENV_FILE"
    fi
    echo -e "${GREEN}  ✓ NEXTAUTH_SECRET generado${NC}"
fi

echo -e "${GREEN}✓ Archivo $ENV_FILE configurado${NC}"
echo ""

##############################################################################
# 3. Mostrar configuración
##############################################################################
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    CONFIGURACIÓN                       ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}Variables clave configuradas:${NC}"
echo "  • NEXT_PUBLIC_DATA_MODE=serve"
echo "  • NEXT_PUBLIC_USE_DIRECT_SERVICES=true (bypassing API Gateway)"
echo "  • NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001"
echo "  • NEXT_PUBLIC_RESOURCES_SERVICE_URL=http://localhost:3002"
echo "  • NEXT_PUBLIC_AVAILABILITY_SERVICE_URL=http://localhost:3003"
echo "  • NEXT_PUBLIC_STOCKPILE_SERVICE_URL=http://localhost:3004"
echo "  • NEXT_PUBLIC_REPORTS_SERVICE_URL=http://localhost:3005"
echo "  • NEXTAUTH_URL=http://localhost:4200"
echo "  • NEXTAUTH_SECRET=<generado>"
echo ""

##############################################################################
# 4. Verificar backend
##############################################################################
echo -e "${YELLOW}Verificando conectividad con backend...${NC}"

if command -v curl &> /dev/null; then
    if curl -s --max-time 2 http://localhost:3000/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API Gateway responde correctamente${NC}"
    else
        echo -e "${RED}✗ API Gateway no responde${NC}"
        echo -e "${YELLOW}  Asegúrate de iniciar el backend primero:${NC}"
        echo -e "  ${BLUE}cd ../bookly-mock && npm run dev:all${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl no instalado, no se puede verificar backend${NC}"
fi

echo ""

##############################################################################
# 5. Próximos pasos
##############################################################################
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                   PRÓXIMOS PASOS                       ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Verificar que el backend esté corriendo:"
echo -e "   ${BLUE}./scripts/verify-backend-connectivity.sh${NC}"
echo ""
echo "2. Iniciar el frontend:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "3. Probar login en:"
echo -e "   ${BLUE}http://localhost:4200/auth/login${NC}"
echo ""
echo "   Credenciales de prueba:"
echo "   • Email: admin@ufps.edu.co"
echo "   • Password: 123456"
echo ""
echo -e "${GREEN}✓ Configuración completada exitosamente${NC}"
echo ""
