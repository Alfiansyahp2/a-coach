# Project Directory Organization & Code Conventions

**Status:** CONFIRMED & AUDITED  
**Version:** 2.0  
**Last Updated:** 2026-11-03  
**Owner:** Senior Frontend Engineer & Backend Lead  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md), [TECH_STACK.md](./TECH_STACK.md)

---

## 1. Directory Tree

```text
project_strava/
├── .data/                      # Local fallback atomic store (store.json)
├── docs/                       # Comprehensive engineering documentation ecosystem
│   ├── 00-foundation/          # Positioning, principles, roadmap, glossary
│   ├── 01-product/             # PRD, specs, requirements, user personas
│   ├── 02-design/              # Anti-AI-slop policy, color tokens, typography
│   ├── 03-architecture/        # System C4, database schema, API contracts, ADRs
│   ├── 04-integrations/        # Strava API v3, OAuth flow, sync, rate limits
│   ├── 05-domain-logic/        # Readiness, AI coach, PRs, training load
│   ├── 06-security/            # AES-256-GCM, privacy, threat model, health data
│   ├── 07-quality/             # Testing strategy, definition of done, clean code
│   ├── 08-development/         # Git workflow, implementation plan, setup
│   ├── 09-audit/               # Documentation, architecture & security audits
│   └── 10-changelog/           # Granular versioned feature changelogs
├── public/                     # Static assets, SVG icons
├── scripts/                    # Database seeding and verification utilities
├── src/
│   ├── app/                    # Next.js 16 App Router (Pages & API Handlers)
│   │   ├── activities/         # Dedicated activity management registry
│   │   │   ├── [id]/           # Deep activity telemetry inspection & editor
│   │   │   └── page.tsx        # Activity registry view with density controls
│   │   ├── api/                # Production Route Handlers
│   │   │   ├── activities/     # Activity retrieval, manual creation, edit & OCR
│   │   │   │   ├── [id]/       # GET, PATCH single activity
│   │   │   │   ├── parse-image/# POST OCR screenshot parser
│   │   │   │   └── route.ts    # GET list, POST manual activity
│   │   │   ├── athlete/        # Clinical health & biometric endpoints
│   │   │   │   ├── checkin/    # POST post-activity pain check-in
│   │   │   │   ├── health-context/ # GET consolidated clinical dossier
│   │   │   │   ├── injuries/   # GET, POST injury registry
│   │   │   │   ├── medical-procedure/ # POST procedure record
│   │   │   │   └── profile/    # GET, PATCH athlete profile & biometrics
│   │   │   ├── auth/strava/    # Official Strava OAuth 2.0 gateway
│   │   │   │   ├── authorize/  # GET redirect to Strava OAuth
│   │   │   │   ├── callback/   # GET token exchange & AES encryption
│   │   │   │   ├── disconnect/ # POST deauthorize & deactivate
│   │   │   │   └── status/     # GET connection verification
│   │   │   ├── strava/         # Strava sync endpoints
│   │   │   │   └── sync/       # POST incremental sync pipeline
│   │   │   └── training/       # Training plan endpoints
│   │   │       └── generate/   # POST 12-week Zone 2 plan generation
│   │   ├── goals/              # Dedicated progressive goals & targets route
│   │   │   └── page.tsx        # Milestone chaining & target management view
│   │   ├── health/             # Dedicated athlete health dossier route
│   │   │   └── page.tsx        # Biomechanical gate & clinical history view
│   │   ├── training/           # Dedicated structured training calendar route
│   │   │   └── page.tsx        # 12-week periodization calendar & matching hub
│   │   ├── globals.css         # Tailwind v4 theme tokens (Chalk & Graphite)
│   │   ├── layout.tsx          # Root layout & font definitions (Inter + IBM Plex)
│   │   └── page.tsx            # Athletic telemetry overview dashboard
│   ├── components/             # Modular presentation components
│   │   ├── dashboard/          # Dashboard tactical deck, streak card, macro goals
│   │   ├── goals/              # GoalsManagementHub, progression engine, filters
│   │   ├── health/             # AthleteHealthHub, joint safety gate, check-in modals
│   │   ├── layout/             # AppShell, AppHeader, AppSidebar (locked sticky rail)
│   │   ├── theme/              # ThemeProvider & theme switcher
│   │   └── training/           # ScheduleTrainingHub, calendar cards, dossiers
│   ├── lib/                    # Core business logic & domain services
│   │   ├── db/                 # Modular repository pattern
│   │   │   ├── activityRepo.ts # Activity queries & pagination
│   │   │   ├── client.ts       # Pool initialization & local fallback store
│   │   │   ├── goalRepo.ts     # Goals & Personal Records persistence
│   │   │   ├── healthRepo.ts   # Clinical health dossier persistence
│   │   │   ├── index.ts        # Unified database export facade
│   │   │   ├── stravaRepo.ts   # OAuth connection & token queries
│   │   │   ├── trainingRepo.ts # Scheduled workouts & plan queries
│   │   │   └── userRepo.ts     # User account management
│   │   ├── ai-coach.ts         # Grounded statistical insights & ACWR
│   │   ├── analytics.ts        # Weekly volume progression & consistency metrics
│   │   ├── anatomyUtils.ts     # 16-structure anatomical kinematic taxonomy
│   │   ├── coachTrainingGenerator.ts # 12-week Zone 2 plan generator
│   │   ├── crypto.ts           # AES-256-GCM token encryption/decryption
│   │   ├── formatters.ts       # Pace, distance, duration, and date formatters
│   │   ├── matching.ts         # Heuristic planned-vs-actual matching engine
│   │   ├── personalRecords.ts  # Deterministic multi-sport PR evaluator
│   │   ├── readinessEngine.ts  # Asymmetric sport-specific joint safety gate
│   │   ├── sportUtils.ts       # Sport type metadata & pacing calculations
│   │   ├── strava.ts           # Strava API v3 client & rate limit handler
│   │   └── streakEngine.ts     # Thermodynamic flame spectrum calculator
│   └── types/
│       └── index.ts            # Canonical TypeScript domain interfaces
├── .env.example                # Environment variable configuration template
├── .env.local                  # Local secrets (DATABASE_URL, STRAVA_CLIENT_*, ENCRYPTION_KEY)
├── package.json                # Dependencies (Next.js 16, pg, lucide-react)
├── schema.sql                  # 16-table normalized PostgreSQL DDL script
└── tsconfig.json               # Strict TypeScript configuration
```
