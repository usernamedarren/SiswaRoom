# 📚 SiswaRoom

> Platform pembelajaran digital dengan fitur AI Chatbot untuk membantu siswa memahami materi pelajaran.

## 🚀 Fitur Utama

- 🎓 **Learning Management System** - Kelola mata pelajaran, materi, dan quiz
- 🤖 **AI Chatbot** - Asisten pembelajaran berbasis LLM (Llama 3.3 70B)
- 👥 **Multi-Role System** - Admin, Teacher, Student
- 📖 **Digital Library** - Repository materi pembelajaran
- 📊 **Dashboard Analytics** - Tracking progress siswa
- 🔐 **JWT Authentication** - Keamanan berbasis token
- 🐳 **Docker Ready** - Deploy dengan satu command

---

## 🏗️ Teknologi Stack

### Backend
- **Runtime:** Node.js 22 (Alpine)
- **Framework:** Express.js
- **Database:** MySQL 9.0.1
- **Auth:** JWT + bcryptjs
- **AI Integration:** Groq API (Llama 3.3 70B Versatile)
- **API Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** Vanilla JavaScript + Vite 7
- **Build Tool:** Vite
- **Server:** Nginx (Alpine)
- **UI:** Responsive Design + Dark Mode Support

### DevOps
- **Containerization:** Docker + Docker Compose
- **Network:** Custom bridge network (siswaroom-net)
- **Health Checks:** Automated container monitoring

## 🔑 Sample Login Credentials

| Email                  | Password    | Role    |
| ---------------------- | ----------- | ------- |
| admin@siswaroom.com    | password123 | Admin   |
| teacher1@siswaroom.com | password123 | Teacher |
| student1@siswaroom.com | password123 | Student |

## 📊 Database Schema

### Core Tables
- **users** - User accounts (admin, teacher, student)
- **subjects** - Mata pelajaran
- **topics** - Topik pembelajaran (database-driven)
- **materials** - Materi pembelajaran
- **quizzes** - Quiz/ujian
- **questions** - Soal quiz
- **quiz_questions** - Relasi quiz-questions
- **quiz_results** - Hasil quiz siswa
- **class_schedule** - Jadwal kelas
- **class_students** - Relasi kelas-siswa

---

### Build Production in Docker
```bash
# Backend
cd /www/SiswaRoom/backend
docker compose down
docker compose up -d --build

# Frontend
cd /www/SiswaRoom/frontend
docker stop siswaroom-web && docker rm siswaroom-web
docker build -t siswaroom-frontend --build-arg VITE_API_URL=https://api.siswaroom.online/api .
docker run -d -p 8088:80 --name siswaroom-web siswaroom-frontend

```

## 🐳 Docker Configuration

### Services
- **backend** - Node.js API (Port 4000)
- **frontend** - Nginx static server (Port 8088)
- **mysql** - MySQL 9.0.1 database (External container)

### Networks
- **siswaroom-net**

## 📖 API Documentation

- **API Docs:** Akses Swagger UI di `/api-docs` setelah menjalankan backend