# SiswaRoom Integration API Documentation

Platform teman Anda dapat menggunakan 5 API endpoints berikut untuk mengakses data dari SiswaRoom.

## Authentication

Semua endpoints (kecuali `/health`) memerlukan API Key dalam header:

```bash
X-API-Key: your-api-key-here
```

### API Keys yang Tersedia

Development:
- `demo-key-123`
- `partner-platform-key-456`
- `your-partner-key-789`

Production: Hubungi admin untuk mendapatkan API key yang valid.

---

## Endpoint 1: Get Students

**URL:** `GET /api/integration/students`

**Authentication:** Required (X-API-Key header)

**Description:** Mengambil daftar semua siswa beserta statistik progress mereka

**Response:**
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@siswaroom.com",
      "role": "student",
      "enrolledCourses": 5,
      "quizzesTaken": 12,
      "averageScore": "78.50",
      "joinDate": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Siti Nurhaliza",
      "email": "siti@siswaroom.com",
      "role": "student",
      "enrolledCourses": 4,
      "quizzesTaken": 8,
      "averageScore": "85.25",
      "joinDate": "2024-02-20T14:15:00Z"
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET "http://192.168.4.247:4000/api/integration/students" \
  -H "X-API-Key: demo-key-123" \
  -H "Content-Type: application/json"
