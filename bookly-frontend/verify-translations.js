#!/usr/bin/env node

/**
 * Script de Verificación de Traducciones - Bookly Frontend
 * Verifica que todas las claves usadas en el código existan en los archivos JSON
 */

const fs = require("fs");
const path = require("path");

// Archivos a verificar
const pages = [
  {
    file: "src/app/[locale]/recursos/[id]/page.tsx",
    namespace: "resource_detail",
  },
  {
    file: "src/app/[locale]/programas/page.tsx",
    namespace: "programs",
  },
  {
    file: "src/app/[locale]/programas/[id]/page.tsx",
    namespace: "programs",
  },
  {
    file: "src/app/[locale]/recursos-virtual/page.tsx",
    namespace: "resources",
  },
];

const locales = ["es", "en"];

// Función para extraer claves de traducción del código
function extractKeysFromCode(content) {
  const keys = new Set();

  // Patrón para t("key"), t('key'), t(`key`)
  const patterns = [/t\("([^"]+)"\)/g, /t\('([^']+)'\)/g, /t\(`([^`]+)`\)/g];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  });

  return Array.from(keys).sort();
}

// Función para obtener todas las claves de un JSON
function getKeysFromJSON(obj, prefix = "") {
  const keys = new Set();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && !Array.isArray(value)) {
      // Recursivo para objetos anidados
      getKeysFromJSON(value, fullKey).forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }

  return Array.from(keys).sort();
}

// Función principal de verificación
function verifyTranslations() {
  console.log("🔍 Verificando traducciones...\n");

  let hasErrors = false;
  const report = [];

  pages.forEach(({ file, namespace }) => {
    console.log(`\n📄 Verificando: ${file}`);
    console.log(`   Namespace: ${namespace}\n`);

    // Leer el archivo TypeScript
    const tsPath = path.join(__dirname, file);
    if (!fs.existsSync(tsPath)) {
      console.error(`   ❌ Archivo no encontrado: ${tsPath}`);
      hasErrors = true;
      return;
    }

    const tsContent = fs.readFileSync(tsPath, "utf-8");
    const usedKeys = extractKeysFromCode(tsContent);

    console.log(`   📝 Claves encontradas en código: ${usedKeys.length}`);

    // Verificar contra cada locale
    locales.forEach((locale) => {
      const jsonPath = path.join(
        __dirname,
        `src/i18n/translations/${locale}/${namespace}.json`
      );

      if (!fs.existsSync(jsonPath)) {
        console.error(`   ❌ Archivo de traducción no encontrado: ${jsonPath}`);
        hasErrors = true;
        return;
      }

      const translations = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      const availableKeys = getKeysFromJSON(translations);

      console.log(
        `   📚 [${locale.toUpperCase()}] Claves disponibles: ${availableKeys.length}`
      );

      // Encontrar claves faltantes
      const missingKeys = usedKeys.filter(
        (key) => !availableKeys.includes(key)
      );

      if (missingKeys.length > 0) {
        console.error(
          `   ❌ [${locale.toUpperCase()}] Claves FALTANTES (${missingKeys.length}):`
        );
        missingKeys.forEach((key) => console.error(`      - "${key}"`));
        hasErrors = true;

        report.push({
          file,
          locale,
          namespace,
          missingKeys,
        });
      } else {
        console.log(`   ✅ [${locale.toUpperCase()}] Todas las claves existen`);
      }

      // Encontrar claves no usadas (opcional, para limpieza)
      const unusedKeys = availableKeys.filter((key) => !usedKeys.includes(key));
      if (unusedKeys.length > 0) {
        console.log(
          `   ⚠️  [${locale.toUpperCase()}] Claves NO USADAS (${unusedKeys.length}):`
        );
        // No mostrar todas para no saturar, solo contar
        if (unusedKeys.length <= 5) {
          unusedKeys.forEach((key) => console.log(`      - "${key}"`));
        } else {
          console.log(
            `      (${unusedKeys.length} claves no están siendo usadas en este archivo)`
          );
        }
      }
    });
  });

  console.log("\n" + "=".repeat(80));

  if (hasErrors) {
    console.error("\n❌ VERIFICACIÓN FALLIDA - Se encontraron errores\n");

    if (report.length > 0) {
      console.log("📋 REPORTE DE CLAVES FALTANTES:\n");
      report.forEach(({ file, locale, namespace, missingKeys }) => {
        console.log(`Archivo: ${file}`);
        console.log(`Locale: ${locale}`);
        console.log(`Namespace: ${namespace}`);
        console.log(`Claves faltantes:`);
        missingKeys.forEach((key) => console.log(`  - "${key}"`));
        console.log("");
      });
    }

    process.exit(1);
  } else {
    console.log(
      "\n✅ VERIFICACIÓN EXITOSA - Todas las traducciones están correctas\n"
    );
    process.exit(0);
  }
}

// Ejecutar verificación
try {
  verifyTranslations();
} catch (error) {
  console.error("\n❌ Error durante la verificación:", error.message);
  process.exit(1);
}
