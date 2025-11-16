# AWS Lightsail Containers Deployment Guide

## Overview

This guide explains how to deploy the URL Shortener application to AWS Lightsail Containers using Pulumi infrastructure-as-code.

## Architecture

```
┌─────────────────────────────────────┐
│   AWS Lightsail Container Service  │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Frontend   │  │   Backend   │ │
│  │   (Nginx)    │  │   (Go API)  │ │
│  │   Port 80    │  │  Port 8080  │ │
│  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────┘
              │
              │
┌─────────────▼─────────────┐
│  Lightsail PostgreSQL DB   │
│  (Managed Database)        │
└────────────────────────────┘
```

## Prerequisites

1. **AWS Account** with Lightsail access
2. **AWS CLI** configured with credentials
3. **Pulumi CLI** installed
4. **Docker** for building images
5. **Node.js** (v18+) for Pulumi

## Quick Start

### 1. Install Prerequisites

```bash
# Install Pulumi
curl -fsSL https://get.pulumi.com | sh

# Install AWS CLI (if not installed)
# macOS: brew install awscli
# Linux: See https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure
```

### 2. Build and Push Docker Images

#### Using AWS ECR (Recommended)

```bash
# Set variables
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Create ECR repositories
aws ecr create-repository --repository-name url-shortener-backend --region $REGION
aws ecr create-repository --repository-name url-shortener-frontend --region $REGION

# Login to ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push backend
cd backend
docker build -t url-shortener-backend:latest .
docker tag url-shortener-backend:latest $ECR_REGISTRY/url-shortener-backend:latest
docker push $ECR_REGISTRY/url-shortener-backend:latest

# Build and push frontend
cd ../frontend
docker build -t url-shortener-frontend:latest .
docker tag url-shortener-frontend:latest $ECR_REGISTRY/url-shortener-frontend:latest
docker push $ECR_REGISTRY/url-shortener-frontend:latest
```

### 3. Configure Pulumi

```bash
cd infrastructure/pulumi

# Install dependencies
npm install

# Initialize stack
pulumi stack init production

# Set configuration
pulumi config set url-shortener:projectName url-shortener
pulumi config set url-shortener:environment production
pulumi config set url-shortener:region us-east-1
pulumi config set url-shortener:baseUrl https://yourdomain.com
pulumi config set url-shortener:backendImage ${ECR_REGISTRY}/url-shortener-backend:latest
pulumi config set url-shortener:frontendImage ${ECR_REGISTRY}/url-shortener-frontend:latest

# Set database password (secret)
pulumi config set --secret url-shortener:dbPassword your_secure_password
```

### 4. Deploy

```bash
# Preview changes
pulumi preview

# Deploy
pulumi up

# Or use the deployment script
./deploy.sh
```

### 5. Get Service URLs

```bash
pulumi stack output
```

## Using Makefile Commands

From the project root:

```bash
# Install Pulumi dependencies
make infra-install

# Preview infrastructure
make infra-preview

# Deploy to AWS
make infra-up

# View outputs
make infra-outputs

# Destroy infrastructure
make infra-down
```

## Configuration

### Required Configuration

- `dbPassword` - Database password (set as secret)

### Optional Configuration

Edit `Pulumi.production.yaml` or use `pulumi config set`:

```bash
pulumi config set url-shortener:projectName my-project
pulumi config set url-shortener:environment staging
pulumi config set url-shortener:region us-west-2
pulumi config set url-shortener:baseUrl https://example.com
```

## Resource Sizing

### Container Services

Edit `index.ts` to change container power:

```typescript
power: "nano",  // Options: nano, micro, small, medium, large, xlarge
scale: 1,       // Number of instances
```

### Database

Edit `index.ts` to change database bundle:

```typescript
bundleId: "micro_1_0",  // Options: micro_1_0, small_1_0, medium_1_0, large_1_0
```

## Updating Deployment

### Update Container Images

1. Build and push new images:
   ```bash
   # Build and push updated images
   docker build -t url-shortener-backend:new-tag ./backend
   docker push $ECR_REGISTRY/url-shortener-backend:new-tag
   ```

2. Update Pulumi config:
   ```bash
   pulumi config set url-shortener:backendImage $ECR_REGISTRY/url-shortener-backend:new-tag
   ```

3. Deploy:
   ```bash
   pulumi up
   ```

## Monitoring

### View Logs

```bash
# Via AWS Console
# Navigate to Lightsail → Container Services → Your Service → Logs

# Via AWS CLI
aws lightsail get-container-service-deployments \
  --service-name url-shortener-backend-production
```

### Health Checks

Health checks are automatically configured:
- Backend: `/health` endpoint
- Frontend: `/` endpoint

## Cost Optimization

### Current Setup (Estimated Monthly Cost)

- Backend Container (nano): ~$7/month
- Frontend Container (nano): ~$7/month
- Database (micro): ~$15/month
- **Total**: ~$29/month

### Scaling Options

1. **Vertical Scaling**: Increase container power
2. **Horizontal Scaling**: Increase scale count
3. **Database Scaling**: Upgrade database bundle

## Security Best Practices

1. **Database Password**: Use strong, unique passwords
2. **Secrets Management**: Store secrets in Pulumi config (encrypted)
3. **Network Security**: Database is not publicly accessible
4. **SSL/TLS**: Configure custom domain with SSL certificate
5. **IAM Roles**: Use IAM roles instead of access keys when possible

## Troubleshooting

### Container Won't Start

1. Check logs in AWS Lightsail Console
2. Verify image exists in registry
3. Check environment variables
4. Verify health check configuration

### Database Connection Issues

1. Verify database endpoint and port
2. Check security groups (database should be accessible from containers)
3. Verify credentials
4. Check SSL mode configuration

### Health Check Failures

1. Verify health check paths are correct
2. Check container logs
3. Ensure ports are correctly configured
4. Verify container is listening on expected port

## Custom Domain Setup

1. **Get Service URLs**:
   ```bash
   pulumi stack output frontendUrl
   ```

2. **Configure DNS**:
   - Add CNAME record pointing to Lightsail service URL
   - Or use Lightsail DNS zones

3. **SSL Certificate**:
   - Use AWS Certificate Manager (ACM)
   - Or Lightsail SSL certificates

## Backup and Recovery

### Database Backups

Lightsail automatically creates daily backups. To restore:

```bash
# Via AWS Console: Lightsail → Databases → Your DB → Snapshots
# Or use AWS CLI
aws lightsail create-relational-database-snapshot \
  --relational-database-name url-shortener-db-production \
  --relational-database-snapshot-name backup-$(date +%Y%m%d)
```

## Cleanup

To destroy all resources:

```bash
cd infrastructure/pulumi
pulumi destroy
```

⚠️ **Warning**: This will delete all resources including the database!

## Next Steps

1. Set up custom domain
2. Configure SSL/TLS certificates
3. Set up monitoring and alerts (CloudWatch)
4. Configure automated backups
5. Set up CI/CD pipeline
6. Implement logging and monitoring

