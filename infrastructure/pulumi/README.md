# Pulumi Infrastructure for AWS Lightsail Containers

This directory contains the Pulumi infrastructure code for deploying the URL Shortener application to AWS Lightsail Containers.

## Prerequisites

1. **Install Pulumi CLI**
   ```bash
   curl -fsSL https://get.pulumi.com | sh
   ```

2. **Install Node.js** (v18 or higher)

3. **Configure AWS Credentials**
   ```bash
   aws configure
   ```
   Or set environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=us-east-1
   ```

4. **Install Dependencies**
   ```bash
   cd infrastructure/pulumi
   npm install
   ```

## Setup

### 1. Initialize Pulumi Stack

```bash
cd infrastructure/pulumi
pulumi stack init production
```

### 2. Configure Stack

Edit `Pulumi.production.yaml` or set configuration:

```bash
# Set configuration
pulumi config set url-shortener:projectName url-shortener
pulumi config set url-shortener:environment production
pulumi config set url-shortener:region us-east-1
pulumi config set url-shortener:dbName urlshortener
pulumi config set url-shortener:dbUser postgres
pulumi config set url-shortener:baseUrl https://yourdomain.com

# Set secret (database password)
pulumi config set --secret url-shortener:dbPassword your_secure_password
```

### 3. Build and Push Docker Images

Before deploying, you need to build and push your Docker images to a container registry:

#### Option A: AWS ECR (Recommended)

```bash
# Create ECR repositories
aws ecr create-repository --repository-name url-shortener-backend
aws ecr create-repository --repository-name url-shortener-frontend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd ../../backend
docker build -t url-shortener-backend:latest .
docker tag url-shortener-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/url-shortener-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/url-shortener-backend:latest

# Build and push frontend
cd ../frontend
docker build -t url-shortener-frontend:latest .
docker tag url-shortener-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/url-shortener-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/url-shortener-frontend:latest
```

#### Option B: Docker Hub

```bash
# Build and push to Docker Hub
docker build -t yourusername/url-shortener-backend:latest ./backend
docker push yourusername/url-shortener-backend:latest

docker build -t yourusername/url-shortener-frontend:latest ./frontend
docker push yourusername/url-shortener-frontend:latest
```

Then update the image names in Pulumi config:
```bash
pulumi config set url-shortener:backendImage yourusername/url-shortener-backend:latest
pulumi config set url-shortener:frontendImage yourusername/url-shortener-frontend:latest
```

## Deployment

### Preview Changes

```bash
pulumi preview
```

### Deploy Infrastructure

```bash
pulumi up
```

This will create:
- Lightsail container service for backend
- Lightsail container service for frontend
- Lightsail PostgreSQL database
- Container deployments

### View Outputs

```bash
pulumi stack output
```

Outputs include:
- `backendUrl` - Backend service URL
- `frontendUrl` - Frontend service URL
- `databaseEndpoint` - Database endpoint
- `databasePort` - Database port

### Update Deployment

After pushing new Docker images:

```bash
# Update image references if needed
pulumi config set url-shortener:backendImage new-image:tag
pulumi config set url-shortener:frontendImage new-image:tag

# Deploy updates
pulumi up
```

## Destroy Infrastructure

⚠️ **Warning**: This will delete all resources!

```bash
pulumi destroy
```

## Configuration Reference

| Config Key | Description | Default |
|------------|-------------|---------|
| `projectName` | Project name prefix | `url-shortener` |
| `environment` | Environment name | `production` |
| `region` | AWS region | `us-east-1` |
| `dbName` | Database name | `urlshortener` |
| `dbUser` | Database username | `postgres` |
| `dbPassword` | Database password (secret) | *required* |
| `baseUrl` | Base URL for the application | `https://yourdomain.com` |
| `backendImage` | Backend Docker image | `url-shortener-backend:latest` |
| `frontendImage` | Frontend Docker image | `url-shortener-frontend:latest` |

## Resource Sizing

### Container Services
- **Power**: `nano` (0.25 vCPU, 0.5GB RAM) - suitable for small workloads
- Available sizes: `nano`, `micro`, `small`, `medium`, `large`, `xlarge`
- **Scale**: Number of container instances (1 = single instance)

### Database
- **Bundle**: `micro_1_0` (1 vCPU, 1GB RAM, 20GB storage)
- Available bundles: `micro_1_0`, `small_1_0`, `medium_1_0`, `large_1_0`

To change sizes, edit `index.ts`:
```typescript
power: "small", // Change container power
bundleId: "small_1_0", // Change database bundle
```

## Troubleshooting

### Check Stack Status
```bash
pulumi stack ls
```

### View Stack Resources
```bash
pulumi stack --show-urns
```

### Check Logs
```bash
# View Pulumi logs
pulumi logs

# View AWS Lightsail logs (via AWS Console or CLI)
aws lightsail get-container-service-deployments --service-name <service-name>
```

### Common Issues

1. **Image not found**: Ensure Docker images are pushed to the registry
2. **Database connection**: Check security groups and network settings
3. **Health check failures**: Verify health check paths in container services

## Cost Estimation

Approximate monthly costs (us-east-1):
- Container Service (nano): ~$7/month per service
- Database (micro): ~$15/month
- **Total**: ~$29/month for basic setup

Costs vary by region and usage. Check [AWS Lightsail Pricing](https://aws.amazon.com/lightsail/pricing/) for current rates.

## Next Steps

1. Set up custom domain (Route 53 or Lightsail DNS)
2. Configure SSL/TLS certificates
3. Set up monitoring and alerts
4. Configure backups for database
5. Set up CI/CD pipeline

