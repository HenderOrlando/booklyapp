#!/bin/bash

# Script para corregir imports de librerías en el monorepo
# Remueve /src/ y archivos específicos de los paths @libs/*

echo "🔧 Corrigiendo imports de @libs/*..."

# Correcciones específicas primero (antes de las generales)
echo "  - Corrigiendo @libs/common/response.util..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/common\/response\.util/@libs\/common/g' {} \;

echo "  - Corrigiendo @libs/decorators/src/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/decorators\/src\/current-user\.decorator/@libs\/decorators/g' {} \;
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/decorators\/src\/roles\.decorator/@libs\/decorators/g' {} \;
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/decorators\/src/@libs\/decorators/g' {} \;

echo "  - Corrigiendo @libs/guards/src/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/guards\/src\/jwt-auth\.guard/@libs\/guards/g' {} \;
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/guards\/src\/roles\.guard/@libs\/guards/g' {} \;
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/guards\/src/@libs\/guards/g' {} \;

echo "  - Corrigiendo @libs/redis/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/redis\/redis\.module/@libs\/redis/g' {} \;
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/redis\/redis\.service/@libs\/redis/g' {} \;
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/redis\/src/@libs\/redis/g' {} \;

echo "  - Corrigiendo @libs/common/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/common\/src/@libs\/common/g' {} \;

echo "  - Corrigiendo @libs/event-bus/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/event-bus\/src/@libs\/event-bus/g' {} \;

echo "  - Corrigiendo @libs/database/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/database\/src/@libs\/database/g' {} \;

echo "  - Corrigiendo @libs/filters/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/filters\/src/@libs\/filters/g' {} \;

echo "  - Corrigiendo @libs/interceptors/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/interceptors\/src/@libs\/interceptors/g' {} \;

echo "  - Corrigiendo @libs/kafka/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/kafka\/src/@libs\/kafka/g' {} \;

echo "  - Corrigiendo @libs/notifications/*..."
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  -exec sed -i '' 's/@libs\/notifications\/src/@libs\/notifications/g' {} \;

echo "✅ Imports corregidos!"
echo "📊 Ahora ejecuta: npm run build"
