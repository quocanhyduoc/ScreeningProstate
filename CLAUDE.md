# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prostate cancer screening system for **Hue Central Hospital** (sangloctuyentienliet.com). A full-stack app with a Next.js frontend and FastAPI backend managing patient registration, clinical workflows, and admin dashboards. UI is entirely in Vietnamese.

---

## Commands

### Frontend (`/frontend`)
```bash
npm run dev          # Dev server → http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript type check — run before deployment
```

### Backend (`/backend`)
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # Dev server
python3 init_db.py                           # Initialize database tables
python3 seed_admin.py                        # Create default admin user
```

### Docker (Production)
```bash
docker compose up -d --build   # Build and start all 4 services
```

---

## Architecture

### Stack
- **Frontend**: Next.js 14.1.0 (Pages Router), React 18, Tailwind CSS, Framer Motion
- **Backend**: FastAPI 0.109.0, SQLAlchemy 2.0, PostgreSQL 15 (SQLite fallback for dev)
- **Auth**: JWT HS256, 8-hour expiry, role-based (SUPERADMIN, CLINICAL, CSKH)
- **Real-time**: WebSocket at `/admin/ws` for live dashboard updates
- **Containerization**: Docker Compose (4 services: PostgreSQL, FastAPI, Next.js, Adminer)

### Backend (`/backend/app/`)

The FastAPI app uses four route modules:

| Module | Responsibilities |
|---|---|
| `routes/auth.py` | `POST /auth/login` — issues JWT |
| `routes/registration.py` | Patient registration with eligibility gating |
| `routes/clinical.py` | QR check-in, status workflow, queue management, survey submission |
| `routes/admin.py` | WebSocket hub, dashboard stats, Excel export, user management, settings |

`websockets.py` holds a `ConnectionManager` that broadcasts JSON events to all connected admin clients on any patient status change.

Background tasks (FastAPI `BackgroundTasks`) handle email and SMS notifications so they don't block HTTP responses.

Database connections use SQLAlchemy's `SessionLocal` injected via `Depends(get_db)`.

### Frontend (`/frontend/src/`)

Pages Router layout:
- `pages/index.tsx` — Public landing page + 6-step patient registration funnel
- `pages/admin/dashboard.tsx` — Admin hub (all three roles share this route, tabs differ by role)
- `pages/clinical/dashboard.tsx` + `survey.tsx` — Clinical staff workflow
- `pages/cskh/dashboard.tsx` — Customer care workflow
- `pages/display.tsx` — Waiting room queue display (TV screen)

The 7-step registration form lives in `components/RegistrationSteps/` — each step is a standalone component passed into a shared orchestrator in `pages/index.tsx`.

`components/Admin/` contains all dashboard tabs: `CalendarTab`, `ReportsTab`, `ClinicalHubTab`, `PatientDetailModal`, `PatientEditModal`, `UserManagementModal`.

---

## Critical Medical Logic — Do Not Break

**Eligibility algorithm** (age calculated against cutoff date **01/06/2026**):
- `< 45` years → auto-reject
- `45–50` years → accept **only if** `history_father`, `history_brother`, or `brca_mutation` is true
- `≥ 50` years → accept by default
- Hard limit: **300 slots** (configurable in `SystemSettings`)

**6-step clinical status workflow** (in order, no skipping):
```
CHO_XAC_NHAN → DA_XAC_NHAN → DA_TIEP_NHAN → DA_XET_NGHIEM → CHO_TU_VAN → HOAN_THANH
```

**Mandatory medical terminology** (Vietnamese labels must use exact terms):
- PSA: `Chỉ số PSA toàn phần (ng/ml)` — never "PSA tự do"
- Ultrasound: `Thể tích tuyến tiền liệt (ml)` or `Kích thước (mm)`
- Risk grade: `PI-RADS v2.1` scale (I–V)
- Family history field: `Tiền sử mắc ung thư tuyến tiền liệt ở người thân trực hệ`

---

## Key Conventions

- **No placeholder data**: All charts/stats must read from live API endpoints.
- **Hospital logo**: Always render `public/logobv.boder.png` on QR badges and registration printouts.
- **Font minimums**: Body ≥ 16px, headings ≥ 20px (geriatric-optimized UI).
- **Excel exports**: Generated server-side with `pandas` + `openpyxl`; v2.1 uses 5-sheet workbook (Users, Registrations, Screening, Lab, Consult).
- **Uploads**: Ultrasound images stored at `/backend/uploads/` and served as static files.
- **Environment**: `DATABASE_URL` env var switches between SQLite (dev) and PostgreSQL (prod). Never hard-code credentials.

---

## Database Schema (5 tables)

| Table | Key Fields |
|---|---|
| `users` | `username`, `hashed_password`, `role`, `permissions` (JSON) |
| `patient_registrations` | demographics, `appointment_slot`, `status`, `registration_number`, `is_extra_slot` |
| `screening_surveys` | FK→registration, PSA value, ultrasound findings, image URLs, symptom flags |
| `queue_status` | station name, current number counter |
| `system_settings` | `registration_active` (bool), `registration_limit` (int) |

Registration numbers use the format `YYMMNNNN` (auto-generated on confirmation).
