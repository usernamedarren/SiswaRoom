# 📚 COMPLETE DEPLOYMENT GUIDE - SiswaRoom aPanel Docker

## Executive Summary

SiswaRoom sekarang sudah fully configured untuk berjalan di aPanel dengan Docker menggunakan:
- ✅ MySQL yang sudah ada di aPanel (`mysql_siswaroom-mysql_siswaroom-1`)
- ✅ phpMyAdmin yang sudah ada di aPanel (`phpmyadmin_siswaroom-phpmyadmin_siswaroom-1`)
- ✅ Backend Node.js baru yang akan di-container
- ✅ Frontend Vite yang akan di-serve via Nginx

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    APANEL SERVER (192.168.4.247)             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  siswaroom-      │  │  siswaroom-      │                │
│  │  backend-prod    │  │  frontend-prod   │                │
│  │  (port 4001)     │  │  (port 8089)     │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                      │                           │
│           └──────────────────────┘                           │
│                    │                                         │
│           ┌────────▼────────┐                               │
│           │  mysql_siswaroom │  (port 13306)               │
│           │  phpmyadmin      │  (port 8080)               │
│           └──────────────────┘                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                          │
         └──────────────────────────┘
                      ▼
        ┌────────────────────────────┐
        │   Cloudflare + aPanel      │
        │   Route Configuration      │
        └────────────────────────────┘
         │                      │
         ▼                      ▼
   api.siswaroom.online   siswaroom.online
   (Backend API)          (Frontend)
```

---

## 📦 What's Been Prepared

### ✅ Backend Configuration
1. **docker-compose.yml** - Development setup dengan MySQL aPanel
2. **docker-compose-aPanel.yml** - Production setup optimized
3. **.env** - Development environment variables
4. **.env.production** - Production environment variables
5. **src/app.js** - Updated dengan proper CORS configuration
6. **Dockerfile** - Node.js Alpine image

### ✅ Frontend Configuration
1. **Dockerfile** - Multi-stage build dengan Nginx
2. **nginx.conf** - Nginx configuration untuk SPA routing
3. **.env.local** - Development environment variables
4. **.env.production** - Production environment variables

### ✅ Database
1. **sql/simple.sql** - Complete schema dengan 11 tables dan sample data
2. **APANEL_DEPLOYMENT_GUIDE.md** - Detailed deployment guide
3. **DEPLOYMENT_CHECKLIST.md** - Quick checklist

### ✅ Documentation
1. **APANEL_DEPLOYMENT_GUIDE.md** - Step-by-step guide
2. **DEPLOYMENT_CHECKLIST.md** - Quick reference

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### PHASE 1: Database Preparation (10 minutes)

#### 1.1 Import Database Schema

```bash
# Method 1: Via phpMyAdmin UI
1. Go to: http://192.168.4.247:8080
2. Login: root / admin
3. Create database: siswaroom (if not exists)
4. Click "Import" tab
5. Upload: backend/sql/simple.sql
6. Click "Go"

# Method 2: Via Command Line
ssh root@192.168.4.247
docker exec -i mysql_siswaroom-mysql_siswaroom-1 mysql -u root -padmin < backend/sql/simple.sql
```

#### 1.2 Verify Database

```bash
docker exec mysql_siswaroom-mysql_siswaroom-1 mysql -u root -padmin -e "USE siswaroom; SHOW TABLES;"

# Expected output:
# Tables_in_siswaroom
# class_schedule
# class_students
# materials
# questions
# quiz_questions
# quiz_results
# quizzes
# subjects
# topics
# user_courses
# users
```

---

### PHASE 2: Backend Deployment (15 minutes)

#### 2.1 Prepare Configuration

Update file `backend/.env`:

```bash
cat > backend/.env << 'EOF'
DB_HOST=localhost
DB_PORT=13306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=siswaroom
JWT_SECRET=supersecretjwt
JWT_EXPIRE=7d
PORT=4000
NODE_ENV=development
API_URL=http://192.168.4.247:4001
CORS_ORIGIN=http://192.168.4.247:8088,http://192.168.4.247:8089,http://siswaroom.online,https://siswaroom.online
DB_POOL_SIZE=10
DB_WAIT_FOR_CONNECTIONS=true
DB_ENABLE_KEEP_ALIVE=true
EOF
```

#### 2.2 Stop Old Backend Container

```bash
docker stop siswaroom-backend
docker rm siswaroom-backend
```

#### 2.3 Deploy New Backend

```bash
cd /path/to/SiswaRoom/backend

