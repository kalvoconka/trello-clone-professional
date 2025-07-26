# 🚂 Railway Deployment Guide

## 🎯 Quick Deploy (CTO Priority)

### Step 1: Railway Project Setup
```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway add
```

### Step 2: Environment Variables Setup
```bash
# Set production environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-super-secure-32-character-secret-key
railway variables set JWT_REFRESH_SECRET=your-super-secure-refresh-secret-32-chars
railway variables set FRONTEND_URL=https://your-app-name.railway.app
railway variables set CORS_ORIGIN=https://your-app-name.railway.app
```

### Step 3: Database Setup
```bash
# Add PostgreSQL service
railway add --template postgres

# Get database URL
railway variables get DATABASE_URL
```

### Step 4: Deploy
```bash
# Deploy from GitHub (recommended)
railway deploy --from-git

# Or deploy from local
railway deploy
```

## 🔧 Alternative: One-Click Deploy

**Via Railway Dashboard:**
1. Go to [railway.app](https://railway.app)
2. "Deploy from GitHub Repo"
3. Select: `kalvoconka/trello-clone-professional`
4. Railway auto-detects Dockerfile
5. Add PostgreSQL template
6. Set environment variables
7. Deploy ✅

## 📋 Environment Variables Required

```env
# Application
NODE_ENV=production
PORT=5000

# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://...

# JWT Secrets (Generate secure ones)
JWT_SECRET=your-super-secure-32-character-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-32-chars

# CORS and Frontend  
FRONTEND_URL=https://your-app-name.railway.app
CORS_ORIGIN=https://your-app-name.railway.app

# Optional: Logging
LOG_LEVEL=info

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Post-Deployment

### Health Check
```bash
curl https://your-app-name.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "database": "connected", 
  "version": "1.0.0"
}
```

### Frontend Access
- **URL**: `https://your-app-name.railway.app`
- **API Docs**: `https://your-app-name.railway.app/api/docs`

### Database Migrations
```bash
# Railway will auto-run migrations via Dockerfile
# But if needed manually:
railway run npx prisma migrate deploy
```

## 🔍 Monitoring

### Railway Dashboard
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Database**: Connection stats

### Custom Health Monitoring
```bash
# Set up monitoring script
curl -f https://your-app-name.railway.app/api/health || exit 1
```

## 🛠️ Troubleshooting

### Common Issues

**1. Build Timeout**
```bash
# Increase build timeout in railway.json
{
  "build": {
    "buildCommand": "npm run build",
    "buildTimeout": 600
  }
}
```

**2. Database Connection Issues**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/db

# Test connection
railway run npx prisma migrate status
```

**3. Environment Variables**
```bash
# List all variables
railway variables

# Check specific variable  
railway variables get JWT_SECRET
```

**4. Logs Debugging**
```bash
# Real-time logs
railway logs

# Filter logs
railway logs --filter error
```

## 💰 Pricing Estimate

**Hobby Plan (Free)**:
- ✅ 512MB RAM, 1 vCPU
- ✅ 1GB storage  
- ✅ 100GB transfer/month
- ⚠️ Sleeps after 30min inactivity

**Pro Plan ($5/month)**:
- ✅ 8GB RAM, 8 vCPU
- ✅ 100GB storage
- ✅ Unlimited transfer
- ✅ No sleep, custom domains

## 🔐 Security Considerations

### Generated Secrets
```bash
# Generate secure JWT secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

### Database Security
- ✅ Railway PostgreSQL is encrypted at rest
- ✅ SSL connections by default
- ✅ Network isolation
- ✅ Automatic backups

### HTTPS
- ✅ Railway provides free SSL certificates
- ✅ Automatic HTTP → HTTPS redirects
- ✅ Security headers via Helmet.js in code

## 📈 Scaling Strategy

### Vertical Scaling (Immediate)
```json
{
  "deploy": {
    "numReplicas": 1,
    "resources": {
      "memory": "1GB",
      "cpu": "1"
    }
  }
}
```

### Horizontal Scaling (Growth)
```json
{
  "deploy": {
    "numReplicas": 3,
    "loadBalancer": true
  }
}
```

### Database Scaling
```bash
# Upgrade to dedicated database
railway add --template postgres-ha

# Or external database
railway variables set DATABASE_URL=postgresql://external-db-url
```

---

## ⏱️ **Deployment Timeline**

1. **Setup** (2-3 minutes)
2. **Build** (3-5 minutes) 
3. **Deploy** (1-2 minutes)
4. **Health Check** (30 seconds)

**Total**: ~8 minutes to live demo URL ✅

---

**Next**: Once deployed, update team documentation with live URL for review process.