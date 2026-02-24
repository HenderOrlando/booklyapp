# ===============================================
# Bookly Mock - Makefile
# ===============================================

.PHONY: help install setup dev build clean docker-up docker-down docker-logs seed

help: ## Mostrar ayuda
	@echo "Bookly Mock - Comandos Disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ===============================================
# INSTALACIÓN Y SETUP
# ===============================================

install: ## Instalar dependencias
	npm install

setup: ## Setup inicial completo (install + docker + seeds)
	@echo "🚀 Iniciando setup de Bookly Mock..."
	$(MAKE) install
	$(MAKE) docker-up
	@echo "⏳ Esperando a que la infraestructura esté lista..."
	sleep 30
	$(MAKE) seed
	@echo "✅ Setup completado!"

# ===============================================
# DESARROLLO
# ===============================================

dev: ## Iniciar todos los servicios en modo desarrollo
	npm run start:dev

dev-auth: ## Iniciar solo auth-service
	npm run start:dev -- --project auth-service

dev-resources: ## Iniciar solo resources-service
	npm run start:dev -- --project resources-service

dev-availability: ## Iniciar solo availability-service
	npm run start:dev -- --project availability-service

dev-stockpile: ## Iniciar solo stockpile-service
	npm run start:dev -- --project stockpile-service

dev-reports: ## Iniciar solo reports-service
	npm run start:dev -- --project reports-service

dev-gateway: ## Iniciar solo api-gateway
	npm run start:dev -- --project api-gateway

# ===============================================
# BUILD
# ===============================================

build: ## Build de todos los servicios
	npm run build

build-auth: ## Build auth-service
	npm run build -- auth-service

build-resources: ## Build resources-service
	npm run build -- resources-service

build-availability: ## Build availability-service
	npm run build -- availability-service

build-stockpile: ## Build stockpile-service
	npm run build -- stockpile-service

build-reports: ## Build reports-service
	npm run build -- reports-service

build-gateway: ## Build api-gateway
	npm run build -- api-gateway

# ===============================================
# DOCKER
# ===============================================

docker-up: ## Iniciar infraestructura Docker (MongoDB, Kafka, Redis)
	@echo "🐳 Iniciando infraestructura..."
	docker-compose up -d
	@echo "✅ Infraestructura iniciada"

docker-down: ## Detener infraestructura Docker
	@echo "🛑 Deteniendo infraestructura..."
	docker-compose down
	@echo "✅ Infraestructura detenida"

docker-clean: ## Limpiar volúmenes Docker (CUIDADO: borra datos)
	@echo "⚠️  Limpiando volúmenes Docker..."
	docker-compose down -v
	@echo "✅ Volúmenes limpiados"

docker-logs: ## Ver logs de todos los contenedores
	docker-compose logs -f

docker-logs-kafka: ## Ver logs de Kafka
	docker-compose logs -f kafka

docker-logs-redis: ## Ver logs de Redis
	docker-compose logs -f redis

docker-logs-mongo-auth: ## Ver logs de MongoDB Auth
	docker-compose logs -f mongodb-auth

docker-logs-mongo-resources: ## Ver logs de MongoDB Resources
	docker-compose logs -f mongodb-resources

docker-status: ## Ver estado de contenedores
	docker-compose ps

# ===============================================
# BASE DE DATOS
# ===============================================

seed: ## Ejecutar seeds en todas las bases de datos
	@echo "🌱 Ejecutando seeds..."
	npm run seed:all
	@echo "✅ Seeds completados"

seed-auth: ## Ejecutar seed de auth-service
	npm run seed:auth

seed-resources: ## Ejecutar seed de resources-service
	npm run seed:resources

seed-availability: ## Ejecutar seed de availability-service
	npm run seed:availability

seed-stockpile: ## Ejecutar seed de stockpile-service
	npm run seed:stockpile

seed-reports: ## Ejecutar seed de reports-service
	npm run seed:reports

# ===============================================
# TESTING
# ===============================================

test: ## Ejecutar tests
	npm test

test-watch: ## Ejecutar tests en modo watch
	npm run test:watch

test-cov: ## Ejecutar tests con cobertura
	npm run test:cov

test-e2e: ## Ejecutar tests e2e
	npm run test:e2e

# ===============================================
# CÓDIGO
# ===============================================

lint: ## Ejecutar linter
	npm run lint

format: ## Formatear código
	npm run format

# ===============================================
# LIMPIEZA
# ===============================================

clean: ## Limpiar archivos generados
	@echo "🧹 Limpiando archivos generados..."
	rm -rf dist
	rm -rf node_modules
	rm -rf coverage
	@echo "✅ Limpieza completada"

# ===============================================
# UTILIDADES
# ===============================================

status: ## Ver estado general del proyecto
	@echo "📊 Estado de Bookly Mock"
	@echo "========================"
	@echo ""
	@echo "Docker Containers:"
	@docker-compose ps || echo "Docker no está corriendo"
	@echo ""
	@echo "Puertos en uso:"
	@lsof -i :3000 -i :3001 -i :3002 -i :3003 -i :3004 -i :3005 -i :6379 -i :9092 2>/dev/null || echo "Ningún puerto en uso"

health: ## Verificar health de servicios
	@echo "🏥 Health Check"
	@echo "==============="
	@echo ""
	@echo "MongoDB Auth:"
	@docker exec bookly-mock-mongodb-auth mongosh --eval "db.runCommand('ping')" --quiet 2>/dev/null || echo "❌ No disponible"
	@echo ""
	@echo "Redis:"
	@docker exec bookly-mock-redis redis-cli ping 2>/dev/null || echo "❌ No disponible"
	@echo ""
	@echo "Kafka:"
	@docker exec bookly-mock-kafka kafka-broker-api-versions --bootstrap-server localhost:9093 2>/dev/null | grep -q "ApiVersion" && echo "✅ OK" || echo "❌ No disponible"

