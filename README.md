# Attendance Management System - Frontend

This is the **frontend** of the Attendance Management System (AMS), built with **React + Vite**.  
It connects to the **Spring Boot backend** to provide attendance tracking, correction requests, and admin approvals.

---

## ✨ Features

### Employee
- Clock In / Clock Out with **browser-based geolocation**
- Upload **selfie** photo during attendance marking
- View attendance records for selected dates
- Submit **correction requests** if timings are incorrect
- View own correction history

### Admin
- View **daywise** attendance for selected employee/date
- View **summary** between date ranges
- Manage **correction requests** (Approve / Reject)
- Employee dropdown selector for filtering

---

## 🛠 Tech Stack
- React 18 (Vite)
- TailwindCSS
- Axios (API calls)
- JWT authentication (backend integration)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ams-frontend.git
cd ams-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root:

```
VITE_API_BASE_URL=http://localhost:8080
```

> Replace with your backend URL if different.

### 4. Run Development Server
```bash
npm run dev
```
Visit 👉 [http://localhost:5173](http://localhost:5173)

---

## 📂 Project Structure

```
ams-frontend/
│── public/                # Static assets
│── src/
│   ├── api/axios.js       # Axios config (base URL + interceptors)
│   ├── pages/             # App pages (EmployeeDashboard, AdminDashboard, Login)
│   ├── components/        # Reusable UI components
│   ├── App.jsx            # Main app entry
│   └── main.jsx           # Vite bootstrap
│── package.json
│── vite.config.js
│── tailwind.config.js
│── .gitignore
│── README.md
```
