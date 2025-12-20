# Fix: Docker/Podman Repository Name Lowercase Error

## Problem

All service deployments (api-gateway, auth-service, availability-service, reports-service, resources-service, stockpile-service, frontend) were failing with the same error:

```
err: Error: repository name must be lowercase
err: Error: no container with name or ID "bookly-api-gateway" found: no such container
err: Error: no container with ID or name "bookly-api-gateway" found: no such container
err: Error: repository name must be lowercase
```

## Root Cause

Docker and Podman require repository names (image names) to be **lowercase only**. When a service in a docker-compose or podman-compose file has:
- A `build:` configuration
- NO explicit `image:` tag

The image name is automatically generated from the project name and service name. If the auto-generated name contains uppercase letters (due to directory names, project names, or other factors), the build will fail with the "repository name must be lowercase" error.

## Solution

Add explicit lowercase `image:` tags to all services with `build:` configurations in all compose files. This ensures that image names are always lowercase and prevents auto-generation issues.

## Changes Made

Updated the following files to include explicit `image:` tags:

### bookly-mock directory:
1. **podman-compose.yml** - Added lowercase image tags for all microservices and frontend
   - `bookly-mock-api-gateway:latest`
   - `bookly-mock-auth-service:latest`
   - `bookly-mock-resources-service:latest`
   - `bookly-mock-availability-service:latest`
   - `bookly-mock-stockpile-service:latest`
   - `bookly-mock-reports-service:latest`
   - `bookly-mock-frontend:latest`

2. **podman-compose.microservices.yml** - Added lowercase image tags for microservices
   - `bookly-api-gateway:latest`
   - `bookly-auth-service:latest`
   - `bookly-resources-service:latest`
   - `bookly-availability-service:latest`
   - `bookly-stockpile-service:latest`
   - `bookly-reports-service:latest`
   - `bookly-frontend:latest`

3. **docker-compose.yml** - Added lowercase image tags (same as podman-compose.yml)

4. **docker-compose.microservices.yml** - Added lowercase image tags (same as podman-compose.microservices.yml)

### bookly-backend directory:
5. **infrastructure/docker-compose.microservices.yml** - Added lowercase image tags
   - `bookly-api-gateway:latest`
   - `bookly-auth-service:latest`
   - `bookly-resources-service:latest`
   - `bookly-availability-service:latest`
   - `bookly-stockpile-service:latest`
   - `bookly-reports-service:latest`

## Example Change

Before:
```yaml
api-gateway:
  build:
    context: .
    dockerfile: ../ci-cd/bookly-mock/dockerfiles/Dockerfile.gateway
  container_name: bookly-api-gateway
```

After:
```yaml
api-gateway:
  build:
    context: .
    dockerfile: ../ci-cd/bookly-mock/dockerfiles/Dockerfile.gateway
  image: bookly-api-gateway:latest
  container_name: bookly-api-gateway
```

## Verification

All modified YAML files have been validated for syntax correctness.

## Benefits

1. **Predictable image names**: Image names are now explicit and won't change based on directory or project names
2. **Lowercase compliance**: All image names are guaranteed to be lowercase
3. **Better image management**: Easier to identify and manage images with consistent naming
4. **Prevents deployment errors**: Eliminates the "repository name must be lowercase" error

## Deployment

After these changes, all deployment scripts should work correctly with both Docker and Podman:
- `podman-compose up --build`
- `docker-compose up --build`
- The deployment script at `ci-cd/bookly-mock/scripts/docker/podman.sh`
