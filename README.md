# Lost and Found Management System

Project skeleton for a college DBMS project demonstrating MySQL-backed Lost & Found application with Node/Express backend and React + Vite frontend.

See `database/schema.sql` for schema and sample data.

Quick start (backend):

1. Copy `backend/.env.example` to `backend/.env` and fill DB credentials.
2. Create the database: run `mysql -u root -p < database/schema.sql` (adjust user/password).
3. Install backend deps and start server:

```powershell
cd backend
npm install
npm run dev
```

Frontend scaffold is in `frontend/` (install and run with `npm run dev`).

API docs: see `docs/API.md`.
