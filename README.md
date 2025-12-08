# 🎓 SiswaRoom - Online Learning Platform

## ✅ COMPLETE DATABASE MIGRATION TO MySQL/phpMyAdmin

---

## 🚀 Quick Start (5 Minutes)

### 1. Import Database

Open `backend/sql/simple.sql` → Copy all → phpMyAdmin SQL tab → Paste → Go

### 2. Configure Backend

Edit `backend/.env` with your MySQL credentials

### 3. Start Backend

```bash
cd backend && npm install && npm run dev
```

### 4. Start Frontend

```bash
cd frontend && npm install && npm run dev
```

Access at: **http://localhost:5173**

---

## 📚 Documentation

- **QUICK_START.md** - 5-minute setup
- **DATABASE_SETUP.md** - Complete step-by-step guide
- **MIGRATION_SUMMARY.md** - Technical details

---

## ✨ What's New

✅ Full MySQL database integration
✅ Topic management system (database-driven)
✅ 11 database tables with relationships
✅ Sample data included (4 subjects, 10 topics, 8 quizzes)
✅ Complete API endpoints
✅ Role-based access (Admin, Teacher, Student)
✅ Production-ready

---

## 📊 Database Tables

- users
- subjects
- topics _(NEW - now database-driven)_
- materials
- quizzes
- questions
- quiz_questions
- quiz_results
- class_schedule
- class_students
- user_courses

---

## 🔑 Sample Login

| Email                  | Password    | Role    |
| ---------------------- | ----------- | ------- |
| admin@siswaroom.com    | password123 | Admin   |
| teacher1@siswaroom.com | password123 | Teacher |
| student1@siswaroom.com | password123 | Student |

---

## 🔌 API Endpoints

### Topics (Database-based)

```
GET    /api/topics/subject/:subjectId
GET    /api/topics/:id
POST   /api/topics              (teacher/admin)
PUT    /api/topics/:id          (teacher/admin)
DELETE /api/topics/:id          (teacher/admin)
```

---

# SiswaRoom
