# HRMS Lite — Human Resource Management System

A production-ready full-stack HRMS application built for the Ethara AI technical assessment.

---

## 🔗 Live Links

| | URL |
|---|---|
| **Frontend** | https://hrmsaayush.netlify.app/ |
| **Backend API** | https://hrms-lite-nduo.onrender.com |
| **Health Check** | `GET /api/health` |

---

## 🛠 Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React 18 + React Router v6 | Component-based SPA with client-side routing |
| **Frontend Build** | Vite 5 | Fast HMR and optimized production builds |
| **HTTP Client** | Axios | Interceptor-based error handling |
| **Icons** | Lucide React | Consistent, lightweight icon set |
| **Backend** | Node.js + Express 4 | Lightweight, well-structured REST API |
| **Database** | SQLite (via better-sqlite3) | Zero-config, file-based persistence; easily swappable to PostgreSQL |
| **Validation** | Custom middleware | Server-side validation with meaningful messages |
| **Frontend Deploy** | Netlify | Static site hosting with SPA redirect support |
| **Backend Deploy** | Render | Free-tier Node.js hosting |

---

## 📁 Project Structure

```
hrms-ethara/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # DB init, schema, singleton
│   │   ├── middleware/
│   │   │   ├── validate.js          # Reusable request validation
│   │   │   └── errorHandler.js      # Global Express error handler
│   │   ├── routes/
│   │   │   ├── employees.js         # Employee CRUD endpoints
│   │   │   ├── attendance.js        # Attendance endpoints + summary
│   │   │   └── dashboard.js         # Dashboard stats endpoint
│   │   └── server.js                # Express app + server bootstrap
│   ├── package.json
│   ├── .env.example
│   └── render.yaml
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js             # Axios client + typed API functions
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   └── index.jsx        # Reusable: Modal, Alert, Badge, Avatar...
│   │   │   ├── Layout.jsx           # Sidebar + Topbar shell
│   │   │   ├── AddEmployeeModal.jsx
│   │   │   ├── MarkAttendanceModal.jsx
│   │   │   └── DeleteConfirmModal.jsx
│   │   ├── context/
│   │   │   └── ToastContext.jsx     # Global toast notification system
│   │   ├── hooks/
│   │   │   └── useData.js           # useFetch + useAction custom hooks
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── EmployeesPage.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   └── SummaryPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Design system (CSS variables, components)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── netlify.toml
└── README.md
```

---

## ⚡ Running Locally

### Prerequisites
- Node.js ≥ 18
- npm ≥ 8

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
cd hrms-lite
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # edit PORT, DB_PATH if needed
npm start
# → http://localhost:5000/api
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
# → http://localhost:5173
```

---

## 🌐 API Reference

### Base URL
`http://localhost:5000/api`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |
| GET | `/dashboard` | Dashboard stats |
| GET | `/employees` | List all employees (with present_days) |
| GET | `/employees/:id` | Get single employee |
| POST | `/employees` | Create employee |
| DELETE | `/employees/:id` | Delete employee (cascades attendance) |
| GET | `/attendance` | List records (supports filters) |
| GET | `/attendance/summary` | Per-employee stats |
| POST | `/attendance` | Mark/update attendance |

**Query params for `GET /attendance`:**
```
?employee_id=<uuid>
?date=2024-01-15
?from=2024-01-01&to=2024-01-31
```

**POST /employees body:**
```json
{
  "employee_id": "EMP001",
  "full_name": "Jane Smith",
  "email": "jane@company.com",
  "department": "Engineering"
}
```

**POST /attendance body:**
```json
{
  "employee_id": "<uuid>",
  "date": "2024-01-15",
  "status": "Present"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |

---

## ✅ Features Implemented

### Core
- [x] Add employees (Employee ID, Full Name, Email, Department)
- [x] List all employees
- [x] Delete employees (with attendance cascade)
- [x] Mark attendance (Present / Absent) per employee per date
- [x] View all attendance records
- [x] Server-side validation (required fields, email format, duplicates)
- [x] Proper HTTP status codes + meaningful error messages
- [x] Loading, empty, and error states in UI

### Bonus
- [x] Filter attendance by employee, date range
- [x] Display total present days per employee (employee list)
- [x] Dashboard summary (totals, today's rate, department breakdown, recent activity)
- [x] Attendance rate % per employee (summary page)
- [x] Toast notifications for all actions
- [x] Search + department filter on employee list
- [x] Upsert logic — re-marking same date updates status

---

## 📝 Assumptions & Limitations

- **Single admin user** — no authentication (per spec)
- **SQLite** used for zero-config local dev. For production scale, replace `better-sqlite3` with `pg` (PostgreSQL) and update the DB config. The rest of the code remains identical.
- Attendance is an **upsert** — marking the same employee on the same date twice updates the record
- Deleting an employee **cascades** to remove all their attendance records
- The Render free tier may have cold-start latency (~30s) on first request after inactivity
