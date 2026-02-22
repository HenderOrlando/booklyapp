# ☁️ DEPLOYMENT PULUMI - Google Cloud Platform

Guía completa para desplegar Bookly-Mock en Google Cloud Platform usando Pulumi como Infrastructure as Code.

## 📋 Prerrequisitos

### Software Requerido

- **Node.js** 18+
- **Pulumi CLI** 3.0+
- **Google Cloud SDK** 400+
- **Docker** 20.10+
- **Git**

### Verificación de Versiones

```bash
node --version          # >= 18.0.0
pulumi version         # >= 3.0.0
gcloud version         # >= 400.0.0
docker --version        # >= 20.10.0
git --version          # >= 2.0.0
```

### Configuración Google Cloud

```bash
# Autenticación con Google Cloud
gcloud auth login
gcloud auth application-default login

# Configurar proyecto
gcloud config set project YOUR_PROJECT_ID
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a

# Verificar permisos
gcloud auth list
gcloud projects list
```

### Configuración Pulumi

```bash
# Instalar Pulumi CLI
curl -fsSL https://get.pulumi.com | sh

# Login a Pulumi
pulumi login

# Crear nuevo stack
pulumi stack init gcp-dev
```

## 🏗️ Arquitectura GCP con Pulumi

### Componentes de Infraestructura

| Componente          | Servicio GCP             | Descripción                  |
| ------------------- | ------------------------ | ---------------------------- |
| VPC                 | Compute Engine           | Red aislada                  |
| GKE Cluster         | Google Kubernetes Engine | Orquestación de contenedores |
| Cloud SQL           | Cloud SQL PostgreSQL     | Base de datos principal      |
| Cloud Memorystore   | Memorystore for Redis    | Cache                        |
| Pub/Sub             | Pub/Sub                  | Event bus                    |
| Cloud Storage       | Cloud Storage            | Almacenamiento de archivos   |
| Cloud Load Balancer | Cloud Load Balancing     | Balanceador de carga         |
| Cloud Run           | Cloud Run                | Servicios serverless         |

### Topología de Red

```
Internet
    ↓
Cloud Load Balancer
    ↓
GKE Cluster (us-central1)
    ├── api-gateway (Pod)
    ├── auth-service (Pod)
    ├── resources-service (Pod)
    ├── availability-service (Pod)
    ├── stockpile-service (Pod)
    └── reports-service (Pod)
    ↓
Cloud SQL (PostgreSQL)
Cloud Memorystore (Redis)
Pub/Sub
```

## 🚀 Configuración del Proyecto Pulumi

### 1. Estructura del Proyecto

```
infrastructure/
├── Pulumi.yaml              # Configuración del proyecto
├── Pulumi.gcp-dev.yaml      # Configuración del stack
├── package.json             # Dependencias Node.js
├── tsconfig.json            # Configuración TypeScript
├── index.ts                 # Programa principal
├── components/
│   ├── gke.ts              # Cluster GKE
│   ├── database.ts          # Cloud SQL
│   ├── networking.ts       # VPC y networking
│   ├── storage.ts          # Cloud Storage
│   └── monitoring.ts       # Monitoring y logging
└── services/
    ├── api-gateway.ts      # Deployment API Gateway
    ├── auth-service.ts     # Deployment Auth Service
    ├── resources-service.ts # Deployment Resources Service
    ├── availability-service.ts # Deployment Availability Service
    ├── stockpile-service.ts # Deployment Stockpile Service
    └── reports-service.ts  # Deployment Reports Service
```

### 2. Pulumi.yaml

```yaml
name: bookly-mock-infrastructure
runtime: nodejs
description: Bookly Mock Infrastructure on GCP
main: index.ts
```

### 3. Pulumi.gcp-dev.yaml

