const fs = require('fs');
const path = require('path');

function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules')) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Procesar línea por línea para manejar imports multi-línea
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Caso 1: Línea contiene 'from' y termina con ";
    if (line.includes('from') && line.match(/'[^']*";$/)) {
      lines[i] = line.replace(/";$/, "';");
    }
    // Caso 2: Línea contiene 'from' y termina con ';
    else if (line.includes('from') && line.match(/"[^"]*';$/)) {
      lines[i] = line.replace(/';$/, '";');
    }
    // Caso 3: String literal dentro del código que termina con ";
    else if (line.match(/'[^']*";/)) {
      lines[i] = line.replace(/'([^']*?)";/g, "'$1';");
    }
    // Caso 4: String literal dentro del código que termina con ';
    else if (line.match(/"[^"]*';/)) {
      lines[i] = line.replace(/"([^"]*?)';/g, '"$1";');
    }
  }
  
  content = lines.join('\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

// Procesar archivos en apps y libs
const dirs = ['apps', 'libs'];
let fixedCount = 0;

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    const files = getAllTsFiles(dirPath);
    files.forEach(file => {
      if (fixImports(file)) {
        fixedCount++;
      }
    });
  }
});

console.log(`\nTotal de archivos corregidos: ${fixedCount}`);