# Option A: Development (with live reload)
docker-compose up -d --build

# Option B: Production (Recommended for aPanel)
docker-compose -f docker-compose-aPanel.yml up -d --build
```

#### 2.4 Verify Backend

```bash
# Check container status
docker ps | grep siswaroom-backend

# Check logs
docker logs siswaroom-backend -f

# Test API endpoint (wait ~30 seconds for startup)
sleep 30
curl http://192.168.4.247:4001/api/subjects

# Expected response:
# [{"subject_id":1,"name":"Web Development",...}]
```

---

### PHASE 3: Frontend Deployment (15 minutes)

#### 3.1 Prepare Configuration

Update file `frontend/.env.local`:

```bash
cat > frontend/.env.local << 'EOF'
VITE_API_URL=http://192.168.4.247:4001/api
VITE_APP_TITLE=SiswaRoom
VITE_APP_DESCRIPTION=Platform Pembelajaran Online
EOF
```

#### 3.2 Build Frontend Image

```bash
cd /path/to/SiswaRoom/frontend
docker build -t siswaroom-frontend:latest .
```

#### 3.3 Run Frontend Container

```bash
# Remove old frontend if exists
docker stop siswaroom-frontend 2>/dev/null || true
docker rm siswaroom-frontend 2>/dev/null || true

# Run new container
docker run -d \
  --name siswaroom-frontend \
  -p 8089:80 \
  --restart always \
  siswaroom-frontend:latest
```

#### 3.4 Verify Frontend

```bash
# Check container
docker ps | grep siswaroom-frontend

# Test health
docker logs siswaroom-frontend

# Test accessibility
curl http://192.168.4.247:8089/

# Expected: HTML content
```

---

### PHASE 4: Integration Testing (10 minutes)

#### 4.1 Test Backend API

```bash
# Get all subjects
curl http://192.168.4.247:4001/api/subjects

# Get single subject
curl http://192.168.4.247:4001/api/subjects/1

# Get all topics
curl http://192.168.4.247:4001/api/topics

# Login (if auth endpoint exists)
curl -X POST http://192.168.4.247:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@siswaroom.online","password":"password"}'
```

#### 4.2 Test Frontend Access

```bash
# Browser test
# URL: http://192.168.4.247:8089
# Expected: SiswaRoom website loads
# Expected: Data appears from API
# Expected: No CORS errors in console
```

#### 4.3 Test Database

```bash
# Login to phpMyAdmin
# URL: http://192.168.4.247:8080
# Username: root
# Password: admin
# Database: siswaroom

