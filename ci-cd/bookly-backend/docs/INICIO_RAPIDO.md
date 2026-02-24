# 🚀 Bookly - Inicio Rápido (Modo Local Híbrido)

Esta guía te permite ejecutar Bookly completo en tu máquina Windows de forma rápida y eficiente.

## 📋 Arquitectura

- **Infraestructura**: Docker (MongoDB, Redis, Kafka)
- **Backend**: Local con Node.js (6 microservicios)
- **Frontend**: Local con Next.js

## ⚡ Inicio Rápido (3 pasos)

### Paso 1: Levantar Infraestructura Docker

```powershell
.\START_ALL_LOCAL.ps1
```

Este script:
- ✅ Verifica Docker
- ✅ Levanta MongoDB, Redis, Kafka y Zookeeper
- ✅ Espera que estén listos

### Paso 2: Iniciar Backend (Nueva terminal)

```powershell
cd bookly-mock
.\start-backend-local.ps1
```

Esto inicia los 6 microservicios:
- 🚀 API Gateway → `http://localhost:3000`
- 🔐 Auth Service → `http://localhost:3001`
- 📦 Resources → `http://localhost:3002`
- 📅 Availability → `http://localhost:3003`
- ✅ Stockpile → `http://localhost:3004`
- 📊 Reports → `http://localhost:3005`

### Paso 3: Iniciar Frontend (Nueva terminal)

```powershell
cd bookly-mock-frontend
.\start-frontend-local.ps1
```

- 🌐 Frontend → `http://localhost:4200`

## 🎯 URLs Importantes

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:4200 |
| **API Gateway** | http://localhost:3000 |
| **Swagger Docs** | http://localhost:3000/api/docs |
| **Auth Service** | http://localhost:3001 |
| **Resources Service** | http://localhost:3002 |
| **Availability Service** | http://localhost:3003 |
| **Stockpile Service** | http://localhost:3004 |
| **Reports Service** | http://localhost:3005 |

## 🛑 Detener Servicios

### Detener Backend/Frontend
- Presiona `Ctrl+C` en cada terminal

### Detener Infraestructura Docker
```powershell
cd bookly-mock
docker-compose down
```

## 🔍 Verificar Estado

### Ver contenedores Docker
```powershell
docker ps --filter "name=bookly-mock"
```

### Ver logs de infraestructura
```powershell
cd bookly-mock
docker-compose logs -f
```

## ⚙️ Configuración

Las variables de entorno están en:
- Backend: `bookly-mock/.env` (se crea automáticamente)
- Frontend: `bookly-mock-frontend/.env.local`

## 🐛 Troubleshooting

### Error: "Docker no está disponible"
- Inicia Docker Desktop

### Error: "Infraestructura Docker no está corriendo"
```powershell
cd bookly-mock
docker-compose up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway
```

### Error: "Puerto ya en uso"
- Verifica que no haya otros servicios usando los puertos 3000-3005 y 4200
- Detén los procesos con esos puertos o cambia la configuración

### Los microservicios no se conectan a MongoDB
- Espera 30 segundos después de levantar Docker
- Verifica con `docker ps` que todos los contenedores estén `healthy`

## 💡 Ventajas de este Modo

✅ **Desarrollo rápido**: Hot reload en backend y frontend  
✅ **Sin Docker Build**: No necesitas construir imágenes pesadas  
✅ **Debugging fácil**: Puedes depurar directamente en VS Code  
✅ **Logs claros**: Todos los logs en tu terminal con colores  
✅ **Compatible con Windows**: Sin problemas de permisos

## 📚 Más Información

- **Documentación completa**: Ver `bookly-mock/DOCKER_DEPLOYMENT.md`
- **Arquitectura**: Ver `docs/`
- **Testing**: Ver `test-endpoints-api-gateway/`
