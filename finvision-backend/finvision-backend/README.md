# FinVision-RL Node.js Backend

Middle layer between Frontend and Python AI backend.

## Architecture

```
Frontend (Next.js :3000)
        ↓
Node.js Backend (:5000)  ← This project
        ├── POST /api/auth/register   → Supabase Auth
        ├── POST /api/auth/login      → Supabase Auth
        ├── GET  /api/auth/profile    → Supabase DB
        ├── POST /api/forecast        → Yahoo + Python AI + Supabase
        ├── GET  /api/forecast/history → Supabase DB
        └── GET  /api/forecast/ai-health → Python AI health
                ↓
        Python AI Backend (:8000)
        + Supabase Database
```

## Step 1 — Supabase Setup

1. Go to https://supabase.com/dashboard/project/unlyeuiuwfpvkpjqqsgg
2. Click **SQL Editor** (left sidebar)
3. Copy contents of `supabase-schema.sql`
4. Paste and click **Run**

## Step 2 — Install & Run

```bash
npm install
npm run dev
```

Server starts at: http://localhost:5000

## Step 3 — Run All 3 Together

Open 3 terminals:

### Terminal 1 — Python AI Backend
```bash
cd D:\finvision\ai-Model
venv\Scripts\activate
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 — Node.js Backend (this project)
```bash
cd finvision-backend
npm install
npm run dev
```

### Terminal 3 — Frontend
```bash
cd finvision-connected-final
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/profile | Yes | Get profile |
| POST | /api/forecast | Yes | Run AI forecast |
| GET | /api/forecast/history | Yes | Past forecasts |
| GET | /api/forecast/ai-health | Yes | Check AI backend |
| GET | /health | No | Backend health |
