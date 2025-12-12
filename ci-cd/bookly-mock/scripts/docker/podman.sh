#!/bin/bash
# ===================================
# Bookly Docker Deployment Script
# ===================================
# Options:
#   -a, --action start   : Start deployment (default)
#   -a, --action stop    : Stop deployment
#   -a, --action restart : Restart deployment
#   -m, --mode full      : Deploy infrastructure + microservices + frontend (default)
#   -m, --mode partial   : Deploy only microservices + frontend (uses .env files)
# ===================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Default values
ACTION="start"
MODE=""

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
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

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
echo -e "${CYAN}=====================================${NC}"
echo -e "${MAGENTA}Action: $ACTION${NC}"
echo -e "${MAGENTA}Mode: $MODE${NC}"
echo ""

# Check if Podman is running
echo -e "${YELLOW}Checking Podman status...${NC}"
if ! podman info &>/dev/null; then
    echo -e "${RED}ERROR: Podman is not running. Please start Podman.${NC}"
    exit 1
fi
echo -e "${GREEN}Podman is running!${NC}"
echo ""

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
    echo -e "${CYAN}  FULL DEPLOYMENT${NC}"
    echo -e "${CYAN}  (Infrastructure + Microservices + Frontend)${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo ""

    # Stop and remove existing containers
    echo -e "${YELLOW}Stopping and removing existing containers...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_FULL" down -v
    echo ""

    # Build and start infrastructure services first
    echo -e "${YELLOW}Starting infrastructure services (MongoDB, Redis, Kafka)...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_FULL" up -d zookeeper kafka redis mongodb-auth mongodb-resources mongodb-availability mongodb-stockpile mongodb-reports mongodb-gateway
    echo ""

    # Wait for infrastructure to be ready
    echo -e "${YELLOW}Waiting for infrastructure services to be healthy (60 seconds)...${NC}"
    sleep 60
    echo ""

    # Build and start microservices
    echo -e "${YELLOW}Building and starting microservices...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_FULL" up -d --build api-gateway auth-service resources-service availability-service stockpile-service reports-service
    echo ""

    # Wait for microservices to be ready
    echo -e "${YELLOW}Waiting for microservices to be ready (30 seconds)...${NC}"
    sleep 30
    echo ""

    # Build and start frontend
    echo -e "${YELLOW}Building and starting frontend...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_FULL" up -d --build bookly-web
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
    echo -e "${CYAN}  PARTIAL DEPLOYMENT${NC}"
    echo -e "${CYAN}  (Microservices + Frontend only)${NC}"
    echo -e "${CYAN}  Using .env files for configuration${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo ""

    # Verify .env files exist
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

    # Stop existing microservices containers
    echo -e "${YELLOW}Stopping existing microservices containers...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_PARTIAL" down
    echo ""

    # Build and start microservices
    echo -e "${YELLOW}Building and starting microservices...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_PARTIAL" up -d --build --force-recreate api-gateway auth-service resources-service availability-service stockpile-service reports-service
    echo ""

    # Wait for microservices to be ready
    echo -e "${YELLOW}Waiting for microservices to be ready (30 seconds)...${NC}"
    sleep 30
    echo ""

    # Build and start frontend
    echo -e "${YELLOW}Building and starting frontend...${NC}"
    podman-compose -f "$DOCKER_COMPOSE_PARTIAL" up -d --build --force-recreate bookly-web
    echo ""

    # Show status
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${CYAN}  Deployment Status${NC}"
    echo -e "${CYAN}=====================================${NC}"
    podman-compose -f "$DOCKER_COMPOSE_PARTIAL" ps
    echo ""
fi

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
