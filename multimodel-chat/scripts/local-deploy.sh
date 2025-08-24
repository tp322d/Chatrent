#!/bin/bash

# Local Development/Testing Deployment Script
# Use this for testing the Docker setup locally

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo -e "${GREEN}🐳 MultiModel Chat - Local Docker Deployment${NC}"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create local .env if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating local .env file..."
    cat > .env << EOF
# Local Development Environment
NODE_ENV=development
PORT=3101

# Local MongoDB (no auth for development)
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DB_NAME=multimodel_chat_dev

# JWT Secret
JWT_SECRET=local-development-jwt-secret-key-change-in-production

# CORS
CLIENT_URL=http://localhost

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
    print_status "Local .env file created"
fi

# Clean up existing containers (optional)
if [ "$1" = "clean" ]; then
    print_status "Cleaning up existing containers..."
    docker-compose -p multimodel-local down -v
    docker system prune -f
fi

# Build and start services
print_status "Building and starting services..."
docker-compose -p multimodel-local up -d --build

# Wait for services
print_status "Waiting for services to start..."
sleep 15

# Check health
print_status "Checking service health..."
if curl -f http://localhost:3101/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo ""
    echo "🌟 Access your application:"
    echo "   Frontend: http://localhost:3101"
    echo "   API Health: http://localhost:3101/health"
    echo "   API Docs: http://localhost:3101/api"
    echo ""
    echo "🛠️  Useful commands:"
    echo "   View logs: docker-compose -p multimodel-local logs -f"
    echo "   Stop: docker-compose -p multimodel-local down"
    echo "   Restart: docker-compose -p multimodel-local restart"
    echo "   Clean & rebuild: $0 clean"
else
    echo "❌ Application failed to start. Check logs:"
    docker-compose -p multimodel-local logs
fi