# 🚀 QUICK DEPLOYMENT CHECKLIST - SiswaRoom aPanel

## Status Kontainer Saat Ini
```
✅ mysql_siswaroom-mysql_siswaroom-1 (port 13306) - RUNNING
✅ phpmyadmin_siswaroom-phpmyadmin_siswaroom-1 (port 8080) - RUNNING
❌ siswaroom-backend (port 4000) - UNHEALTHY (perlu diperbaiki)
✅ siswaroom-web (port 8088) - RUNNING
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Database Setup
- [ ] Database `siswaroom` sudah exist di MySQL aPanel
- [ ] Login phpMyAdmin di `http://192.168.4.247:8080`
- [ ] Import SQL: `backend/sql/simple.sql` ke database `siswaroom`
- [ ] Verifikasi 11 tables ter-create dengan data sample

### 2. Configuration Files
- [ ] Update `backend/.env`:
  ```
  DB_HOST=localhost
  DB_PORT=13306
  DB_USER=root
  DB_PASSWORD=admin
  DB_NAME=siswaroom
  API_URL=http://192.168.4.247:4001
  ```
- [ ] Update `frontend/.env.local`:
  ```
  VITE_API_URL=http://192.168.4.247:4001/api
  ```

### 3. Code Changes
- [ ] ✅ Updated `backend/app.js` dengan proper CORS configuration
- [ ] ✅ Created `docker-compose-aPanel.yml` untuk production
- [ ] ✅ Created `APANEL_DEPLOYMENT_GUIDE.md`

---

## 🐳 DEPLOYMENT COMMANDS

### Step 1: Stop Old Container
```bash
docker stop siswaroom-backend
docker rm siswaroom-backend
```

### Step 2: Build & Run New Backend
```bash
cd /path/to/SiswaRoom/backend

# Option A: Development
docker-compose up -d --build

# Option B: Production (Recommended)
docker-compose -f docker-compose-aPanel.yml up -d --build
```

### Step 3: Verify Backend
```bash
# Check if container running
docker ps | grep siswaroom-backend

# Check logs
docker logs siswaroom-backend -f

# Test API
curl http://192.168.4.247:4001/api/subjects
```

### Step 4: Deploy Frontend (if needed)
```bash
cd /path/to/SiswaRoom/frontend

# Build
docker build -t siswaroom-frontend:latest .

# Run
docker run -d \
  --name siswaroom-frontend-new \
  -p 8089:80 \
  -e VITE_API_URL=http://192.168.4.247:4001/api \
  siswaroom-frontend:latest

# Or use docker-compose
docker-compose -f ../backend/docker-compose-aPanel.yml up -d siswaroom-frontend
```

### Step 5: Verify Frontend
```bash
curl http://192.168.4.247:8089
```

---

## 🔧 TROUBLESHOOTING QUICK FIX

### Backend Connection Error
```bash
# 1. Check MySQL accessibility
docker exec siswaroom-backend nc -zv localhost 13306

# 2. Check backend logs
docker logs siswaroom-backend

# 3. Restart backend
docker restart siswaroom-backend

# 4. Rebuild if needed
docker-compose down && docker-compose up -d --build
```

### Frontend CORS Error
```bash
# Update backend CORS in .env:
CORS_ORIGIN=http://192.168.4.247:8089,http://siswaroom.online,https://siswaroom.online

# Restart backend
docker restart siswaroom-backend
```

### Network Issues
```bash
# Check if containers can communicate
docker network ls
docker network inspect bridge | grep siswaroom

# Test connectivity from backend to MySQL
docker exec siswaroom-backend ping localhost
```

---

## 📊 Port Reference

| Service | Container Port | Host Port | URL |
|---------|---|---|---|
| Backend API | 4000 | 4001 | http://192.168.4.247:4001 |
| Frontend | 80 | 8089 | http://192.168.4.247:8089 |
| Old Frontend | 80 | 8088 | http://192.168.4.247:8088 |
| phpMyAdmin | 80 | 8080 | http://192.168.4.247:8080 |
| MySQL | 3306 | 13306 | localhost:13306 |

---

## 📍 Cloudflare Routes (aPanel)

### Route 1: API
- Domain: `api.siswaroom.online`
- Path: `/api/*`
- Service: `http://192.168.4.247:4001`

### Route 2: Frontend
- Domain: `siswaroom.online`
- Path: `*`
- Service: `http://192.168.4.247:8089`

### Route 3: phpMyAdmin
- Domain: `pma.siswaroom.online`
- Path: `*`
- Service: `http://192.168.4.247:8080`

---

## ✅ POST-DEPLOYMENT VERIFICATION

```bash
# 1. Check all containers
docker ps | grep siswaroom

# 2. Test API endpoint
curl -X GET http://192.168.4.247:4001/api/subjects

# 3. Check database connection
docker logs siswaroom-backend | grep -i "database\|connected"

# 4. Test health endpoint
curl http://192.168.4.247:4001/health

# 5. Visit frontend
# Browser: http://192.168.4.247:8089
# Expected: SiswaRoom page loads with data from API
```

---

## 📁 Important Files

```
backend/
├── .env                           # Development config
├── .env.production                # Production config
├── docker-compose.yml             # Dev compose
├── docker-compose-aPanel.yml      # Production compose
├── Dockerfile                     # Backend image
└── src/
    ├── app.js                    # ✅ Updated with CORS
    ├── server.js
    └── config/db.js              # MySQL connection pool

frontend/
├── .env.local                     # ✅ Updated for aPanel
├── .env.production
└── Dockerfile                     # Frontend image

sql/
└── simple.sql                    # Database schema + data

APANEL_DEPLOYMENT_GUIDE.md        # ✅ Complete guide
```

---

## 🎯 Success Criteria

- [ ] Backend container berjalan healthy
- [ ] Frontend container berjalan
- [ ] API endpoint `/api/subjects` mengembalikan data
- [ ] Frontend bisa load dari `http://192.168.4.247:8089`
- [ ] Tidak ada CORS errors di console
- [ ] Database dapat di-backup dari phpMyAdmin
- [ ] Cloudflare routes terkonfigurasi

---

## 📞 Next Actions

1. **Immediate**: Run `docker-compose up -d --build` di backend directory
2. **Verify**: Test semua endpoints menggunakan curl/postman
3. **Frontend**: Jika sudah berjalan, update route di aPanel
4. **DNS**: Point `siswaroom.online` ke `192.168.4.247` di Cloudflare
5. **Monitor**: Watch logs untuk 24 jam pertama

---

## 💾 Backup & Recovery

### Backup Database
```bash
docker exec mysql_siswaroom-mysql_siswaroom-1 mysqldump -u root -padmin siswaroom > siswaroom_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
docker exec -i mysql_siswaroom-mysql_siswaroom-1 mysql -u root -padmin siswaroom < siswaroom_backup.sql
```

### Clear & Restart
```bash
docker-compose down -v
docker-compose up -d --build
```

---

**Status**: ✅ Siap untuk di-deploy ke aPanel
**Updated**: 2025-12-08
**Version**: 1.0
