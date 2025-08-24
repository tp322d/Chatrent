# MultiModel Chat - External Nginx Deployment Guide

## 🎯 Perfect for chatrent.deeprank.ai

This guide is specifically for deploying on a server where **Nginx is already installed** and configured.

### 📦 What Gets Dockerized:
✅ **App Container**: Node.js backend + React frontend  
✅ **MongoDB Container**: Database with initialization  
✅ **Redis Container**: Caching/sessions  
❌ **Nginx**: Uses your existing server Nginx

---

## 🚀 Quick Deployment

### 1. On Your Server (chatrent.deeprank.ai)

```bash
# Clone your repo
git clone <your-repo-url> multimodel-chat
cd multimodel-chat

# Deploy with external nginx
sudo ./scripts/deploy-external-nginx.sh deploy
```

### 2. Fully Automated - What the Script Does:
- ✅ Installs Docker & Docker Compose (if needed)
- ✅ **Auto-creates .env file** with secure generated credentials
- ✅ Builds and starts app containers (port 127.0.0.1:3101)  
- ✅ Installs Nginx configuration for chatrent.deeprank.ai
- ✅ Sets up SSL certificate (optional)
- ✅ Tests the deployment

**🎯 Zero manual configuration required!**

---

## ⚙️ Configuration Details

### Docker Services:
| Service | Purpose | Port |
|---------|---------|------|
| `multimodel-app` | Backend + Frontend | `127.0.0.1:3101` |
| `multimodel-mongodb` | Database | `27017` (internal) |
| `multimodel-redis` | Cache | `6379` (internal) |

### Nginx Configuration:
- **File**: `/etc/nginx/conf.d/chatrent.deeprank.ai.conf`
- **Upstream**: `127.0.0.1:3101` (your Docker app)
- **Features**: Rate limiting, SSL, security headers, gzip

---

## 🌐 Domain Setup

### DNS Configuration:
Point your domain to your server:
```
chatrent.deeprank.ai  →  YOUR_SERVER_IP
```

### SSL Certificate:
```bash
# The deployment script will ask, or run separately:
sudo ./scripts/deploy-external-nginx.sh ssl
```

This uses Let's Encrypt and sets up auto-renewal.

---

## 📋 Management Commands

```bash
# View status
./scripts/deploy-external-nginx.sh status

# View application logs
./scripts/deploy-external-nginx.sh logs

# View nginx logs  
./scripts/deploy-external-nginx.sh logs nginx

# Update application
sudo ./scripts/deploy-external-nginx.sh update

# Restart services
sudo ./scripts/deploy-external-nginx.sh restart

# Stop application
sudo ./scripts/deploy-external-nginx.sh stop
```

---

## 🛡️ Security Features

### Nginx Protection:
- **Rate Limiting**: 5 req/s for auth, 10 req/s for API
- **SSL/TLS**: Modern cipher suites, HSTS
- **Security Headers**: CSP, XSS protection, frame denial
- **Bot Protection**: Blocks common scanners and attack vectors

### Application Security:
- **Bound to localhost**: App only accessible via Nginx proxy
- **JWT Authentication**: Secure user sessions
- **API Key Encryption**: User API keys encrypted before storage

---

## 🗂️ File Structure

```
/var/lib/multimodel/          # Data persistence
├── mongodb/                  # Database files
├── redis/                    # Cache data  
└── uploads/                  # User uploads

/var/log/multimodel/          # Application logs
├── app/                      # App container logs
└── nginx logs in standard location

/etc/nginx/conf.d/            # Nginx configuration
└── chatrent.deeprank.ai.conf # Your domain config
```

---

## 🔧 Environment Variables (Auto-Generated!)

The script **automatically creates** `.env` with secure credentials:
```env
NODE_ENV=production
PORT=3101
DOMAIN=chatrent.deeprank.ai

# Database (auto-generated secure password)
MONGO_ROOT_PASSWORD=[25-char secure password]
JWT_SECRET=[64-char secure JWT secret]

# CORS (auto-configured)
CLIENT_URL=https://chatrent.deeprank.ai

# Rate limiting, Redis, etc. (all pre-configured)
```

**✅ No manual editing required!** All credentials are auto-generated securely.

---

## 🧪 Testing the Deployment

### Health Checks:
```bash
# Test local app
curl http://127.0.0.1:3101/health

# Test through Nginx
curl https://chatrent.deeprank.ai/health

# Test HTTP redirect
curl -I http://chatrent.deeprank.ai
```

### Expected Results:
- ✅ Local health check: `{"status":"OK"}`
- ✅ HTTPS health check: `{"status":"OK"}`  
- ✅ HTTP redirect: `301 → https://`

---

## 📊 Monitoring

### Container Status:
```bash
docker-compose -p multimodel ps
```

### Nginx Status:
```bash
systemctl status nginx
nginx -t  # test configuration
```

### Log Monitoring:
```bash
# App logs
docker-compose -p multimodel logs -f app

# Nginx access logs
tail -f /var/log/nginx/chatrent_access.log

# Nginx error logs  
tail -f /var/log/nginx/chatrent_error.log
```

---

## 🔄 Updates & Maintenance

### Application Updates:
```bash
sudo ./scripts/deploy-external-nginx.sh update
```

### SSL Renewal:
- **Automatic**: Configured via cron job
- **Manual**: `sudo certbot renew && systemctl reload nginx`

### Nginx Config Updates:
```bash
# Update config and reload
sudo ./scripts/deploy-external-nginx.sh nginx
```

---

## 🚨 Troubleshooting

### Common Issues:

**"Port 3101 already in use"**
```bash
# Check what's using port 3101
sudo netstat -tlnp | grep :3101
sudo ./scripts/deploy-external-nginx.sh stop
```

**"Nginx test failed"**
```bash
# Check nginx syntax
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

**"Can't reach application"**
```bash
# Test each layer
curl http://127.0.0.1:3101/health    # Docker app
curl http://localhost/health          # Through nginx
curl https://chatrent.deeprank.ai/health  # External
```

**"SSL certificate errors"**
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## 🎯 Your Deployment Checklist

1. ✅ DNS points to your server
2. ✅ Run deployment script: `sudo ./scripts/deploy-external-nginx.sh deploy`
3. ✅ Edit `.env` with secure credentials
4. ✅ Set up SSL certificate
5. ✅ Test: `https://chatrent.deeprank.ai/health`
6. ✅ Create user account in the app
7. ✅ Configure API keys in Settings

**🎉 Your multimodel chat app will be live at: `https://chatrent.deeprank.ai`**