# Local Environment Setup & Configuration Guide

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Backend Engineer  
**Related Documents:** [TECH_STACK.md](../03-architecture/TECH_STACK.md)

---

## 1. Prerequisites
* **Node.js:** v20.x or higher (`node -v`).
* **Package Manager:** npm or pnpm (`npm -v`).
* **Database (Optional for MVP):** PostgreSQL 16 (`psql --version`). If unconfigured, the app seamlessly runs on local storage.

## 2. Step-by-Step Setup
1. Clone / open project directory.
2. Copy configuration template:
   ```bash
   cp .env.example .env.local
   ```
3. Set your Strava credentials in `.env.local` (from https://www.strava.com/settings/api):
   - Set Authorization Callback Domain to `localhost:3000`.
   - Set `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET`.
4. (Optional) Set `DATABASE_URL=postgresql://user:pass@localhost:5432/project_strava` and run:
   ```bash
   psql -d project_strava -f schema.sql
   ```
5. Run development server:
   ```bash
   npm run dev
   ```
