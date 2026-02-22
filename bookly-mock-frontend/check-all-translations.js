const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const locales = ['es', 'en'];

function findFiles(dir, filter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Function to get all keys from a JSON object (nested)
function getKeysFromJSON(obj, prefix = "") {
  const keys = new Set();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      getKeysFromJSON(value, fullKey).forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  return Array.from(keys);
}

// Map to cache loaded JSON translations
const translationsCache = { es: {}, en: {} };

function getTranslations(locale, namespace) {
  if (translationsCache[locale][namespace]) {
    return translationsCache[locale][namespace];
  }
  const jsonPath = path.join(__dirname, `src/i18n/translations/${locale}/${namespace}.json`);
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const keys = getKeysFromJSON(data);
  translationsCache[locale][namespace] = keys;
  return keys;
}

const tsxFiles = findFiles(srcDir, /\.tsx?$/);
let totalMissing = 0;
let hasErrors = false;

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // 1. Find all translation hooks: useTranslations("namespace")
  // Sometimes it's like const t = useTranslations("auth")
  // Or const tAuth = useTranslations('auth')
  const hookRegex = /(?:const\s+([a-zA-Z0-9_]+)\s*=\s*)?useTranslations\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  
  const fileNamespaces = [];
  const funcToNamespace = {};
  
  while ((match = hookRegex.exec(content)) !== null) {
    const funcName = match[1] || 't';
    const namespace = match[2];
    fileNamespaces.push(namespace);
    funcToNamespace[funcName] = namespace;
  }
  
  if (fileNamespaces.length === 0) continue;
  
  // 2. Find all usages of translation functions: t("key") or tAuth("key")
  const usedKeys = [];
  
  // A naive approach: look for funcName("key") or funcName('key') or funcName(`key`)
  for (const [funcName, namespace] of Object.entries(funcToNamespace)) {
    // Only checking literal strings, not dynamic variables
    const usageRegex = new RegExp(`${funcName}\\(\\s*["'\`]+([a-zA-Z0-9_.-]+)["'\`]+\\s*(?:,|\\))`, 'g');
    let usageMatch;
    while ((usageMatch = usageRegex.exec(content)) !== null) {
      usedKeys.push({ key: usageMatch[1], namespace, funcName });
    }
  }
  
  if (usedKeys.length === 0) continue;
  
  const relativeFile = path.relative(__dirname, file);
  
  for (const locale of locales) {
    const missingKeysForFile = [];
    
    for (const { key, namespace, funcName } of usedKeys) {
      // If key contains a dot, it might refer to another namespace if the setup allows it,
      // but next-intl usually expects namespace.key when no namespace is passed, 
      // or just key when namespace is passed to useTranslations.
      // We'll just check against the namespace assigned to the function.
      const availableKeys = getTranslations(locale, namespace);
      
      if (!availableKeys) {
        missingKeysForFile.push(`[${namespace}] ${key} (Namespace file missing)`);
        continue;
      }
      
      if (!availableKeys.includes(key)) {
        missingKeysForFile.push(`[${namespace}] ${key}`);
      }
    }
    
    if (missingKeysForFile.length > 0) {
      console.log(`\n📄 Archivo: ${relativeFile}`);
      console.log(`   Locale: ${locale}`);
      console.log(`   ❌ Claves FALTANTES (${missingKeysForFile.length}):`);
      missingKeysForFile.forEach(k => console.log(`      - "${k}"`));
      totalMissing += missingKeysForFile.length;
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.log(`\n❌ VERIFICACIÓN FALLIDA - Faltan ${totalMissing} traducciones en total.`);
  process.exit(1);
} else {
  console.log(`\n✅ VERIFICACIÓN EXITOSA - Todas las traducciones en todos los archivos existen.`);
  process.exit(0);
}
