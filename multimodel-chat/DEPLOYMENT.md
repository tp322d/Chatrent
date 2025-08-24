# MultiModel Chat - Docker Deployment Guide

## 🚀 Quick Deployment (Production)

### 1. Server Requirements
- **Ubuntu/Debian/CentOS** Linux server
- **2GB+ RAM** (4GB recommended)
- **20GB+ Storage**
- **Root or sudo access**
- **Domain name** (optional, for SSL)

### 2. One-Command Deployment

```bash
# Clone and deploy
git clone <your-repo-url> multimodel-chat
cd multimodel-chat
./scripts/deploy.sh deploy
```

This script will:
- ✅ Install Docker & Docker Compose
- ✅ Create necessary directories
- ✅ Set up environment files
- ✅ Build and start all containers
- ✅ Configure networking and security

### 3. SSL Setup (Optional but Recommended)
```bash
# After deployment, set up SSL
./scripts/deploy.sh ssl your-domain.com
```

## 🐳 What's Containerized

| Container | Purpose | Port |
|-----------|---------|------|
| `multimodel-app` | Node.js Backend + React Frontend | 3001 |
| `multimodel-mongodb` | Database | 27017 |
| `multimodel-redis` | Caching/Sessions | 6379 |
| `multimodel-nginx` | Reverse Proxy/SSL | 80, 443 |

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Copy and edit
cp .env.production .env
nano .env
```

**Required Settings:**
```env
DOMAIN=your-domain.com
MONGO_ROOT_PASSWORD=secure_password_here
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
```

### API Keys
Users configure their own API keys in the app:
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)  
- **Google**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

## 📋 Management Commands

```bash
# View status
./scripts/deploy.sh status

# View logs
./scripts/deploy.sh logs
./scripts/deploy.sh logs app    # specific service

# Update application
./scripts/deploy.sh update

# Backup data
./scripts/deploy.sh backup

# Restart services
./scripts/deploy.sh restart

# Stop services
./scripts/deploy.sh stop
```

## 🔧 Local Development/Testing

```bash
# Test Docker setup locally
./scripts/local-deploy.sh

# Access locally at: http://localhost:3001
```

## 🗂️ Data Persistence

All data is stored in Docker volumes and mapped to host directories:

- **Database**: `/var/lib/multimodel/mongodb`
- **Uploads**: `/var/lib/multimodel/uploads`  
- **Logs**: `/var/log/multimodel/`
- **Backups**: `/var/backups/multimodel/`

## 🛡️ Security Features

### Nginx Security
- ✅ SSL/TLS encryption
- ✅ Rate limiting (API: 10req/s, Auth: 5req/s)
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Static file caching

### Application Security
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ CORS protection
- ✅ API key encryption

## 🔍 Monitoring & Logs

```bash
# Real-time logs
docker-compose -p multimodel logs -f

# Specific service logs
docker-compose -p multimodel logs -f app
docker-compose -p multimodel logs -f mongodb
docker-compose -p multimodel logs -f nginx

# System resource usage
docker stats
```

## 📊 Health Checks

- **Application**: `http://your-domain.com/health`
- **API Status**: `http://your-domain.com/api/auth/me`
- **Docker Health**: `docker-compose -p multimodel ps`

## 🔄 Updates & Maintenance

### Regular Updates
```bash
# Update application (preserves data)
./scripts/deploy.sh update
```

### SSL Certificate Renewal
Certificates auto-renew via cron. Manual renewal:
```bash
certbot renew
./scripts/deploy.sh restart
```

### Database Maintenance
```bash
# Backup before maintenance
./scripts/deploy.sh backup

# Access MongoDB
docker exec -it multimodel-mongodb mongosh

# View collections
use multimodel_chat
show collections
db.users.countDocuments()
db.chats.countDocuments()
```

## 🚨 Troubleshooting

### Common Issues

**Port 80/443 already in use:**
```bash
# Check what's using the port
sudo netstat -tlnp | grep :80
sudo systemctl stop apache2  # or nginx
```

**Low disk space:**
```bash
# Clean up old Docker data
docker system prune -a
./scripts/deploy.sh backup  # backup first
```

**Can't connect to MongoDB:**
```bash
# Check container status
docker-compose -p multimodel ps
docker-compose -p multimodel logs mongodb

# Reset MongoDB
docker-compose -p multimodel down
docker volume rm multimodel_mongodb_data
./scripts/deploy.sh deploy
```

**SSL certificate issues:**
```bash
# Renew certificate
certbot renew --force-renewal
./scripts/deploy.sh restart
```

### Log Locations
- **Application**: `docker logs multimodel-app`
- **Nginx**: `/var/log/multimodel/nginx/`
- **MongoDB**: `docker logs multimodel-mongodb`

## 📞 Support

For deployment issues:
1. Check logs: `./scripts/deploy.sh logs`
2. Verify environment: `cat .env`
3. Check resources: `df -h && free -h`
4. Restart services: `./scripts/deploy.sh restart`

## 🎯 Access Your App

After deployment:
- **HTTP**: `http://your-server-ip`
- **HTTPS**: `https://your-domain.com` (after SSL setup)
- **Health Check**: `http://your-domain.com/health`