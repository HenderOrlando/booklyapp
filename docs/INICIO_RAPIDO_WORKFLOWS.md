# 🚀 Inicio Rápido - GitHub Actions Workflows

Esta guía te ayudará a empezar a usar los workflows de GitHub Actions en menos de 5 minutos.

## ⚡ TL;DR (Lo Mínimo Necesario)

1. **Configurar Secrets SSH** → `Settings` → `Secrets` → Agregar `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`
2. **Hacer un cambio** → Edita cualquier archivo en un servicio
3. **Push a GitHub** → `git push origin main`
4. **Ver el resultado** → Tab `Actions` en GitHub

¡Listo! 🎉

---

## 📋 Pasos Detallados

### Paso 1: Configurar SSH Secrets (2 minutos)

#### 1.1 Preparar Servidor de Despliegue

1. Asegúrate de tener Podman instalado en tu servidor
2. Crea la red Podman:
   ```bash
   podman network create bookly-network
   ```
3. Crea directorio para env files:
   ```bash
   sudo mkdir -p /opt/bookly
   ```
4. Crea archivos `.env` para cada servicio en `/opt/bookly/`

#### 1.2 Agregar Secrets SSH en GitHub

1. Ve a tu repositorio: https://github.com/HenderOrlando/booklyapp
2. Click en **Settings** (tab superior)
3. En el menú lateral: **Secrets and variables** → **Actions**
4. Click en **New repository secret**
5. Agrega los siguientes secrets:
   - Name: `DEPLOY_HOST`
   - Secret: IP o dominio de tu servidor (ej: `192.168.1.100` o `server.example.com`)
   - Click **Add secret**
6. Agrega el usuario SSH:
   - Name: `DEPLOY_USER`
   - Secret: Usuario SSH (ej: `ubuntu`, `root`, etc.)
   - Click **Add secret**
7. Agrega la clave SSH privada:
   - Name: `DEPLOY_SSH_KEY`
   - Secret: Contenido completo de tu clave privada SSH (ej: `~/.ssh/id_rsa`)
   - Click **Add secret**
8. (Opcional) Si usas un puerto SSH diferente:
   - Name: `DEPLOY_PORT`
   - Secret: Número de puerto (ej: `2222`)
   - Click **Add secret**

✅ **Secrets SSH configurados correctamente**

**Nota**: Las imágenes se publican automáticamente en **GitHub Container Registry (GHCR)** usando `GITHUB_TOKEN`, no necesitas configurar Docker Hub.

### Paso 2: Probar un Workflow (1 minuto)

#### Opción A: Ejecución Manual (Recomendada para primera vez)

1. Ve a la pestaña **Actions** en GitHub
2. En el menú lateral, selecciona: **API Gateway - Build and Deploy**
3. Click en **Run workflow** (botón derecho)
4. Selecciona la rama: `main` o `develop`
5. Click en **Run workflow** (botón verde)
6. Espera unos segundos y verás el workflow ejecutándose
7. Click en el workflow para ver los logs en tiempo real

#### Opción B: Cambio Real en el Código

1. Haz un pequeño cambio en cualquier servicio:
   ```bash
   cd bookly-mock/apps/api-gateway/src
   # Edita cualquier archivo, por ejemplo, agrega un comentario
   echo "// Test workflow" >> main.ts
   ```

2. Commit y push:
   ```bash
   git add .
   git commit -m "test: trigger workflow for api-gateway"
   git push origin main
   ```

3. Ve a la pestaña **Actions** en GitHub
4. Verás el workflow ejecutándose automáticamente

### Paso 3: Verificar el Resultado (1 minuto)

1. **En GitHub Actions:**
   - Ve a: `Actions` → Click en el workflow en ejecución
   - Verás los pasos: Build → Push → Deploy
   - ✅ = Paso completado
   - ⏳ = Paso en ejecución
   - ❌ = Paso fallido (click para ver logs)

2. **En GitHub Container Registry (GHCR):**
   - Ve a: `https://github.com/TU-USUARIO?tab=packages`
   - Busca: `bookly-api-gateway`
   - Verás la imagen con múltiples tags

3. **En el servidor de despliegue:**
   ```bash
   # Conectarse al servidor
   ssh usuario@servidor
   
   # Verificar que el contenedor está corriendo
   podman ps | grep bookly-api-gateway
   
   # Ver logs del servicio
   podman logs bookly-api-gateway
   ```

---

## 🎯 ¿Qué Workflows Están Disponibles?

