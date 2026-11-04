# ==============================================================================
# HydroShift AI Platform - Automated Docker Startup Script (PowerShell)
# ==============================================================================
param (
    [string]$Option = ""
)

$ErrorActionPreference = "Continue"

function Print-Header {
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  HydroShift AI - Estuarine Salinity & Crop Rotation DSS Platform" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Cyan
}

function Show-Usage {
    Write-Host "Usage: .\run.ps1 [-Option <option>]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  (no args)    Build images, start all services, run migrations & seed"
    Write-Host "  --down       Stop and remove all project containers"
    Write-Host "  --restart    Restart all services"
    Write-Host "  --logs       Stream logs from all services"
    Write-Host "  --status     Show status of all services"
    Write-Host "  --test       Run the full automated test suite inside Docker"
    Write-Host "  --seed       Run database migrations and seed datasets"
    Write-Host "  --help       Show this help message"
}

Print-Header

if ($Option -eq "--down") {
    Write-Host "--> Stopping and removing all project containers..." -ForegroundColor Yellow
    docker compose down
    Write-Host "[OK] All services stopped." -ForegroundColor Green
    exit 0
}
elseif ($Option -eq "--restart") {
    Write-Host "--> Restarting services..." -ForegroundColor Yellow
    docker compose restart
    docker compose ps
    exit 0
}
elseif ($Option -eq "--logs") {
    docker compose logs -f
    exit 0
}
elseif ($Option -eq "--status") {
    docker compose ps
    exit 0
}
elseif ($Option -eq "--test") {
    Write-Host "--> Running test suite inside Docker API container..." -ForegroundColor Yellow
    docker compose exec api pytest tests/ -v
    exit 0
}
elseif ($Option -eq "--seed") {
    Write-Host "--> Running database migrations & seeds..." -ForegroundColor Yellow
    docker compose exec api alembic upgrade head
    docker compose exec api python -m scripts.seed
    docker compose exec api python -m scripts.seed_crop_data
    docker compose exec api python -m scripts.ingest_ground_truth
    docker compose exec api python -m scripts.populate_database
    Write-Host "[OK] Seeding complete." -ForegroundColor Green
    exit 0
}
elseif ($Option -eq "--help" -or $Option -eq "-h") {
    Show-Usage
    exit 0
}

# Default: start everything
if (-not (Test-Path ".env")) {
    Write-Host "--> .env not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] .env created." -ForegroundColor Green
}

Write-Host "--> Building and starting services with Docker Compose..." -ForegroundColor Yellow
docker compose up -d --build

Write-Host "--> Waiting 10s for database & redis to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "--> Running database migrations..." -ForegroundColor Yellow
docker compose exec api alembic upgrade head

Write-Host "--> Seeding institutional and agronomic data..." -ForegroundColor Yellow
docker compose exec api python -m scripts.seed
docker compose exec api python -m scripts.seed_crop_data
docker compose exec api python -m scripts.ingest_ground_truth
docker compose exec api python -m scripts.populate_database

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  HydroShift AI Platform is live and ready!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  Web UI:          http://localhost:3000" -ForegroundColor Cyan
Write-Host "  API Backend:     http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs (SWAG): http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  Database:        localhost:5433 (PostGIS)" -ForegroundColor Cyan
Write-Host "  Redis Cache:     localhost:6379" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------"
Write-Host "  Useful commands:"
Write-Host "    View live logs:      .\run.ps1 -Option --logs"
Write-Host "    Check status:        .\run.ps1 -Option --status"
Write-Host "    Run backend tests:   .\run.ps1 -Option --test"
Write-Host "    Stop all services:   .\run.ps1 -Option --down"
Write-Host "======================================================================"

