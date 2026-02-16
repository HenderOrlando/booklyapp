# 🔄 DEPLOYMENT GITHUB ACTIONS - CI/CD Automation

Guía completa para configurar CI/CD automatizado con GitHub Actions para Bookly-Mock.

## 📋 Prerrequisitos

### Software Requerido

- **Git** 2.0+
- **GitHub Account** con permisos de admin
- **Docker Hub Account** (opcional)
- **Cloud Provider Account** (GCP/AWS/Azure)

### Verificación de Versiones

```bash
git --version  # >= 2.0.0
```

### Configuración GitHub

```bash
# Ver configuración de git
git config --list

# Configurar usuario si es necesario
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🏗️ Arquitectura CI/CD

### Workflow Types

| Workflow     | Trigger         | Purpose                               |
| ------------ | --------------- | ------------------------------------- |
| CI           | Pull Request    | Testing, linting, security scanning   |
| Build Docker | Push to main    | Build and push Docker images          |
| Deploy Dev   | Push to develop | Deploy to development environment     |
| Deploy Prod  | Manual/Tag      | Deploy to production environment      |
| Security     | Schedule        | Security scans and dependency updates |

### Pipeline Stages

```
Code Push → CI Pipeline → Quality Gates → Build Images → Deploy Environments
    ↓              ↓              ↓              ↓              ↓
  GitHub       GitHub         GitHub        Docker        Cloud
  Actions      Actions        Actions       Hub/Registry   Provider
```

## 🚀 Configuración de GitHub Actions

### 1. Estructura de Workflows

```
.github/
├── workflows/
│   ├── ci.yml                    # Continuous Integration
│   ├── build-docker.yml          # Docker Build & Push
│   ├── deploy-dev.yml            # Deploy to Development
│   ├── deploy-prod.yml           # Deploy to Production
│   ├── security-scan.yml          # Security Scanning
│   ├── dependency-update.yml     # Dependency Updates
│   └── cleanup.yml               # Resource Cleanup
├── scripts/
│   ├── setup-node.sh             # Node.js setup
│   ├── test-coverage.sh          # Coverage reporting
│   ├── deploy-k8s.sh             # Kubernetes deployment
│   └── notify-slack.sh           # Slack notifications
└── templates/
    ├── docker-build.yml          # Reusable Docker build
    ├── node-test.yml              # Reusable Node.js test
    └── k8s-deploy.yml             # Reusable K8s deployment
```

### 2. Secrets Configuration

```bash
# GitHub Secrets a configurar en Repository Settings > Secrets and variables > Actions

# Docker Hub
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-token

# Google Cloud (si usa GCP)
GCP_SA_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GCP_PROJECT_ID=your-gcp-project
GCP_REGION=us-central1

# AWS (si usa AWS)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Azure (si usa Azure)
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
AZURE_SUBSCRIPTION_ID=your-subscription-id

# Application Secrets
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
REDIS_HOST=your-redis-host

# Notifications
SLACK_WEBHOOK_URL=your-slack-webhook
TEAMS_WEBHOOK_URL=your-teams-webhook
EMAIL_SMTP_HOST=your-smtp-host
EMAIL_SMTP_USER=your-smtp-user
EMAIL_SMTP_PASS=your-smtp-password
```

## 📦 Workflow Implementations

### ci.yml - Continuous Integration

```yaml
name: Continuous Integration

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

env:
  NODE_VERSION: "18"
  CACHE_VERSION: "v1"

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

  test:
    name: Test Suite
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth, resources, availability, stockpile, reports]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Start infrastructure
        run: |
          docker-compose up -d
          sleep 30

      - name: Run tests
        run: npm run test:${{ matrix.service }}

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: ${{ matrix.service }}

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test, security]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build:all

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/
          retention-days: 7
```

### build-docker.yml - Docker Build & Push

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]
    tags: ["v*"]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    name: Build and Push Images
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    strategy:
      matrix:
        service:
          - api-gateway
          - auth-service
          - resources-service
          - availability-service
          - stockpile-service
          - reports-service
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./bookly-mock
          file: ./bookly-mock/apps/${{ matrix.service }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}:${{ steps.meta.outputs.version }}
          format: spdx-json
          output-file: sbom-${{ matrix.service }}.spdx

      - name: Upload SBOM
        uses: actions/upload-artifact@v3
        with:
          name: sbom-${{ matrix.service }}
          path: sbom-${{ matrix.service }}.spdx
```

### deploy-dev.yml - Deploy to Development

