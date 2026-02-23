/**
 * Audit i18n: finds t() calls in code that don't have a matching key in ES/EN translation files.
 * Usage: node scripts/audit-i18n.js
 */
const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname, "../src");
const transBase = path.join(base, "i18n/translations");

function walk(dir, exts) {
  let results = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f);
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) {
        if (f === "node_modules" || f === "__tests__" || f === "__mocks__") continue;
        results = results.concat(walk(fp, exts));
      } else if (exts.some((e) => fp.endsWith(e)) && !fp.includes(".stories.") && !fp.includes(".test.")) {
        results.push(fp);
      }
    }
  } catch (_) {}
  return results;
}

function getKeysDeep(obj, prefix) {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + "." + k : k;
    if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeysDeep(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function hasKey(obj, keyPath) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return false;
    cur = cur[p];
  }
  return cur !== undefined;
}

// Step 1: collect t() calls per namespace
const files = walk(base, [".tsx", ".ts"]);
const nsKeys = {}; // namespace -> Set<key>

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");

  // Map variable names to namespaces: const t = useTranslations("reports")
  const varNsMap = {};
  const nsRegex = /const\s+(\w+)\s*=\s*useTranslations\(\s*["'](\w+)["']\s*\)/g;
  let m;
  while ((m = nsRegex.exec(content)) !== null) {
    varNsMap[m[1]] = m[2];
  }

  // For each variable, find t("key") calls
  for (const [varName, ns] of Object.entries(varNsMap)) {
    const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tReg = new RegExp(escaped + '\\(\\s*["\']([a-zA-Z0-9_.]+)["\']', "g");
    let tm;
    while ((tm = tReg.exec(content)) !== null) {
      if (!nsKeys[ns]) nsKeys[ns] = new Set();
      nsKeys[ns].add(tm[1]);
    }
  }
}

// Step 2: check keys against ES and EN
const langs = ["es", "en"];
let totalMissing = 0;

for (const [ns, keys] of Object.entries(nsKeys).sort()) {
  for (const lang of langs) {
    const fp = path.join(transBase, lang, ns + ".json");
    if (!fs.existsSync(fp)) {
      console.log(`MISSING_FILE: ${lang}/${ns}.json`);
      totalMissing++;
      continue;
    }
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    const missing = [...keys].filter((k) => !hasKey(data, k)).sort();
    if (missing.length) {
      console.log(`${lang}/${ns}.json [${missing.length} missing]:`);
      for (const k of missing) console.log(`  - ${k}`);
      totalMissing += missing.length;
    }
  }
}

// Step 3: check ES vs EN symmetry
const esDir = path.join(transBase, "es");
const enDir = path.join(transBase, "en");
const allFiles = [...new Set([...fs.readdirSync(esDir), ...fs.readdirSync(enDir)])].filter((f) => f.endsWith(".json")).sort();

for (const file of allFiles) {
  const esPath = path.join(esDir, file);
  const enPath = path.join(enDir, file);
  if (!fs.existsSync(esPath)) { console.log(`SYMMETRY: missing es/${file}`); totalMissing++; continue; }
  if (!fs.existsSync(enPath)) { console.log(`SYMMETRY: missing en/${file}`); totalMissing++; continue; }
  const esKeys = getKeysDeep(JSON.parse(fs.readFileSync(esPath, "utf8")), "");
  const enKeys = getKeysDeep(JSON.parse(fs.readFileSync(enPath, "utf8")), "");
  const missingInEn = esKeys.filter((k) => !enKeys.includes(k));
  const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
  if (missingInEn.length) { console.log(`SYMMETRY ${file}: missing in EN: ${missingInEn.join(", ")}`); totalMissing += missingInEn.length; }
  if (missingInEs.length) { console.log(`SYMMETRY ${file}: missing in ES: ${missingInEs.join(", ")}`); totalMissing += missingInEs.length; }
}

if (totalMissing === 0) {
  console.log("ALL TRANSLATIONS COMPLETE - no missing keys found.");
} else {
  console.log(`\nTOTAL ISSUES: ${totalMissing}`);
}
