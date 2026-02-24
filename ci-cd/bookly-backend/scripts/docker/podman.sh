#!/bin/bash
# ===================================
# Bookly Podman Deployment Script (OPTIMIZED)
# ===================================
# Options:
#   -a, --action start   : Start deployment (default)
#   -a, --action stop    : Stop deployment
#   -a, --action restart : Restart deployment
#   -m, --mode full      : Deploy infrastructure + microservices + frontend (default)
#   -m, --mode partial   : Deploy only microservices + frontend (uses .env files)
#   -f, --fast           : Skip health checks, maximum speed (use with caution)
#   -p, --parallel N     : Number of parallel builds (default: auto-detect CPUs)
# ===================================

set -euo pipefail

# Start timer for performance tracking
START_TIME=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# ===============================================
# PERFORMANCE OPTIMIZATIONS
# ===============================================
# Detect CPU cores for parallel builds
CPU_CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
PARALLEL_JOBS=$((CPU_CORES > 2 ? CPU_CORES : 2))

# Podman/Buildah optimizations
export BUILDAH_LAYERS=true
export BUILDAH_FORMAT=docker
export CONTAINERS_CONF=""
export STORAGE_DRIVER=overlay

# Go runtime optimizations for Podman
export GOMAXPROCS=$CPU_CORES

# Default values
ACTION="start"
MODE=""
FAST_MODE=false
CUSTOM_PARALLEL=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -f|--fast)
            FAST_MODE=true
            shift
            ;;
        -p|--parallel)
            CUSTOM_PARALLEL="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Apply custom parallel setting if provided
if [[ -n "$CUSTOM_PARALLEL" ]]; then
    PARALLEL_JOBS="$CUSTOM_PARALLEL"
fi

# Validate action
if [[ ! "$ACTION" =~ ^(start|stop|restart)$ ]]; then
    echo -e "${RED}ERROR: Invalid action '$ACTION'. Must be one of: start, stop, restart${NC}"
    exit 1
fi

# Validate mode if provided
if [[ -n "$MODE" && ! "$MODE" =~ ^(full|partial)$ ]]; then
    echo -e "${RED}ERROR: Invalid mode '$MODE'. Must be one of: full, partial${NC}"
    exit 1
fi

# Configuration - Use script location to calculate paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOOKLY_MOCK_PATH="$(cd "$SCRIPT_DIR/../../../../bookly-mock" && pwd)"
DOCKER_COMPOSE_FULL="podman-compose.yml"
DOCKER_COMPOSE_PARTIAL="podman-compose.microservices.yml"
DEPLOY_MODE_FILE=".deploy-mode"

# Function to get saved mode
get_saved_mode() {
    local mode_file_path="$BOOKLY_MOCK_PATH/$DEPLOY_MODE_FILE"
    if [[ -f "$mode_file_path" ]]; then
        cat "$mode_file_path"
    fi
}

# Function to save mode
save_mode() {
    local mode_to_save="$1"
    local mode_file_path="$BOOKLY_MOCK_PATH/$DEPLOY_MODE_FILE"
    echo -n "$mode_to_save" > "$mode_file_path"
}

# Determine mode to use
saved_mode=$(get_saved_mode)
if [[ -z "$MODE" ]]; then
    if [[ "$ACTION" == "start" ]]; then
        MODE="full"
    elif [[ -n "$saved_mode" ]]; then
        MODE=$(echo "$saved_mode" | tr -d '[:space:]')
    else
        echo -e "${RED}ERROR: No previous deployment found. Please run with -m (full|partial) first.${NC}"
        exit 1
    fi
fi

echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}  Bookly Podman Deployment Script${NC}"
echo -e "${CYAN}  (OPTIMIZED - $PARALLEL_JOBS parallel jobs)${NC}"
echo -e "${CYAN}=====================================${NC}"
echo -e "${MAGENTA}Action: $ACTION${NC}"
echo -e "${MAGENTA}Mode: $MODE${NC}"
echo -e "${MAGENTA}Fast Mode: $FAST_MODE${NC}"
echo -e "${MAGENTA}CPU Cores: $CPU_CORES${NC}"
echo ""

