.PHONY: help db-up db-down db-logs migrate run-backend install-frontend run-frontend setup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

db-up: ## Start PostgreSQL database with Docker Compose
	docker-compose up -d
	@echo "Waiting for database to be ready..."
	@sleep 3
	@echo "Database is ready!"

db-down: ## Stop PostgreSQL database
	docker-compose down

db-logs: ## View database logs
	docker-compose logs -f postgres

db-reset: ## Stop database and remove all data
	docker-compose down -v
	@echo "Database data removed. Run 'make db-up' to start fresh."

migrate: ## Run database migrations
	cd backend && go run cmd/migrate/main.go

run-backend: ## Run the backend server
	cd backend && go run cmd/server/main.go

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

run-frontend: install-frontend ## Run the frontend development server
	cd frontend && npm run dev

setup: ## Initial setup: start DB, run migrations
	@echo "Setting up development environment..."
	@make db-up
	@sleep 5
	@make migrate
	@echo "Setup complete! You can now run 'make run-backend' and 'make run-frontend'"

# Production Docker commands
prod-build: ## Build production Docker images
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production containers
	docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

prod-down: ## Stop production containers
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## View production logs
	docker-compose -f docker-compose.prod.yml logs -f

prod-restart: ## Restart production containers
	docker-compose -f docker-compose.prod.yml restart

prod-ps: ## Show production container status
	docker-compose -f docker-compose.prod.yml ps

# Infrastructure (Pulumi)
infra-install: ## Install Pulumi dependencies
	cd infrastructure/pulumi && npm install

infra-preview: ## Preview infrastructure changes
	cd infrastructure/pulumi && pulumi preview

infra-up: ## Deploy infrastructure to AWS Lightsail
	cd infrastructure/pulumi && pulumi up

infra-down: ## Destroy infrastructure
	cd infrastructure/pulumi && pulumi destroy

infra-outputs: ## Show infrastructure outputs
	cd infrastructure/pulumi && pulumi stack output

