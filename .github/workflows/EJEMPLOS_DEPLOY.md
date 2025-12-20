# 🎯 Ejemplos de Configuración de Deploy

Este documento proporciona ejemplos prácticos de cómo configurar la sección `deploy` de cada workflow para diferentes plataformas de despliegue.

## 📋 Índice

1. [Kubernetes (kubectl)](#kubernetes-kubectl)
2. [Kubernetes (Helm)](#kubernetes-helm)
3. [Docker Compose en Servidor Remoto](#docker-compose-en-servidor-remoto)
4. [Docker Swarm](#docker-swarm)
5. [AWS ECS](#aws-ecs)
6. [Google Cloud Run](#google-cloud-run)
7. [Azure Container Instances](#azure-container-instances)
8. [Portainer](#portainer)

## 🔧 Secrets Necesarios

Antes de configurar el deploy, asegúrate de tener los siguientes secrets configurados en GitHub:

### Básicos (todos los métodos)
- `DOCKER_USERNAME` - Usuario de Docker Hub
- `DOCKER_PASSWORD` - Token de acceso de Docker Hub

### Específicos por plataforma

#### Kubernetes
- `KUBECONFIG` - Contenido del archivo kubeconfig
- `K8S_CLUSTER` - URL del cluster (opcional)
- `K8S_NAMESPACE` - Namespace para deploy (opcional, default: default)

#### SSH/Servidor Remoto
- `DEPLOY_HOST` - IP o dominio del servidor
- `DEPLOY_USER` - Usuario SSH
- `DEPLOY_SSH_KEY` - Clave privada SSH

#### AWS
- `AWS_ACCESS_KEY_ID` - Access Key de AWS
- `AWS_SECRET_ACCESS_KEY` - Secret Key de AWS
- `AWS_REGION` - Región de AWS (ej: us-east-1)

#### Google Cloud
- `GCP_PROJECT_ID` - ID del proyecto en GCP
- `GCP_SA_KEY` - Service Account Key en formato JSON

#### Azure
- `AZURE_CREDENTIALS` - Credenciales de Azure en formato JSON

---

## 1. Kubernetes (kubectl)

### Opción A: Deploy Simple

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'

    - name: Configure kubectl
      run: |
        mkdir -p $HOME/.kube
        echo "${{ secrets.KUBECONFIG }}" > $HOME/.kube/config
        chmod 600 $HOME/.kube/config

    - name: Update deployment
      run: |
        kubectl set image deployment/api-gateway \
          api-gateway=${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }} \
          --namespace=${{ secrets.K8S_NAMESPACE || 'default' }}

    - name: Verify deployment
      run: |
        kubectl rollout status deployment/api-gateway \
          --namespace=${{ secrets.K8S_NAMESPACE || 'default' }} \
          --timeout=5m
```

### Opción B: Deploy con Manifiestos

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up kubectl
      uses: azure/setup-kubectl@v3

    - name: Configure kubectl
      run: |
        mkdir -p $HOME/.kube
        echo "${{ secrets.KUBECONFIG }}" > $HOME/.kube/config

    - name: Update image tag in manifests
      run: |
        sed -i "s|image:.*bookly-api-gateway.*|image: ${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }}|g" \
          k8s/api-gateway-deployment.yaml

    - name: Apply manifests
      run: |
        kubectl apply -f k8s/api-gateway-deployment.yaml
        kubectl apply -f k8s/api-gateway-service.yaml

    - name: Wait for rollout
      run: |
        kubectl rollout status deployment/api-gateway --timeout=5m
```

---

## 2. Kubernetes (Helm)

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up kubectl
      uses: azure/setup-kubectl@v3

    - name: Set up Helm
      uses: azure/setup-helm@v3
      with:
        version: 'v3.13.0'

    - name: Configure kubectl
      run: |
        mkdir -p $HOME/.kube
        echo "${{ secrets.KUBECONFIG }}" > $HOME/.kube/config

    - name: Deploy with Helm
      run: |
        helm upgrade --install api-gateway ./helm/api-gateway \
          --namespace bookly \
          --create-namespace \
          --set image.repository=${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway \
          --set image.tag=${{ github.sha }} \
          --set image.pullPolicy=Always \
          --wait \
          --timeout 5m

    - name: Verify deployment
      run: |
        helm status api-gateway --namespace bookly
```

---

## 3. Docker Compose en Servidor Remoto

### Opción A: SSH Direct

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to remote server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_SSH_KEY }}
        script: |
          cd /opt/bookly
          docker-compose pull api-gateway
          docker-compose up -d api-gateway
          docker-compose ps
```

### Opción B: Con docker-compose específico

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Copy docker-compose to server
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_SSH_KEY }}
        source: "docker-compose.yml,.env"
        target: "/opt/bookly"

    - name: Deploy via SSH
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_SSH_KEY }}
        script: |
          cd /opt/bookly
          export IMAGE_TAG=${{ github.sha }}
          docker-compose pull api-gateway
          docker-compose up -d api-gateway
          docker-compose logs --tail=50 api-gateway
```

---

## 4. Docker Swarm

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to Docker Swarm
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_SSH_KEY }}
        script: |
          docker service update \
            --image ${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }} \
            --update-parallelism 1 \
            --update-delay 10s \
            bookly_api-gateway

    - name: Verify service
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_SSH_KEY }}
        script: |
          docker service ps bookly_api-gateway
          docker service logs --tail 50 bookly_api-gateway
```

---

## 5. AWS ECS

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ secrets.AWS_REGION }}

    - name: Download task definition
      run: |
        aws ecs describe-task-definition \
          --task-definition bookly-api-gateway \
          --query taskDefinition > task-definition.json

    - name: Update task definition
      id: task-def
      uses: aws-actions/amazon-ecs-render-task-definition@v1
      with:
        task-definition: task-definition.json
        container-name: api-gateway
        image: ${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }}

    - name: Deploy to ECS
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: ${{ steps.task-def.outputs.task-definition }}
        service: bookly-api-gateway
        cluster: bookly-cluster
        wait-for-service-stability: true
```

---

## 6. Google Cloud Run

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v1
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v1

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy bookly-api-gateway \
          --image ${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }} \
          --platform managed \
          --region us-central1 \
          --project ${{ secrets.GCP_PROJECT_ID }} \
          --allow-unauthenticated \
          --port 3000 \
          --memory 512Mi \
          --cpu 1 \
          --min-instances 1 \
          --max-instances 10

    - name: Get service URL
      run: |
        gcloud run services describe bookly-api-gateway \
          --platform managed \
          --region us-central1 \
          --project ${{ secrets.GCP_PROJECT_ID }} \
          --format 'value(status.url)'
```

---

## 7. Azure Container Instances

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Login to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Deploy to Azure Container Instances
      uses: azure/aci-deploy@v1
      with:
        resource-group: bookly-rg
        dns-name-label: bookly-api-gateway
        image: ${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }}
        name: bookly-api-gateway
        location: eastus
        ports: 3000
        cpu: 1
        memory: 1
        environment-variables: |
          NODE_ENV=production
          PORT=3000
