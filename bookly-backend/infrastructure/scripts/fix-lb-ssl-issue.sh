#!/bin/bash

# Fix: Eliminar configuración SSL local y usar solo Load Balancer
# El Load Balancer maneja SSL, la instancia solo recibe HTTP

set -e

echo "🔧 Corrigiendo configuración SSL para Load Balancer..."
echo ""

# Verificar directorio
if [ ! -d "nginx/conf.d" ]; then
    echo "❌ Error: Debe ejecutar desde el directorio infrastructure/"
    exit 1
fi

# Paso 1: Deshabilitar TODAS las configuraciones SSL locales
echo "📋 Paso 1: Deshabilitando configuraciones SSL locales..."

# Backup de configuraciones existentes
for conf in nginx/conf.d/*.conf; do
    if [ -f "$conf" ]; then
        basename=$(basename "$conf")
        if [[ "$basename" != "bookly-loadbalancer.conf" ]]; then
            mv "$conf" "${conf}.disabled" 2>/dev/null || true
            echo "   ✅ $basename → disabled"
        fi
    fi
done

# Paso 2: Verificar que bookly-loadbalancer.conf esté activo
echo ""
echo "📋 Paso 2: Habilitando configuración Load Balancer..."

if [ ! -f "nginx/conf.d/bookly-loadbalancer.conf" ]; then
    echo "   ❌ Error: bookly-loadbalancer.conf no existe"
    echo "   Ejecute: git pull origin main"
    exit 1
fi

echo "   ✅ bookly-loadbalancer.conf activo"

# Paso 3: Verificar docker-compose - debe exponer SOLO puerto 80
echo ""
echo "📋 Paso 3: Verificando configuración Docker..."

if grep -q "443:443" docker-compose.base.yml 2>/dev/null; then
    echo "   ⚠️  Puerto 443 encontrado en docker-compose.base.yml"
    echo "   Eliminando puerto 443..."
    
    # Crear backup
    cp docker-compose.base.yml docker-compose.base.yml.backup
    
    # Eliminar línea con 443:443
    sed -i.tmp '/- "443:443"/d' docker-compose.base.yml
    rm -f docker-compose.base.yml.tmp
    
    echo "   ✅ Puerto 443 eliminado"
else
    echo "   ✅ Puerto 443 no está configurado (correcto)"
fi

# Paso 4: Verificar certificados SSL (no deberían usarse)
echo ""
echo "📋 Paso 4: Verificando certificados SSL locales..."

if [ -d "nginx/ssl" ] && [ "$(ls -A nginx/ssl 2>/dev/null)" ]; then
    echo "   ℹ️  Certificados SSL locales encontrados"
    echo "   (No se usarán con Load Balancer)"
fi

# Paso 5: Reiniciar Nginx si está corriendo
echo ""
echo "📋 Paso 5: Reiniciando Nginx..."

if docker ps | grep -q bookly-nginx; then
    docker restart bookly-nginx
    echo "   ✅ Nginx reiniciado"
    
    sleep 3
    
    # Verificar puertos
    PORTS=$(docker ps | grep bookly-nginx | grep -oP '0\.0\.0\.0:\d+' || true)
    
    echo ""
    echo "📋 Puertos expuestos:"
    if echo "$PORTS" | grep -q "0.0.0.0:80"; then
        echo "   ✅ Puerto 80 (HTTP) - CORRECTO"
    fi
    
    if echo "$PORTS" | grep -q "0.0.0.0:443"; then
        echo "   ❌ Puerto 443 (HTTPS) - NO DEBE ESTAR EXPUESTO"
        echo "   Detener y volver a iniciar con: make dev-full"
    fi
else
    echo "   ℹ️  Nginx no está corriendo"
    echo "   Inicie con: make dev-full"
fi

echo ""
echo "🎉 Configuración corregida!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1️⃣  DETENER Y REINICIAR Nginx (importante):"
echo "   docker-compose down nginx"
echo "   make dev-full"
echo ""
echo "2️⃣  Verificar que SOLO puerto 80 esté expuesto:"
echo "   docker ps | grep nginx"
echo "   Debe mostrar: 0.0.0.0:80->80/tcp (SIN puerto 443)"
echo ""
echo "3️⃣  Verificar DNS apunta al LOAD BALANCER, NO a la instancia:"
echo "   dig booklyapp.com +short"
echo "   Debe retornar: IP DEL LOAD BALANCER (no 35.208.82.78)"
echo ""
echo "4️⃣  Obtener IP del Load Balancer:"
echo "   gcloud compute addresses describe bookly-lb-ip --global --format='get(address)'"
echo ""
echo "5️⃣  Actualizar DNS si es necesario:"
echo "   Ver: docs/GCP-LOAD-BALANCER-SSL.md"
echo ""
