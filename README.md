# SiswaRoom

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