```yaml
encryptionsalt: v1:YOUR_ENCRYPTION_SALT
config:
  gcp:project: your-gcp-project-id
  gcp:region: us-central1
  gcp:zone: us-central1-a

  # Configuración de la aplicación
  app:environment: development
  app:replicas: 2
  app:cpu: "500m"
  app:memory: "512Mi"

  # Configuración de base de datos
  database:tier: db-custom-4-16384
  database:version: POSTGRES_15
  database:backupRetention: 7

  # Configuración de Redis
  redis:tier: STANDARD_HA
  redis:memorySizeGb: 4

  # Configuración de networking
  networking:cidrBlock: "10.0.0.0/16"
  networking:enablePrivateEndpoint: true
```

### 4. package.json

```json
{
  "name": "bookly-mock-infrastructure",
  "version": "1.0.0",
  "dependencies": {
    "@pulumi/pulumi": "^3.0.0",
    "@pulumi/gcp": "^7.0.0",
    "@pulumi/docker": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## 📦 Implementación Pulumi

### index.ts - Programa Principal

```typescript
import * as pulumi from "@pulumi/pulumi";
import { GKECluster } from "./components/gke";
import { Database } from "./components/database";
import { Networking } from "./components/networking";
import { Storage } from "./components/storage";
import { Monitoring } from "./components/monitoring";
import { deployServices } from "./services";

// Configuración
const config = new pulumi.Config();
const project = config.require("gcp:project");
const region = config.require("gcp:region");

// Crear networking
const networking = new Networking("bookly-networking", {
  project,
  region,
  cidrBlock: config.get("networking:cidrBlock") || "10.0.0.0/16",
});

// Crear GKE cluster
const gkeCluster = new GKECluster("bookly-gke", {
  project,
  region,
  network: networking.network,
  subnetwork: networking.subnetwork,
  nodeCount: config.getNumber("app:replicas") || 2,
});

// Crear base de datos
const database = new Database("bookly-database", {
  project,
  region,
  tier: config.get("database:tier") || "db-custom-4-16384",
  version: config.get("database:version") || "POSTGRES_15",
  network: networking.network,
});

// Crear Redis
const redis = new Redis("bookly-redis", {
  project,
  region,
  tier: config.get("redis:tier") || "STANDARD_HA",
  memorySizeGb: config.getNumber("redis:memorySizeGb") || 4,
  network: networking.network,
});

// Crear storage
const storage = new Storage("bookly-storage", {
  project,
  region,
});

// Desplegar servicios
const services = deployServices("bookly-services", {
  project,
  region,
  cluster: gkeCluster.cluster,
  database: database.instance,
  redis: redis.instance,
  storage: storage.bucket,
});

// Exportar outputs
export const kubeconfig = gkeCluster.kubeconfig;
export const databaseConnection = database.connectionString;
export const redisHost = redis.host;
export const storageBucket = storage.bucket.name;
export const serviceEndpoints = services.endpoints;
```

### components/gke.ts - Cluster GKE

```typescript
import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

interface GKEClusterArgs {
  project: string;
  region: string;
  network: gcp.compute.Network;
  subnetwork: gcp.compute.Subnetwork;
  nodeCount: number;
}

export class GKECluster extends pulumi.ComponentResource {
  public readonly cluster: gcp.container.Cluster;
  public readonly kubeconfig: pulumi.Output<string>;

