import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * Script para refactorizar imports relativos a alias
 * Convierte rutas como ../../domain/ a @service/domain/
 */

const serviceAliases: Record<string, string> = {
  'auth-service': '@auth',
  'resources-service': '@resources',
  'availability-service': '@availability',
  'stockpile-service': '@stockpile',
  'reports-service': '@reports',
  'api-gateway': '@gateway',
};

interface FixStats {
  filesProcessed: number;
  filesModified: number;
  importsFixed: number;
}

async function fixImports(serviceName: string, alias: string): Promise<FixStats> {
  const stats: FixStats = {
    filesProcessed: 0,
    filesModified: 0,
    importsFixed: 0,
  };

  const files = await glob(`apps/${serviceName}/src/**/*.ts`, {
    ignore: ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**'],
  });

  for (const file of files) {
    stats.filesProcessed++;
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;
    let fixCount = 0;

    // Patrones para reemplazar rutas relativas por alias
    const patterns = [
      // Cuatro niveles arriba (../../../../)
      { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/(domain|application|infrastructure)\//g, to: `from '${alias}/$1/` },
      // Tres niveles arriba (../../../)
      { from: /from ['"]\.\.\/\.\.\/\.\.\/(domain|application|infrastructure)\//g, to: `from '${alias}/$1/` },
      // Dos niveles arriba (../../)
      { from: /from ['"]\.\.\/\.\.\/(domain|application|infrastructure)\//g, to: `from '${alias}/$1/` },
      // Casos especiales: handlers en subdirectorios que van a application/
      { from: /from ['"]\.\.\/\.\.\/(commands|queries|dtos|services)\//g, to: `from '${alias}/application/$1/` },
      // Imports de @nestjs y otras librerías externas no se tocan
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern.from);
      if (matches) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
        fixCount += matches.length;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      stats.filesModified++;
      stats.importsFixed += fixCount;
      console.log(`  ✅ Fixed ${fixCount} imports in: ${path.relative(process.cwd(), file)}`);
    }
  }

  return stats;
}

async function main() {
  console.log('🚀 Starting import refactoring...\n');

  const totalStats: FixStats = {
    filesProcessed: 0,
    filesModified: 0,
    importsFixed: 0,
  };

  for (const [service, alias] of Object.entries(serviceAliases)) {
    console.log(`\n🔧 Processing ${service} (${alias})...`);
    
    const stats = await fixImports(service, alias);
    
    totalStats.filesProcessed += stats.filesProcessed;
    totalStats.filesModified += stats.filesModified;
    totalStats.importsFixed += stats.importsFixed;

    console.log(`  📊 ${service}: ${stats.filesModified}/${stats.filesProcessed} files modified, ${stats.importsFixed} imports fixed`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Import refactoring completed!');
  console.log('='.repeat(60));
  console.log(`📊 Total Statistics:`);
  console.log(`   Files processed: ${totalStats.filesProcessed}`);
  console.log(`   Files modified: ${totalStats.filesModified}`);
  console.log(`   Imports fixed: ${totalStats.importsFixed}`);
  console.log('='.repeat(60));
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm run build');
  console.log('   2. Run: npm run test');
  console.log('   3. Verify no relative imports remain');
}

main().catch(console.error);
