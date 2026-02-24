# Auditoría Fase 1 - Tarea 5.6: Configuración de Cobertura de Código

**Fecha**: 30 de noviembre de 2024  
**Responsable**: Equipo Bookly  
**Objetivo**: Verificar configuración de cobertura de código y herramientas de calidad

---

## 📋 Resumen Ejecutivo

**Cumplimiento**: 60% ⚠️ MEDIO

**Configuración básica**: ✅ Completa  
**Coverage thresholds**: ❌ Faltante  
**SonarQube**: ❌ No configurado  
**Pre-commit hooks**: ❌ No configurado

---

## ✅ Configuración Existente

### 1. `jest.preset.js` ✅

```javascript
module.exports = {
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  coverageReporters: ['html', 'text', 'lcov'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),
  testEnvironment: 'node',
};
```

**Estado**: ✅ Configuración básica correcta

---

### 2. Scripts en `package.json` ✅

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

**Estado**: ✅ Scripts configurados

---

## ❌ Configuración Faltante

### 1. Coverage Thresholds ❌

**Falta agregar en `jest.preset.js`**:

```javascript
module.exports = {
  // ... configuración existente
  coverageDirectory: '../coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**Prioridad**: ALTA  
**Esfuerzo**: 30 minutos

---

### 2. SonarQube Configuration ❌

**Falta crear**: `.github/workflows/sonar-analysis.yml`

```yaml
name: SonarQube Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:cov

      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

**Prioridad**: ALTA  
**Esfuerzo**: 1 día

---

### 3. `sonar-project.properties` ❌

**Falta crear**:

```properties
sonar.projectKey=bookly-backend
sonar.projectName=Bookly Mock
sonar.projectVersion=1.0

sonar.sources=apps,libs
sonar.tests=apps,libs
sonar.test.inclusions=**/*.spec.ts,**/*.e2e-spec.ts

sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.spec.ts,**/*.e2e-spec.ts,**/test/**

sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

**Prioridad**: ALTA  
**Esfuerzo**: 30 minutos

---

### 4. Pre-commit Hooks ❌

**Falta configurar**: Husky + lint-staged

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "npm run test -- --findRelatedTests",
      "git add"
    ]
  }
}
```

**Instalación**:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Prioridad**: MEDIA  
**Esfuerzo**: 1 día

---

## 🎯 Plan de Implementación

### Fase 1: Coverage Thresholds (Día 1)

1. Actualizar `jest.preset.js`
2. Ejecutar `npm run test:cov`
3. Validar que falla si cobertura <80%

### Fase 2: SonarQube (Día 2-3)

1. Crear cuenta en SonarCloud
2. Configurar proyecto
3. Crear `sonar-project.properties`
4. Crear workflow de GitHub Actions
5. Agregar secrets en GitHub
6. Ejecutar primer análisis

### Fase 3: Pre-commit Hooks (Día 4)

1. Instalar Husky y lint-staged
2. Configurar hooks
3. Probar en commits locales
4. Documentar en README

---

## 📊 Métricas Objetivo

### Cobertura por Tipo

| Tipo | Objetivo | Actual | Gap |
|------|----------|--------|-----|
| Branches | 80% | ~3% | 77% |
| Functions | 80% | ~3% | 77% |
| Lines | 80% | ~3% | 77% |
| Statements | 80% | ~3% | 77% |

---

## ✅ Checklist de Validación

- [ ] `jest.preset.js` tiene coverage thresholds
- [ ] `npm run test:cov` genera reporte
- [ ] SonarQube configurado
- [ ] GitHub Actions ejecuta SonarQube
- [ ] Pre-commit hooks funcionan
- [ ] Husky instalado
- [ ] lint-staged configurado
- [ ] README documenta configuración

---

**Estado de la tarea**: Auditada  
**Esfuerzo total estimado**: 4 días  
**Prioridad**: ALTA  
**Última actualización**: 30 de noviembre de 2024
