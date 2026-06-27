# React Sandbox Dashboard

A full-stack dashboard sandbox with a Vite/React frontend and an Express/SQLite backend.

Live demo: https://alex-lemberger.github.io/react-sandbox/

The GitHub Pages version is a static frontend demo. It falls back to bundled demo data because GitHub Pages cannot run the Express backend or SQLite database.

## Project Structure

```text
backend/   Express API, SQLite schema, seed data
frontend/  Vite React app, Tailwind CSS, Lucide icons
```

## Local Development

Install and run the backend:

```bash
cd backend
npm install
npm start
```

The backend runs at:

```text
http://localhost:3001
```

Install and run the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:5173
```

## Data And CRUD

The local backend creates and seeds `backend/data.db` automatically on startup. That database file is intentionally ignored by git.

Real create/update/delete behavior needs a running backend and persistent storage. The GitHub Pages deployment is static, so it can display the dashboard and demo data but cannot persist CRUD operations.

For hosted CRUD, deploy the frontend to Vercel/GitHub Pages and connect it to a hosted API plus database, such as:

- Express API on Render, Railway, Fly.io, or Vercel serverless functions
- Postgres/Supabase/Firebase for persistent data
- A hosted backend that exposes the same API shape as `backend/server.js`

## Useful Commands

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
npm start
```

## GitHub Pages

Pages deployment is handled by:

```text
.github/workflows/deploy-pages.yml
```

The workflow builds `frontend/` with the `/react-sandbox/` base path and publishes `frontend/dist`.
