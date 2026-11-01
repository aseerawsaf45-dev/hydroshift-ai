.PHONY: up down logs migrate seed test test-api test-ml test-web e2e lint typecheck reset-demo

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec api alembic upgrade head

seed:
	docker compose exec api python -m scripts.seed

test: test-backend test-web

test-backend:
	docker compose exec api pytest tests/

test-web:
	cd apps/web && pnpm test

e2e:
	cd apps/web && pnpm exec playwright test

lint:
	cd apps/web && pnpm lint
	docker compose exec api ruff check .

typecheck:
	cd apps/web && pnpm typecheck
	docker compose exec api mypy .

reset-demo:
	docker compose down -v
	docker compose up --build -d
	docker compose exec api python -m scripts.seed