| Servicio | Workflow | Se activa cuando cambias |
|----------|----------|--------------------------|
| API Gateway | `api-gateway.yml` | `bookly-mock/apps/api-gateway/**` |
| Auth Service | `auth-service.yml` | `bookly-mock/apps/auth-service/**` |
| Resources | `resources-service.yml` | `bookly-mock/apps/resources-service/**` |
| Availability | `availability-service.yml` | `bookly-mock/apps/availability-service/**` |
| Stockpile | `stockpile-service.yml` | `bookly-mock/apps/stockpile-service/**` |
| Reports | `reports-service.yml` | `bookly-mock/apps/reports-service/**` |
| Frontend | `frontend.yml` | `bookly-mock-frontend/**` |

---

## 🔧 Deploy Automático via SSH

Los workflows ahora despliegan automáticamente cada servicio en tu servidor vía SSH:

Para agregar deploy automático, edita la sección `deploy` en cada workflow:

### Ejemplo: Deploy con kubectl

```yaml
# Editar: .github/workflows/api-gateway.yml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3

    - name: Configure kubectl
      run: |
        mkdir -p $HOME/.kube
        echo "${{ secrets.KUBECONFIG }}" > $HOME/.kube/config

    - name: Update deployment
      run: |
        kubectl set image deployment/api-gateway \
          api-gateway=${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }}
```

**Más ejemplos:** Ver `.github/workflows/EJEMPLOS_DEPLOY.md`

---

## ❓ FAQ Rápido

### ¿Tengo que configurar algo más?

No. Con los secrets configurados, los workflows funcionarán automáticamente.

### ¿Puedo seguir usando podman-compose para desarrollo local?

Sí, totalmente. Los workflows son para CI/CD, no afectan desarrollo local.

### ¿Qué pasa si un workflow falla?

1. Recibirás un email de GitHub
2. Ve a la pestaña Actions
3. Click en el workflow fallido
4. Revisa los logs para ver el error

### ¿Cómo cancelo un workflow en ejecución?

1. Ve a la pestaña Actions
2. Click en el workflow en ejecución
3. Click en "Cancel workflow" (esquina superior derecha)

### ¿Puedo ejecutar workflows en una rama diferente?

Sí, los workflows se ejecutan en `main` y `develop` por defecto. Puedes agregar más ramas editando el workflow:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - tu-rama-aqui
```

### ¿Cuánto tarda un build?

- Primera vez: 5-10 minutos (sin cache)
- Siguientes: 2-5 minutos (con cache)

---

## 🐛 Troubleshooting Rápido

### Error: "docker login failed"

**Problema:** Secrets mal configurados

**Solución:**
1. Verifica `DOCKER_USERNAME` y `DOCKER_PASSWORD` en Settings → Secrets
2. Asegúrate de usar un token, no la contraseña
3. Verifica que el token tenga permisos de escritura

### Error: "Dockerfile not found"

**Problema:** Ruta incorrecta al Dockerfile

**Solución:**
- Verifica que el Dockerfile existe en: `ci-cd/bookly-mock/dockerfiles/`
- No muevas los Dockerfiles de su ubicación

### Workflow no se ejecuta

**Problema:** El cambio no coincide con los paths configurados

**Solución:**
1. Verifica que modificaste archivos en la ruta correcta
2. Ejemplo: cambios en `bookly-mock/apps/api-gateway/` activan `api-gateway.yml`
3. Verifica que hiciste push a `main` o `develop`

### Build falla con error de dependencias

**Problema:** Problemas en el código o dependencias

**Solución:**
1. Verifica que el código compile localmente: `npm run build`
2. Revisa los logs del workflow para ver el error específico
3. Arregla el error y vuelve a hacer push

---

## 📚 Documentación Completa

- **README completo**: `.github/workflows/README.md`
- **Guía de migración**: `docs/MIGRACION_WORKFLOWS.md`
- **Ejemplos de deploy**: `.github/workflows/EJEMPLOS_DEPLOY.md`
- **Resumen**: `docs/RESUMEN_MIGRACION.md`

---

## 🎉 ¡Ya Estás Listo!

Con los secrets configurados, cada push a `main` o `develop` que modifique un servicio:

1. ✅ Construirá automáticamente la imagen Docker
2. ✅ La publicará en Docker Hub con tags automáticos
3. ✅ (Opcional) Desplegará el servicio si configuraste deploy

**Siguiente paso**: Haz un cambio y observa la magia de CI/CD en acción 🚀

---

**¿Preguntas?** Revisa la documentación completa o abre un issue en GitHub.

**Última actualización**: Diciembre 17, 2024
