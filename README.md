# Campus Made Easy 🎓
> **"Simplify Everyday Campus Life"**

A modern, responsive, all-in-one college campus management web application built for Students, Faculty, Hostel Wardens, and Administrators.

---

## 🌟 Key Features

### 1. Multi-Role Architecture (RBAC)
- **Student Portal**: Hostel room & occupancy, mess menus & interactive food rating, maintenance ticket lifecycle tracking with reopening, attendance audit with 75% statutory warning alerts, academic marks & CGPA calculator, timetable, study materials, fee management with simulated receipts, digital ID cards & bonafide certificates.
- **Teacher / Faculty Portal**: Enrolled student directory, subject roll call & batch attendance, internal & exam marks grading, lecture study materials upload, teaching schedules, and leave/academic request approvals.
- **Hostel Warden Portal**: Hostel buildings & room occupancy tracking, bed allocations & student room transfers, maintenance complaints resolution desk with staff assignments, mess menu management & student review responses, visitor log register with timestamps, and exportable occupancy reports.
- **Administrator Portal**: Campus-wide analytics dashboard, full user management (create, edit, deactivate, password reset), infrastructure oversight, campus announcements broadcast, and CSV reports generation.

### 2. Authentication & Data Persistence
- **Firebase Authentication**: Google Sign-In with popup + email/password login.
- **Cloud Firestore**: Persistent document store with hardened security rules (`firestore.rules`) and intermediate representation (`firebase-blueprint.json`).
- **One-Click Demo Switcher**: Instant floating banner to test all 4 roles effortlessly without manual typing.

---

## 🔑 Demo Credentials

| Role | Name | Identifier / Email | Password |
|------|------|-------------------|----------|
| **Student** | Aman Sahu (3rd Yr CSE) | `CSE2024089` or `amansahu@campus.edu` | `password` |
| **Faculty** | Dr. Rajesh Sharma | `rajesh.sharma@campus.edu` | `password` |
| **Warden** | Ramesh Patil | `ramesh.patil@campus.edu` | `password` |
| **Admin** | Dr. Arvind Mehra | `admin@campus.edu` | `password` |

*(You can also click any of the 4 role buttons in the top Quick Demo Switcher bar for instant 1-click previewing).*

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons
- **Backend & Database**: Node.js, Express, Firebase Authentication, Cloud Firestore
- **Build Tool**: Vite

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on port `3000`.

### 4. Build for Production
```bash
npm run build
```
