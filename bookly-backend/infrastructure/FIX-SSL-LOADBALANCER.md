# 🚨 FIX: Certificado Autofirmado con Load Balancer

## 🔍 Problema Identificado

```
curl -v https://booklyapp.com/health
* Connected to booklyapp.com (35.208.82.78) port 443
* SSL certificate problem: self-signed certificate
```

### ❌ Causas:

1. **DNS apunta a la instancia** (35.208.82.78) en vez del Load Balancer
2. **Nginx expone puerto 443** (no debería, solo 80)
3. **Nginx usa certificados locales** (Load Balancer debe manejar SSL)

## ✅ Solución Completa

### **Paso 1: Aplicar Fix en tu Máquina Local**

```bash
cd bookly-backend/infrastructure

# Corregir configuración (ya eliminé puerto 443)
git add .
git commit -m "fix: eliminar puerto 443 de nginx, usar solo load balancer"
git push origin main
```

### **Paso 2: En Servidor GCP - Aplicar Cambios**

```bash
# Conectarse
gcloud compute ssh qa-bookly --zone=us-central1-f

# Pull cambios
cd ~/bookly-monorepo/bookly-backend/infrastructure
git pull origin main

# Aplicar fix
make dev-fix-lb-ssl

# Detener servicios
docker-compose down

# Reiniciar con nueva configuración (SIN puerto 443)
make dev-full
```

### **Paso 3: Verificar Configuración Local**

```bash
# Nginx debe exponer SOLO puerto 80
docker ps | grep nginx
# Debe mostrar: 0.0.0.0:80->80/tcp (SIN 443)

# Health check local funciona
curl http://localhost/health
# Debe retornar: healthy
```

### **Paso 4: Configurar DNS - CRÍTICO**

El DNS debe apuntar al **Load Balancer**, NO a la instancia.

```bash
# Obtener IP del Load Balancer
LB_IP=$(gcloud compute addresses describe bookly-lb-ip --global --format="get(address)")
echo "IP del Load Balancer: $LB_IP"

# Actualizar DNS
gcloud dns record-sets transaction start --zone=booklyapp-com

# Eliminar registro viejo (IP de instancia)
gcloud dns record-sets transaction remove 35.208.82.78 \
    --name=booklyapp.com. \
    --ttl=300 \
    --type=A \
    --zone=booklyapp-com

# Agregar nuevo registro (IP del Load Balancer)
gcloud dns record-sets transaction add $LB_IP \
    --name=booklyapp.com. \
    --ttl=300 \
    --type=A \
    --zone=booklyapp-com

# Ejecutar cambio
gcloud dns record-sets transaction execute --zone=booklyapp-com
```

### **Paso 5: Esperar Propagación DNS (5-10 minutos)**

```bash
# Verificar DNS (ejecutar cada 1 minuto)
dig booklyapp.com +short

# Debe retornar: IP del Load Balancer (NO 35.208.82.78)
```

### **Paso 6: Verificar Load Balancer**

```bash
# Verificar certificado SSL del Load Balancer
gcloud compute ssl-certificates describe booklyapp-ssl-cert --global

# Debe mostrar:
# status: ACTIVE
# domains: booklyapp.com, www.booklyapp.com

# Verificar health check
gcloud compute backend-services get-health bookly-backend-service --global

# Debe mostrar: HEALTHY
```

### **Paso 7: Probar HTTPS (después de propagación DNS)**

```bash
# HTTPS debe funcionar SIN -k (certificado válido)
curl -I https://booklyapp.com/health

# Debe retornar:
# HTTP/2 200
# server: nginx
# (SIN error de certificado)

# API debe funcionar
curl https://booklyapp.com/api/v1/health

# Ver detalles del certificado
curl -vI https://booklyapp.com 2>&1 | grep -i "issuer\|subject"

# Debe mostrar:
# issuer: CN=GTS CA 1P5 (Google Trust Services)
# subject: CN=booklyapp.com
```

## 📊 Arquitectura Correcta

```
Internet (HTTPS)
    ↓
booklyapp.com → DNS → Load Balancer IP
    ↓
GCP Cloud Load Balancer (puerto 443)
    ├─ SSL Termination (certificado de Google)
    └─ Envía HTTP → Instancia GCP (puerto 80)
        ↓
        Nginx (solo puerto 80)
            ↓
            API Gateway (puerto 3000)
                ↓
                Microservicios
```

## ✅ Checklist de Verificación

- [ ] `docker-compose.base.yml` NO tiene puerto 443
- [ ] `docker ps | grep nginx` muestra SOLO puerto 80
- [ ] `bookly-loadbalancer.conf` está activo
- [ ] Configuraciones SSL locales están deshabilitadas
- [ ] DNS apunta a IP del Load Balancer
- [ ] Certificado SSL del LB en estado ACTIVE
- [ ] Health check del backend es HEALTHY
- [ ] `curl -I https://booklyapp.com` funciona SIN -k
- [ ] Certificado emitido por Google Trust Services

## 🔍 Troubleshooting

### Problema: Sigue mostrando certificado autofirmado

**Causa**: DNS aún apunta a la instancia

```bash
# Verificar a qué IP apunta
dig booklyapp.com +short

# Si muestra 35.208.82.78 → Mal (instancia)
# Debe mostrar: IP del Load Balancer

# Limpiar cache DNS local
sudo dscacheutil -flushcache  # macOS
sudo systemd-resolve --flush-caches  # Linux
```

### Problema: Nginx expone puerto 443

**Causa**: No se reinició con nueva configuración

```bash
# Detener todo
cd ~/bookly-monorepo/bookly-backend/infrastructure
docker-compose down

# Verificar que no hay contenedores
docker ps | grep bookly

# Reiniciar
make dev-full

# Verificar puertos
docker ps | grep nginx
# Debe mostrar SOLO: 0.0.0.0:80->80/tcp
```

### Problema: Load Balancer no está configurado

**Causa**: Falta crear el Load Balancer

**Solución**: Ver `docs/GCP-LOAD-BALANCER-SSL.md` para configuración completa

## 📋 Comandos Rápidos

```bash
# En servidor GCP
cd ~/bookly-monorepo/bookly-backend/infrastructure

# 1. Pull cambios
git pull origin main

# 2. Fix SSL
make dev-fix-lb-ssl

# 3. Reiniciar
docker-compose down && make dev-full

# 4. Verificar
docker ps | grep nginx  # Solo puerto 80
curl http://localhost/health  # Debe funcionar

# En tu máquina local (después de actualizar DNS)
# 5. Probar HTTPS
curl -I https://booklyapp.com/health  # Sin -k
```

## 🎯 Resultado Final

```bash
✅ Nginx: Solo puerto 80 (HTTP)
✅ Load Balancer: Maneja SSL en puerto 443
✅ DNS: Apunta al Load Balancer
✅ Certificado: Emitido por Google (válido)
✅ HTTPS: Funciona sin advertencias
✅ curl https://booklyapp.com: Sin -k, certificado válido
```

---

**Tiempo estimado**: 15-20 minutos (incluye propagación DNS)
