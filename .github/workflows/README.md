# 🚀 GitHub Actions Workflows - Despliegue Automatizado

Este directorio contiene los workflows de GitHub Actions que reemplazan el archivo `podman-compose.microservices.yml`, permitiendo un despliegue automático de cada microservicio cuando su imagen Docker es actualizada.

## 📋 Contenido

### Workflows Disponibles

1. **build-and-push-image.yml** - Workflow reutilizable para construir y publicar imágenes Docker en GHCR
2. **api-gateway.yml** - Build y deploy del API Gateway
3. **auth-service.yml** - Build y deploy del servicio de autenticación
4. **resources-service.yml** - Build y deploy del servicio de recursos
5. **availability-service.yml** - Build y deploy del servicio de disponibilidad
6. **stockpile-service.yml** - Build y deploy del servicio de inventario
7. **reports-service.yml** - Build y deploy del servicio de reportes
8. **frontend.yml** - Build y deploy del frontend (Bookly Web)

## 🔧 Configuración Inicial

### 1. Configurar Secrets en GitHub

Para que los workflows funcionen correctamente, necesitas configurar los siguientes secrets en tu repositorio de GitHub:

1. Ve a **Settings** > **Secrets and variables** > **Actions**
2. Agrega los siguientes secrets para SSH deployment:
   - `DEPLOY_HOST`: IP o dominio del servidor de despliegue
   - `DEPLOY_USER`: Usuario SSH para conectarse al servidor
   - `DEPLOY_SSH_KEY`: Clave privada SSH para autenticación
   - `DEPLOY_PORT`: (Opcional) Puerto SSH, por defecto 22

### 2. Configurar Permisos de GHCR

Los workflows usan **GitHub Container Registry (GHCR)** automáticamente, no necesitas configurar credenciales adicionales:

1. Las imágenes se publican en: `ghcr.io/{tu-usuario}/{imagen}:{tag}`
2. Se usa `GITHUB_TOKEN` automático para autenticación
3. Permisos `packages: write` ya están configurados en los workflows

### 3. Preparar Servidor de Despliegue

En el servidor donde se desplegarán los servicios:

1. Instalar Podman
2. Crear red Podman: `podman network create bookly-network`
3. **[Opcional]** Crear directorio para env files: `mkdir -p /opt/bookly` (solo si necesitas variables de entorno)
4. Configurar variables de entorno para puertos dinámicos:
   - `PORT_0` - Puerto para api-gateway (ej: 3000)
   - `PORT_1` - Puerto para auth-service (ej: 3001)
   - `PORT_2` - Puerto para resources-service (ej: 3002)
   - `PORT_3` - Puerto para availability-service (ej: 3003)
   - `PORT_4` - Puerto para stockpile-service (ej: 3004)
   - `PORT_5` - Puerto para reports-service (ej: 3005)
   - `PORT_6` - Puerto para frontend/bookly-web (ej: 4200)
5. **[Opcional]** Crear archivos `.env` para cada servicio (solo si necesitas variables de entorno específicas):
   - `/opt/bookly/.env.api-gateway`
   - `/opt/bookly/.env.auth-service`
   - `/opt/bookly/.env.resources-service`
   - `/opt/bookly/.env.availability-service`
   - `/opt/bookly/.env.stockpile-service`
   - `/opt/bookly/.env.reports-service`
   - `/opt/bookly/.env.frontend`

> **Nota**: Los archivos de entorno son opcionales. Si no existen, los contenedores se ejecutarán sin variables de entorno adicionales. Esto permite que el despliegue funcione inmediatamente sin configuración previa.

## 🎯 Funcionamiento

### Triggers Automáticos

Cada servicio tiene su propio workflow que se activa automáticamente cuando:

1. **Push a ramas principales** (`main` o `develop`)
2. **Cambios en archivos específicos**:
   - Código del servicio específico (`bookly-backend/apps/{servicio}/**`)
   - Librerías compartidas (`bookly-backend/libs/**`)
   - Dockerfile del servicio (`ci-cd/bookly-backend/dockerfiles/Dockerfile.{servicio}`)
   - El propio workflow (`.github/workflows/{servicio}.yml`)

### Triggers Manuales

Todos los workflows también se pueden ejecutar manualmente:

1. Ve a **Actions** en tu repositorio de GitHub
2. Selecciona el workflow que deseas ejecutar
3. Click en **Run workflow**
4. Selecciona la rama y click en **Run workflow**

## 📦 Proceso de Build y Deploy

### Fase 1: Build y Push a GHCR

El workflow realiza los siguientes pasos:

1. **Checkout del código**: Descarga el código del repositorio
2. **Setup Docker Buildx**: Configura Docker para builds multi-plataforma
3. **Login a GHCR**: Autentica con GitHub Container Registry usando `GITHUB_TOKEN`
4. **Extracción de metadata**: Genera tags automáticos basados en:
   - Rama actual
   - SHA del commit
   - Versión semántica (si existe)
5. **Build y Push**: Construye la imagen Docker y la sube a GHCR
   - Usa caché de GitHub Actions para acelerar builds
   - Genera múltiples tags automáticamente

### Fase 2: Deploy via SSH

Después del build exitoso, se ejecuta el deploy automáticamente:

1. **Conexión SSH**: Se conecta al servidor usando las credenciales configuradas
2. **Login a GHCR**: Autentica Podman en el servidor con GHCR
3. **Pull de imagen**: Descarga la imagen recién creada desde GHCR
4. **Stop container**: Detiene el contenedor existente (si existe)
5. **Remove container**: Elimina el contenedor antiguo
6. **Run container**: Ejecuta el nuevo contenedor con:
   - Nombre del servicio
   - Puerto mapeado
   - Red `bookly-network`
   - Variables de entorno desde `/opt/bookly/.env.{servicio}` (si el archivo existe)
   - Restart policy: `unless-stopped`
