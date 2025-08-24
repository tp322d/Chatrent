#!/bin/bash

# MultiModel Chat Deployment Script
# This script helps deploy the application to a remote server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="multimodel-chat"
COMPOSE_PROJECT_NAME="multimodel"
BACKUP_DIR="/var/backups/multimodel"

echo -e "${GREEN}🚀 MultiModel Chat Deployment Script${NC}"
echo "=================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. Consider using a non-root user with sudo privileges."
    fi
}

# Install Docker and Docker Compose if not present
install_docker() {
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $USER
        rm get-docker.sh
    else
        print_status "Docker is already installed"
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    else
        print_status "Docker Compose is already installed"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating application directories..."
    mkdir -p /var/lib/multimodel/{mongodb,redis,uploads}
    mkdir -p /var/log/multimodel/{nginx,app}
    mkdir -p $BACKUP_DIR
    chmod 755 /var/lib/multimodel
    chmod 755 /var/log/multimodel
}

# Backup existing data
backup_data() {
    if [ -d "/var/lib/multimodel/mongodb" ] && [ "$(ls -A /var/lib/multimodel/mongodb)" ]; then
        print_status "Creating backup of existing data..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        tar -czf "$BACKUP_DIR/multimodel_backup_$timestamp.tar.gz" -C /var/lib/multimodel .
        print_status "Backup created: $BACKUP_DIR/multimodel_backup_$timestamp.tar.gz"
    fi
}

# Setup SSL certificates (Let's Encrypt)
setup_ssl() {
    if [ ! -z "$1" ]; then
        DOMAIN=$1
        print_status "Setting up SSL certificate for domain: $DOMAIN"
        
        # Install certbot if not present
        if ! command -v certbot &> /dev/null; then
            print_status "Installing certbot..."
            apt-get update
            apt-get install -y certbot
        fi
        
        # Generate certificate
        print_status "Generating SSL certificate..."
        certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Set up auto-renewal
        echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    else
        print_warning "No domain provided. SSL setup skipped."
        print_warning "Run: ./deploy.sh ssl your-domain.com to set up SSL later"
    fi
}

# Deploy the application
deploy_app() {
    print_status "Deploying MultiModel Chat application..."
    
    # Pull latest images
    docker-compose -p $COMPOSE_PROJECT_NAME pull
    
    # Build the application
    print_status "Building application..."
    docker-compose -p $COMPOSE_PROJECT_NAME build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose -p $COMPOSE_PROJECT_NAME -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if docker-compose -p $COMPOSE_PROJECT_NAME ps | grep -q "Up"; then
        print_status "✅ Application deployed successfully!"
    else
        print_error "❌ Deployment failed. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Show application status
show_status() {
    print_status "Application Status:"
    echo "==================="
    docker-compose -p $COMPOSE_PROJECT_NAME ps
    echo ""
    print_status "To view logs: docker-compose -p $COMPOSE_PROJECT_NAME logs -f"
    print_status "To stop: docker-compose -p $COMPOSE_PROJECT_NAME down"
    print_status "To restart: docker-compose -p $COMPOSE_PROJECT_NAME restart"
}

# Update application
update_app() {
    print_status "Updating MultiModel Chat application..."
    backup_data
    docker-compose -p $COMPOSE_PROJECT_NAME pull
    docker-compose -p $COMPOSE_PROJECT_NAME build --no-cache
    docker-compose -p $COMPOSE_PROJECT_NAME -f docker-compose.yml -f docker-compose.prod.yml up -d
    print_status "✅ Application updated successfully!"
}

# Main deployment function
main_deploy() {
    check_permissions
    install_docker
    create_directories
    backup_data
    
    if [ ! -f ".env" ]; then
        print_warning "No .env file found. Copying from .env.production template..."
        cp .env.production .env
        print_warning "Please edit .env file with your configuration before continuing."
        print_warning "Press Enter to continue after editing .env file..."
        read
    fi
    
    deploy_app
    show_status
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo "Your MultiModel Chat application is now running."
    echo ""
    echo "Next steps:"
    echo "1. Configure your domain DNS to point to this server"
    echo "2. Run: $0 ssl your-domain.com (to setup SSL)"
    echo "3. Access your application at: http://your-server-ip or https://your-domain.com"
}

# Script commands
case "$1" in
    "install")
        install_docker
        ;;
    "deploy")
        main_deploy
        ;;
    "update")
        update_app
        ;;
    "ssl")
        setup_ssl $2
        ;;
    "status")
        show_status
        ;;
    "backup")
        backup_data
        ;;
    "logs")
        docker-compose -p $COMPOSE_PROJECT_NAME logs -f $2
        ;;
    "stop")
        print_status "Stopping MultiModel Chat..."
        docker-compose -p $COMPOSE_PROJECT_NAME down
        ;;
    "restart")
        print_status "Restarting MultiModel Chat..."
        docker-compose -p $COMPOSE_PROJECT_NAME restart
        ;;
    *)
        echo "MultiModel Chat Deployment Script"
        echo "Usage: $0 {deploy|update|ssl|status|backup|logs|stop|restart}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment (install Docker, create dirs, deploy app)"
        echo "  update  - Update existing deployment"
        echo "  ssl     - Setup SSL certificate (usage: $0 ssl your-domain.com)"
        echo "  status  - Show application status"
        echo "  backup  - Create data backup"
        echo "  logs    - Show application logs (usage: $0 logs [service])"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo ""
        echo "Examples:"
        echo "  $0 deploy"
        echo "  $0 ssl example.com"
        echo "  $0 logs app"
        exit 1
        ;;
esac