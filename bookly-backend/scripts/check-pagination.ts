import * as fs from 'fs';
import { glob } from 'glob';

/**
 * Script para verificar endpoints GET sin paginación estándar
 * Busca métodos @Get() que no usan ResponseUtil.paginated()
 */

interface EndpointInfo {
  file: string;
  method: string;
  line: number;
  hasPagination: boolean;
  usesResponseUtil: boolean;
}

async function checkPagination(serviceName: string): Promise<EndpointInfo[]> {
  const endpoints: EndpointInfo[] = [];
  
  const files = await glob(`apps/${serviceName}/src/infrastructure/controllers/*.ts`, {
    ignore: ['**/*.spec.ts', '**/*.test.ts', '**/health.controller.ts'],
  });

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    let inGetMethod = false;
    let methodStartLine = 0;
    let methodContent = '';
    let methodName = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detectar inicio de método GET
      if (line.trim().match(/^@Get\(/)) {
        inGetMethod = true;
        methodStartLine = i + 1;
        methodContent = '';
        continue;
      }
      
      // Acumular contenido del método
      if (inGetMethod) {
        methodContent += line + '\n';
        
        // Detectar nombre del método
        if (!methodName && line.match(/async\s+(\w+)\s*\(/)) {
          const match = line.match(/async\s+(\w+)\s*\(/);
          methodName = match ? match[1] : 'unknown';
        }
        
        // Detectar fin del método (cierre de llave al nivel de indentación del método)
        if (line.trim() === '}' && !line.match(/^\s{4,}/)) {
          // Analizar el método completo
          const hasPaginated = methodContent.includes('ResponseUtil.paginated');
          const hasResponseUtil = methodContent.includes('ResponseUtil.');
          const returnsArray = methodContent.match(/Promise<.*\[\].*>/);
          
          // Solo reportar si parece retornar una lista
          if (returnsArray || methodName.includes('findAll') || methodName.includes('getAll') || methodName.includes('list')) {
            endpoints.push({
              file: file.replace(/\\/g, '/'),
              method: methodName,
              line: methodStartLine,
              hasPagination: hasPaginated,
              usesResponseUtil: hasResponseUtil,
            });
          }
          
          inGetMethod = false;
          methodName = '';
        }
      }
    }
  }
  
  return endpoints;
}

async function main() {
  console.log('🔍 Verificando paginación en endpoints GET...\n');
  
  const services = [
    'auth-service',
    'resources-service',
    'availability-service',
    'stockpile-service',
    'reports-service',
  ];
  
  let totalEndpoints = 0;
  let withPagination = 0;
  let withoutPagination = 0;
  
  for (const service of services) {
    console.log(`\n📦 ${service}`);
    console.log('='.repeat(60));
    
    const endpoints = await checkPagination(service);
    totalEndpoints += endpoints.length;
    
    const paginated = endpoints.filter(e => e.hasPagination);
    const notPaginated = endpoints.filter(e => !e.hasPagination);
    
    withPagination += paginated.length;
    withoutPagination += notPaginated.length;
    
    if (notPaginated.length > 0) {
      console.log(`\n❌ Endpoints SIN paginación (${notPaginated.length}):`);
      notPaginated.forEach(e => {
        console.log(`   - ${e.method}() en ${e.file.split('/').pop()}:${e.line}`);
        console.log(`     ResponseUtil: ${e.usesResponseUtil ? '✅' : '❌'}`);
      });
    }
    
    if (paginated.length > 0) {
      console.log(`\n✅ Endpoints CON paginación (${paginated.length}):`);
      paginated.forEach(e => {
        console.log(`   - ${e.method}() en ${e.file.split('/').pop()}`);
      });
    }
    
    const percentage = endpoints.length > 0 
      ? Math.round((paginated.length / endpoints.length) * 100)
      : 100;
    
    console.log(`\n📊 Cumplimiento: ${percentage}% (${paginated.length}/${endpoints.length})`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN GLOBAL');
  console.log('='.repeat(60));
  console.log(`Total endpoints analizados: ${totalEndpoints}`);
  console.log(`Con paginación: ${withPagination} (${Math.round((withPagination/totalEndpoints)*100)}%)`);
  console.log(`Sin paginación: ${withoutPagination} (${Math.round((withoutPagination/totalEndpoints)*100)}%)`);
  console.log('='.repeat(60));
}

main().catch(console.error);