7. **Cleanup**: Limpia imágenes antiguas no utilizadas usando Podman

## 🏷️ Tags Generados Automáticamente

Para cada imagen en GHCR, se generan los siguientes tags:

| Tag | Descripción | Ejemplo |
|-----|-------------|---------|
| `latest` | Última versión de la rama principal | `ghcr.io/usuario/bookly-api-gateway:latest` |
| `{branch}` | Nombre de la rama | `ghcr.io/usuario/bookly-api-gateway:main` |
| `{branch}-{sha}` | Rama + SHA del commit | `ghcr.io/usuario/bookly-api-gateway:main-abc1234` |
| `{version}` | Versión semántica (si existe) | `ghcr.io/usuario/bookly-api-gateway:1.0.0` |

## 🔄 Migración desde podman-compose.microservices.yml

### Antes (podman-compose.microservices.yml)

```yaml
services:
  api-gateway:
    build:
      context: .
      dockerfile: ../ci-cd/bookly-backend/dockerfiles/Dockerfile.gateway
    # ...
```

### Después (GitHub Actions)

El despliegue ahora es completamente automático:

1. **Push de código** → Workflow se activa automáticamente
2. **Build de imagen** → Imagen se construye y publica en Docker Hub
3. **Deploy** → Servicio se despliega automáticamente

### Ventajas

✅ **Automatización completa**: No necesitas ejecutar comandos manualmente
✅ **CI/CD integrado**: Build y deploy en un solo flujo
✅ **Trazabilidad**: Historial completo de todos los despliegues
✅ **Control de versiones**: Tags automáticos por commit
✅ **Independencia**: Cada servicio se despliega independientemente
✅ **Rollback fácil**: Usa cualquier tag anterior para volver a una versión previa

## 🚀 Personalizar el Deploy

Para integrar con tu plataforma de despliegue, edita la sección `deploy` en cada workflow:

### Ejemplo: Kubernetes

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Configure kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/api-gateway \
          api-gateway=${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.ref_name }}-${{ github.sha }} \
          --namespace=bookly
```

### Ejemplo: Docker Compose en servidor remoto

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Deploy via SSH
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_SSH_KEY }}
        script: |
          cd /opt/bookly
          docker-compose pull api-gateway
          docker-compose up -d api-gateway
```

## 🔍 Monitoreo de Workflows

### Ver el estado de los workflows

1. Ve a la pestaña **Actions** en GitHub
2. Verás el historial de todos los workflows ejecutados
3. Click en cualquier workflow para ver detalles
4. Revisa logs de cada paso

### Notificaciones

GitHub enviará notificaciones cuando:
- ✅ Un workflow se complete exitosamente
- ❌ Un workflow falle
- ⚠️ Se requiera aprobación manual (si configuras ambientes protegidos)

## 📝 Mejores Prácticas

1. **Protege ramas principales**: Requiere pull requests y revisiones antes de merge
2. **Usa ambientes**: Configura ambientes de staging y producción en GitHub
3. **Aprobaciones manuales**: Requiere aprobación manual para deploy a producción
4. **Secrets seguros**: Nunca commits secrets en el código
5. **Tests antes de deploy**: Agrega tests en el workflow antes del deploy
6. **Rollback plan**: Mantén tags anteriores para rollback rápido

## 🐛 Troubleshooting

### Error: "sudo: a terminal is required to read the password"

**Problema**: El usuario SSH no tiene permisos sudo sin contraseña.

**Solución**: Este error ha sido resuelto en la última versión de los workflows. Los archivos de entorno ahora son opcionales y no requieren sudo. Si aún experimentas este error:
1. Actualiza los workflows a la última versión
2. O configura sudo sin contraseña para el usuario de deploy: `echo "deploy-user ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/deploy-user`

### Error: "parsing file: no such file or directory" al cargar .env

**Problema**: El archivo de variables de entorno no existe en el servidor.

**Solución**: Este error ha sido resuelto en la última versión de los workflows. Los archivos `.env` ahora son opcionales. Si necesitas variables de entorno:
1. Crea el directorio: `mkdir -p /opt/bookly`
2. Crea el archivo de entorno: `touch /opt/bookly/.env.{servicio}`
3. Agrega las variables necesarias al archivo

### Error: "docker login failed"

**Problema**: Las credenciales de Docker Hub son incorrectas o no están configuradas.

**Solución**:
1. Verifica que los secrets `DOCKER_USERNAME` y `DOCKER_PASSWORD` estén configurados
2. Asegúrate de usar un Access Token en lugar de la contraseña
3. Verifica que el token tenga permisos de escritura

### Error: "Dockerfile not found"

**Problema**: La ruta al Dockerfile es incorrecta.

**Solución**:
1. Verifica que el Dockerfile existe en la ruta especificada
2. Revisa que la ruta sea relativa al contexto de build

### Workflow no se activa

**Problema**: El workflow no se ejecuta después de hacer push.

**Solución**:
1. Verifica que los archivos modificados coincidan con los paths configurados
2. Asegúrate de hacer push a las ramas correctas (`main` o `develop`)
3. Revisa la sintaxis del archivo YAML

## 🔗 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Login Action](https://github.com/docker/login-action)

---

**Última actualización**: Diciembre 22, 2024
