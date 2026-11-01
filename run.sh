#!/usr/bin/env bash
# ==============================================================================
# SWOT Khulna Platform - Automated Docker Startup Script
# ==============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

print_header() {
    echo -e "${CYAN}${BOLD}"
    echo "======================================================================"
    echo "  SWOT Khulna - Estuarine Salinity & Crop Rotation DSS Platform"
    echo "======================================================================"
    echo -e "${NC}"
}

usage() {
    echo "Usage: ./run.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  (no args)    Build images, start all services, run migrations & seed"
    echo "  --down       Stop and remove all project containers"
    echo "  --restart    Restart all services"
    echo "  --logs       Stream logs from all services"
    echo "  --status     Show status of all services"
    echo "  --test       Run the full automated test suite inside Docker"
    echo "  --seed       Run database migrations and seed real & demo datasets"
    echo "  --help       Show this help message"
    echo ""
    exit 0
}

check_prerequisites() {
    echo -e "${YELLOW}--> Checking prerequisites...${NC}"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[ERROR] Docker is not installed or not in PATH.${NC}"
        echo "Please install Docker from https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        echo -e "${RED}[ERROR] Docker Compose plugin is not available.${NC}"
        echo "Please install Docker Compose V2: https://docs.docker.com/compose/install/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo -e "${RED}[ERROR] Docker daemon is not running.${NC}"
        echo "Please start Docker Desktop or the dockerd service and try again."
        exit 1
    fi

    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}[INFO] .env file not found. Creating from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}[OK] .env created.${NC}"
    fi
    echo -e "${GREEN}[OK] Prerequisites verified.${NC}"
}

run_migrations_and_seed() {
    echo -e "\n${YELLOW}--> Running database migrations (Alembic)...${NC}"
    docker compose exec -T api alembic upgrade head
    echo -e "${GREEN}[OK] Database schema up to date.${NC}"

    echo -e "\n${YELLOW}--> Seeding institutional, agronomic, and ground-truth data...${NC}"
    docker compose exec -T api python -m scripts.seed || true
    docker compose exec -T api python -m scripts.seed_crop_data || true
    docker compose exec -T api python -m scripts.ingest_ground_truth || true
    docker compose exec -T api python -m scripts.populate_database || true
    echo -e "${GREEN}[OK] Database successfully populated.${NC}"
}

wait_for_healthy() {
    local service="$1"
    local max_retries="${2:-30}"
    echo -ne "${YELLOW}--> Waiting for ${service} to become healthy...${NC}"
    local count=0
    while [ $count -lt $max_retries ]; do
        local status
        status=$(docker compose ps "$service" --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || true)
        if [ "$status" = "healthy" ]; then
            echo -e " ${GREEN}healthy!${NC}"
            return 0
        fi
        sleep 2
        count=$((count + 1))
        echo -ne "."
    done
    echo -e "\n${YELLOW}[WARN] Service ${service} did not report healthy within $((max_retries * 2))s. Proceeding...${NC}"
}

start_stack() {
    check_prerequisites

    echo -e "\n${YELLOW}--> Building and starting services with Docker Compose...${NC}"
    docker compose up -d --build

    wait_for_healthy db 25
    wait_for_healthy redis 15

    run_migrations_and_seed

    echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
    echo -e "${GREEN}${BOLD}  SWOT Khulna Platform is live and ready!${NC}"
    echo -e "${GREEN}${BOLD}======================================================================${NC}"
    echo -e "  ${BOLD}Web UI:${NC}         ${CYAN}http://localhost:3000${NC}"
    echo -e "  ${BOLD}API Backend:${NC}    ${CYAN}http://localhost:8000${NC}"
    echo -e "  ${BOLD}API Docs (SWAG):${NC}${CYAN}http://localhost:8000/docs${NC}"
    echo -e "  ${BOLD}Database:${NC}       ${CYAN}localhost:5433 (PostGIS)${NC}"
    echo -e "  ${BOLD}Redis Cache:${NC}    ${CYAN}localhost:6379${NC}"
    echo -e "----------------------------------------------------------------------"
    echo -e "  ${BOLD}Useful commands:${NC}"
    echo -e "    View live logs:      ${CYAN}./run.sh --logs${NC}   (or docker compose logs -f)"
    echo -e "    Check status:        ${CYAN}./run.sh --status${NC} (or docker compose ps)"
    echo -e "    Run backend tests:   ${CYAN}./run.sh --test${NC}"
    echo -e "    Stop all services:   ${CYAN}./run.sh --down${NC}"
    echo -e "======================================================================\n"
}

# Parse CLI arguments
case "${1:-}" in
    --down)
        print_header
        echo -e "${YELLOW}--> Stopping and removing all project containers...${NC}"
        docker compose down
        echo -e "${GREEN}[OK] All services stopped.${NC}"
        ;;
    --restart)
        print_header
        echo -e "${YELLOW}--> Restarting services...${NC}"
        docker compose restart
        docker compose ps
        ;;
    --logs)
        docker compose logs -f
        ;;
    --status)
        print_header
        docker compose ps
        ;;
    --test)
        print_header
        echo -e "${YELLOW}--> Running 44-test automated suite inside Docker API container...${NC}"
        docker compose exec api pytest tests/ -v
        ;;
    --seed)
        print_header
        run_migrations_and_seed
        ;;
    --help|-h)
        print_header
        usage
        ;;
    "")
        print_header
        start_stack
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}\n"
        usage
        ;;
esac