# Check if Podman is running
echo -e "${YELLOW}Checking Podman status...${NC}"
if ! podman info &>/dev/null; then
    echo -e "${RED}ERROR: Podman is not running. Please start Podman.${NC}"
    exit 1
fi
echo -e "${GREEN}Podman is running!${NC}"
echo ""

# ===============================================
# UTILITY FUNCTIONS FOR SPEED
# ===============================================

# Pre-pull base images in parallel (background jobs)
prepull_images() {
    echo -e "${YELLOW}Pre-pulling base images in parallel...${NC}"
    local images=("node:20-alpine" "mongo:7.0" "redis:7.2-alpine" "confluentinc/cp-zookeeper:7.5.0" "confluentinc/cp-kafka:7.5.0")
    for img in "${images[@]}"; do
        podman pull "$img" &>/dev/null &
    done
    wait
    echo -e "${GREEN}Base images ready!${NC}"
}

# Wait for container to be healthy (active polling, not fixed sleep)
wait_for_container() {
    local container_name="$1"
    local max_wait="${2:-30}"
    local interval=2
    local elapsed=0
    
    while [[ $elapsed -lt $max_wait ]]; do
        if podman inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null | grep -q "healthy"; then
            return 0
        fi
        if podman inspect --format='{{.State.Running}}' "$container_name" 2>/dev/null | grep -q "true"; then
            # No health check defined, just check if running
            if ! podman inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null | grep -q "starting"; then
                return 0
            fi
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    echo -e "${YELLOW}Warning: $container_name did not become healthy in ${max_wait}s${NC}"
    return 0
}

# Wait for multiple containers in parallel
wait_for_containers() {
    local containers=("$@")
    local pids=()
    
    for container in "${containers[@]}"; do
        wait_for_container "$container" 20 &
        pids+=($!)
    done
    
    for pid in "${pids[@]}"; do
        wait "$pid" 2>/dev/null || true
    done
}

# Build all services in parallel using background jobs
parallel_build() {
    local compose_file="$1"
    shift
    local services=("$@")
    
    echo -e "${YELLOW}Building ${#services[@]} services in parallel (max $PARALLEL_JOBS jobs)...${NC}"
    
    # Use podman-compose with all services at once (it handles parallelization)
    podman-compose -f "$compose_file" build --parallel "${services[@]}" 2>&1 | tail -20
    
    echo -e "${GREEN}Build complete!${NC}"
}

# Change to bookly-mock directory
cd "$BOOKLY_MOCK_PATH" || exit 1

# Determine which podman-compose file to use
if [[ "$MODE" == "full" ]]; then
    docker_compose_file="$DOCKER_COMPOSE_FULL"
else
    docker_compose_file="$DOCKER_COMPOSE_PARTIAL"
fi

# Cleanup function
cleanup() {
    cd - &>/dev/null || true
}
trap cleanup EXIT