urls: ## Mostrar URLs de servicios
	@echo "🌐 URLs de Servicios"
	@echo "===================="
	@echo ""
	@echo "API Gateway:          http://localhost:3000/api/v1"
	@echo "Gateway Swagger:      http://localhost:3000/api/docs"
	@echo ""
	@echo "Auth Service:         http://localhost:3001/api/v1/auth"
	@echo "Auth Swagger:         http://localhost:3001/api/docs"
	@echo ""
	@echo "Resources Service:    http://localhost:3002/api/v1/resources"
	@echo "Resources Swagger:    http://localhost:3002/api/docs"
	@echo ""
	@echo "Availability Service: http://localhost:3003/api/v1/availability"
	@echo "Availability Swagger: http://localhost:3003/api/docs"
	@echo ""
	@echo "Stockpile Service:    http://localhost:3004/api/v1/stockpile"
	@echo "Stockpile Swagger:    http://localhost:3004/api/docs"
	@echo ""
	@echo "Reports Service:      http://localhost:3005/api/v1/reports"
	@echo "Reports Swagger:      http://localhost:3005/api/docs"

restart: ## Reiniciar todo (docker + servicios)
	@echo "🔄 Reiniciando Bookly Mock..."
	$(MAKE) docker-down
	$(MAKE) docker-up
	sleep 10
	@echo "✅ Reinicio completado"

reset: ## Reset completo (clean + setup)
	@echo "⚠️  Reseteando Bookly Mock (esto borrará todos los datos)..."
	@read -p "¿Estás seguro? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(MAKE) docker-clean; \
		$(MAKE) clean; \
		$(MAKE) setup; \
	fi

# ===============================================
# PRODUCCIÓN
# ===============================================

prod-start: ## Iniciar todos los servicios en modo producción
	@echo "🚀 Iniciando servicios en modo producción..."
	./start-all-prod.sh

prod-stop: ## Detener todos los servicios
	@echo "🛑 Deteniendo servicios..."
	pkill -f 'node dist' || echo "No hay servicios corriendo"
	@echo "✅ Servicios detenidos"

prod-restart: ## Reiniciar servicios en modo producción
	@echo "🔄 Reiniciando servicios..."
	$(MAKE) prod-stop
	sleep 2
	$(MAKE) build
	$(MAKE) prod-start

prod-health: ## Verificar health de servicios en producción
	@echo "🏥 Health Check de Servicios"
	@echo "============================"
	@echo ""
	@echo "API Gateway (3000):"
	@curl -s http://localhost:3000/health | jq -c '{service, status}' 2>/dev/null || echo "❌ No disponible"
	@echo ""
	@echo "Auth Service (3001):"
	@curl -s http://localhost:3001/api/v1/health | jq -c '{service, status}' 2>/dev/null || echo "❌ No disponible"
	@echo ""
	@echo "Resources Service (3002):"
	@curl -s http://localhost:3002/api/v1/health | jq -c '{service, status}' 2>/dev/null || echo "❌ No disponible"
	@echo ""
	@echo "Availability Service (3003):"
	@curl -s http://localhost:3003/api/v1/health | jq -c '{service, status}' 2>/dev/null || echo "❌ No disponible"
	@echo ""
	@echo "Stockpile Service (3004):"
	@curl -s http://localhost:3004/api/v1/health | jq -c '{service, status}' 2>/dev/null || echo "❌ No disponible"
	@echo ""
	@echo "Reports Service (3005):"
	@curl -s http://localhost:3005/api/v1/health | jq -c '{service, status}' 2>/dev/null || echo "❌ No disponible"

prod-logs: ## Ver logs de servicios en producción
	@echo "📝 Logs de Servicios (usa Ctrl+C para salir de cada log)"
	@echo ""
	@echo "Selecciona el servicio:"
	@echo "  1) API Gateway"
	@echo "  2) Auth Service"
	@echo "  3) Resources Service"
	@echo "  4) Availability Service"
	@echo "  5) Stockpile Service"
	@echo "  6) Reports Service"
	@echo "  7) Todos (tail -f)"
	@read -p "Opción [1-7]: " opt; \
	case $$opt in \
		1) tail -f /tmp/bookly-gateway.log ;; \
		2) tail -f /tmp/bookly-auth.log ;; \
		3) tail -f /tmp/bookly-resources.log ;; \
		4) tail -f /tmp/bookly-availability.log ;; \
		5) tail -f /tmp/bookly-stockpile.log ;; \
		6) tail -f /tmp/bookly-reports.log ;; \
		7) tail -f /tmp/bookly-*.log ;; \
		*) echo "Opción inválida" ;; \
	esac

# ===============================================
# DESARROLLO RÁPIDO
# ===============================================

quick-start: docker-up ## Inicio rápido (solo infraestructura)
	@echo "✅ Infraestructura lista. Ejecuta 'make dev' para iniciar servicios."

full-start: setup dev ## Inicio completo (setup + dev)

prod-full: ## Setup completo + inicio en producción
	@echo "🚀 Setup y arranque completo en modo producción..."
	$(MAKE) docker-up
	@echo "⏳ Esperando infraestructura..."
	sleep 15
	$(MAKE) build
	$(MAKE) prod-start
	@echo ""
	@echo "✅ Sistema completo iniciado!"
	@echo "Ejecuta 'make prod-health' para verificar el estado"

# ===============================================
# DEFAULT
# ===============================================

.DEFAULT_GOAL := help