```yaml
name: Deploy to Development

on:
  push:
    branches: [develop]
  workflow_run:
    workflows: ["Build and Push Docker Images"]
    types: [completed]
    branches: [develop]

env:
  ENVIRONMENT: development
  NAMESPACE: bookly-dev
  CLUSTER_NAME: bookly-dev-cluster
  CLUSTER_REGION: us-central1

jobs:
  deploy:
    name: Deploy to Development
    runs-on: ubuntu-latest
    environment: development
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.ref == 'refs/heads/develop' }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Google Cloud credentials
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup gcloud
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}

      - name: Get GKE credentials
        run: |
          gcloud container clusters get-credentials ${{ env.CLUSTER_NAME }} --region ${{ env.CLUSTER_REGION }}

      - name: Deploy to Kubernetes
        run: |
          # Apply configurations
          kubectl apply -f k8s/${{ env.ENVIRONMENT }}/namespace.yaml
          kubectl apply -f k8s/${{ env.ENVIRONMENT }}/configmaps/
          kubectl apply -f k8s/${{ env.ENVIRONMENT }}/secrets/

          # Deploy services
          for service in api-gateway auth-service resources-service availability-service stockpile-service reports-service; do
            envsubst < k8s/${{ env.ENVIRONMENT }}/${service}/deployment.yaml | kubectl apply -f -
            envsubst < k8s/${{ env.ENVIRONMENT }}/${service}/service.yaml | kubectl apply -f -
          done
        env:
          IMAGE_TAG: ${{ github.sha }}
          REGISTRY: ghcr.io/${{ github.repository }}

      - name: Wait for rollout
        run: |
          for service in api-gateway auth-service resources-service availability-service stockpile-service reports-service; do
            kubectl rollout status deployment/${service} -n ${{ env.NAMESPACE }} --timeout=300s
          done

      - name: Run smoke tests
        run: |
          # Wait for services to be ready
          kubectl wait --for=condition=ready pod -l app=api-gateway -n ${{ env.NAMESPACE }} --timeout=300s

          # Get service URL
          API_URL=$(kubectl get service api-gateway -n ${{ env.NAMESPACE }} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

          # Run health checks
          for i in {1..30}; do
            if curl -f http://$API_URL/health; then
              echo "Health check passed"
              break
            fi
            echo "Health check failed, retrying in 10 seconds..."
            sleep 10
          done

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          channel: "#deployments"
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          text: |
            Deployment to ${{ env.ENVIRONMENT }} ${{ job.status }}
            Commit: ${{ github.sha }}
            Branch: ${{ github.ref_name }}
            Author: ${{ github.actor }}
```

### deploy-prod.yml - Deploy to Production

