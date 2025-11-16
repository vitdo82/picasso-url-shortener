# Picasso URL Shortener

A full-stack URL shortener application built with Go backend and React frontend.

## Project Structure

This is a monorepo containing both backend and frontend applications:

```
url-shortener/
├── backend/              # Go backend service
│   ├── cmd/
│   │   ├── server/      # Main application entry point
│   │   └── migrate/     # Database migration tool
│   ├── internal/        # Internal application code
│   │   ├── api/         # HTTP handlers
│   │   ├── db/          # Database layer
│   │   ├── models/      # Data models
│   │   └── service/     # Business logic
│   ├── migrations/      # Database migrations
│   └── go.mod
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── docker-compose.yml   # Docker Compose configuration
├── Makefile            # Development commands
├── .gitignore
└── README.md
```

## Features

- Shorten long URLs to short, memorable links
- Redirect short URLs to original URLs
- Track click statistics
- Modern, responsive UI
- RESTful API

## Prerequisites

- Go 1.21 or higher
- Node.js 18 or higher
- Docker and Docker Compose (for database) OR PostgreSQL 12 or higher
- npm or yarn

## Tech Stack

### Backend
- **Gin** - High-performance HTTP web framework
- **pgx/v5** - PostgreSQL driver
- **godotenv** - Environment variable management

See [backend/FRAMEWORK.md](backend/FRAMEWORK.md) for framework details and alternatives.

## Getting Started

### Database Setup with Docker Compose

The easiest way to get started is using Docker Compose for the database:

**Note:** Make sure Docker Desktop (macOS/Windows) or Docker daemon (Linux) is running. You don't need to configure `DOCKER_HOST` - Docker uses defaults automatically.

1. Start the PostgreSQL database:
```bash
docker-compose up -d
```

This will start a PostgreSQL 15 container with:
- Database: `urlshortener`
- User: `postgres`
- Password: `postgres`
- Port: `5432`

2. Verify the database is running:
```bash
docker-compose ps
```

3. To stop the database:
```bash
docker-compose down
```

4. To stop and remove all data:
```bash
docker-compose down -v
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
go mod download
```

3. Set up environment variables:
```bash
# Copy the example env file (if using Docker Compose, these defaults work)
cp ../.env.example ../.env
# Or create .env manually with database credentials
```

The default `.env.example` is configured to work with the Docker Compose setup.

4. Run database migrations:
```bash
go run cmd/migrate/main.go
```

5. Start the server:
```bash
go run cmd/server/main.go
```

The backend API will be available at `http://localhost:8080`

### Alternative: Using Local PostgreSQL

If you prefer to use a local PostgreSQL installation:

1. Create the database:
```bash
createdb urlshortener
```

2. Update your `.env` file with your local PostgreSQL credentials

3. Continue with steps 4-5 from Backend Setup above

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

- `POST /api/shorten` - Create a short URL
- `GET /api/:shortCode` - Redirect to original URL
- `GET /api/stats/:shortCode` - Get statistics for a short URL

## Development

### Quick Start with Make

For convenience, use the Makefile commands:

```bash
# Complete setup (start DB, run migrations)
make setup

# Start database
make db-up

# Run migrations
make migrate

# Run backend
make run-backend

# Run frontend
make run-frontend

# View database logs
make db-logs

# Stop database
make db-down

# Reset database (removes all data)
make db-reset
```

### Running Tests

Backend:
```bash
cd backend
go test ./...
```

Frontend:
```bash
cd frontend
npm test
```

## License

MIT

