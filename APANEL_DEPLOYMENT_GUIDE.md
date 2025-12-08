# DEPLOYMENT GUIDE: SiswaRoom di aPanel Docker

## Overview

Panduan ini menjelaskan cara deploy SiswaRoom backend dan frontend menggunakan Docker di aPanel dengan MySQL dan phpMyAdmin yang sudah ada.

### Infrastructure aPanel Anda

```
MySQL:       mysql_siswaroom-mysql_siswaroom-1 (port 13306)
phpMyAdmin:  phpmyadmin_siswaroom-phpmyadmin_siswaroom-1 (port 8080)
Frontend:    siswaroom-web (port 8088)
Backend:     siswaroom-backend (port 4000) - UNHEALTHY - perlu diperbaiki
```

---

## Step 1: Update Configuration Files

### 1.1 Backend .env

File: `backend/.env`

```env
# Koneksi ke MySQL aPanel yang sudah ada
DB_HOST=localhost
DB_PORT=13306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=siswaroom

# JWT Configuration
JWT_SECRET=supersecretjwt
JWT_EXPIRE=7d

# Server
PORT=4000
NODE_ENV=development
API_URL=http://192.168.4.247:4001
CORS_ORIGIN=http://192.168.4.247:8088,http://siswaroom.online,https://siswaroom.online
```

### 1.2 Frontend .env.local

File: `frontend/.env.local`

```env
VITE_API_URL=http://192.168.4.247:4001/api
VITE_APP_TITLE=SiswaRoom
VITE_APP_DESCRIPTION=Platform Pembelajaran Online
```

---

## Step 2: Prepare Database

### 2.1 Import SQL Schema

Login ke phpMyAdmin: http://192.168.4.247:8080

1. Pilih Database: `siswaroom`
2. Klik "Import"
3. Upload file: `backend/sql/simple.sql`
4. Klik "Go"

**Status**: ✅ Database schema dengan 11 tables akan ter-create otomatis dengan sample data

---

## Step 3: Deploy Backend

### Option A: Development (Current Setup)

```bash
# Di dalam directory backend/
docker-compose up -d --build

# Check logs
docker logs siswaroom-backend -f

# Check container health
docker inspect siswaroom-backend | grep -A 4 "Health"
```

### Option B: Production (Recommended for aPanel)

```bash
# Gunakan docker-compose-aPanel.yml
docker-compose -f docker-compose-aPanel.yml up -d --build

# Check logs
docker logs siswaroom-backend-prod -f
```

---

## Step 4: Deploy Frontend

### Option A: Development Build

```bash
# Di dalam directory frontend/
docker build -t siswaroom-frontend:latest .
docker run -d \
  --name siswaroom-frontend-dev \
  -p 8089:80 \
  -e VITE_API_URL=http://192.168.4.247:4001/api \
  siswaroom-frontend:latest
```

### Option B: Production Build (via docker-compose)

Frontend sudah ter-build dalam `docker-compose-aPanel.yml`

```bash
# Run dari backend directory
docker-compose -f docker-compose-aPanel.yml up -d siswaroom-frontend
```

---

## Step 5: Verify Deployment

### 5.1 Test Backend Connectivity

```bash
# Test API endpoint
curl http://192.168.4.247:4001/api/subjects

# Expected response (jika berhasil):
[{"subject_id": 1, "name": "Web Development", ...}]
```

### 5.2 Test Database Connectivity

```bash
# SSH ke server aPanel
ssh root@192.168.4.247

# Check if backend can reach MySQL
docker logs siswaroom-backend | grep -i "database\|mysql\|connected"
```

### 5.3 Test Frontend Loading

```
Browser: http://192.168.4.247:8089
Expected: SiswaRoom website loads
```

### 5.4 Check Container Status

```bash
docker ps | grep siswaroom
```

Expected output:

```
siswaroom-backend-prod     Running ✅
siswaroom-frontend-prod    Running ✅
siswaroom-web              Running ✅ (existing frontend)
mysql_siswaroom            Running ✅
phpmyadmin_siswaroom       Running ✅
```

---

## Step 6: Configure aPanel Routes (Published Application Routes)

Di aPanel Control Panel, buat routes untuk:

### 6.1 Backend API Route

```
Domain:  api.siswaroom.online
Path:    /api/*
Service: http://192.168.4.247:4001
```

### 6.2 Frontend Route

```
Domain:  siswaroom.online
Path:    *
Service: http://192.168.4.247:8089
```

### 6.3 phpMyAdmin Route

```
Domain:  pma.siswaroom.online
Path:    *
Service: http://192.168.4.247:8080
```

---

## Troubleshooting

### Backend Shows "Unhealthy"

