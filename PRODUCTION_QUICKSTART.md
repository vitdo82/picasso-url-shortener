# Production Quick Start Guide

## 🚀 Deploy to Production

### Step 1: Create Environment File

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your production values:

```env
DB_PASSWORD=your_secure_password_here
BASE_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### Step 2: Build and Start

```bash
# Build images
make prod-build

# Start services
make prod-up
```

Or use docker-compose directly:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Step 3: Verify

```bash
# Check status
make prod-ps

# View logs
make prod-logs

# Test endpoints
curl http://localhost:8080/health
curl http://localhost/
```

## 📋 Available Commands

```bash
make prod-build    # Build production images
make prod-up       # Start production containers
make prod-down     # Stop production containers
make prod-logs     # View logs
make prod-restart  # Restart containers
make prod-ps       # Show container status
```

## 🔧 Configuration

### Ports
- Frontend: `80` (configurable via `FRONTEND_PORT`)
- Backend: `8080` (configurable via `BACKEND_PORT`)
- Database: Internal only (not exposed)

### Environment Variables

See `.env.production.example` for all available options.

## 🛑 Stop Services

```bash
make prod-down
```

To remove volumes (⚠️ deletes data):

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## 📝 Notes

- Migrations run automatically on backend startup
- All services include health checks
- Containers restart automatically on failure
- Database data persists in Docker volumes

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change default database password
- [ ] Use HTTPS/TLS (configure reverse proxy)
- [ ] Set secure BASE_URL
- [ ] Review firewall rules
- [ ] Enable monitoring
- [ ] Set up backups
- [ ] Review container security settings

