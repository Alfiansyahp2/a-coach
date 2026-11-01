# Project Directory Organization & Code Conventions

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Frontend Engineer & Backend Lead  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

---

## 1. Directory Tree
```text
project_strava/
├── .data/                  # Local fallback atomic store (store.json)
├── docs/                   # Comprehensive project documentation
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── api/            # Server Route Handlers
│   │   │   ├── auth/strava/# OAuth authorize, callback, status, disconnect
│   │   │   ├── strava/     # Activity sync endpoint
│   │   │   ├── workouts/   # Scheduled workouts CRUD
│   │   │   ├── activities/ # Strava activities retrieval
│   │   │   ├── matches/    # Planned vs Actual matching API
│   │   │   ├── goals/      # Fitness goals API
│   │   │   ├── insights/   # AI training insights API
│   │   │   └── analytics/  # Volume and pace progression aggregations
│   │   ├── globals.css     # Tailwind v4 theme definitions
│   │   ├── layout.tsx      # Root layout & font definitions
│   │   └── page.tsx        # Main application dashboard
│   ├── components/         # Reusable presentation components
│   ├── lib/                # Core business logic & services
│   │   ├── ai-coach.ts     # Grounded AI insights & ACWR calculations
│   │   ├── analytics.ts    # Aggregation & volume metrics
│   │   ├── crypto.ts       # AES-256-GCM encryption/decryption
│   │   ├── db.ts           # Unified database repository (PostgreSQL + Local)
│   │   ├── formatters.ts   # Pace, distance, duration, and date utilities
│   │   ├── matching.ts     # Auto-match heuristic engine
│   │   └── strava.ts       # Official Strava API v3 client
│   └── types/
│       └── index.ts        # Canonical TypeScript domain interfaces
├── .env.example            # Environment variable template
├── .env.local              # Local environment configuration
├── package.json            # Node.js dependencies & scripts
├── schema.sql              # Normalized PostgreSQL DDL script
└── tsconfig.json           # Strict TypeScript configuration
```
