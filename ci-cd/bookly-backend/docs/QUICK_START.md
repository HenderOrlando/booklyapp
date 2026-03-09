# 🚀 Bookly - Quick Start con Docker

## 📦 Despliegue Completo en 3 Pasos

### 1️⃣ Desplegar Todo
```powershell
cd bookly-backend
.\docker-deploy.ps1
```

Espera 15-20 minutos en la primera ejecución (descarga de imágenes).

### 2️⃣ Verificar Estado
```powershell
.\docker-verify.ps1
```

### 3️⃣ Acceder a la Aplicación
- **Frontend**: http://localhost:4200
- **API Docs**: http://localhost:3000/api/docs

## 🛠️ Comandos Útiles

```powershell
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener todo
docker-compose down

# Limpiar todo (⚠️ borra datos)
docker-compose down -v
```

## 📚 Documentación Completa
Ver `DOCKER_DEPLOYMENT.md` para guía detallada.
