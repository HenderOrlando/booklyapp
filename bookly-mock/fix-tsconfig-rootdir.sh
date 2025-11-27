#!/bin/bash

# Script para remover rootDir de todos los tsconfig.json en libs/
# Esto permite imports cross-library en el monorepo

echo "🔧 Removiendo rootDir de archivos tsconfig.json en libs/..."

# Lista de todas las librerías
libs=(
  "common"
  "database"
  "decorators"
  "event-bus"
  "filters"
  "guards"
  "interceptors"
  "kafka"
  "notifications"
  "redis"
)

for lib in "${libs[@]}"; do
  tsconfig_file="libs/$lib/tsconfig.json"
  
  if [ -f "$tsconfig_file" ]; then
    echo "  - Corrigiendo $tsconfig_file..."
    # Remover línea que contiene "rootDir"
    sed -i '' '/"rootDir":/d' "$tsconfig_file"
  fi
done

echo "✅ Todos los tsconfig.json corregidos!"
echo "📊 Ahora ejecuta: npm run build"
