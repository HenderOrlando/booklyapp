#!/bin/bash

#================================================
# Script para Crear Archivos .env con Variables
#================================================

set -e

MONOREPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPS_DIR="$MONOREPO_ROOT/apps"

GREEN='\033[0;32m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

# API Gateway
log_info "Creando .env para api-gateway..."
cat > "$APPS_DIR/api-gateway/.env" <<'EOF'
# API Gateway Configuration
PORT=3000
GATEWAY_PORT=3000
NODE_ENV=development

# MongoDB - Configuración estandarizada (@libs/database)
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-gateway?authSource=admin&replicaSet=bookly-rs
DATABASE_NAME=bookly-gateway
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123
MONGO_AUTH_SOURCE=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Event Bus
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
KAFKA_BROKERS=localhost:9092
ENABLE_EVENT_STORE=false

# JWT
JWT_SECRET=bookly-secret-key

# Microservices URLs
RESOURCES_SERVICE_URL=http://localhost:3002
AVAILABILITY_SERVICE_URL=http://localhost:3003
STOCKPILE_SERVICE_URL=http://localhost:3004
AUTH_SERVICE_URL=http://localhost:3001
REPORTS_SERVICE_URL=http://localhost:3005

# CORS
CORS_ORIGIN=*
EOF

# Auth Service
log_info "Creando .env para auth-service..."
cat > "$APPS_DIR/auth-service/.env" <<'EOF'
# Auth Service Configuration
PORT=3001
AUTH_PORT=3001
NODE_ENV=development

# MongoDB - Configuración estandarizada (@libs/database)
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-auth?authSource=admin&replicaSet=bookly-rs
DATABASE_NAME=bookly-auth
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123
MONGO_AUTH_SOURCE=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Event Bus
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
KAFKA_BROKERS=localhost:9092
ENABLE_EVENT_STORE=false

# JWT
JWT_SECRET=bookly-secret-key
JWT_EXPIRATION=1d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/oauth/google/callback

# CORS
CORS_ORIGIN=*
EOF

# Resources Service
log_info "Creando .env para resources-service..."
cat > "$APPS_DIR/resources-service/.env" <<'EOF'
# Resources Service Configuration
PORT=3002
NODE_ENV=development

# MongoDB - Configuración estandarizada (@libs/database)
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-resources?authSource=admin&replicaSet=bookly-rs
DATABASE_NAME=bookly-resources
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123
MONGO_AUTH_SOURCE=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Event Bus
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
KAFKA_BROKERS=localhost:9092
ENABLE_EVENT_STORE=false

# CORS
CORS_ORIGIN=*
EOF

# Availability Service
log_info "Creando .env para availability-service..."
cat > "$APPS_DIR/availability-service/.env" <<'EOF'
# Availability Service Configuration
PORT=3003
NODE_ENV=development

# MongoDB - Configuración estandarizada (@libs/database)
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-availability?authSource=admin&replicaSet=bookly-rs
DATABASE_NAME=bookly-availability
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123
MONGO_AUTH_SOURCE=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Event Bus
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
KAFKA_BROKERS=localhost:9092
ENABLE_EVENT_STORE=false

# CORS
CORS_ORIGIN=*
EOF

# Stockpile Service
log_info "Creando .env para stockpile-service..."
cat > "$APPS_DIR/stockpile-service/.env" <<'EOF'
# Stockpile Service Configuration
PORT=3004
NODE_ENV=development

# MongoDB - Configuración estandarizada (@libs/database)
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-stockpile?authSource=admin&replicaSet=bookly-rs
DATABASE_NAME=bookly-stockpile
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123
MONGO_AUTH_SOURCE=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Event Bus
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
KAFKA_BROKERS=localhost:9092
ENABLE_EVENT_STORE=false

# CORS
CORS_ORIGIN=*
EOF

# Reports Service
log_info "Creando .env para reports-service..."
cat > "$APPS_DIR/reports-service/.env" <<'EOF'
# Reports Service Configuration
PORT=3005
NODE_ENV=development

# MongoDB - Configuración estandarizada (@libs/database)
DATABASE_URI=mongodb://bookly:bookly123@localhost:27017,localhost:27018,localhost:27019/bookly-reports?authSource=admin&replicaSet=bookly-rs
DATABASE_NAME=bookly-reports
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123
MONGO_AUTH_SOURCE=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Event Bus
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
KAFKA_BROKERS=localhost:9092
ENABLE_EVENT_STORE=false

# CORS
CORS_ORIGIN=*
EOF

log_info "✅ Archivos .env creados exitosamente"
