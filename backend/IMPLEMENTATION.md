# Backend Implementation Summary

## Architecture

The backend follows a clean architecture pattern with clear separation of concerns:

```
cmd/
  ├── server/     # Application entry point
  └── migrate/    # Database migration tool

internal/
  ├── api/        # HTTP handlers and routes
  ├── db/         # Database connection and repository layer
  ├── models/     # Data models and DTOs
  └── service/    # Business logic layer
```

## Components

### 1. Models (`internal/models/url.go`)
- `URL` - Database model for shortened URLs
- `ShortenRequest` - Request DTO for creating short URLs
- `ShortenResponse` - Response DTO after creating short URL
- `StatsResponse` - Response DTO for URL statistics

### 2. Database Layer (`internal/db/`)
- **database.go**: PostgreSQL connection pool using pgx/v5
- **repository.go**: Repository pattern for database operations
  - `CreateShortURL()` - Create a new short URL
  - `GetURLByShortCode()` - Retrieve URL by short code
  - `IncrementClickCount()` - Track clicks
  - `ShortCodeExists()` - Check if short code exists
  - `GetStats()` - Get URL statistics

### 3. Service Layer (`internal/service/url_service.go`)
- **URLService**: Business logic for URL shortening
  - `ShortenURL()` - Creates short URLs with validation
  - `GetOriginalURL()` - Retrieves original URL and tracks clicks
  - `GetStats()` - Returns statistics for a short URL
  - `generateShortCode()` - Generates unique random short codes
  - `randomString()` - Helper for generating random strings

### 4. API Layer (`internal/api/`)
- **handlers.go**: HTTP request handlers
  - `ShortenURL()` - POST /api/shorten
  - `RedirectURL()` - GET /:shortCode
  - `GetStats()` - GET /api/stats/:shortCode
- **routes.go**: Route configuration

### 5. Database Migration (`migrations/001_create_urls_table.sql`)
- Creates `urls` table with:
  - `id` (BIGSERIAL PRIMARY KEY)
  - `original_url` (TEXT)
  - `short_code` (VARCHAR(20) UNIQUE)
  - `click_count` (BIGINT)
  - `created_at` (TIMESTAMP)
  - `expires_at` (TIMESTAMP, nullable)
- Indexes on `short_code` and `created_at`

## API Endpoints

### POST /api/shorten
Creates a new short URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/url",
  "short_code": "optional",  // Optional custom short code
  "expires_at": "2024-12-31T23:59:59Z"  // Optional expiration
}
```

**Response:**
```json
{
  "short_code": "abc123",
  "short_url": "http://localhost:8080/abc123",
  "original_url": "https://example.com/very/long/url",
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": null
}
```

### GET /:shortCode
Redirects to the original URL and increments click count.

**Response:** HTTP 301 Redirect

### GET /api/stats/:shortCode
Returns statistics for a short URL.

**Response:**
```json
{
  "short_code": "abc123",
  "original_url": "https://example.com/very/long/url",
  "click_count": 42,
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": null
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "URL Shortener API is running"
}
```

## Features

✅ URL shortening with auto-generated or custom short codes  
✅ URL redirection with click tracking  
✅ Statistics tracking (click count)  
✅ Optional expiration dates  
✅ URL validation and normalization  
✅ CORS support for frontend integration  
✅ Database connection pooling  
✅ Error handling and validation  

## Environment Variables

Set these in `.env` file:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=urlshortener
DB_SSLMODE=disable
BASE_URL=http://localhost:8080
SHORT_CODE_LENGTH=6
```

## Running the Application

1. **Set up database:**
   ```bash
   # Create PostgreSQL database
   createdb urlshortener
   ```

2. **Run migrations:**
   ```bash
   cd backend
   go run cmd/migrate/main.go
   ```

3. **Start server:**
   ```bash
   go run cmd/server/main.go
   ```

The API will be available at `http://localhost:8080`

