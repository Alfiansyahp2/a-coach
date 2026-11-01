# Production Deployment & Hosting Architecture

**Status:** PROPOSED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Site Reliability Engineer  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](../03-architecture/SYSTEM_ARCHITECTURE.md)

---

## 1. Deployment Target Options
* **Option A (Vercel / Next.js Serverless):** Standard deployment for Next.js App Router with hosted PostgreSQL (Neon, Supabase, or AWS RDS).
* **Option B (Docker Container on VPS):** Node.js standalone server with local PostgreSQL service.

## 2. Environment Variables Checklist in Production
* `NEXT_PUBLIC_APP_URL` = Production URL (e.g. `https://athlete.domain.com`).
* `STRAVA_CLIENT_ID` & `STRAVA_CLIENT_SECRET` set in secure secrets store.
* `ENCRYPTION_SECRET` = 32-byte production random hex key.
* `DATABASE_URL` = Production PostgreSQL connection string with SSL.
