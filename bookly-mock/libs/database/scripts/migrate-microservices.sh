#!/bin/bash

#================================================
# Script de Migración Automática a @libs/database
#================================================
# 
# Este script migra los microservicios de Bookly
# para usar la librería estandarizada @libs/database
#
# Uso: ./migrate-microservices.sh [service-name]
# Ejemplo: ./migrate-microservices.sh resources-service
#
# Si no se especifica servicio, migra todos los pendientes
#================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio base del monorepo
MONOREPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"
APPS_DIR="$MONOREPO_ROOT/apps"

# Servicios a migrar
SERVICES_TO_MIGRATE=(
  "resources-service"
  "availability-service"
  "stockpile-service"
  "reports-service"
)

# Función para logging
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Función para migrar un servicio
migrate_service() {
  local SERVICE_NAME=$1
  local SERVICE_DIR="$APPS_DIR/$SERVICE_NAME"
  
  log_info "Migrando $SERVICE_NAME..."
  
  # Verificar que el servicio existe
  if [ ! -d "$SERVICE_DIR" ]; then
    log_error "Directorio $SERVICE_DIR no encontrado"
    return 1
  fi
  
  # 1. Actualizar imports en el módulo principal
  log_info "  - Actualizando imports en módulo principal..."
  local MODULE_FILE=$(find "$SERVICE_DIR/src" -name "*.module.ts" -type f | head -n 1)
  
  if [ -f "$MODULE_FILE" ]; then
    # Agregar import de DatabaseModule si no existe
    if ! grep -q "import { DatabaseModule }" "$MODULE_FILE"; then
      sed -i.bak '1i\
import { DatabaseModule } from "@libs/database";
' "$MODULE_FILE"
      log_info "    ✓ Import de DatabaseModule agregado"
    fi
    
    # Reemplazar MongooseModule.forRoot con DatabaseModule
    if grep -q "MongooseModule.forRoot" "$MODULE_FILE"; then
      # Crear backup
      cp "$MODULE_FILE" "$MODULE_FILE.backup"
      
      # Comentar MongooseModule.forRoot (multilinea)
      perl -i -p0e 's/MongooseModule\.forRoot\(([\s\S]*?)\),/\/\/ DatabaseModule reemplaza MongooseModule.forRoot\n    DatabaseModule,/g' "$MODULE_FILE"
      
      log_info "    ✓ MongooseModule.forRoot reemplazado por DatabaseModule"
    fi
    
    # Limpiar backup
    rm -f "$MODULE_FILE.bak"
  fi
  
  # 2. Actualizar main.ts
  log_info "  - Actualizando main.ts..."
  local MAIN_FILE="$SERVICE_DIR/src/main.ts"
  
  if [ -f "$MAIN_FILE" ]; then
    # Agregar import de DatabaseService
    if ! grep -q "import { DatabaseService }" "$MAIN_FILE"; then
      sed -i.bak '/import { createLogger }/a\
import { DatabaseService } from "@libs/database";
' "$MAIN_FILE"
      log_info "    ✓ Import de DatabaseService agregado"
    fi
    
    # Agregar shutdown hooks antes de await app.listen
    if ! grep -q "enableShutdownHooks" "$MAIN_FILE"; then
      sed -i.bak '/await app.listen/i\
\  // Habilitar shutdown graceful para base de datos\
\  const databaseService = app.get(DatabaseService);\
\  await databaseService.enableShutdownHooks(app);\
\
' "$MAIN_FILE"
      log_info "    ✓ Shutdown hooks agregados"
    fi
    
    rm -f "$MAIN_FILE.bak"
  fi
  
  # 3. Crear .env.example
  log_info "  - Creando .env.example..."
  local ENV_EXAMPLE="$SERVICE_DIR/.env.example"
  local DB_NAME=$(echo "$SERVICE_NAME" | sed 's/-service$//')
  
  cat > "$ENV_EXAMPLE" <<EOF
# $SERVICE_NAME Configuration
PORT=300X
NODE_ENV=development

# MongoDB - Configuración estandarizada (@libs/database)
DATABASE_URI=mongodb://localhost:27017,localhost:27018,localhost:27019
DATABASE_NAME=bookly-$DB_NAME
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123
MONGO_AUTH_SOURCE=admin

# MongoDB - Configuración opcional
MONGO_RETRY_ATTEMPTS=5
MONGO_RETRY_DELAY=3000
MONGO_SERVER_SELECTION_TIMEOUT=30000
MONGO_SOCKET_TIMEOUT=45000
MONGO_CONNECT_TIMEOUT=30000
MONGO_MAX_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=2
MONGO_AUTO_INDEX=true
MONGO_DIRECT_CONNECTION=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Event Bus
EVENT_BUS_TYPE=rabbitmq # rabbitmq | kafka
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
KAFKA_BROKERS=localhost:9092
ENABLE_EVENT_STORE=false

# CORS
CORS_ORIGIN=*
EOF
  
  log_info "    ✓ .env.example creado"
  
  log_info "${GREEN}✓ $SERVICE_NAME migrado exitosamente${NC}"
  echo ""
}

# Main
main() {
  log_info "==================================="
  log_info "Migración a @libs/database"
  log_info "==================================="
  echo ""
  
  if [ $# -eq 1 ]; then
    # Migrar un servicio específico
    migrate_service "$1"
  else
    # Migrar todos los servicios
    for service in "${SERVICES_TO_MIGRATE[@]}"; do
      migrate_service "$service"
    done
  fi
  
  echo ""
  log_info "==================================="
  log_info "Migración completada"
  log_info "==================================="
  echo ""
  log_warn "Pasos siguientes:"
  echo "  1. Revisar los cambios en cada servicio"
  echo "  2. Actualizar variables de entorno (.env files)"
  echo "  3. Probar cada servicio individualmente"
  echo "  4. Verificar health checks: curl http://localhost:PORT/api/v1/health"
  echo ""
}

main "$@"
