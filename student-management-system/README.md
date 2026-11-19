# University Student Management System

A complete full-stack web application built with **Node.js + Express.js**, **TypeORM**, **PostgreSQL**, and a **premium black-and-white HTML/CSS/JS frontend**.

---

## 🗂 Project Structure

```
student-management-system/
├── backend/
│   ├── src/
│   │   ├── config/database.js       ← TypeORM + PostgreSQL config
│   │   ├── entities/                ← User, Student, Department, Course, Enrollment
│   │   ├── controllers/             ← Business logic for each resource
│   │   ├── routes/                  ← Express route definitions
│   │   ├── middleware/auth.js        ← JWT authentication + role guards
│   │   ├── middleware/upload.js      ← Multer file upload
│   │   ├── utils/seed.js            ← Admin seeder + default departments
│   │   ├── app.js                   ← Express app setup
│   │   └── server.js               ← Entry point
│   ├── uploads/                     ← Profile picture uploads
│   ├── .env                         ← Your environment variables
│   └── package.json
│
└── frontend/
    ├── index.html                   ← Landing / redirect page
    ├── login.html                   ← Student login
    ├── signup.html                  ← Student signup
    ├── student-dashboard.html       ← Student portal
    ├── student-registration.html    ← Registration form
    ├── admin-login.html             ← Admin login
    ├── admin-dashboard.html         ← Admin portal
    ├── pages/
    │   ├── students.html            ← Student management table
    │   ├── departments.html         ← Department management
    │   ├── courses.html             ← Course management
    │   └── enrollments.html         ← Enrollment management
    ├── css/style.css                ← Global B&W design system
    └── js/
        ├── auth.js                  ← JWT helpers, modal/toast utilities
        ├── admin.js                 ← Admin shared utilities
        └── student.js              ← Student shared utilities
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+ running locally
- A PostgreSQL user with CREATE DATABASE permission

---

## 🚀 Setup Instructions

### 1. Configure the database

Create the database in PostgreSQL:
```sql
CREATE DATABASE university_db;
```

### 2. Configure environment variables

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_actual_password
DB_NAME=university_db

JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRES_IN=24h

ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=System Administrator

PORT=5000
NODE_ENV=development
```

### 3. Install dependencies

```powershell
cd backend
npm install
```

### 4. Seed the admin account + default departments

```powershell
npm run seed
```

This creates:
- One admin account (`admin@university.edu` / `Admin@123456`)
- Five default departments (CS, SE, EE, BBA, Math)

### 5. Start the server

```powershell
npm start
# or for auto-reload during development:
npm run dev
```

The server starts at: **http://localhost:5000**

The frontend is served automatically from `http://localhost:5000`.

---

## 🔐 Default Credentials

| Role    | Email                    | Password      |
|---------|--------------------------|---------------|
| Admin   | admin@university.edu     | Admin@123456  |
| Student | *(create via signup)*    | *(your choice)* |

> **Change admin credentials in `.env` before deploying to production.**

---

## 📋 API Endpoints

### Authentication
| Method | Endpoint               | Description          | Auth Required |
|--------|------------------------|----------------------|---------------|
| POST   | /api/auth/signup       | Student registration | No            |
| POST   | /api/auth/login        | Student login        | No            |
| POST   | /api/auth/admin/login  | Admin login          | No            |
| GET    | /api/auth/me           | Get current user     | Yes           |

### Students
| Method | Endpoint                 | Description                  | Auth        |
|--------|--------------------------|------------------------------|-------------|
| POST   | /api/students            | Submit registration          | Student     |
| GET    | /api/students/me         | Get own registration         | Student     |
| GET    | /api/students            | Get all students             | Admin       |
| GET    | /api/students/stats      | Dashboard statistics         | Admin       |
| GET    | /api/students/:id        | Get student by ID            | Admin/Own   |
| PUT    | /api/students/:id        | Update student               | Admin/Own   |
| DELETE | /api/students/:id        | Delete student               | Admin       |
| GET    | /api/students/:id/courses| Get student's enrollments    | Any         |

### Departments
| Method | Endpoint               | Description             | Auth    |
|--------|------------------------|-------------------------|---------|
| GET    | /api/departments       | List all departments    | Any     |
| POST   | /api/departments       | Create department       | Admin   |
| PUT    | /api/departments/:id   | Update department       | Admin   |
| DELETE | /api/departments/:id   | Delete department       | Admin   |

### Courses
| Method | Endpoint           | Description      | Auth  |
|--------|--------------------|------------------|-------|
| GET    | /api/courses       | List all courses | Any   |
| POST   | /api/courses       | Create course    | Admin |
| PUT    | /api/courses/:id   | Update course    | Admin |
| DELETE | /api/courses/:id   | Delete course    | Admin |

### Enrollments
| Method | Endpoint               | Description          | Auth  |
|--------|------------------------|----------------------|-------|
| GET    | /api/enrollments       | List all enrollments | Admin |
| POST   | /api/enrollments       | Create enrollment    | Admin |
| PUT    | /api/enrollments/:id   | Update grade         | Admin |
| DELETE | /api/enrollments/:id   | Remove enrollment    | Admin |

---

## 🗃️ Database Entities

| Entity     | Key Fields                                                      |
|------------|-----------------------------------------------------------------|
| User       | id, fullName, email, password (hashed), role (STUDENT/ADMIN)   |
| Student    | studentId, rollNumber, fullName, email, phone, department, user |
| Department | departmentId, departmentName, location                          |
| Course     | courseId, courseName, creditHours, department                   |
| Enrollment | enrollmentId, student, course, enrollmentDate, grade            |

---

## 🧪 Postman Testing

Import the following example requests:

**Signup:**
```json
POST http://localhost:5000/api/auth/signup
{ "fullName": "Ali Khan", "email": "ali@test.com", "password": "test123", "confirmPassword": "test123" }
```

**Student Login:**
```json
POST http://localhost:5000/api/auth/login
{ "email": "ali@test.com", "password": "test123" }
```

**Admin Login:**
```json
POST http://localhost:5000/api/auth/admin/login
{ "email": "admin@university.edu", "password": "Admin@123456" }
```

Use the returned JWT token as: `Authorization: Bearer <token>`

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (12 rounds)
- JWT tokens expire in 24 hours
- Role is **always verified on the backend** — never trusted from the frontend
- Students can only access their own records
- Admin routes require `ADMIN` role middleware
- File uploads are validated for type and size (5MB limit)
- CORS is configured to allow frontend origin only

---

## 📱 Browser Support

The frontend works on all modern browsers (Chrome, Firefox, Edge, Safari).  
Responsive design supports desktop, tablet, and mobile screens.
