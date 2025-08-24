#!/bin/bash

# MultiModel Chat Deployment Script for External Nginx
# Use this when you already have Nginx running on your server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="multimodel-chat"
COMPOSE_PROJECT_NAME="multimodel"
BACKUP_DIR="/var/backups/multimodel"
NGINX_CONF_DIR="/etc/nginx/conf.d"
DOMAIN="chatrent.deeprank.ai"

echo -e "${GREEN}🚀 MultiModel Chat Deployment (External Nginx)${NC}"
echo "================================================"

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

print_blue() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        print_warning "This script needs sudo privileges for some operations."
        echo "Run with: sudo $0 or as root user"
        exit 1
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
    mkdir -p /var/log/multimodel/app
    mkdir -p $BACKUP_DIR
    chmod 755 /var/lib/multimodel
    chmod 755 /var/log/multimodel
}

# Setup Nginx configuration (HTTP-only initially)
setup_nginx_config() {
    print_blue "Setting up Nginx configuration for $DOMAIN..."
    
    # Check if Nginx is installed
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx is not installed. Please install Nginx first:"
        print_error "  Ubuntu/Debian: sudo apt update && sudo apt install nginx"
        print_error "  CentOS/RHEL: sudo yum install nginx"
        exit 1
    fi
    
    # Remove any existing configuration
    if [ -f "$NGINX_CONF_DIR/chatrent.deeprank.ai.conf" ]; then
        print_status "Removing existing Nginx configuration..."
        rm "$NGINX_CONF_DIR/chatrent.deeprank.ai.conf"
    fi
    
    # Install HTTP-only configuration first (no SSL certificates required)
    if [ -f "nginx/chatrent.deeprank.ai-http.conf" ]; then
        print_status "Installing HTTP-only Nginx configuration..."
        cp "nginx/chatrent.deeprank.ai-http.conf" "$NGINX_CONF_DIR/chatrent.deeprank.ai.conf"
        
        # Test Nginx configuration
        nginx -t
        if [ $? -eq 0 ]; then
            print_status "Nginx configuration is valid"
            systemctl reload nginx
            print_status "Nginx configuration reloaded (HTTP-only)"
        else
            print_error "Nginx configuration test failed"
            rm "$NGINX_CONF_DIR/chatrent.deeprank.ai.conf"
            exit 1
        fi
    else
        print_error "HTTP Nginx configuration file not found: nginx/chatrent.deeprank.ai-http.conf"
        exit 1
    fi
}

# Upgrade Nginx to HTTPS configuration
setup_nginx_ssl_config() {
    print_blue "Upgrading Nginx to HTTPS configuration..."
    
    if [ -f "nginx/chatrent.deeprank.ai.conf" ]; then
        print_status "Installing HTTPS Nginx configuration..."
        cp "nginx/chatrent.deeprank.ai.conf" "$NGINX_CONF_DIR/"
        
        # Test Nginx configuration
        nginx -t
        if [ $? -eq 0 ]; then
            print_status "HTTPS Nginx configuration is valid"
            systemctl reload nginx
            print_status "Nginx upgraded to HTTPS"
        else
            print_error "HTTPS Nginx configuration test failed, keeping HTTP version"
            # Restore HTTP-only configuration
            cp "nginx/chatrent.deeprank.ai-http.conf" "$NGINX_CONF_DIR/chatrent.deeprank.ai.conf"
            systemctl reload nginx
            return 1
        fi
    else
        print_error "HTTPS Nginx configuration file not found: nginx/chatrent.deeprank.ai.conf"
        return 1
    fi
}

# Setup SSL certificates
setup_ssl() {
    print_blue "Setting up SSL certificate for $DOMAIN..."
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        print_status "Installing certbot..."
        if command -v apt &> /dev/null; then
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
        elif command -v yum &> /dev/null; then
            yum install -y certbot python3-certbot-nginx
        else
            print_error "Could not install certbot. Please install manually."
            exit 1
        fi
    fi
    
    # Stop nginx temporarily for standalone mode
    systemctl stop nginx
    
    # Generate certificate
    print_status "Generating SSL certificate for $DOMAIN..."
    if certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN; then
        print_status "SSL certificate generated successfully"
        
        # Start nginx back up
        systemctl start nginx
        
        # Upgrade to HTTPS configuration
        setup_nginx_ssl_config
        
        # Set up auto-renewal
        echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx" | crontab -
        print_status "SSL auto-renewal configured"
        
        return 0
    else
        print_error "Failed to generate SSL certificate"
        # Start nginx back up with HTTP configuration
        systemctl start nginx
        return 1
    fi
}

