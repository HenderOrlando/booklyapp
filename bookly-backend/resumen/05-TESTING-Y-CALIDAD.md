# 05 - Testing y Calidad de Código

## 📋 Objetivo

Garantizar cobertura de pruebas >80%, implementar BDD con Jasmine, y mantener calidad de código con SonarQube.

---

## ✅ Estado Actual en bookly-mock

### ✓ Implementado Correctamente

1. **Configuración de Testing**
   - ✅ Jest configurado en `jest.preset.js`
   - ✅ Configuración por servicio en `tsconfig.spec.json`
   - ✅ Scripts de testing en `package.json`

2. **Estructura de Tests**
   - ✅ Carpeta `test/` en auth-service
   - ⚠️ Tests parciales en otros servicios

---

## 🎯 Tareas por Completar

### Tarea 5.1: Implementar Tests Unitarios

**Objetivo**: Cobertura >80% en todos los servicios.

**Estructura de tests**:

```typescript
// apps/resources-service/src/application/services/__tests__/resource.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceService } from '../resource.service';
import { ResourceRepository } from '@app/domain/repositories';

describe('ResourceService', () => {
  let service: ResourceService;
  let repository: jest.Mocked<ResourceRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        {
          provide: ResourceRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    repository = module.get(ResourceRepository);
  });

  describe('create', () => {
    it('should create a resource successfully', async () => {
      const dto = {
        name: 'Sala A-101',
        capacity: 30,
        categoryId: 'cat-1',
      };

      const expectedResource = { id: 'res-1', ...dto };
      repository.save.mockResolvedValue(expectedResource);

      const result = await service.create(dto);

      expect(result).toEqual(expectedResource);
      expect(repository.save).toHaveBeenCalledWith(dto);
    });

    it('should throw error if name is duplicated', async () => {
      const dto = { name: 'Sala A-101', capacity: 30 };
      repository.save.mockRejectedValue(new Error('Duplicate name'));

      await expect(service.create(dto)).rejects.toThrow('Duplicate name');
    });
  });
});
```

**Acción**: Crear tests para todos los servicios en:
- `apps/auth-service/src/application/services/__tests__/`
- `apps/resources-service/src/application/services/__tests__/`
- `apps/availability-service/src/application/services/__tests__/`
- `apps/stockpile-service/src/application/services/__tests__/`
- `apps/reports-service/src/application/services/__tests__/`

---

### Tarea 5.2: Implementar Tests BDD con Jasmine

**Objetivo**: Tests en formato Given-When-Then para casos de uso críticos.

**Patrón BDD**:

```typescript
// apps/availability-service/test/bdd/reservation.spec.ts
describe('Feature: Reservation Management', () => {
  describe('Scenario: Create a valid reservation', () => {
    let service: ReservationService;
    let resource: Resource;
    let user: User;

    beforeEach(() => {
      // Given: A resource is available
      resource = {
        id: 'res-1',
        name: 'Sala A-101',
        capacity: 30,
        status: 'available',
      };

      // And: A user exists
      user = {
        id: 'user-1',
        email: 'student@ufps.edu.co',
        role: 'student',
      };
    });

    it('should create reservation when resource is available', async () => {
      // When: User creates a reservation
      const dto = {
        resourceId: resource.id,
        userId: user.id,
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T12:00:00Z',
      };

      const result = await service.create(dto);

      // Then: Reservation is created successfully
      expect(result.status).toBe('confirmed');
      expect(result.resourceId).toBe(resource.id);
      expect(result.userId).toBe(user.id);
    });
  });

  describe('Scenario: Conflict detection', () => {
    it('should reject reservation when resource is already booked', async () => {
      // Given: A reservation exists
      const existingReservation = {
        resourceId: 'res-1',
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T12:00:00Z',
      };

      // When: User tries to create overlapping reservation
      const dto = {
        resourceId: 'res-1',
        userId: 'user-2',
        startTime: '2025-01-15T11:00:00Z',
        endTime: '2025-01-15T13:00:00Z',
      };

      // Then: Should throw conflict error
      await expect(service.create(dto)).rejects.toThrow('Schedule conflict');
    });
  });
});
```

**Acción**: Crear tests BDD para:
- Autenticación y autorización
- Creación de recursos
- Reservas y conflictos
- Flujos de aprobación
- Generación de reportes

---

### Tarea 5.3: Implementar Tests de Integración

**Objetivo**: Validar integración entre servicios.

**Patrón de integración**:

