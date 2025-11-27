#!/usr/bin/env node

/**
 * Script de migración automática para convertir createSuccessResponse
 * y otras funciones legacy a ResponseUtil
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuración
const ROOT_DIR = path.join(__dirname, "..");
const APPS_DIR = path.join(ROOT_DIR, "apps");

// Contadores
let totalFiles = 0;
let migratedFiles = 0;
let errors = [];

console.log("🚀 Iniciando migración al estándar ResponseUtil...\n");

/**
 * Encuentra todos los archivos TypeScript en un directorio
 */
function findTypeScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== ".git") {
        findTypeScriptFiles(filePath, fileList);
      }
    } else if (
      file.endsWith(".controller.ts") ||
      file.endsWith(".service.ts") ||
      file.endsWith(".handler.ts")
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Migra un archivo al nuevo estándar
 */
function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;
    let changed = false;

    // Verificar si el archivo usa funciones legacy
    const usesLegacy =
      content.includes("createSuccessResponse") ||
      content.includes("createErrorResponse") ||
      content.includes("createValidationErrorResponse");

    if (!usesLegacy) {
      return false;
    }

    console.log(`  📝 Migrando: ${path.relative(ROOT_DIR, filePath)}`);

    // 1. Actualizar imports
    // Reemplazar imports individuales
    if (content.includes("import { createSuccessResponse }")) {
      content = content.replace(
        /import\s*{\s*createSuccessResponse\s*}\s*from\s*"@libs\/common";?/g,
        'import { ResponseUtil } from "@libs/common";'
      );
      changed = true;
    }

    if (content.includes("import { createErrorResponse }")) {
      content = content.replace(
        /import\s*{\s*createErrorResponse\s*}\s*from\s*"@libs\/common";?/g,
        'import { ResponseUtil } from "@libs/common";'
      );
      changed = true;
    }

    if (content.includes("import { createValidationErrorResponse }")) {
      content = content.replace(
        /import\s*{\s*createValidationErrorResponse\s*}\s*from\s*"@libs\/common";?/g,
        'import { ResponseUtil } from "@libs/common";'
      );
      changed = true;
    }

    // Imports combinados
    content = content.replace(
      /import\s*{\s*createSuccessResponse,\s*createErrorResponse\s*}\s*from\s*"@libs\/common";?/g,
      'import { ResponseUtil } from "@libs/common";'
    );
    content = content.replace(
      /import\s*{\s*createSuccessResponse,\s*createValidationErrorResponse\s*}\s*from\s*"@libs\/common";?/g,
      'import { ResponseUtil } from "@libs/common";'
    );
    content = content.replace(
      /import\s*{\s*createErrorResponse,\s*createValidationErrorResponse\s*}\s*from\s*"@libs\/common";?/g,
      'import { ResponseUtil } from "@libs/common";'
    );
    content = content.replace(
      /import\s*{\s*createSuccessResponse,\s*createErrorResponse,\s*createValidationErrorResponse\s*}\s*from\s*"@libs\/common";?/g,
      'import { ResponseUtil } from "@libs/common";'
    );

    // 2. Reemplazar llamadas a funciones
    // createSuccessResponse -> ResponseUtil.success
    content = content.replace(
      /createSuccessResponse\(/g,
      "ResponseUtil.success("
    );

    // createValidationErrorResponse -> ResponseUtil.validationError
    content = content.replace(
      /createValidationErrorResponse\(/g,
      "ResponseUtil.validationError("
    );

    // createErrorResponse es más complejo - advertir
    if (content.includes("createErrorResponse")) {
      console.log(
        "    ⚠️  ADVERTENCIA: createErrorResponse requiere migración manual"
      );
      content = content.replace(
        /createErrorResponse\(/g,
        "ResponseUtil.error("
      );
    }

    // Verificar si hubo cambios
    if (content !== originalContent) {
      // Crear backup
      fs.writeFileSync(filePath + ".bak", originalContent);

      // Guardar archivo migrado
      fs.writeFileSync(filePath, content);

      migratedFiles++;
      console.log("    ✅ Migrado exitosamente");
      return true;
    }

    return false;
  } catch (error) {
    errors.push({ file: filePath, error: error.message });
    console.log(`    ❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Procesa todos los archivos en apps/
 */
function processAllFiles() {
  console.log("📁 Buscando archivos TypeScript...\n");

  const services = [
    "auth-service",
    "resources-service",
    "availability-service",
    "stockpile-service",
    "reports-service",
    "api-gateway",
  ];

  services.forEach((service) => {
    const serviceDir = path.join(APPS_DIR, service);
    if (!fs.existsSync(serviceDir)) {
      console.log(`  ⚠️  Servicio no encontrado: ${service}`);
      return;
    }

    console.log(`\n📦 Procesando: ${service}`);
    const files = findTypeScriptFiles(serviceDir);

    files.forEach((file) => {
      totalFiles++;
      migrateFile(file);
    });
  });
}

/**
 * Genera reporte final
 */
function generateReport() {
  console.log("\n" + "=".repeat(60));
  console.log("✨ MIGRACIÓN COMPLETADA\n");
  console.log(`📊 Estadísticas:`);
  console.log(`   Total de archivos procesados: ${totalFiles}`);
  console.log(`   Archivos migrados: ${migratedFiles}`);
  console.log(`   Archivos sin cambios: ${totalFiles - migratedFiles}`);

  if (errors.length > 0) {
    console.log(`\n❌ Errores encontrados: ${errors.length}`);
    errors.forEach((err) => {
      console.log(`   - ${path.relative(ROOT_DIR, err.file)}: ${err.error}`);
    });
  }

  console.log("\n📝 Próximos pasos:");
  console.log("   1. Revisar archivos .bak si algo salió mal");
  console.log("   2. Verificar manualmente archivos con createErrorResponse");
  console.log("   3. Ejecutar: npm run lint --fix");
  console.log("   4. Ejecutar: npm run test");
  console.log("   5. Eliminar archivos .bak cuando todo esté OK:");
  console.log('      find apps/ -name "*.bak" -delete');
  console.log("=".repeat(60) + "\n");
}

// Ejecutar migración
try {
  processAllFiles();
  generateReport();
  process.exit(0);
} catch (error) {
  console.error("\n❌ Error fatal:", error.message);
  process.exit(1);
}