# Verify tables and data:
- users table: 4 records
- subjects table: 4 records
- topics table: 6 records
- materials table: 4 records
- quizzes table: 3 records
```

---

### PHASE 5: aPanel Route Configuration (10 minutes)

#### 5.1 Configure Backend API Route

In aPanel Control Panel:

```
Path: /api/*
Service: http://192.168.4.247:4001
Loadbalancer: Yes (optional)
SSL: Yes (recommended)
Cache: No
```

#### 5.2 Configure Frontend Route

In aPanel Control Panel:

```
Path: *
Service: http://192.168.4.247:8089
Loadbalancer: Yes (optional)
SSL: Yes (recommended)
Cache: Yes (for static files)
```

#### 5.3 Configure phpMyAdmin Route (Optional)

In aPanel Control Panel:

```
Path: *
Service: http://192.168.4.247:8080
Authentication: Basic Auth (recommended)
SSL: Yes (recommended)
```

---

### PHASE 6: DNS & Cloudflare Configuration (5 minutes)

#### 6.1 Update Cloudflare DNS

```
A Record: siswaroom.online    → 192.168.4.247
A Record: api.siswaroom.online → 192.168.4.247
A Record: pma.siswaroom.online → 192.168.4.247
```

#### 6.2 Cloudflare Proxy Settings

For each domain:
- Orange Cloud: Enabled (Proxied)
- SSL/TLS: Full (Strict)
- Cache Level: Standard
- Browser Cache: 30 minutes

---

## ✅ VERIFICATION CHECKLIST

### Pre-Deployment
- [ ] Database schema imported via phpMyAdmin
- [ ] `.env` files updated with aPanel server details
- [ ] All configuration files reviewed
- [ ] Docker images available locally

### Deployment Phase
- [ ] Old backend container stopped
- [ ] New backend container running healthily
- [ ] Backend logs show no connection errors
- [ ] Frontend container running and accessible
- [ ] All API endpoints responding correctly

### Post-Deployment
- [ ] Backend API `/api/subjects` returns data
- [ ] Frontend loads at `http://192.168.4.247:8089`
- [ ] Frontend API calls succeed (check browser console)
- [ ] phpMyAdmin accessible at `http://192.168.4.247:8080`
- [ ] aPanel routes configured and working
- [ ] Cloudflare DNS pointing to correct IP
- [ ] Domain names resolving correctly

### Production Verification
- [ ] HTTPS working for all routes
- [ ] CORS configured correctly (no browser errors)
- [ ] Database backups working
- [ ] Monitoring/logging in place
- [ ] Response times acceptable (<500ms API)
- [ ] No memory/CPU issues after 1 hour

---

## 🔧 TROUBLESHOOTING GUIDE

### Problem: Backend Shows "Unhealthy"

**Symptoms**: 
```
siswaroom-backend  Up 3 days (unhealthy)
```

**Solutions**:

```bash
# 1. Check logs for errors
docker logs siswaroom-backend -f

# 2. Test database connectivity manually
docker exec siswaroom-backend curl -v http://localhost:4000/api/subjects

# 3. Check if port 13306 is accessible
docker run --rm -it mysql:latest mysql -h192.168.4.247 -P13306 -uroot -padmin -e "SHOW DATABASES;"

# 4. Verify .env variables
docker exec siswaroom-backend env | grep DB_

# 5. Rebuild container
docker-compose down
docker-compose up -d --build

# 6. Check MySQL container
docker logs mysql_siswaroom-mysql_siswaroom-1 | tail -20
```

### Problem: Frontend CORS Errors

**Symptoms**:
```
Access to XMLHttpRequest at 'http://192.168.4.247:4001/api/subjects' 
from origin 'http://192.168.4.247:8089' has been blocked by CORS policy
```

**Solutions**:

```bash
# 1. Verify CORS_ORIGIN in backend .env
cat backend/.env | grep CORS_ORIGIN

# Must include: http://192.168.4.247:8089

# 2. Update if needed and restart
docker restart siswaroom-backend

# 3. Test CORS headers
curl -i -H "Origin: http://192.168.4.247:8089" \
  http://192.168.4.247:4001/api/subjects | grep -i "access-control"
```

### Problem: Frontend Can't Find Database

**Symptoms**:
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
API Error: Cannot reach backend
```

**Solutions**:

```bash
# 1. Verify API URL in frontend
cat frontend/.env.local | grep VITE_API_URL

# Should be: http://192.168.4.247:4001/api

# 2. Test backend connectivity
curl http://192.168.4.247:4001/health

# 3. Check frontend logs
docker logs siswaroom-frontend

# 4. Rebuild frontend with correct URL
docker build -t siswaroom-frontend:latest \
  --build-arg VITE_API_URL=http://192.168.4.247:4001/api \
  frontend/
```

### Problem: MySQL Connection Timeout

**Symptoms**:
```
Error: connect ETIMEDOUT 192.168.4.247:13306
```

**Solutions**:

```bash
# 1. Check MySQL container status
docker ps | grep mysql_siswaroom

# 2. Check MySQL logs
docker logs mysql_siswaroom-mysql_siswaroom-1

# 3. Test port accessibility
telnet 192.168.4.247 13306

# 4. Check port mapping
docker port mysql_siswaroom-mysql_siswaroom-1

# Should show: 3306/tcp -> 0.0.0.0:13306

# 5. Verify connection pool settings in backend
cat backend/src/config/db.js | grep -A5 "waitForConnections"
```

---

## 📊 MONITORING COMMANDS

```bash
# Monitor all siswaroom containers
watch -n 1 'docker ps | grep siswaroom'

# Monitor resource usage
docker stats siswaroom-backend siswaroom-frontend

# Monitor logs in real-time
docker logs -f siswaroom-backend
docker logs -f siswaroom-frontend

# Check health status
docker inspect siswaroom-backend --format='{{json .State.Health}}'

# Monitor database connections
docker exec mysql_siswaroom-mysql_siswaroom-1 mysql -u root -padmin -e "SHOW PROCESSLIST;"

# Check error logs
docker logs siswaroom-backend | grep -i "error"
docker logs siswaroom-frontend | grep -i "error"
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Backend Optimization
```bash
# Increase connection pool size
DB_POOL_SIZE=20

# Enable keep-alive
DB_ENABLE_KEEP_ALIVE=true

# Use production node environment
NODE_ENV=production

# Enable compression in Express
app.use(compression());
```

### Frontend Optimization
```bash
# Enable nginx caching
proxy_cache_valid 200 1d;
proxy_cache_key "$scheme$request_method$host$request_uri";

# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Add cache headers
Cache-Control: max-age=86400
```

### Database Optimization
```bash
# Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';

# Add indexes if needed
CREATE INDEX idx_subject_id ON materials(subject_id);
CREATE INDEX idx_user_id ON user_courses(user_id);

# Monitor connections
SHOW PROCESSLIST;
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Change `JWT_SECRET` from default value
- [ ] Change MySQL `DB_PASSWORD` if used in production
- [ ] Enable SSL/HTTPS for all routes in Cloudflare
- [ ] Implement rate limiting for API endpoints
- [ ] Add input validation for all endpoints
- [ ] Enable CORS only for trusted origins
- [ ] Implement authentication/authorization
- [ ] Regular database backups configured
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker images updated

---

## 📅 MAINTENANCE SCHEDULE

### Daily
- Monitor container health
- Check error logs
- Monitor resource usage

### Weekly
- Backup database
- Review access logs
- Update dependencies (if needed)

### Monthly
- Full backup (off-site)
- Security audit
- Performance analysis
- Database optimization

### Quarterly
- Update Docker images
- Review and update security settings
- Performance benchmarking

---

## 📞 SUPPORT INFORMATION

### Useful Commands

```bash
# Restart service
docker restart siswaroom-backend

# View logs (last 100 lines)
docker logs --tail 100 siswaroom-backend

# Connect to container shell
docker exec -it siswaroom-backend /bin/sh

# Execute command in container
docker exec siswaroom-backend npm list

# Copy files from container
docker cp siswaroom-backend:/app/src/config/db.js ./

# Copy files to container
docker cp ./config.js siswaroom-backend:/app/
```

### Getting Help

If you encounter issues:
1. Check logs: `docker logs siswaroom-backend -f`
2. Test connectivity: `curl http://192.168.4.247:4001/api/subjects`
3. Verify configuration: `cat backend/.env`
4. Check Docker status: `docker ps`
5. Review this guide's troubleshooting section

---

## 📝 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-08 | Initial setup for aPanel deployment |

---

## ✨ SUCCESS INDICATORS

When everything is working correctly, you should see:

✅ Backend container running and healthy
✅ Frontend accessible at `http://192.168.4.247:8089`
✅ API responding with data at `http://192.168.4.247:4001/api/subjects`
✅ phpMyAdmin accessible at `http://192.168.4.247:8080`
✅ No CORS errors in browser console
✅ Database tables populated with sample data
✅ Domain names resolving correctly (if DNS configured)
✅ HTTPS working for all routes (if SSL configured)

---

**Deployment Status**: ✅ Ready to Deploy
**Last Updated**: 2025-12-08
**Maintained By**: SiswaRoom Team