  constructor(
    name: string,
    args: GKEClusterArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("bookly:components:GKECluster", name, {}, opts);

    // Crear node pool
    const nodePool = new gcp.container.NodePool(
      `${name}-node-pool`,
      {
        project: args.project,
        location: args.region,
        cluster: args.cluster.name,
        initialNodeCount: args.nodeCount,
        nodeConfig: {
          machineType: "e2-standard-4",
          oauthScopes: ["https://www.googleapis.com/auth/cloud-platform"],
        },
      },
      { parent: this },
    );

    this.cluster = args.cluster;

    // Generar kubeconfig
    this.kubeconfig = pulumi
      .all([args.cluster.name, args.cluster.endpoint, args.cluster.masterAuth])
      .apply(([name, endpoint, masterAuth]) => {
        const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
        return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        access-token: $(gcloud auth print-access-token)
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`;
      });
  }
}
```

### services/api-gateway.ts - API Gateway Service

```typescript
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

interface ServiceArgs {
  project: string;
  region: string;
  cluster: gcp.container.Cluster;
  database: gcp.sql.DatabaseInstance;
  redis: gcp.redis.Instance;
  storage: gcp.storage.Bucket;
}

export function deployApiGateway(name: string, args: ServiceArgs) {
  const provider = new k8s.Provider("k8s-provider", {
    kubeconfig: args.cluster.kubeconfig,
  });

  // ConfigMap para variables de entorno
  const configMap = new k8s.core.v1.ConfigMap(
    `${name}-config`,
    {
      metadata: {
        name: "api-gateway-config",
        namespace: "bookly",
      },
      data: {
        NODE_ENV: "production",
        PORT: "3000",
        DATABASE_URL: args.database.connectionString,
        REDIS_HOST: args.redis.host,
        GOOGLE_CLOUD_PROJECT: args.project,
        STORAGE_BUCKET: args.storage.name,
      },
    },
    { provider },
  );

  // Deployment
  const deployment = new k8s.apps.v1.Deployment(
    `${name}-deployment`,
    {
      metadata: {
        name: "api-gateway",
        namespace: "bookly",
      },
      spec: {
        replicas: 2,
        selector: { matchLabels: { app: "api-gateway" } },
        template: {
          metadata: {
            labels: { app: "api-gateway" },
          },
          spec: {
            containers: [
              {
                name: "api-gateway",
                image: "gcr.io/${args.project}/api-gateway:latest",
                ports: [{ containerPort: 3000 }],
                envFrom: [{ configMapRef: { name: "api-gateway-config" } }],
                resources: {
                  requests: {
                    cpu: "250m",
                    memory: "256Mi",
                  },
                  limits: {
                    cpu: "500m",
                    memory: "512Mi",
                  },
                },
              },
            ],
          },
        },
      },
    },
    { provider },
  );

  // Service
  const service = new k8s.core.v1.Service(
    `${name}-service`,
    {
      metadata: {
        name: "api-gateway",
        namespace: "bookly",
      },
      spec: {
        selector: { app: "api-gateway" },
        ports: [{ port: 80, targetPort: 3000 }],
        type: "ClusterIP",
      },
    },
    { provider },
  );

  return { deployment, service };
}
```

## 🚀 Comandos de Deployment

### 1. Inicialización

```bash
# Navegar al directorio de infraestructura
cd infrastructure

# Instalar dependencias
npm install

# Configurar stack
pulumi stack select gcp-dev
```

### 2. Preview de Cambios

```bash
# Ver qué recursos se crearán/modificarán
pulumi preview

# Preview detallado con diff
pulumi preview --diff
```

### 3. Deployment

```bash
# Desplegar infraestructura
pulumi up

# Desplegar sin confirmación interactiva (cuidado)
pulumi up --yes
```

### 4. Gestión de Stacks

```bash
# Crear nuevo stack para producción
pulumi stack init gcp-prod
pulumi config set gcp:project your-prod-project
pulumi config set app:environment production

# Listar stacks
pulumi stack ls

# Cambiar entre stacks
pulumi stack select gcp-dev
```

### 5. Configuración y Secrets

```bash
# Configurar variables
pulumi config set app:replicas 3
pulumi config set database:tier "db-custom-8-32768"

# Configurar secrets (encriptados)
pulumi config set --secret database:password "super-secret-password"
pulumi config set --secret jwt:secret "your-jwt-secret"

# Ver configuración
pulumi config
```

## 🐳 Integración con Docker

### 1. Build y Push de Imágenes

```typescript
// docker-build.ts
import * as docker from "@pulumi/docker";

export function buildAndPushImages(project: string) {
  // Build API Gateway image
  const apiGatewayImage = new docker.Image("api-gateway-image", {
    imageName: docker.buildImage({
      context: "../bookly-mock",
      dockerfile: "apps/api-gateway/Dockerfile",
    }),
    build: {
      context: "../bookly-mock",
      dockerfile: "apps/api-gateway/Dockerfile",
    },
    imageName: `gcr.io/${project}/api-gateway:latest`,
    registry: {
      server: "gcr.io",
      username: "_json_key",
      password: pulumi.secret(gcp.config.serviceAccountKey),
    },
  });

  // Build otras imágenes...

  return {
    apiGateway: apiGatewayImage,
    // ... otras imágenes
  };
}
```

### 2. Dockerfile Optimizado para GKE

```dockerfile
# apps/api-gateway/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs18-debian11 AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
USER nonroot:nonroot

ENTRYPOINT ["node", "dist/apps/api-gateway/main.js"]
```

## 🔍 Monitoreo y Logging

### 1. Configuración de Monitoring

```typescript
// components/monitoring.ts
import * as gcp from "@pulumi/gcp";

export class Monitoring extends pulumi.ComponentResource {
  public readonly dashboard: gcp.monitoring.Dashboard;
  public readonly alertPolicies: gcp.monitoring.AlertPolicy[];

  constructor(
    name: string,
    args: MonitoringArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("bookly:components:Monitoring", name, {}, opts);

    // Dashboard personalizado
    this.dashboard = new gcp.monitoring.Dashboard(
      `${name}-dashboard`,
      {
        displayName: "Bookly Mock Dashboard",
        gridLayout: {
          columns: "2",
          widgets: [
            {
              title: "API Response Time",
              xyChart: {
                dataSets: [
                  {
                    timeSeriesQuery: {
                      prometheusQuery: {
                        query:
                          "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
                      },
                    },
                  },
                ],
              },
            },
            // ... más widgets
          ],
        },
      },
      { parent: this },
    );

    // Alert policies
    this.alertPolicies = [
      new gcp.monitoring.AlertPolicy(
        `${name}-high-error-rate`,
        {
          displayName: "High Error Rate",
          combiner: "OR",
          conditions: [
            {
              displayName: "Error rate > 5%",
              conditionThreshold: {
                filter:
                  'metric.type="serviceruntime.googleapis.com/api/request_count"',
                aggregations: [
                  {
                    alignmentPeriod: "300s",
                    perSeriesAligner: "ALIGN_RATE",
                  },
                ],
                comparison: "COMPARISON_GT",
                thresholdValue: 0.05,
              },
            },
          ],
        },
        { parent: this },
      ),
    ];
  }
}
```

### 2. Integración con Cloud Logging

```typescript
// Configuración de logging en los servicios
const loggingConfig = new k8s.core.v1.ConfigMap(
  "logging-config",
  {
    metadata: { name: "logging-config", namespace: "bookly" },
    data: {
      GOOGLE_CLOUD_PROJECT: project,
      LOG_LEVEL: "info",
    },
  },
  { provider },
);
```

## 🔧 Gestión de Secrets

### 1. Secret Manager

```typescript
import * as secretmanager from "@pulumi/gcp/secretmanager";

export function createSecrets(project: string) {
  const jwtSecret = new secretmanager.Secret("jwt-secret", {
    project,
    secretId: "bookly-jwt-secret",
    replication: {
      automatic: true,
    },
  });

  const jwtSecretVersion = new secretmanager.SecretVersion(
    "jwt-secret-version",
    {
      secret: jwtSecret.id,
      secretData: "your-super-secret-jwt-key",
    },
  );

  const dbPassword = new secretmanager.Secret("db-password", {
    project,
    secretId: "bookly-db-password",
    replication: {
      automatic: true,
    },
  });

  return { jwtSecret, dbPassword };
}
```

### 2. Acceso a Secrets en Kubernetes

```typescript
// Montar secrets como variables de entorno
const secretVolume = new k8s.core.v1.Secret(
  "app-secrets",
  {
    metadata: { name: "app-secrets", namespace: "bookly" },
    stringData: {
      JWT_SECRET: jwtSecretVersion.secretData,
      DB_PASSWORD: dbPasswordVersion.secretData,
    },
  },
  { provider },
);
```

## 🚀 CI/CD con Pulumi

### GitHub Actions Workflow

```yaml
# .github/workflows/pulumi-deploy.yml
name: Pulumi Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Setup Pulumi
        uses: pulumi/setup-pulumi@v2
        with:
          pulumi-version: "3.x"

      - name: Configure GCP credentials
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Login to GCP
        run: gcloud auth login --brief

      - name: Select Pulumi stack
        run: pulumi stack select gcp-${{ github.ref == 'refs/heads/main' && 'prod' || 'dev' }}

      - name: Deploy infrastructure
        run: pulumi up --yes
```

## 🔍 Verificación del Deployment

### 1. Health Checks

```bash
# Verificar estado del cluster
gcloud container clusters describe bookly-gke --region us-central1

# Verificar pods
kubectl get pods -n bookly

# Verificar servicios
kubectl get services -n bookly

# Verificar endpoints
kubectl get endpoints -n bookly
```

### 2. Testing de Conectividad

```bash
# Port forward para testing local
kubectl port-forward service/api-gateway 3000:80 -n bookly

# Test de API
curl http://localhost:3000/health

# Ver logs
kubectl logs -f deployment/api-gateway -n bookly
```

### 3. Monitoring

```bash
# Ver métricas en Cloud Monitoring
gcloud monitoring metrics list

# Ver logs en Cloud Logging
gcloud logging read "resource.type=k8s_container" --limit 10

# Ver dashboards
gcloud monitoring dashboards list
```

## 🔧 Troubleshooting Pulumi

### Problemas Comunes

#### Error de Permisos

```bash
# Verificar permisos del service account
gcloud projects get-iam-policy YOUR_PROJECT_ID

# Otorgar permisos necesarios
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:your-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.admin"
```

#### Recursos No Creados

```bash
# Ver estado del stack
pulumi stack output

# Ver historial de deployments
pulumi history

# Rollback a versión anterior
pulumi up --target <RESOURCE_URN>
```

#### Configuración Incorrecta

```bash
# Ver configuración actual
pulumi config

# Actualizar configuración
pulumi config set app:replicas 3

# Eliminar configuración
pulumi config rm app:replicas
```

### Debug Mode

```bash
# Habilitar debug logs
export PULUMI_CONFIG_PASSPHRASE=""
pulumi up --debug --logflow
```

## 📝 Checklist de Deployment Pulumi

- [ ] Pulumi CLI instalado y autenticado
- [ ] Google Cloud SDK configurado
- [ ] Proyecto GCP creado y permisos otorgados
- [ ] Stack Pulumi configurado
- [ ] Código de infraestructura escrito
- [ ] Variables de entorno configuradas
- [ ] Secrets creados en Secret Manager
- [ ] Imágenes Docker build y push
- [ ] Preview validado
- [ ] Deployment ejecutado exitosamente
- [ ] Health checks pasando
- [ ] Monitoring configurado
- [ ] Logs funcionando

## 🆘 Comandos de Emergencia

### Destroy Completo

```bash
# Eliminar toda la infraestructura
pulumi destroy --yes

# Eliminar stack
pulumi stack rm gcp-dev
```

### Recuperación de Desastres

```bash
# Ver estado anterior
pulumi history

# Rollback a versión específica
pulumi up --target <RESOURCE_URN> --replace

# Importar recursos existentes
pulumi import gcp:container/cluster:Cluster bookly-gke us-central1/bookly-gke
```

### Escalado Rápido

```bash
# Escalar cluster
gcloud container clusters resize bookly-gke --node-pool default-pool --num-nodes 5 --region us-central1

# Escalar deployments
kubectl scale deployment api-gateway --replicas=5 -n bookly
```

## 📚 Recursos Adicionales

- [Pulumi GCP Provider](https://www.pulumi.com/registry/packages/gcp/)
- [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Monitoring](https://cloud.google.com/monitoring)
- [Pulumi Best Practices](https://www.pulumi.com/docs/guides/cross-language/best-practices/)