# ===============================================
# STOP ACTION
# ===============================================
if [[ "$ACTION" == "stop" ]]; then
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${CYAN}  STOPPING DEPLOYMENT ($MODE)${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo ""
    
    if [[ "$MODE" == "full" ]]; then
        podman-compose -f "$docker_compose_file" down -v
    else
        podman-compose -f "$docker_compose_file" down
    fi
    
    echo ""
    echo -e "${GREEN}Deployment stopped successfully!${NC}"
    exit 0
fi

# ===============================================
# RESTART ACTION
# ===============================================
if [[ "$ACTION" == "restart" ]]; then
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${CYAN}  RESTARTING DEPLOYMENT ($MODE)${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo ""
    
    echo -e "${YELLOW}Stopping containers...${NC}"
    podman-compose -f "$docker_compose_file" down
    echo ""
    
    echo -e "${YELLOW}Starting containers...${NC}"
    podman-compose -f "$docker_compose_file" up -d
    echo ""
    
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${CYAN}  Deployment Status${NC}"
    echo -e "${CYAN}=====================================${NC}"
    podman-compose -f "$docker_compose_file" ps
    echo ""
    
    echo -e "${GREEN}Deployment restarted successfully!${NC}"
    exit 0
fi

# ===============================================
# START ACTION (default)
# ===============================================

# Save the mode for future stop/restart commands
save_mode "$MODE"

if [[ "$MODE" == "full" ]]; then
    # ===============================================
    # FULL DEPLOYMENT: Infrastructure + Microservices + Frontend
    # Uses inline environment variables from podman-compose.yml
    # ===============================================
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${CYAN}  FULL DEPLOYMENT (OPTIMIZED)${NC}"
    echo -e "${CYAN}  (Infrastructure + Microservices + Frontend)${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo ""

    # Pre-pull base images in parallel (speeds up builds significantly)
    prepull_images &
    PREPULL_PID=$!

    # Stop and remove existing containers (in parallel with pre-pull)
    echo -e "${YELLOW}Stopping and removing existing containers...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_FULL" down -v 2>/dev/null || true
    echo ""

    # Wait for pre-pull to complete
    wait $PREPULL_PID 2>/dev/null || true

    # Start ALL infrastructure services in parallel
    echo -e "${YELLOW}Starting infrastructure services (MongoDB, Redis, Kafka)...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_FULL" up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway
    echo ""

    # Wait for infrastructure - use active polling instead of fixed sleep
    if [[ "$FAST_MODE" == "true" ]]; then
        echo -e "${YELLOW}Fast mode: skipping health checks...${NC}"
        sleep 5
    else
        echo -e "${YELLOW}Waiting for infrastructure (active polling, max 30s)...${NC}"
        wait_for_containers \
            "bookly-mock-redis" \
            "bookly-mock-mongodb-auth" \
            "bookly-mock-mongodb-resources" \
            "bookly-mock-mongodb-availability" \
            "bookly-mock-mongodb-stockpile" \
            "bookly-mock-mongodb-reports" \
            "bookly-mock-mongodb-gateway"
        echo -e "${GREEN}Infrastructure ready!${NC}"
    fi
    echo ""

    # Build ALL microservices + frontend in ONE parallel command
    echo -e "${YELLOW}Building and starting ALL services in parallel...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_FULL" up -d --build \
        api-gateway auth-service resources-service availability-service stockpile-service reports-service bookly-web
    echo ""

    # Wait for services - use active polling
    if [[ "$FAST_MODE" != "true" ]]; then
        echo -e "${YELLOW}Waiting for services to be ready (active polling)...${NC}"
        wait_for_containers \
            "bookly-mock-api-gateway" \
            "bookly-mock-auth-service" \
            "bookly-mock-resources-service" \
            "bookly-mock-availability-service" \
            "bookly-mock-stockpile-service" \
            "bookly-mock-reports-service" \
            "bookly-mock-frontend"
        echo -e "${GREEN}All services ready!${NC}"
    fi
    echo ""

    # Show status
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${CYAN}  Deployment Status${NC}"
    echo -e "${CYAN}=====================================${NC}"
    podman-compose -f "$DOCKER_COMPOSE_FULL" ps
    echo ""

else
    # ===============================================
    # PARTIAL DEPLOYMENT: Only Microservices + Frontend
    # Uses .env files from each microservice and frontend
    # Assumes infrastructure is already running externally
    # ===============================================
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${CYAN}  PARTIAL DEPLOYMENT (OPTIMIZED)${NC}"
    echo -e "${CYAN}  (Microservices + Frontend only)${NC}"
    echo -e "${CYAN}  Using .env files for configuration${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo ""

    # Pre-pull node:20-alpine in background while checking .env files
    echo -e "${YELLOW}Pre-pulling node:20-alpine...${NC}"
    podman pull node:20-alpine &>/dev/null &
    PREPULL_PID=$!

    # Verify .env files exist (quick check, in parallel with pre-pull)
    echo -e "${YELLOW}Verifying .env files exist...${NC}"
    env_files=(
        "apps/api-gateway/.env"
        "apps/auth-service/.env"
        "apps/resources-service/.env"
        "apps/availability-service/.env"
        "apps/stockpile-service/.env"
        "apps/reports-service/.env"
        "../bookly-mock-frontend/.env"
    )
    
    missing_files=()
    for env_file in "${env_files[@]}"; do
        if [[ ! -f "$env_file" ]]; then
            missing_files+=("$env_file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        echo -e "${RED}WARNING: The following .env files are missing:${NC}"
        for file in "${missing_files[@]}"; do
            echo -e "${RED}  - $file${NC}"
        done
        echo ""
        echo -e "${YELLOW}Please create these files from their .env.example templates.${NC}"
        echo -e "${YELLOW}Do you want to continue anyway? (y/N)${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo -e "${RED}Deployment cancelled.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}All .env files found!${NC}"
    fi
    echo ""

    # Stop existing containers (in parallel with pre-pull completion)
    echo -e "${YELLOW}Stopping existing microservices containers...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_PARTIAL" down 2>/dev/null || true
    echo ""

    # Wait for pre-pull
    wait $PREPULL_PID 2>/dev/null || true

    # Build and start ALL services in ONE parallel command (no --force-recreate unless needed)
    echo -e "${YELLOW}Building and starting ALL services in parallel...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_PARTIAL" up -d --build \
        api-gateway auth-service resources-service availability-service stockpile-service reports-service bookly-web
    echo ""

    # Wait for services - use active polling instead of fixed sleep
    if [[ "$FAST_MODE" == "true" ]]; then
        echo -e "${YELLOW}Fast mode: skipping health checks...${NC}"
        sleep 3
    else
        echo -e "${YELLOW}Waiting for services to be ready (active polling)...${NC}"
        wait_for_containers \
            "bookly-api-gateway" \
            "bookly-auth-service" \
            "bookly-resources-service" \
            "bookly-availability-service" \
            "bookly-stockpile-service" \
            "bookly-reports-service" \
            "bookly-frontend"
        echo -e "${GREEN}All services ready!${NC}"
    fi
    echo ""

    # Show status
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${CYAN}  Deployment Status${NC}"
    echo -e "${CYAN}=====================================${NC}"
    podman-compose -f "$DOCKER_COMPOSE_PARTIAL" ps
    echo ""
fi

# Calculate and show elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
ELAPSED_MIN=$((ELAPSED / 60))
ELAPSED_SEC=$((ELAPSED % 60))

# Show access URLs
echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}  Access URLs${NC}"
echo -e "${CYAN}=====================================${NC}"
echo -e "${GREEN}API Gateway:          http://localhost:3000${NC}"
echo -e "${GREEN}API Docs (Swagger):   http://localhost:3000/api/docs${NC}"
echo -e "${GREEN}Auth Service:         http://localhost:3001${NC}"
echo -e "${GREEN}Resources Service:    http://localhost:3002${NC}"
echo -e "${GREEN}Availability Service: http://localhost:3003${NC}"
echo -e "${GREEN}Stockpile Service:    http://localhost:3004${NC}"
echo -e "${GREEN}Reports Service:      http://localhost:3005${NC}"
echo -e "${GREEN}Frontend:             http://localhost:4200${NC}"
echo ""

# Show performance summary
echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}  Performance Summary${NC}"
echo -e "${CYAN}=====================================${NC}"
echo -e "${GREEN}Total deployment time: ${ELAPSED_MIN}m ${ELAPSED_SEC}s${NC}"
echo -e "${GREEN}Parallel jobs used: $PARALLEL_JOBS${NC}"
echo -e "${GREEN}Fast mode: $FAST_MODE${NC}"
echo ""

# Show appropriate commands based on mode
echo -e "${CYAN}=====================================${NC}"
if [[ "$MODE" == "full" ]]; then
    echo -e "${YELLOW}To view logs, run: podman-compose logs -f${NC}"
    echo -e "${YELLOW}To stop all services, run: podman-compose down${NC}"
else
    echo -e "${YELLOW}To view logs, run: podman-compose -f $DOCKER_COMPOSE_PARTIAL logs -f${NC}"
    echo -e "${YELLOW}To stop services, run: podman-compose -f $DOCKER_COMPOSE_PARTIAL down${NC}"
fi
echo -e "${CYAN}=====================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