**Problem**: `siswaroom-backend` status `Up 3 days (unhealthy)`

**Solution**:

```bash
# 1. Check logs
docker logs siswaroom-backend

# 2. Check database connectivity
docker exec siswaroom-backend curl -v http://localhost:4000/api/subjects

# 3. Restart container
docker restart siswaroom-backend

# 4. Force rebuild
docker-compose down
docker-compose up -d --build

# 5. Check if MySQL port 13306 is accessible
telnet 192.168.4.247 13306
```

### Frontend Can't Connect to Backend

**Problem**: CORS error atau API calls timeout

**Solution**:

```bash
# 1. Verify API_URL in VITE_API_URL
echo $VITE_API_URL

# 2. Check backend CORS settings
# Pastikan backend/.env memiliki CORS_ORIGIN yang benar:
CORS_ORIGIN=http://192.168.4.247:8089,http://siswaroom.online

# 3. Rebuild frontend
docker build -t siswaroom-frontend:latest ../frontend
```

### MySQL Connection Refused

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:13306`

**Solution**:

```bash
# 1. Check MySQL container status
docker ps | grep mysql_siswaroom

# 2. Check MySQL logs
docker logs mysql_siswaroom-mysql_siswaroom-1

# 3. Verify port mapping
docker port mysql_siswaroom-mysql_siswaroom-1

# Should show: 3306/tcp -> 0.0.0.0:13306

# 4. If not accessible, check docker network
docker network inspect bridge | grep mysql
```

---

## Port Reference

| Service        | Container Port | Host Port | Purpose                  |
| -------------- | -------------- | --------- | ------------------------ |
| MySQL          | 3306           | 13306     | Database                 |
| phpMyAdmin     | 80             | 8080      | Database Management      |
| Backend        | 4000           | 4001      | API Endpoints            |
| Frontend (old) | 80             | 8088      | Frontend (siswaroom-web) |
| Frontend (new) | 80             | 8089      | Frontend (new container) |

---

## Database Management

### Access phpMyAdmin

```
URL: http://192.168.4.247:8080
Username: root
Password: admin
```

### Database Tables

```
1. users (4 records)
2. subjects (4 records)
3. topics (6 records)
4. materials (4 records)
5. quizzes (3 records)
6. questions (8 records)
7. quiz_questions (mapping)
8. quiz_results (results)
9. class_schedule (schedules)
10. class_students (attendance)
11. user_courses (enrollments)
```

### Backup Database

```bash
# Via phpMyAdmin: Tools > Export
# Or via command line:
docker exec mysql_siswaroom-mysql_siswaroom-1 mysqldump -u root -padmin siswaroom > backup.sql
```

---

## API Endpoints

### Public Endpoints

```
GET  /api/subjects          - List all subjects
GET  /api/subjects/:id      - Get subject detail
GET  /api/topics            - List all topics
GET  /api/topics/:slug      - Get topic by slug
GET  /api/materials         - List materials
```

### Protected Endpoints (Require JWT)

```
POST /api/auth/login        - User login
POST /api/auth/register     - User registration
GET  /api/user/profile      - Get user profile
POST /api/courses/enroll    - Enroll in course
```

---

## Environment Variables Summary

### Backend (.env)

| Variable    | Value                     | Notes                             |
| ----------- | ------------------------- | --------------------------------- |
| DB_HOST     | localhost                 | aPanel host                       |
| DB_PORT     | 13306                     | Exposed port dari mysql_siswaroom |
| DB_USER     | root                      | MySQL root                        |
| DB_PASSWORD | admin                     | MySQL password                    |
| DB_NAME     | siswaroom                 | Database name                     |
| API_URL     | http://192.168.4.247:4001 | Backend public URL                |
| PORT        | 4000                      | Container port                    |

### Frontend (.env.local)

| Variable     | Value                         | Notes                |
| ------------ | ----------------------------- | -------------------- |
| VITE_API_URL | http://192.168.4.247:4001/api | Backend API endpoint |

---

## Next Steps

1. ✅ Update `.env` files dengan konfigurasi aPanel
2. ✅ Import database via phpMyAdmin
3. ⬜ Stop container backend yang lama: `docker stop siswaroom-backend`
4. ⬜ Jalankan container backend baru: `docker-compose up -d`
5. ⬜ Verifikasi konektivitas API
6. ⬜ Update frontend dengan VITE_API_URL baru
7. ⬜ Configure aPanel routes untuk Cloudflare

---

## Support

Jika ada masalah:

1. Check logs: `docker logs [container_name]`
2. Check connectivity: `docker exec [container_name] curl http://target:port`
3. Restart container: `docker restart [container_name]`
4. Rebuild image: `docker-compose down && docker-compose up -d --build`
