# 📚 SiswaRoom

> Platform pembelajaran digital dengan fitur AI Chatbot untuk membantu siswa memahami materi pelajaran.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)

---

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

---

## 📦 Instalasi

### Prerequisites
- Docker & Docker Compose
- Git
- Node.js 22+ (untuk development lokal)

### 1. Clone Repository
```bash
git clone https://github.com/usernamedarren/SiswaRoom.git
cd SiswaRoom
```

### 2. Setup Environment Variables
```bash
# Copy template .env
cp .env.example .env

# Edit .env dan isi dengan konfigurasi Anda
# Minimal yang harus diisi:
# - DB_PASSWORD
# - JWT_SECRET
# - GROQ_API_KEY (untuk AI Chatbot)
```

### 3. Jalankan dengan Docker Compose
```bash
# Pastikan sudah ada network siswaroom-net
docker network create siswaroom-net

# Jalankan MySQL container terlebih dahulu (jika belum)
# Atau gunakan MySQL container yang sudah ada

# Build dan jalankan aplikasi
docker compose up -d --build
```

### 4. Akses Aplikasi
- **Frontend:** http://localhost:8088
- **Backend API:** http://localhost:4000
- **API Documentation:** http://localhost:4000/api-docs

---

## 🔑 Sample Login Credentials

| Email                  | Password    | Role    |
| ---------------------- | ----------- | ------- |
| admin@siswaroom.com    | password123 | Admin   |
| teacher1@siswaroom.com | password123 | Teacher |
| student1@siswaroom.com | password123 | Student |

---

## 🤖 AI Chatbot Integration

SiswaRoom mengintegrasikan **Intelligent Chatbot** berbasis Large Language Model (LLM) menggunakan Groq API dengan model `llama-3.3-70b-versatile`.

### Fitur AI Chatbot:
- ✅ **Conversational Learning Assistant** - Chat natural dengan context history
- ✅ **Subject-Specific Help** - Bantuan per mata pelajaran (Matematika, Fisika, Biologi, dll)
- ✅ **Multi-Level Explanations** - Beginner, Intermediate, Advanced
- ✅ **Bahasa Indonesia** - Mendukung bahasa lokal

### API Endpoints (Protected - JWT Required):
```
POST   /api/chatbot/message      # General chat dengan conversation history
POST   /api/chatbot/topic-help   # Bantuan topik pembelajaran spesifik
POST   /api/chatbot/explain      # Penjelasan konsep dengan level
GET    /api/chatbot/health       # Health check AI service
```

### Akses Chatbot:
- **Navbar Button:** Klik "🤖 AI Tutor" di navbar (setelah Quiz)
- **Floating Button:** Tombol chat di kanan bawah layar
- **Keyboard Shortcut:** Klik tombol untuk toggle widget

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register        # Register user baru
POST   /api/auth/login           # Login user
GET    /api/auth/me              # Get current user (protected)
```

### Courses & Materials
```
GET    /api/courses              # List semua courses
GET    /api/courses/:id          # Detail course
POST   /api/courses              # Create course (teacher/admin)
PUT    /api/courses/:id          # Update course (teacher/admin)
DELETE /api/courses/:id          # Delete course (teacher/admin)

GET    /api/materials            # List materials
POST   /api/materials            # Create material (teacher/admin)
```

### Quizzes
```
GET    /api/quizzes              # List quizzes
GET    /api/quizzes/:id          # Detail quiz
POST   /api/quizzes              # Create quiz (teacher/admin)
POST   /api/quiz-attempts        # Submit quiz attempt
GET    /api/quiz-attempts/:id    # Get quiz results
```

### Library
```
GET    /api/library              # List library items
POST   /api/library              # Create library item (teacher/admin)
PUT    /api/library/:id          # Update library item (teacher/admin)
DELETE /api/library/:id          # Delete library item (teacher/admin)
```

### Dashboard & Activity
```
GET    /api/dashboard            # Dashboard data (protected)
GET    /api/activity             # Activity log (protected)
```

### Topics (Database-based)
```
GET    /api/topics/subject/:subjectId   # Topics by subject
GET    /api/topics/:id                  # Detail topic
POST   /api/topics                      # Create topic (teacher/admin)
PUT    /api/topics/:id                  # Update topic (teacher/admin)
DELETE /api/topics/:id                  # Delete topic (teacher/admin)
```

### AI Chatbot
```
POST   /api/chatbot/message      # Chat dengan AI
POST   /api/chatbot/topic-help   # Bantuan topik
POST   /api/chatbot/explain      # Penjelasan konsep
GET    /api/chatbot/health       # Health check
```

---

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
- **user_courses** - Enrollment siswa ke course

---

## 🛠️ Development

### Local Development (Without Docker)

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi local
npm start
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit VITE_API_URL jika perlu
npm run dev
```

### Build Production
```bash
# Frontend build
cd frontend
npm run build

# Backend already uses production mode in Docker
```

---

## 📝 Environment Variables

### Root `.env` (Docker Compose)
```env
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=siswaroom
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
AI_MODEL=llama-3.3-70b-versatile
VITE_API_URL=https://api.siswaroom.online/api
```

### Backend `.env`
```env
DB_HOST=mysql_container_name
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=siswaroom
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
AI_MODEL=llama-3.3-70b-versatile
AI_API_URL=https://api.groq.com/openai/v1/chat/completions
```

### Frontend `.env`
```env
VITE_API_URL=https://api.siswaroom.online/api
```

---

## 🐳 Docker Configuration

### Services
- **backend** - Node.js API (Port 4000)
- **frontend** - Nginx static server (Port 8088)
- **mysql** - MySQL 9.0.1 database (External container)

### Networks
- **siswaroom-net** - Custom bridge network untuk inter-container communication

### Health Checks
- Backend: `curl http://localhost:4000/api/health` (30s interval)
- Frontend: `curl http://localhost/health` (30s interval)

---

## 📖 Documentation

- **API Docs:** Akses Swagger UI di `/api-docs` setelah menjalankan backend
- **Architecture:** Layered architecture (Routes → Controllers → Services → Models)
- **Security:** JWT-based authentication, CORS configured, environment-based secrets

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Darren** - [GitHub](https://github.com/usernamedarren)

---

## 🙏 Acknowledgments

- Groq API for AI integration
- Open source community
- All contributors

---

## 📞 Support

Untuk pertanyaan atau issues, silakan buka [GitHub Issues](https://github.com/usernamedarren/SiswaRoom/issues).
