#!/bin/bash

# Script para migrar createSuccessResponse a ResponseUtil.success en todos los archivos
# Uso: ./migrate-responses.sh

echo "🔄 Iniciando migración de respuestas al estándar unificado..."

# Directorios a procesar
DIRS=(
  "apps/auth-service"
  "apps/resources-service"
  "apps/availability-service"
  "apps/stockpile-service"
  "apps/reports-service"
  "apps/api-gateway"
)

# Contadores
TOTAL_FILES=0
MIGRATED_FILES=0

# Función para migrar un archivo
migrate_file() {
  local file=$1
  local changed=false
  
  # Verificar si el archivo usa las funciones legacy
  if grep -q "createSuccessResponse\|createErrorResponse\|createValidationErrorResponse" "$file"; then
    echo "  📝 Migrando: $file"
    
    # Backup del archivo
    cp "$file" "$file.bak"
    
    # 1. Actualizar imports
    if grep -q "createSuccessResponse\|createErrorResponse\|createValidationErrorResponse" "$file"; then
      # Reemplazar import de funciones legacy por ResponseUtil
      sed -i '' 's/import { createSuccessResponse } from "@libs\/common";/import { ResponseUtil } from "@libs\/common";/g' "$file"
      sed -i '' 's/import { createErrorResponse } from "@libs\/common";/import { ResponseUtil } from "@libs\/common";/g' "$file"
      sed -i '' 's/import { createSuccessResponse, createErrorResponse } from "@libs\/common";/import { ResponseUtil } from "@libs\/common";/g' "$file"
      changed=true
    fi
    
    # 2. Reemplazar llamadas a funciones
    # createSuccessResponse(data, message) -> ResponseUtil.success(data, message)
    sed -i '' 's/createSuccessResponse(/ResponseUtil.success(/g' "$file"
    
    # createErrorResponse(message, code) -> ResponseUtil.error(message, code ? { [code]: [message] } : undefined)
    # Este es más complejo, lo dejamos para revisión manual
    if grep -q "createErrorResponse" "$file"; then
      echo "    ⚠️  ADVERTENCIA: createErrorResponse detectado - requiere migración manual"
    fi
    
    # createValidationErrorResponse(errors) -> ResponseUtil.validationError(errors)
    sed -i '' 's/createValidationErrorResponse(/ResponseUtil.validationError(/g' "$file"
    
    if [ "$changed" = true ]; then
      MIGRATED_FILES=$((MIGRATED_FILES + 1))
      echo "    ✅ Migrado exitosamente"
    fi
  fi
}

# Procesar todos los directorios
for dir in "${DIRS[@]}"; do
  echo ""
  echo "📁 Procesando: $dir"
  
  # Encontrar todos los archivos .ts (controllers, services, handlers)
  while IFS= read -r file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    migrate_file "$file"
  done < <(find "$dir" -type f -name "*.controller.ts" -o -name "*.service.ts" -o -name "*.handler.ts" 2>/dev/null)
done

echo ""
echo "✨ Migración completada!"
echo "📊 Estadísticas:"
echo "   Total de archivos procesados: $TOTAL_FILES"
echo "   Archivos migrados: $MIGRATED_FILES"
echo ""
echo "⚠️  Recuerda:"
echo "   1. Revisar los archivos .bak si algo salió mal"
echo "   2. Verificar manualmente los createErrorResponse"
echo "   3. Ejecutar 'npm run lint' y 'npm run test'"
echo "   4. Eliminar archivos .bak cuando todo esté OK"