```yaml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: "Version to deploy (tag or commit SHA)"
        required: true
        type: string
      confirm:
        description: 'Type "deploy" to confirm production deployment'
        required: true
        type: string

env:
  ENVIRONMENT: production
  NAMESPACE: bookly-prod
  CLUSTER_NAME: bookly-prod-cluster
  CLUSTER_REGION: us-central1

jobs:
  pre-deploy-checks:
    name: Pre-deploy Checks
    runs-on: ubuntu-latest
    outputs:
      can-deploy: ${{ steps.check.outputs.can-deploy }}
    steps:
      - name: Confirm deployment
        id: check
        run: |
          if [[ "${{ github.event.inputs.confirm }}" == "deploy" ]]; then
            echo "can-deploy=true" >> $GITHUB_OUTPUT
          else
            echo "can-deploy=false" >> $GITHUB_OUTPUT
            echo "Deployment confirmation failed"
            exit 1
          fi

      - name: Verify image exists
        run: |
          # Verify that all images exist in registry
          for service in api-gateway auth-service resources-service availability-service stockpile-service reports-service; do
            if ! docker manifest inspect ghcr.io/${{ github.repository }}/${service}:${{ github.event.inputs.version }}; then
              echo "Image ghcr.io/${{ github.repository }}/${service}:${{ github.event.inputs.version }} not found"
              exit 1
            fi
          done

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    needs: pre-deploy-checks
    if: needs.pre-deploy-checks.outputs.can-deploy == 'true'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Google Cloud credentials
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup gcloud
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}

      - name: Get GKE credentials
        run: |
          gcloud container clusters get-credentials ${{ env.CLUSTER_NAME }} --region ${{ env.CLUSTER_REGION }}

      - name: Create backup
        run: |
          # Create database backup before deployment
          TIMESTAMP=$(date +%Y%m%d-%H%M%S)
          gcloud sql backups create --instance=bookly-prod-db --description="Pre-deployment backup $TIMESTAMP"

      - name: Deploy with rolling update
        run: |
          # Update deployments with new image version
          for service in api-gateway auth-service resources-service availability-service stockpile-service reports-service; do
            kubectl set image deployment/${service} ${service}=ghcr.io/${{ github.repository }}/${service}:${{ github.event.inputs.version }} -n ${{ env.NAMESPACE }}
            
            # Wait for rollout to complete
            kubectl rollout status deployment/${service} -n ${{ env.NAMESPACE }} --timeout=600s
          done

      - name: Run production tests
        run: |
          # Wait for services to be ready
          kubectl wait --for=condition=ready pod -l app=api-gateway -n ${{ env.NAMESPACE }} --timeout=600s

          # Get service URL
          API_URL=$(kubectl get service api-gateway -n ${{ env.NAMESPACE }} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

          # Run comprehensive health checks
          curl -f http://$API_URL/health
          curl -f http://$API_URL/api/v1/users/ping

          # Run integration tests
          npm run test:e2e:prod -- --baseUrl=http://$API_URL

      - name: Rollback on failure
        if: failure()
        run: |
          echo "Deployment failed, initiating rollback..."

          # Get previous revision
          PREV_REVISION=$(kubectl rollout history deployment/api-gateway -n ${{ env.NAMESPACE }} | awk 'NR==3{print $1}')

          # Rollback all services
          for service in api-gateway auth-service resources-service availability-service stockpile-service reports-service; do
            kubectl rollout undo deployment/${service} -n ${{ env.NAMESPACE }} --to-revision=$PREV_REVISION
            kubectl rollout status deployment/${service} -n ${{ env.NAMESPACE }} --timeout=300s
          done

          # Notify rollback
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚨 Production deployment failed! Rollback initiated for version ${{ github.event.inputs.version }}"}' \
            ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Update monitoring dashboards
        run: |
          # Update Cloud Monitoring dashboards with new version info
          gcloud monitoring dashboards update --project=${{ secrets.GCP_PROJECT_ID }} \
            --dashboard-file=monitoring/production-dashboard.json

      - name: Notify success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: "#deployments"
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          text: |
            ✅ Production deployment successful!
            Version: ${{ github.event.inputs.version }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
            Time: $(date)
```

### security-scan.yml - Security Scanning

```yaml
name: Security Scanning

on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM UTC
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  dependency-scan:
    name: Dependency Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  container-scan:
    name: Container Security Scan
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          [
            api-gateway,
            auth-service,
            resources-service,
            availability-service,
            stockpile-service,
            reports-service,
          ]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build -f bookly-mock/apps/${{ matrix.service }}/Dockerfile -t test-image ./bookly-mock

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: test-image
          format: "sarif"
          output: "trivy-results.sarif"

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: "trivy-results.sarif"

  code-scan:
    name: Code Security Analysis
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL analysis
        uses: github/codeql-action/analyze@v2
```

## 🔄 Reusable Workflows

### templates/node-test.yml

```yaml
name: Reusable Node.js Test

on:
  workflow_call:
    inputs:
      service:
        required: true
        type: string
      node-version:
        required: false
        type: string
        default: "18"

jobs:
  test:
    name: Test ${{ inputs.service }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Start infrastructure
        run: |
          docker-compose up -d
          sleep 30

      - name: Run tests
        run: npm run test:${{ inputs.service }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: ${{ inputs.service }}
```

### templates/docker-build.yml

```yaml
name: Reusable Docker Build

on:
  workflow_call:
    inputs:
      service:
        required: true
        type: string
      registry:
        required: false
        type: string
        default: ghcr.io
    secrets:
      registry-username:
        required: true
      registry-password:
        required: true

jobs:
  build:
    name: Build ${{ inputs.service }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ inputs.registry }}
          username: ${{ secrets.registry-username }}
          password: ${{ secrets.registry-password }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ inputs.registry }}/${{ github.repository }}/${{ inputs.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./bookly-mock
          file: ./bookly-mock/apps/${{ inputs.service }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 📊 Monitoring y Observabilidad

### Monitoring Workflow

```yaml
name: Monitoring and Health Checks

on:
  schedule:
    - cron: "*/5 * * * *" # Every 5 minutes
  workflow_dispatch:

