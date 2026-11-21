# Store Rating Platform - FullStack Coding Challenge

A production-ready fullstack web application that allows users to submit and modify ratings (1 to 5 stars) for stores registered on the platform, built with **Express.js**, **MySQL**, and **React.js**.

---

## 🚀 Tech Stack

- **Backend**: Node.js & Express.js
- **Database**: MySQL 8.0 (compatible with local MySQL, AWS RDS, Aiven, Railway, Render)
- **Frontend**: React.js (Vite, Tailwind CSS, Lucide Icons)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.js password hashing
- **Deployment**: Docker, Docker Compose, Render, Railway, Vercel/Netlify

---

## 👥 User Roles & Capabilities

### 1. System Administrator
- **Summary Dashboard**: Displays real-time metrics for:
  - Total number of users
  - Total number of stores
  - Total number of submitted ratings
- **Stores Management**:
  - View all registered stores with Name, Email, Address, and Overall Rating.
  - Filter stores by Name, Email, and Address.
  - Sort table ascending/descending on Name, Email, Address, and Rating.
  - Add new stores (Name: 20-60 chars, Email, Address: max 400 chars, optional Owner assignment).
- **Users Management**:
  - View list of normal, admin, and store owner users with Name, Email, Address, Role, and Store Rating (if Store Owner).
  - Filter users by Name, Email, Address, and Role.
  - Sort table ascending/descending on Name, Email, Address, Role, and Store Rating.
  - Add new users with: Name, Email, Password, Address, and Role.
- **Log out** from the system.

### 2. Normal User
- **Signup & Login**: Registration page with live validation feedback.
- **View Stores**: View all registered stores with Store Name, Address, Overall Rating, and User's Submitted Rating.
- **Search**: Live search stores by Name and Address.
- **Sorting**: Sort table ascending/descending by Store Name, Address, Overall Rating, and User's Rating.
- **Rate Stores**:
  - Submit ratings (1 to 5 stars) for individual stores.
  - Modify existing submitted ratings with real-time feedback.
- **Password Management**: Update password securely from the navigation bar.
- **Log out** from the system.

### 3. Store Owner
- **Dashboard Overview**:
  - Displays the store assigned to their account.
  - Displays the overall average rating and total ratings count.
  - Displays a detailed customer feedback table of users who rated their store:
    - Customer Name, Email, Address, Submitted Rating, and Date/Time.
  - Sorting ascending/descending on Customer Name, Email, Rating, and Date.
- **Password Management**: Update password securely.
- **Log out** from the system.

---

## 🛡️ Form Validations Enforced (Frontend & Backend)

| Field | Rule / Specification |
|---|---|
| **Name** | Min 20 characters, Max 60 characters |
| **Address** | Max 400 characters |
| **Password** | 8 to 16 characters, must include at least one uppercase letter (`A-Z`) and one special character (`!@#$%^&*...`) |
| **Email** | Standard valid email format (`user@domain.com`) |
| **Rating** | Integer between 1 and 5 |

---

## 🔑 Pre-seeded Demo Credentials

The database comes pre-seeded with realistic test accounts that satisfy all validation requirements:

| Role | Email | Password | Full Name |
|---|---|---|---|
| **System Admin** | `admin@ratingapp.com` | `Admin@2026#` | Rajeshwar Prasad Sharma |
| **Normal User 1** | `user1@ratingapp.com` | `User@2026#` | Rahul Devendra Kulkarni |
| **Normal User 2** | `user2@ratingapp.com` | `User@2026#` | Ananya Jayant Deshmukh |
| **Store Owner 1** | `owner1@ratingapp.com` | `Owner@2026#` | Vikramaditya Singh Rathore |
| **Store Owner 2** | `owner2@ratingapp.com` | `Owner@2026#` | Sunil Kumar Subramaniam |

> **Convenience**: The login page includes one-click demo fill buttons for Admin, Normal User, and Store Owner.

---

## 🏃 Local Development Setup

### 1. Environment Configuration
Copy the environment example files:
```bash
# In backend
cp backend/.env.example backend/.env

# In frontend (optional, defaults to relative /api)
cp frontend/.env.example frontend/.env
```
Configure your database credentials in `backend/.env`.

### 2. Database Initialization
Ensure your MySQL server is running, then initialize tables and seed data:
```bash
npm run init-db
# or: cd backend && npm run init-db
```

### 3. Run Development Servers
In separate terminals:
```bash
# Backend (Port 5000)
npm run start:backend

# Frontend (Port 3000 / 5173 with Vite proxy)
npm run start:frontend
```

---

## 🐳 Docker & Container Deployment

### 1-Click Launch with Docker Compose
To run both the application and a configured MySQL 8.0 database container:
```bash
docker compose up -d --build
```
- Web Application: `http://localhost:5000`
- MySQL Database: `localhost:3306`
- The application automatically runs database migrations and seeds initial accounts on first startup.

To stop the containers:
```bash
docker compose down
```

---

## ☁️ Production Deployment Guide

### Option A: All-in-One Deployment (Docker / Render / Railway)
The backend is configured to serve the production-built React frontend as static assets:
1. Build frontend:
   ```bash
   npm run build
   ```
2. Start the Express server:
   ```bash
   npm start
   ```
3. Provide the following environment variables in your cloud hosting provider:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `DB_HOST=<cloud-mysql-host>`
   - `DB_PORT=3306`
   - `DB_USER=<db-user>`
   - `DB_PASSWORD=<db-password>`
   - `DB_NAME=rating_app`
   - `DB_SSL=true` (if using cloud DB providers like Aiven or AWS RDS)
   - `JWT_SECRET=<secure-random-secret>`
   - `CORS_ORIGIN=*`

### Option B: Split Deployment (Vercel/Netlify Frontend + Cloud Backend)
- **Frontend (Vercel/Netlify)**:
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://your-backend-api-url.com/api`
- **Backend (Render / Railway / Fly.io)**:
  - Root directory: `backend`
  - Start command: `node src/scripts/initDb.js && node src/server.js`
  - Environment variable: `CORS_ORIGIN=https://your-frontend-domain.com`

---

## 🧪 Automated Test Suite
To run the automated verification suite covering 23 test cases (validations, role access, rating submissions, sorting, and dashboards):
```bash
npm run test:api
```
