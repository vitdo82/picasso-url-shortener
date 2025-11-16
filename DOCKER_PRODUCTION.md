# Docker Production Setup

## Overview

This project includes production-ready Dockerfiles and docker-compose configuration for deploying the URL shortener application.

## Architecture

- **Backend**: Go application running on port 8080
- **Frontend**: React application served by Nginx on port 80
- **Database**: PostgreSQL 15 on port 5432

## Files

### Dockerfiles
- `backend/Dockerfile` - Multi-stage build for Go backend
- `frontend/Dockerfile` - Multi-stage build for React frontend with Nginx

### Docker Compose
- `docker-compose.prod.yml` - Production docker-compose configuration

### Configuration
- `frontend/nginx.conf` - Nginx configuration for SPA routing
- `.env.production.example` - Example production environment variables

## Quick Start

### 1. Set Up Environment Variables

```bash
cp .env.production.example .env.production
# Edit .env.production with your production values
```

### 2. Build and Start Services

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### 3. Check Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### 4. View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 5. Stop Services

```bash
docker-compose -f docker-compose.prod.yml down
```

### 6. Stop and Remove Volumes

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Production Deployment

### Environment Variables

Create a `.env.production` file with:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=urlshortener

# Backend
PORT=8080
BASE_URL=https://yourdomain.com
SHORT_CODE_LENGTH=6

# Frontend
FRONTEND_PORT=80
VITE_API_URL=https://api.yourdomain.com
```

### Build Images

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend
```

### Run Migrations

Migrations run automatically when the backend container starts. If you need to run them manually:

```bash
docker-compose -f docker-compose.prod.yml exec backend ./migrate
```

### Health Checks

All services include health checks:

```bash
# Check backend health
curl http://localhost:8080/health

# Check frontend
curl http://localhost/
```

## Security Considerations

### 1. Database Password
- Use a strong, unique password for production
- Never commit `.env.production` to version control
- Use secrets management in production (AWS Secrets Manager, HashiCorp Vault, etc.)

### 2. Network Security
- Use reverse proxy (Nginx/Traefik) with TLS/SSL
- Configure firewall rules
- Limit exposed ports

### 3. Container Security
- Images run as non-root user
- Minimal base images (Alpine Linux)
- Regular security updates

### 4. Environment Variables
- Don't expose sensitive data in docker-compose files
- Use Docker secrets or environment files
- Rotate credentials regularly

## Scaling

### Backend Scaling

```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

Note: You'll need a load balancer (Nginx, Traefik) in front of multiple backend instances.

### Database

For production, consider:
- Managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Database connection pooling
- Read replicas for scaling reads

## Monitoring

### View Resource Usage

```bash
docker stats
```

### Logs

```bash
# Follow logs
docker-compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

## Troubleshooting

### Backend won't start
1. Check database connection: `docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d urlshortener`
2. Check backend logs: `docker-compose -f docker-compose.prod.yml logs backend`
3. Verify environment variables

### Frontend shows blank page
1. Check if build succeeded: `docker-compose -f docker-compose.prod.yml logs frontend`
2. Verify API URL in environment variables
3. Check browser console for errors

### Database connection issues
1. Verify database is healthy: `docker-compose -f docker-compose.prod.yml ps postgres`
2. Check database logs: `docker-compose -f docker-compose.prod.yml logs postgres`
3. Verify credentials in `.env.production`

## Production Checklist

- [ ] Set strong database password
- [ ] Configure BASE_URL correctly
- [ ] Set VITE_API_URL to production API URL
- [ ] Enable HTTPS/TLS (use reverse proxy)
- [ ] Set up monitoring and logging
- [ ] Configure backups for database
- [ ] Set up CI/CD pipeline
- [ ] Review security settings
- [ ] Test all endpoints
- [ ] Load testing
- [ ] Set up error tracking

## Makefile Commands

Add to Makefile:

```makefile
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

prod-restart:
	docker-compose -f docker-compose.prod.yml restart
```