```

---

## 8. Portainer

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Deploy via Portainer API
      run: |
        # Obtener access token
        TOKEN=$(curl -X POST "${{ secrets.PORTAINER_URL }}/api/auth" \
          -H "Content-Type: application/json" \
          -d '{"username":"${{ secrets.PORTAINER_USER }}","password":"${{ secrets.PORTAINER_PASSWORD }}"}' \
          | jq -r '.jwt')

        # Actualizar servicio
        curl -X POST "${{ secrets.PORTAINER_URL }}/api/endpoints/1/docker/services/${{ secrets.SERVICE_ID }}/update?version=$VERSION" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "Name": "bookly-api-gateway",
            "TaskTemplate": {
              "ContainerSpec": {
                "Image": "${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }}"
              }
            }
          }'
```

---

## 🔄 Workflow Completo Ejemplo

Aquí un ejemplo completo de `api-gateway.yml` con Kubernetes:

```yaml
name: API Gateway - Build and Deploy

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'bookly-mock/apps/api-gateway/**'
      - 'bookly-mock/libs/**'
      - 'ci-cd/bookly-mock/dockerfiles/Dockerfile.gateway'
      - '.github/workflows/api-gateway.yml'
  workflow_dispatch:

jobs:
  build:
    uses: ./.github/workflows/build-and-push-image.yml
    with:
      service-name: api-gateway
      dockerfile-path: ci-cd/bookly-mock/dockerfiles/Dockerfile.gateway
      context-path: bookly-mock
      image-name: bookly-api-gateway
    secrets:
      DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
      DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.bookly.app
    steps:
      - name: Set up kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.28.0'

      - name: Configure kubectl
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBECONFIG }}" > $HOME/.kube/config
          chmod 600 $HOME/.kube/config

      - name: Update deployment
        run: |
          kubectl set image deployment/api-gateway \
            api-gateway=${{ secrets.DOCKER_USERNAME }}/bookly-api-gateway:${{ github.sha }} \
            --namespace=bookly

      - name: Verify deployment
        run: |
          kubectl rollout status deployment/api-gateway \
            --namespace=bookly \
            --timeout=5m

      - name: Get deployment info
        run: |
          kubectl get deployment api-gateway -n bookly
          kubectl get pods -n bookly -l app=api-gateway
```

---

## 📝 Notas Importantes

1. **Environments**: Usa GitHub Environments para separar staging y producción
2. **Secrets**: Nunca hardcodees credenciales en los workflows
3. **Rollback**: Mantén tags anteriores para facilitar rollbacks
4. **Health Checks**: Verifica que el servicio esté saludable después del deploy
5. **Notificaciones**: Configura notificaciones en caso de fallo

## 🔗 Referencias

- [GitHub Actions Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Kubectl Set Image](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_set/kubectl_set_image/)

---

**Última actualización**: Diciembre 17, 2024
