# 🚀 EMS WorkPulse

EMS WorkPulse is a Full Stack Employee Management System built using the MERN Stack. It helps organizations manage employees, attendance, tasks, and leave requests through a secure role-based dashboard.

## ✨ Features

- 🔐 JWT Authentication with session rotation (one valid session per user at a time)
- 👥 Employee Management (Admin only)
- 📅 Attendance Management with bulk submit and lock
- ✅ Task Management with priority and progress tracking
- 📝 Leave Management with approval workflow
- 📊 Dashboard Analytics (MongoDB aggregation pipelines)
- 📜 Activity Logs (Admin only)
- 👤 Profile Management & Login History
- 🔔 In-app Notifications

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite 8
- Tailwind CSS 4
- Axios + React Hook Form + Zod
- Framer Motion + Recharts

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (HttpOnly cookie — no localStorage exposure)
- bcryptjs, helmet, express-rate-limit

## 📦 Installation

### Clone the repository

```bash
git clone https://github.com/your-username/EMS-WorkPulse.git
cd EMS-WorkPulse
```

### Install dependencies (single install — monorepo)

```bash
npm install
```

### Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Run in development

```bash
# Run both frontend (Vite) and backend (Express) together:
npm run dev:full

# Or run separately:
npm run server:dev   # backend with live reload
npm run dev          # frontend (Vite)
```

## 🔑 Environment Variables

See `.env.example` for the full list. Key variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
SEED_ADMIN_EMAIL=admin@ems.com
SEED_ADMIN_PASSWORD=YourAdminPassword
SEED_EMPLOYEE_PASSWORD=YourEmployeePassword
```

> **Note:** Seed credentials are only used on the very first run when the database is empty. Set them in `.env` — never commit real passwords to source control.

## 🌟 Future Improvements

- Payroll Management
- Email Notifications
- OTP Password Reset
- PDF/Excel Reports
- Employee Documents (Cloudinary already wired)
- Avatar upload

## 👨‍💻 Author

**Prashant Vaishnav**
