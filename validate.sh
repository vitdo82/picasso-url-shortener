#!/bin/bash

# Validation script for URL Shortener project
set -e

echo "🔍 Validating URL Shortener Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo "1. Checking Docker..."
if docker ps &>/dev/null; then
    echo -e "${GREEN}✓ Docker is running${NC}"
else
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "   Please start Docker Desktop or Docker daemon"
    echo "   On macOS: Open Docker Desktop application"
    exit 1
fi

# Check Docker Compose
echo "2. Checking Docker Compose..."
if docker-compose version &>/dev/null; then
    echo -e "${GREEN}✓ Docker Compose is available${NC}"
else
    echo -e "${RED}✗ Docker Compose not found${NC}"
    exit 1
fi

# Check Go
echo "3. Checking Go..."
if command -v go &>/dev/null; then
    GO_VERSION=$(go version | awk '{print $3}')
    echo -e "${GREEN}✓ Go is installed: ${GO_VERSION}${NC}"
else
    echo -e "${RED}✗ Go is not installed${NC}"
    exit 1
fi

# Check backend compilation
echo "4. Checking backend compilation..."
cd backend
if go build ./cmd/server && go build ./cmd/migrate; then
    echo -e "${GREEN}✓ Backend compiles successfully${NC}"
    rm -f server migrate  # Clean up binaries
else
    echo -e "${RED}✗ Backend compilation failed${NC}"
    exit 1
fi
cd ..

# Check required files
echo "5. Checking required files..."
REQUIRED_FILES=(
    "docker-compose.yml"
    "Makefile"
    "backend/migrations/001_create_urls_table.sql"
    "backend/cmd/server/main.go"
    "backend/cmd/migrate/main.go"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ Found: $file${NC}"
    else
        echo -e "${RED}✗ Missing: $file${NC}"
        exit 1
    fi
done

# Check database connection (if Docker is running)
echo "6. Checking database setup..."
if docker-compose ps postgres 2>/dev/null | grep -q "Up"; then
    echo -e "${GREEN}✓ PostgreSQL container is running${NC}"
    
    # Wait a bit and check if we can connect
    sleep 2
    if docker-compose exec -T postgres pg_isready -U postgres &>/dev/null; then
        echo -e "${GREEN}✓ Database is ready to accept connections${NC}"
    else
        echo -e "${YELLOW}⚠ Database container is running but not ready yet${NC}"
    fi
else
    echo -e "${YELLOW}⚠ PostgreSQL container is not running${NC}"
    echo "   Run 'make db-up' to start it"
fi

echo ""
echo -e "${GREEN}✅ Validation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. If database is not running: make db-up"
echo "  2. Run migrations: make migrate"
echo "  3. Start backend: make run-backend"
echo "  4. Start frontend: make run-frontend"

