const fs = require('fs');

const testFile = 'apps/stockpile-service/src/application/commands/create-approval-flow.command.ts';
const content = fs.readFileSync(testFile, 'utf8');

console.log('Contenido de la primera línea:');
console.log(JSON.stringify(content.split('\n')[0]));

console.log('\n¿Contiene \'";?', content.includes('\'";'));
console.log('¿Contiene "\'?', content.includes('"\''));

// Mostrar caracteres individuales de la línea problemática
const firstLine = content.split('\n')[0];
console.log('\nCaracteres al final de la línea:');
for (let i = Math.max(0, firstLine.length - 10); i < firstLine.length; i++) {
  console.log(`[${i}]: '${firstLine[i]}' (code: ${firstLine.charCodeAt(i)})`);
}
