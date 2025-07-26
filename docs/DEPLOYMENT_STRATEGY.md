# 🌐 Deployment Strategy - Servidor Cloud

## Opciones de Deployment Recomendadas

### Option 1: Railway (Recomendado para inicio)
**Por qué Railway:**
- ✅ **Setup en 5 minutos**
- ✅ **PostgreSQL incluido**
- ✅ **Deploy automático desde GitHub**
- ✅ **SSL gratis**
- ✅ **$5-10/mes para empezar**

**Setup:**
1. Conectar GitHub repo a Railway
2. Auto-detecta Node.js + React
3. Configura variables de entorno
4. Deploy automático en cada push

### Option 2: DigitalOcean App Platform  
**Para más control:**
- ✅ **Droplets personalizables**
- ✅ **Database cluster separado**
- ✅ **$10-20/mes**
- ✅ **Scaling fácil**

### Option 3: Tu Servidor Cloud Actual
**Si ya tienes infraestructura:**
- ✅ **Máximo control**
- ✅ **Costos conocidos**
- ✅ **Docker deployment**

## Arquitectura de Deployment

```
Internet
    ↓
[CloudFlare CDN] (opcional)
    ↓
[Load Balancer] 
    ↓
┌─────────────────┬─────────────────┐
│   Frontend      │    Backend      │
│   (Static)      │   (Node.js)     │
│   Port 3000     │   Port 5000     │
└─────────────────┴─────────────────┘
    ↓                    ↓
[Static Files]      [PostgreSQL]
                    [Redis] (opcional)
```

## Variables de Entorno - Producción

```bash
# Crear archivo .env.production
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/trello_prod
JWT_SECRET=super-secure-production-secret-32-chars
JWT_REFRESH_SECRET=another-super-secure-secret-32-chars
FRONTEND_URL=https://trello.tudominio.com
CORS_ORIGIN=https://trello.tudominio.com
```

## CI/CD Pipeline con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install & Test Backend
        run: |
          cd backend
          npm ci
          npm run test
      
      - name: Install & Test Frontend  
        run: |
          cd frontend
          npm ci
          npm run test
          npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Railway
        uses: railway-deploy@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## Docker Setup para tu servidor

```dockerfile
# Dockerfile.production
FROM node:18-alpine

WORKDIR /app

# Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Frontend build
COPY frontend/package*.json ./frontend/  
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy backend code
COPY backend/ ./backend/
RUN cd backend && npm run build

# Production server
EXPOSE 5000
CMD ["node", "backend/dist/server.js"]
```

```yaml
# docker-compose.production.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: trello_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app

volumes:
  postgres_data:
```

## Setup en tu servidor cloud

### 1. Preparar servidor
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose nginx
sudo systemctl enable docker

# Clone repo
git clone https://github.com/tu-usuario/trello-clone-professional.git
cd trello-clone-professional
```

### 2. Configurar environment
```bash
# Copiar variables de producción
cp .env.example .env.production

# Editar con valores reales
nano .env.production
```

### 3. Deploy
```bash
# Producción
docker-compose -f docker-compose.production.yml up -d

# Verificar
docker-compose ps
docker-compose logs app
```

### 4. SSL con Let's Encrypt
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d trello.tudominio.com

# Auto-renewal
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoreo y Mantenimiento

### Health Checks
```bash
# Script de monitoreo
#!/bin/bash
curl -f http://localhost:5000/api/health || exit 1
```

### Backup automático
```bash
# Backup diario de DB
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
# Upload to cloud storage
```

### Logs centralizados
```bash
# Ver logs en producción
docker-compose logs -f app
docker-compose logs -f postgres
```

## Recomendación Final

**Para tu caso (equipo review + demo):**

1. **Start con Railway** (más simple)
2. **GitHub repo público** para review
3. **Domain personalizado** (profesional)
4. **SSL certificate** (seguridad)
5. **Analytics básicos** (usage tracking)

**Timeline sugerido:**
- Día 1: GitHub setup + Railway deploy
- Día 2: Domain + SSL setup  
- Día 3: Team onboarding + feedback collection
- Día 4: Iteraciones basadas en feedback

¿Empezamos con GitHub o prefieres directamente el deployment?