```typescript
// apps/availability-service/test/integration/reservation-flow.spec.ts
describe('Integration: Reservation Flow', () => {
  let app: INestApplication;
  let eventBus: EventBus;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AvailabilityModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    eventBus = app.get(EventBus);
    await app.init();
  });

  it('should publish RESERVATION_CREATED event', async () => {
    const eventSpy = jest.spyOn(eventBus, 'publish');

    const response = await request(app.getHttpServer())
      .post('/api/v1/reservations')
      .send({
        resourceId: 'res-1',
        userId: 'user-1',
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T12:00:00Z',
      })
      .expect(201);

    expect(eventSpy).toHaveBeenCalledWith(
      'reservations.created',
      expect.objectContaining({
        data: expect.objectContaining({
          resourceId: 'res-1',
        }),
      })
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Acción**: Crear tests de integración para:
- Flujo completo de reserva
- Sincronización de eventos entre servicios
- Invalidación de cache
- Notificaciones

---

### Tarea 5.4: Implementar Tests E2E

**Objetivo**: Validar flujos completos desde el API Gateway.

**Patrón E2E**:

```typescript
// test/e2e/reservation-complete-flow.e2e-spec.ts
describe('E2E: Complete Reservation Flow', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Setup API Gateway
    app = await setupTestApp();
    
    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'student@ufps.edu.co',
        password: '123456',
      });

    authToken = loginResponse.body.data.accessToken;
  });

  it('should complete full reservation flow', async () => {
    // 1. Search available resources
    const searchResponse = await request(app.getHttpServer())
      .get('/api/v1/availability/search')
      .query({
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '12:00',
      })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(searchResponse.body.data).toHaveLength(1);
    const resourceId = searchResponse.body.data[0].id;

    // 2. Create reservation
    const reservationResponse = await request(app.getHttpServer())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        resourceId,
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T12:00:00Z',
      })
      .expect(201);

    expect(reservationResponse.body.success).toBe(true);
    const reservationId = reservationResponse.body.data.id;

    // 3. Verify reservation appears in user's list
    const userReservations = await request(app.getHttpServer())
      .get('/api/v1/reservations/my-reservations')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(userReservations.body.data).toContainEqual(
      expect.objectContaining({ id: reservationId })
    );
  });
});
```

**Acción**: Crear tests E2E para:
- Flujo de registro y login
- Flujo completo de reserva
- Flujo de aprobación
- Flujo de cancelación

---

### Tarea 5.5: Configurar SonarQube

**Objetivo**: Análisis estático de código en cada PR.

**Configuración**:

```yaml
# .github/workflows/sonar-analysis.yml
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

**Archivo de configuración**:

```properties
# sonar-project.properties
sonar.projectKey=bookly-mock
sonar.projectName=Bookly Mock
sonar.projectVersion=1.0

sonar.sources=apps,libs
sonar.tests=apps,libs
sonar.test.inclusions=**/*.spec.ts,**/*.e2e-spec.ts

sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.spec.ts,**/*.e2e-spec.ts,**/test/**

sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

**Acción**: 
1. Crear cuenta en SonarCloud
2. Configurar proyecto
3. Agregar secrets en GitHub
4. Ejecutar primer análisis

---

### Tarea 5.6: Implementar Cobertura de Código

**Objetivo**: Mantener cobertura >80% en todos los servicios.

**Configuración Jest**:

```javascript
// jest.preset.js
module.exports = {
  coverageDirectory: '../coverage',
  coverageReporters: ['html', 'lcov', 'text', 'text-summary'],
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

**Scripts en package.json**:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

**Acción**: 
1. Ejecutar `npm run test:cov` en cada servicio
2. Identificar archivos con baja cobertura
3. Crear tests para alcanzar 80%

---

### Tarea 5.7: Implementar Linting y Formatting

**Objetivo**: Código consistente y sin errores de estilo.

**ESLint configuration**:

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint/eslint-plugin"],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "root": true,
  "env": {
    "node": true,
    "jest": true
  },
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**Prettier configuration**:

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

**Pre-commit hook**:

```json
// package.json
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
      "git add"
    ]
  }
}
```

**Acción**: 
1. Instalar husky y lint-staged
2. Configurar pre-commit hooks
3. Ejecutar `npm run lint:fix` en todo el proyecto

---

## 📊 Métricas de Cumplimiento

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| Tests unitarios | 40% | Alta |
| Tests BDD | 20% | Alta |
| Tests de integración | 10% | Media |
| Tests E2E | 5% | Media |
| SonarQube configurado | 0% | Alta |
| Cobertura >80% | 30% | Alta |
| Linting configurado | 70% | Media |

---

## 🎯 Plan de Acción

### Semana 1: Tests Unitarios
- Implementar tests en auth-service (100%)
- Implementar tests en resources-service (80%)
- Implementar tests en availability-service (80%)

### Semana 2: Tests BDD
- Crear escenarios BDD para flujos críticos
- Implementar tests Given-When-Then
- Documentar casos de prueba

### Semana 3: Integración y E2E
- Tests de integración entre servicios
- Tests E2E completos
- Validación de eventos

### Semana 4: Calidad y CI/CD
- Configurar SonarQube
- Alcanzar cobertura >80%
- Configurar pre-commit hooks

---

## 🔗 Referencias

- `jest.preset.js` - Configuración de Jest
- [Jest Documentation](https://jestjs.io/)
- [Testing NestJS Applications](https://docs.nestjs.com/fundamentals/testing)
- [SonarQube](https://www.sonarqube.org/)

---

**Última actualización**: 30 de noviembre de 2024  
**Responsable**: Equipo Bookly  
**Siguiente revisión**: Tarea 5.1