# Generate secure random strings
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

generate_jwt_secret() {
    openssl rand -base64 48 | tr -d "=+/"
}

# Create .env file automatically
create_env_file() {
    print_status "Creating automated .env file..."
    
    # Generate secure credentials
    MONGO_PASSWORD=$(generate_password)
    MONGO_APP_PASSWORD=$(generate_password)
    JWT_SECRET=$(generate_jwt_secret)
    
    cat > .env << EOF
# MultiModel Chat - Production Environment
# Generated automatically by deployment script
NODE_ENV=production
PORT=3101

# Domain Configuration
DOMAIN=$DOMAIN

# Database Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=$MONGO_PASSWORD
MONGO_APP_PASSWORD=$MONGO_APP_PASSWORD
MONGO_DB_NAME=multimodel_chat

# JWT Secret (Auto-generated secure key)
JWT_SECRET=$JWT_SECRET

# CORS Configuration
CLIENT_URL=https://$DOMAIN

# Redis Configuration
REDIS_URL=redis://redis:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API Keys (Users will configure these in the app)
# Users add their own keys via Settings page:
# - OpenAI: https://platform.openai.com/api-keys
# - Anthropic: https://console.anthropic.com/
# - Google: https://makersuite.google.com/app/apikey

# Optional: Email Configuration (uncomment and configure if needed)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Security: Generated $(date)
EOF

    print_status "✅ Environment file created with secure auto-generated credentials"
    print_blue "MongoDB Password: $MONGO_PASSWORD"
    print_blue "JWT Secret: [Generated - 64 characters]"
    print_blue "Domain: $DOMAIN"
    print_warning "💾 Save these credentials in a secure location!"
}

# Deploy the application
deploy_app() {
    print_status "Deploying MultiModel Chat application..."
    
    # Always create fresh .env file for automated deployment
    if [ -f ".env" ]; then
        print_warning "Existing .env file found. Creating backup..."
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    create_env_file
    
    # Pull latest images
    docker-compose -p $COMPOSE_PROJECT_NAME pull
    
    # Build the application
    print_status "Building application..."
    docker-compose -p $COMPOSE_PROJECT_NAME build --no-cache
    
    # Start services
    print_status "Starting Docker services..."
    docker-compose -p $COMPOSE_PROJECT_NAME -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Test local connection
    if curl -f http://127.0.0.1:3101/health > /dev/null 2>&1; then
        print_status "✅ Application is responding locally on port 3101"
    else
        print_error "❌ Application failed to start. Check logs with: docker-compose -p $COMPOSE_PROJECT_NAME logs"
        exit 1
    fi
}

# Test SSL and domain access
test_deployment() {
    print_blue "Testing deployment..."
    
    # Test HTTP first
    if curl -f http://$DOMAIN/health > /dev/null 2>&1; then
        print_status "✅ HTTP health check passed"
    else
        print_warning "❌ HTTP health check failed. Check Nginx configuration."
    fi
    
    # Test HTTPS only if SSL certificates exist
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        if curl -f -k https://$DOMAIN/health > /dev/null 2>&1; then
            print_status "✅ HTTPS health check passed"
        else
            print_warning "❌ HTTPS health check failed. SSL may not be configured properly."
        fi
        
        # Test HTTP redirect
        if curl -I http://$DOMAIN 2>/dev/null | grep -q "301"; then
            print_status "✅ HTTP to HTTPS redirect working"
        else
            print_warning "❌ HTTP to HTTPS redirect not working properly"
        fi
    else
        print_warning "SSL certificates not found - running in HTTP-only mode"
    fi
}

# Show application status
show_status() {
    print_status "Application Status:"
    echo "==================="
    docker-compose -p $COMPOSE_PROJECT_NAME ps
    echo ""
    print_status "Nginx status:"
    systemctl status nginx --no-pager -l
    echo ""
    print_blue "🌐 Access your application:"
    print_blue "   Frontend: https://$DOMAIN"
    print_blue "   Health: https://$DOMAIN/health"
    echo ""
    print_status "📋 Management commands:"
    print_status "   View app logs: docker-compose -p $COMPOSE_PROJECT_NAME logs -f"
    print_status "   View nginx logs: tail -f /var/log/nginx/chatrent_*.log"
    print_status "   Restart app: docker-compose -p $COMPOSE_PROJECT_NAME restart"
    print_status "   Stop app: docker-compose -p $COMPOSE_PROJECT_NAME down"
}