```

**JavaScript Fetch:**
```javascript
const response = await fetch('http://192.168.4.247:4000/api/integration/students', {
  headers: {
    'X-API-Key': 'demo-key-123',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);
```

---

## Endpoint 2: Get Courses

**URL:** `GET /api/integration/courses`

**Authentication:** Required (X-API-Key header)

**Description:** Mengambil daftar semua kursus dengan info materi dan enrollment

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": 1,
      "name": "Matematika Dasar",
      "description": "Kursus matematika untuk level pemula",
      "category": "Matematika",
      "totalEnrolled": 45,
      "totalMaterials": 15,
      "createdAt": "2024-01-10T08:00:00Z"
    },
    {
      "id": 2,
      "name": "Bahasa Inggris",
      "description": "Kursus bahasa Inggris intensif",
      "category": "Bahasa",
      "totalEnrolled": 62,
      "totalMaterials": 20,
      "createdAt": "2024-01-12T09:30:00Z"
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET "http://192.168.4.247:4000/api/integration/courses" \
  -H "X-API-Key: demo-key-123"
```

**JavaScript:**
```javascript
async function getCourses() {
  const response = await fetch('http://192.168.4.247:4000/api/integration/courses', {
    headers: {
      'X-API-Key': 'demo-key-123'
    }
  });
  return await response.json();
}
```

---

## Endpoint 3: Get Schedules

**URL:** `GET /api/integration/schedules`

**Authentication:** Required (X-API-Key header)

**Description:** Mengambil jadwal kelas dengan info guru dan ruangan

**Response:**
```json
{
  "success": true,
  "count": 24,
  "data": [
    {
      "id": 1,
      "subjectId": 1,
      "subjectName": "Matematika Dasar",
      "teacherId": 5,
      "teacherName": "Dr. Rini Sulistio",
      "teacherEmail": "rini@siswaroom.com",
      "room": "Ruang A101",
      "day": "Monday",
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "studentCount": 45
    },
    {
      "id": 2,
      "subjectId": 2,
      "subjectName": "Bahasa Inggris",
      "teacherId": 6,
      "teacherName": "Miss Sarah Johnson",
      "teacherEmail": "sarah@siswaroom.com",
      "room": "Ruang B205",
      "day": "Tuesday",
      "startTime": "10:00:00",
      "endTime": "11:30:00",
      "studentCount": 62
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET "http://192.168.4.247:4000/api/integration/schedules" \
  -H "X-API-Key: demo-key-123"
```

---

## Endpoint 4: Get Quizzes

**URL:** `GET /api/integration/quizzes`

**Authentication:** Required (X-API-Key header)

**Description:** Mengambil daftar quiz dengan hasil dan statistik

**Response:**
```json
{
  "success": true,
  "count": 18,
  "data": [
    {
      "id": 1,
      "subjectId": 1,
      "subjectName": "Matematika Dasar",
      "title": "Quiz Aljabar Dasar",
      "description": "Menguji pemahaman konsep aljabar",
      "durationMinutes": 45,
      "passingScore": 70,
      "totalAttempts": 42,
      "averageScore": "76.80",
      "createdAt": "2024-02-01T10:00:00Z"
    },
    {
      "id": 2,
      "subjectId": 2,
      "subjectName": "Bahasa Inggris",
      "title": "Reading Comprehension",
      "description": "Tes pemahaman membaca bahasa Inggris",
      "durationMinutes": 30,
      "passingScore": 75,
      "totalAttempts": 58,
      "averageScore": "82.15",
      "createdAt": "2024-02-03T14:30:00Z"
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET "http://192.168.4.247:4000/api/integration/quizzes" \
  -H "X-API-Key: demo-key-123"
```

---

## Endpoint 5: Sync Grades

**URL:** `POST /api/integration/sync-grades`

**Authentication:** Required (X-API-Key header)

**Description:** Menerima dan mensinkronisasi nilai dari platform partner

**Request Body:**
```json
{
  "studentId": 1,
  "courseId": 2,
  "grade": 92.5,
  "source": "partner-platform-name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Grade synced successfully",
  "data": {
    "studentId": 1,
    "courseId": 2,
    "grade": 92.5,
    "syncdAt": "2024-12-08T15:45:30.123Z"
  }
}
```

**Required Fields:**
- `studentId` (number): ID siswa di database SiswaRoom
- `courseId` (number): ID kursus di database SiswaRoom
- `grade` (number): Nilai (0-100)
- `source` (string, optional): Nama platform pengirim (untuk logging)

**Example cURL:**
```bash
curl -X POST "http://192.168.4.247:4000/api/integration/sync-grades" \
  -H "X-API-Key: demo-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "courseId": 2,
    "grade": 92.5,
    "source": "partner-platform"
  }'
```

**JavaScript:**
```javascript
async function syncGrade(studentId, courseId, grade) {
  const response = await fetch('http://192.168.4.247:4000/api/integration/sync-grades', {
    method: 'POST',
    headers: {
      'X-API-Key': 'demo-key-123',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      studentId,
      courseId,
      grade,
      source: 'my-platform'
    })
  });
  return await response.json();
}

// Usage
syncGrade(1, 2, 92.5).then(result => console.log(result));
```

---

## Health Check Endpoint (No Auth Required)

**URL:** `GET /api/integration/health`

**Description:** Cek status API integration

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-12-08T15:50:00.000Z",
  "version": "1.0.0"
}
```

---

## Error Responses

### Missing API Key
```json
{
  "success": false,
  "error": "Invalid or missing API key",
  "message": "Please provide valid X-API-Key header"
}
```

### Invalid Student/Course
```json
{
  "success": false,
  "error": "Student not found"
}
```

### Missing Required Fields
```json
{
  "success": false,
  "error": "Missing required fields: studentId, courseId, grade"
}
```

---

## Rate Limiting & Quotas

- **Limit:** 1000 requests per hour per API key
- **Max records per request:** 1000 untuk GET, 1 untuk POST
- **Response timeout:** 30 seconds

---

## Integration Examples

### Python
```python
import requests
import json

API_KEY = "demo-key-123"
BASE_URL = "http://192.168.4.247:4000/api/integration"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Get students
response = requests.get(f"{BASE_URL}/students", headers=headers)
students = response.json()
print(f"Total students: {students['count']}")

# Sync a grade
sync_data = {
    "studentId": 1,
    "courseId": 2,
    "grade": 85.0,
    "source": "python-script"
}
response = requests.post(f"{BASE_URL}/sync-grades", headers=headers, json=sync_data)
print(response.json())
```

### PHP
```php
<?php
$apiKey = "demo-key-123";
$baseUrl = "http://192.168.4.247:4000/api/integration";

$headers = [
    "X-API-Key: " . $apiKey,
    "Content-Type: application/json"
];

// Get courses
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $baseUrl . "/courses",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => $headers
]);

$response = curl_exec($curl);
$data = json_decode($response, true);
echo "Total courses: " . $data['count'];
curl_close($curl);
?>
```

---

## Support & Contact

Untuk pertanyaan teknis atau untuk mendapatkan API key baru, silakan hubungi:
- Email: support@siswaroom.com
- WhatsApp: +62-XXX-XXXX-XXXX

---

**Last Updated:** December 8, 2024
**API Version:** 1.0.0
**Status:** Production Ready
