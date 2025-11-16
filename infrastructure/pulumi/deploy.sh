#!/bin/bash

# Deployment script for AWS Lightsail Containers
set -e

echo "🚀 Deploying URL Shortener to AWS Lightsail Containers..."

# Check prerequisites
if ! command -v pulumi &> /dev/null; then
    echo "❌ Pulumi CLI not found. Install it from https://www.pulumi.com/docs/get-started/install/"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install it from https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run 'aws configure'"
    exit 1
fi

cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if stack exists
if ! pulumi stack ls | grep -q "production"; then
    echo "📝 Initializing Pulumi stack..."
    pulumi stack init production
fi

# Select stack
pulumi stack select production

# Check if required config is set
if ! pulumi config get url-shortener:dbPassword &> /dev/null; then
    echo "⚠️  Database password not set. Setting it now..."
    read -sp "Enter database password: " DB_PASSWORD
    echo
    pulumi config set --secret url-shortener:dbPassword "$DB_PASSWORD"
fi

# Preview changes
echo "🔍 Previewing changes..."
pulumi preview

# Ask for confirmation
read -p "Continue with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy
echo "🚀 Deploying infrastructure..."
pulumi up --yes

# Show outputs
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service URLs:"
pulumi stack output

echo ""
echo "🔗 Access your application:"
echo "   Frontend: $(pulumi stack output frontendUrl)"
echo "   Backend:  $(pulumi stack output backendUrl)"