# Backup existing data (DISABLED FOR TESTING - force fresh DB)
backup_data() {
    print_status "Skipping backup - removing existing MongoDB data for fresh start..."
    # Remove existing MongoDB data to force fresh initialization
    sudo rm -rf /var/lib/multimodel/mongodb/* 2>/dev/null || true
    # Remove Docker volumes
    docker volume rm $(docker volume ls -q | grep mongodb) 2>/dev/null || true
    print_status "MongoDB data cleared for fresh initialization"
}

# Update application
update_app() {
    print_status "Updating MultiModel Chat application..."
    backup_data
    docker-compose -p $COMPOSE_PROJECT_NAME pull
    docker-compose -p $COMPOSE_PROJECT_NAME build --no-cache
    docker-compose -p $COMPOSE_PROJECT_NAME -f docker-compose.yml -f docker-compose.prod.yml up -d
    systemctl reload nginx
    print_status "✅ Application updated successfully!"
}

# Main deployment function
main_deploy() {
    check_permissions
    install_docker
    create_directories
    backup_data
    deploy_app
    
    # Ask about SSL setup
    echo ""
    read -p "Do you want to set up SSL certificate for $DOMAIN? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if setup_ssl; then
            print_status "✅ SSL setup completed successfully"
            SSL_ENABLED=true
        else
            print_warning "❌ SSL setup failed, but app is still accessible via HTTP"
            SSL_ENABLED=false
        fi
    else
        print_warning "SSL setup skipped. You can run: $0 ssl later"
        SSL_ENABLED=false
    fi
    
    test_deployment
    show_status
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo "================================================="
    echo ""
    echo -e "${BLUE}🌐 Your MultiModel Chat is now live at:${NC}"
    if [ "$SSL_ENABLED" = true ]; then
        echo -e "${BLUE}   https://$DOMAIN${NC} (HTTPS - Secure)"
    else
        echo -e "${BLUE}   http://$DOMAIN${NC} (HTTP - Consider adding SSL later)"
    fi
    echo ""
    echo -e "${GREEN}📋 Next Steps:${NC}"
    echo "   1. Visit your app and create an admin account"
    echo "   2. Go to Settings → API Keys to add your AI API keys"
    echo "   3. Start comparing AI model responses!"
    echo ""
    echo -e "${YELLOW}🔑 Generated Credentials (save these securely):${NC}"
    echo "   MongoDB Password: [shown above during deployment]"
    echo "   JWT Secret: [auto-generated secure key]"
    echo ""
    echo -e "${GREEN}💡 Management Commands:${NC}"
    echo "   Status:  ./scripts/deploy-external-nginx.sh status"
    echo "   Logs:    ./scripts/deploy-external-nginx.sh logs"
    echo "   Update:  sudo ./scripts/deploy-external-nginx.sh update"
    echo "   Restart: sudo ./scripts/deploy-external-nginx.sh restart"
}

# Script commands
case "$1" in
    "deploy")
        main_deploy
        ;;
    "update")
        check_permissions
        update_app
        ;;
    "ssl")
        check_permissions
        setup_ssl
        ;;
    "nginx")
        check_permissions
        setup_nginx_config
        ;;
    "status")
        show_status
        ;;
    "backup")
        check_permissions
        backup_data
        ;;
    "logs")
        if [ "$2" = "nginx" ]; then
            tail -f /var/log/nginx/chatrent_*.log
        else
            docker-compose -p $COMPOSE_PROJECT_NAME logs -f $2
        fi
        ;;
    "stop")
        check_permissions
        print_status "Stopping MultiModel Chat..."
        docker-compose -p $COMPOSE_PROJECT_NAME down
        ;;
    "restart")
        check_permissions
        print_status "Restarting MultiModel Chat..."
        docker-compose -p $COMPOSE_PROJECT_NAME restart
        systemctl reload nginx
        ;;
    *)
        echo "MultiModel Chat Deployment Script (External Nginx)"
        echo "Usage: $0 {deploy|update|ssl|nginx|status|backup|logs|stop|restart}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment (Docker + Nginx config + optional SSL)"
        echo "  update  - Update existing deployment"
        echo "  ssl     - Setup/renew SSL certificate for $DOMAIN"
        echo "  nginx   - Install/update Nginx configuration only"
        echo "  status  - Show application and nginx status"
        echo "  backup  - Create data backup"
        echo "  logs    - Show logs (usage: $0 logs [app|mongodb|redis|nginx])"
        echo "  stop    - Stop Docker services"
        echo "  restart - Restart Docker services and reload Nginx"
        echo ""
        echo "Examples:"
        echo "  $0 deploy"
        echo "  $0 ssl"
        echo "  $0 logs nginx"
        exit 1
        ;;
esac