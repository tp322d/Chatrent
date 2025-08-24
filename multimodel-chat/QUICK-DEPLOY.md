# 🚀 Quick Deploy Guide - chatrent.deeprank.ai

## One-Command Deployment

After cloning the repo, just run **one command** and your app will be live!

### Step 1: Clone & Deploy
```bash
# Clone the repo
git clone <your-repo-url> multimodel-chat
cd multimodel-chat

# Deploy everything (fully automated)
sudo ./scripts/deploy-external-nginx.sh deploy
```

### Step 2: Done! 🎉
Your app will be live at: **https://chatrent.deeprank.ai**

---

## What the Script Does Automatically:

✅ **Installs Docker** & Docker Compose (if needed)  
✅ **Creates .env file** with secure auto-generated credentials  
✅ **Installs Nginx config** for chatrent.deeprank.ai  
✅ **Builds & starts** all Docker containers  
✅ **Sets up SSL certificate** (optional, prompted)  
✅ **Tests deployment** and shows status  

## Zero Manual Configuration Required!

- ✅ **Database**: Auto-configured with secure password
- ✅ **JWT Secret**: Auto-generated 64-character secure key  
- ✅ **Port**: Configured for 3101 (internal) 
- ✅ **Domain**: Set to chatrent.deeprank.ai
- ✅ **Security**: Rate limiting, SSL, headers all configured
- ✅ **API Keys**: Empty (users add their own in the app)

---

## After Deployment:

### 1. Create Your Account
- Visit: https://chatrent.deeprank.ai
- Click "Sign Up" 
- Create admin account

### 2. Add API Keys (Optional)
- Go to Settings → API Keys
- Add your keys:
  - **OpenAI**: https://platform.openai.com/api-keys
  - **Anthropic**: https://console.anthropic.com/
  - **Google**: https://makersuite.google.com/app/apikey

### 3. Start Comparing Models!
- Go to Chat page
- Enter a prompt
- Select models to compare
- Get side-by-side responses

---

## Management Commands:

```bash
# View status
./scripts/deploy-external-nginx.sh status

# View logs  
./scripts/deploy-external-nginx.sh logs

# Update app
sudo ./scripts/deploy-external-nginx.sh update

# Restart
sudo ./scripts/deploy-external-nginx.sh restart
```

---

## Troubleshooting:

**If deployment fails:**
```bash
# Check logs
./scripts/deploy-external-nginx.sh logs

# Restart services
sudo ./scripts/deploy-external-nginx.sh restart
```

**If you need to reset:**
```bash
# Stop everything
sudo ./scripts/deploy-external-nginx.sh stop

# Redeploy
sudo ./scripts/deploy-external-nginx.sh deploy
```

---

## That's It! 

From **git clone** to **live application** in one command. Your multimodel chat comparison tool will be ready for users at https://chatrent.deeprank.ai 🎯