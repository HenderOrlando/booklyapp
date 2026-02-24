# 🎭 Bookly Mock - Full NestJS Implementation

Complete microservices implementation of the Bookly reservation system using NestJS, following Clean Architecture, CQRS, and Event-Driven Architecture patterns.

## 📚 Documentación

### **[📖 Índice Maestro de Documentación](./docs/INDEX.md)**

Toda la documentación está organizada y disponible en el índice maestro:

- **[🚀 Documentación por Microservicio](./docs/INDEX.md#microservicios)**
  - [API Gateway](./apps/api-gateway/docs/INDEX.md) - Puerto 3000
  - [Auth Service](./apps/auth-service/docs/INDEX.md) - Puerto 3001
  - [Resources Service](./apps/resources-service/docs/INDEX.md) - Puerto 3002
  - [Availability Service](./apps/availability-service/docs/INDEX.md) - Puerto 3003
  - [Stockpile Service](./apps/stockpile-service/docs/INDEX.md) - Puerto 3004
  - [Reports Service](./apps/reports-service/docs/INDEX.md) - Puerto 3005

- **[📖 Documentación Técnica](./docs/INDEX.md#documentación-técnica)** - Arquitectura, configuración, testing
- **[🔗 Guías de Integración](./docs/INDEX.md#guías-de-integración)** - OAuth, calendarios, eventos
- **[📜 Documentación Histórica](./docs/INDEX.md#documentación-histórica)** - Migraciones, refactorings

### Guías Rápidas

- **[🐛 Debugging](./docs/DEBUG_README.md)** - Configuración de debug en VS Code
- **[🔄 Idempotencia](./docs/IDEMPOTENCY_README.md)** - Guía de uso de idempotencia y distributed tracing
- **[▶️ Ejecutar Servicios](./docs/RUNNING_SERVICES.md)** - Comandos para iniciar microservicios
- **[🤝 Contribuir](./docs/CONTRIBUTING.md)** - Guía de contribución al proyecto

## 🏗️ Architecture

### Microservices

- **API Gateway** (Port 3000): Central entry point, aggregated Swagger documentation
- **Auth Service** (Port 3001): Authentication, authorization, JWT, roles & permissions
- **Resources Service** (Port 3002): Resources, categories, maintenance management
- **Availability Service** (Port 3003): Reservations, schedules, calendars, waiting lists
- **Stockpile Service** (Port 3004): Approval workflows, document templates, notifications
- **Reports Service** (Port 3005): Analytics, dashboards, exports, feedback

### Infrastructure

- **MongoDB**: 6 dedicated databases (one per context + gateway) + Event Store
- **Event Bus**: Unified event system with Kafka OR RabbitMQ (configurable)
- **Redis**: Caching and session management
- **Zookeeper**: Kafka coordination (when using Kafka)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

```bash
# Clone and navigate
cd bookly-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start infrastructure
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Run database seeds
npm run seed:all

# Start all microservices (development)
npm run start:dev
```

### Individual Service Startup

```bash
# Start specific service
npm run start:dev -- --project auth-service
npm run start:dev -- --project resources-service
npm run start:dev -- --project availability-service
npm run start:dev -- --project stockpile-service
npm run start:dev -- --project reports-service
npm run start:dev -- --project api-gateway
```

## 📚 API Documentation

### Swagger Endpoints

- **Aggregated**: <http://localhost:3000/api/docs> (All services)
- **Auth Service**: <http://localhost:3001/api/docs>
- **Resources Service**: <http://localhost:3002/api/docs>
- **Availability Service**: <http://localhost:3003/api/docs>
- **Stockpile Service**: <http://localhost:3004/api/docs>
- **Reports Service**: <http://localhost:3005/api/docs>

### AsyncAPI Documentation

Each microservice exposes AsyncAPI documentation for event-driven architecture:

- <http://localhost:300X/api/async-docs>

## 🎯 Features

### Authentication & Authorization (auth-service)

- ✅ JWT authentication with access & refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Permission-based authorization
- ✅ 6 predefined roles (Student, Teacher, Admin, Program Admin, Security, Staff)
- ✅ Audit logging for all auth operations
- ✅ Password hashing with bcrypt
- ✅ Account lockout after failed attempts

### Resource Management (resources-service)

- ✅ CRUD operations for resources (rooms, equipment, etc.)
- ✅ Unified category model (resource types, maintenance types)
- ✅ CSV import/export for bulk operations
- ✅ Maintenance scheduling and tracking
- ✅ Academic program associations
- ✅ Availability rules per resource

### Availability & Reservations (availability-service)

- ✅ Real-time availability checking
- ✅ Reservation creation with conflict detection
- ✅ Periodic/recurring reservations
- ✅ Waiting list management
- ✅ Calendar integration (Google, Outlook)
- ✅ Reservation reassignment
- ✅ Historical usage tracking

### Approval Workflows (stockpile-service)

- ✅ Configurable approval flows
- ✅ Multi-step approval processes
- ✅ Document template generation (PDF)
- ✅ Email & WhatsApp notifications
- ✅ Digital check-in/check-out
- ✅ Security dashboard for validation

### Reports & Analytics (reports-service)

- ✅ Usage reports by resource/program/period
- ✅ User reservation statistics
- ✅ CSV/Excel export
- ✅ Real-time dashboards
- ✅ Feedback collection and analysis
- ✅ Unmet demand tracking
- ✅ Conflict resolution reports

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run tests for specific service
npm test -- apps/auth-service
```

## 📦 Project Structure

```
bookly-backend/
├── apps/                         # Microservices
│   ├── api-gateway/              # Central gateway
│   ├── auth-service/             # Authentication & Authorization
│   ├── resources-service/        # Resource management
│   ├── availability-service/     # Reservations & Availability
│   ├── stockpile-service/        # Approvals & Workflows
│   └── reports-service/          # Analytics & Reports
├── libs/                         # Shared libraries
│   ├── common/                   # Common utilities
│   ├── database/                 # MongoDB connection
│   ├── event-bus/                # Event bus (RabbitMQ/Kafka)
│   ├── redis/                    # Cache layer
│   ├── idempotency/              # Idempotency & distributed tracing
│   ├── guards/                   # Auth guards
│   ├── decorators/               # Custom decorators
│   └── filters/                  # Exception filters
├── docs/                         # Comprehensive documentation
├── scripts/                      # Utility scripts
├── docker-compose.yml            # Infrastructure
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🔧 Configuration

All configuration is managed through environment variables. See `.env.example` for available options.

### Key Configuration Options

- `NODE_ENV`: Environment (development/production)
- `SIMULATE_NETWORK_LATENCY`: Enable realistic network delays
- `ERROR_SIMULATION_RATE`: Probability of simulated errors (0-1)
- `JWT_SECRET`: Secret for JWT signing
- `KAFKA_BROKER`: Kafka connection string
- `REDIS_HOST`: Redis connection

## 🐳 Docker Commands

```bash
# Start all infrastructure
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Remove volumes (clean state)
docker-compose down -v

# Rebuild specific service
docker-compose up -d --build [service-name]
```

## 🔐 Default Credentials

### MongoDB

- Username: `bookly`
- Password: `bookly123`

### Test Users (after seeding)

- **Admin**: <admin@ufps.edu.co> / 123456
- **Program Admin**: <admin.sistemas@ufps.edu.co> / 123456
- **Teacher**: <docente@ufps.edu.co> / 123456
- **Student**: <estudiante@ufps.edu.co> / 123456
- **Security**: <vigilante@ufps.edu.co> / 123456

## 📊 Monitoring

- **Kafka UI**: <http://localhost:9092> (via kafka-ui if installed)
- **Redis Commander**: Install separately if needed
- **MongoDB**: Use MongoDB Compass with connection strings from `.env`

## 🤝 Contributing

This is a mock implementation for development and testing purposes. Follow the coding standards defined in the main Bookly project.

## 📝 License

MIT License - See main Bookly project for details.

## 🆘 Troubleshooting

### Services won't start

- Ensure Docker is running
- Check port availability (3000-3005, 6379, 9092, 27017-27022)
- Run `docker-compose logs [service-name]` for details

### MongoDB connection issues

- Wait for MongoDB containers to be healthy
- Check credentials in `.env`
- Verify network connectivity: `docker network inspect bookly-frontend-network`

### Kafka not receiving events

- Ensure Zookeeper is running: `docker-compose ps zookeeper`
- Check Kafka logs: `docker-compose logs kafka`
- Verify topics exist: Use Kafka CLI tools

### Redis connection errors

- Check Redis is running: `docker-compose ps redis`
- Test connection: `redis-cli ping`
- Verify REDIS_HOST in `.env`

## 📞 Support

For issues related to this mock implementation, please refer to the main Bookly project documentation and architecture guidelines.
