# MileTracker

Full-stack Next.js app to scrape mileage prices, store them in PostgreSQL (via Prisma), and display analytics.

## Stack
- Next.js 16 (App Router, TypeScript, TailwindCSS)
- Prisma ORM + PostgreSQL 16
- Cheerio (scraping), node-cron (scheduling)
- Recharts (charts)

## Getting started (local without Docker)
1) Copy envs
```
cp .env.example .env
```
2) Start a Postgres 16 (or use Docker below) and set `DATABASE_URL` in `.env`.
3) Install deps and generate Prisma client
```
npm install
npx prisma generate
```
4) Run dev server
```
npm run dev
```

## Using Docker Compose (recommended)
From the `docker/` folder:
```
docker compose up -d --build
```
App: http://localhost:3001
DB:  localhost:5432 (postgres/postgres)

Note: Run Prisma migrations once your DB is up:
```
# from repo root
npx prisma migrate dev --name init
```

## API routes
- GET /api/sources
- POST /api/sources
- GET /api/prices?program=Smiles&limit=30
- POST /api/scrape

## Project structure
See `.github/instructions/copilot-instructions.md` for architecture and conventions.

## Troubleshooting
- If charts don’t render, ensure you have data in `MileagePrice` (trigger `/api/scrape` or insert test data).
- If Prisma types are missing: `npx prisma generate`.