jobs:
  health-check:
    name: Health Check Services
    runs-on: ubuntu-latest
    steps:
      - name: Check API Gateway
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://api.bookly.example.com/health)
          if [ $response -ne 200 ]; then
            echo "API Gateway health check failed with status $response"
            curl -X POST -H 'Content-type: application/json' \
              --data '{"text":"🚨 API Gateway health check failed!"}' \
              ${{ secrets.SLACK_WEBHOOK_URL }}
            exit 1
          fi

      - name: Check Database Connectivity
        run: |
          # Add database connectivity check
          curl -X POST https://api.bookly.example.com/health/db

      - name: Update Status Page
        run: |
          # Update status page with current health
          curl -X PUT -H "Authorization: Bearer ${{ secrets.STATUS_PAGE_TOKEN }}" \
            https://statuspage.io/api/v1/components/12345 \
            -d '{"status":"operational"}'

  performance-check:
    name: Performance Monitoring
    runs-on: ubuntu-latest
    steps:
      - name: Run performance tests
        run: |
          # Use k6 or artillery for performance testing
          k6 run --out json=performance-results.json performance-test.js

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance-results.json
```

## 🔧 Scripts de Soporte

### scripts/setup-node.sh

```bash
#!/bin/bash
set -e

NODE_VERSION=${1:-18}

echo "Setting up Node.js $NODE_VERSION"

# Setup Node.js
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Configure npm
npm config set fund false
npm config set audit false

echo "Node.js setup complete"
```

### scripts/deploy-k8s.sh

```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-development}
NAMESPACE=${2:-bookly-dev}
IMAGE_TAG=${3:-latest}

echo "Deploying to $ENVIRONMENT environment"
echo "Namespace: $NAMESPACE"
echo "Image tag: $IMAGE_TAG"

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply configurations
kubectl apply -f k8s/$ENVIRONMENT/configmaps/ -n $NAMESPACE
kubectl apply -f k8s/$ENVIRONMENT/secrets/ -n $NAMESPACE

# Deploy services with image substitution
for service in api-gateway auth-service resources-service availability-service stockpile-service reports-service; do
  echo "Deploying $service..."

  # Substitute image tag and apply
  envsubst < k8s/$ENVIRONMENT/$service/deployment.yaml | kubectl apply -f -
  kubectl apply -f k8s/$ENVIRONMENT/$service/service.yaml -n $NAMESPACE

  # Wait for rollout
  kubectl rollout status deployment/$service -n $NAMESPACE --timeout=300s
done

echo "Deployment completed successfully"
```

### scripts/notify-slack.sh

```bash
#!/bin/bash
set -e

WEBHOOK_URL=${1}
MESSAGE=${2}
COLOR=${3:-good}

echo "Sending Slack notification..."

curl -X POST -H 'Content-type: application/json' \
  --data "{
    \"attachments\": [
      {
        \"color\": \"$COLOR\",
        \"text\": \"$MESSAGE\",
        \"footer\": \"GitHub Actions\",
        \"ts\": $(date +%s)
      }
    ]
  }" \
  $WEBHOOK_URL

echo "Slack notification sent"
```

## 🔍 Verificación y Testing

### Integration Tests

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  integration-tests:
    name: Run Integration Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup test environment
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 60

      - name: Run API tests
        run: |
          npm run test:integration

      - name: Run E2E tests
        run: |
          npm run test:e2e

      - name: Generate test report
        run: |
          npm run test:report

      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## 📝 Mejores Prácticas

### 1. Security

- Usar secrets encriptados de GitHub
- No exponer datos sensibles en logs
- Escanear imágenes Docker por vulnerabilidades
- Usar RBAC para Kubernetes

### 2. Performance

- Cache de dependencias y builds
- Builds paralelos cuando sea posible
- Reusable workflows para reducir duplicación
- Artifacts para compartir entre jobs

### 3. Reliability

- Health checks después de deployment
- Rollback automático en fallos
- Notificaciones de estado
- Testing en múltiples ambientes

### 4. Maintainability

- Templates reutilizables
- Scripts versionados
- Documentación clara
- Nomenclatura consistente

## 🆘 Troubleshooting

### Problemas Comunes

#### Workflow Fallido

```bash
# Ver logs del workflow
gh run view --log

# Re-run workflow
gh run rerun <run-id>

# Debug localmente
act -j test-job  # Usar act para correr GitHub Actions localmente
```

#### Secrets No Disponibles

```bash
# Verificar secrets configurados
gh secret list

# Agregar secret
gh secret set DOCKER_PASSWORD --body "your-password"
```

#### Rate Limits

```bash
# Configurar cache para reducir llamadas a API
# Usar acciones optimizadas
# Implementar retry logic
```

## 📚 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Buildx](https://docs.docker.com/buildx/)
- [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
