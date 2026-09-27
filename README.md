# SmartSpend — Phase 1 Starter (Manual Expense Tracker)

This is a working skeleton for Phase 1 of the build plan: signup/login,
manually adding transactions, and a dashboard with a category pie chart.
It's deliberately minimal so you can read every line and extend it.

## Stack
- Backend: Node.js + Express + PostgreSQL (raw SQL via `pg`, no ORM — easier to see what's happening)
- Frontend: React (Vite) + Recharts
- Auth: JWT + bcrypt

## Setup

### 1. Database
Create a Postgres database (local, or free tier on Supabase/Neon/Railway), then run:
```
psql <your-connection-string> -f backend/db/schema.sql
```

### 2. Backend
```
cd backend
cp .env.example .env      # fill in your DATABASE_URL and JWT_SECRET
npm install
npm run dev                # starts on http://localhost:5000
```

### 3. Frontend
```
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

## What's included
- `POST /api/auth/signup`, `POST /api/auth/login` — JWT-based auth
- `POST /api/transactions`, `GET /api/transactions` — add/list transactions (auth-protected)
- `GET /api/transactions/summary` — totals grouped by category (feeds the pie chart)
- React app: login/signup form → add-transaction form → dashboard with pie chart + list

## What's NOT included (next phases — see BUILD_CHECKLIST.md)
- CSV/PDF statement import
- AI/rule-based auto-categorization
- Budgets, goals, forecasting
- Notifications
- Deployment configs (Docker etc.)

Extend this skeleton phase by phase rather than starting over.
