# a-coach

> **Sports Science Telemetry, Injury-Aware Coaching & Adaptive Periodization Platform**  
> Built with **Next.js 16.4.6 (App Router & Turbopack)**, **React 19**, **PostgreSQL 16**, and an embedded **Python 3.14 Computational Engine**. Operating under a 100% device-independent **Manual-First Architecture**, dual-load telemetry, deterministic sports science algorithms, and optional **Official Strava API v3** bridge.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![Test Suites](https://img.shields.io/badge/Test%20Suites-88%2F88%20Passing-success?style=flat-square)](./scripts/tests/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-%3C%20300%20Lines%2FFile-emerald?style=flat-square)](./src/)

---

## 🏛️ Overview & Product Philosophy

**a-coach** is not a generic workout logger or an aesthetic clone of mainstream fitness apps. It is a deterministic, high-integrity athletic command center designed specifically for endurance athletes (Mountain Biking, Road Cycling, and Running) who demand clinical safety, rigorous sports science, and complete independence from closed-garden subscription models.

The platform is anchored in four non-negotiable architectural tenets:

1. **Grounded Indicator Protocol (Zero AI Slop / Zero Hallucination)**:
   - Physiological metrics that cannot be directly derived or clinically calibrated (such as HRmax, LTHR, FTP, and VO2max) remain strictly labeled as `UNKNOWN`. The system never fabricates synthetic baselines or vanity scores.
2. **Clinical Injury-First Periodization**:
   - Progressive overload and training prescriptions are gated by anatomical joint dossiers (e.g. Ankle ATFL ligament protection, bilateral patellofemoral tracking) and empirical post-workout symptom logs.
3. **Dual-Load Telemetry & Supercompensation Awareness**:
   - Training stress is monitored across two coupled dimensions: **External Mechanical Workload** (KM, elevation, moving time) and **Internal Metabolic Strain** (RPE, cardiovascular stress, joint soreness). Deload weeks are recognized as planned physiological adaptation—never penalized as laziness.
4. **Zero Paid Strava Dependency & Total Offline Sovereignty**:
   - Operates 100% autonomously without requiring Strava Summit/Premium subscriptions. Supports manual entry, image/screenshot OCR parsing, and optional free Strava API v3 syncing with local PostgreSQL and JSON fallback storage.

---

## ⚡ Key Modules & Capabilities

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   A-COACH PLATFORM                                     │
├───────────────────┬───────────────────┬────────────────────┬───────────────────────────┤
│    /health        │      /coach       │      /recap        │        /training          │
│ Health Hub &      │ Coach Intel &     │ Weekly & Mesocycle │ Multi-Model Calendar      │
│ Injury Dossiers   │ Discipline Hubs   │ Sports Science     │ Suite, Gantt & Filters    │
├───────────────────┼───────────────────┼────────────────────┼───────────────────────────┤
│    /activities    │      /goals       │      /profile      │            /              │
│ Registry, Detail  │ Milestone Targets │ Equipment Wear &   │ Tactical Command Deck,    │
│ & Mass Grouping   │ & Century Ride    │ Quota Projections  │ PRs & Flame Retaining     │
└───────────────────┴───────────────────┴────────────────────┴───────────────────────────┘
```

### 1. Athlete Health & Injury-Aware Readiness Engine (`/health`)
- **Authoritative Biometric Profile**: Calibrated age, height, weight, BMI, resting heart rate (RHR), and weekly training availability (e.g., 2–3 days/week).
- **Full-Body Anatomical Taxonomy**: Multi-quadrant body picker covering Head & Neck, Upper Body & Trunk, Pelvis & Hips, and Lower Extremities with laterality tagging (Left, Right, Bilateral).
- **Injury Dossiers & Clinical Safeguards**: Tracks acute and chronic joint/ligament issues (e.g., Right Ankle ATFL Sprain) with clinical status gating (`PENDING_CLINICAL_ASSESSMENT`, `REHAB_ACTIVE`, `CLEARED_WITH_LIMITS`).
- **Biological Circuit Breakers**: Automatically locks progression and halts high-impact running when acute swelling, joint instability, or elevated pain is recorded.
- **Post-Activity Subjective Check-in Modal**:
  - Ingested sessions sorted chronologically descending (`⭐ [TERBARU]` highlighted at top).
  - Deep-link navigation (`/activities/[id]`) for telemetry inspection prior to subjective rating.
  - Multi-dimensional pain ratings (during, immediately post-session, next-morning stiffness) with structural circuit breaker triggers.

### 2. Running & Cycling Coach Intelligence Hub (`/coach`, `/coach/cycling`, `/coach/running`)
- **MTB & Cycling Coach (`/coach/cycling`)**:
  - Zone 2 aerobic base building engine, progressive cadence prescriptions, and hill-climbing torque preparation.
  - Banister Impulse-Response Fitness Management Chart (PMC) tracking Chronic Training Load (CTL / Fitness), Acute Training Load (ATL / Fatigue), and Training Stress Balance (TSB / Form).
- **Running & Joint Impact Coach (`/coach/running`)**:
  - Return-to-Run (RTR) 4-phase conservative protocol: Phase 1 (Brisk Walking), Phase 2 (Walk-Jog Intervals), Phase 3 (Continuous Run), Phase 4 (Dynamic Loading).
  - Ankle ATFL joint protection mode: Keeps running on strict clinical hold (`Lari: HOLD (ATFL)`) until objective pain-free load tests are satisfied.

### 3. Weekly Evaluation & Mesocycle Recap Engine (`/recap`)
- **Monday 00:00:00 Automatic Transition**: Automatically shifts to evaluating the newly completed week at midnight Monday without requiring manual date shifts.
- **Dual-Load Telemetry Coupling**: Displays combined external mechanical volume vs. internal perceived effort (RPE/soreness) with clinical ratio evaluations.
- **Mesocycle Rollup Analytics**: Dynamic aggregations across **1-Week Microcycles**, **2-Week Training Blocks**, and **4-Week Monthly Mesocycles**.
- **Deload Week Recognition**: Validates scheduled recovery weeks as active supercompensation, preventing false "missed workout" alerts.
- **Sports Science Tactical Bridge**: Generates actionable prescriptions for the upcoming week, including safe kilometer quotas, mandatory recovery days, and fasting schedule alignments.

### 4. Multi-Model Training Calendar Pro Suite (`/training`)
- **Interchangeable Views**:
  - **Month Grid View**: High-density month layout with day cards, active session badges, and completed workout telemetry.
  - **Periodization Gantt View**: Visual timeline tracking mesocycle phases, recovery buffers, and volume build curves.
  - **Kinetic Day Cards**: Detailed day-by-day workout inspection with completion status and target vs. actual metrics.
- **Clinical Clearance Badging**: Prominent header pills displaying real-time joint readiness (`Lari: HOLD (ATFL)` vs. `Clear: MTB Zone 2`).
- **Semantic Fasting Tokens**: Dedicated theme token (`--color-fasting`) highlighting Monday & Thursday intermittent fasting days to preserve metabolic adaptation and joint rest.

### 5. Equipment Wear & Telemetry Gauges (`/profile`)
- **Sport-Specific Accent Cards**: Tailored equipment tracking for Mountain Bikes, Road Bikes, and Running Shoes.
- **High-Contrast Tabular Telemetry**: Clear metric readouts with formatted kilometer totals and target lifespan ceilings.
- **Clinical Wear Thresholds**:
  - `< 65%`: Prime Condition (`Kondisi Prima` - Sport accent / Cyan).
  - `65% - 85%`: Maintenance Monitoring (`Perlu Pemantauan` - Amber warning).
  - `≥ 85%`: Wear Limit Reached (`Batas Aus Tercapai` - Red alert).
- **Quota Projections**: Computes exact remaining safe kilometers before mandatory replacement.

### 6. Tactical Command Deck & Thermodynamic Flame Engine (`/`)
- **Obsidian 3-Column Streak Card**: Tracks **Total Active Contributions**, **Current Streak**, and **Longest Streak** separated by clean vertical dividers.
- **Weekly Retention Protocol**: Built around ISO calendar weeks (Monday–Sunday) so endurance athletes can balance high-volume workouts with adequate rest without risking daily streak burnout.
- **Thermodynamic Combustion Spectrum**:
  - **Stage 1 (1–9 Weeks)**: `Api Merah` (`#EF4444`, ~800°C) — Initial ember.
  - **Stage 2 (10–19 Weeks)**: `Api Oranye` (`#F97316`, ~1,100°C) — Sustained medium heat.
  - **Stage 3 (20–29 Weeks)**: `Api Kuning Emas` (`#EAB308`, ~1,300°C) — High heat consistency.
  - **Stage 4 (30–39 Weeks)**: `Api Putih Terang` (`#F8FAFC`, ~1,500°C) — White-hot intensity.
  - **Stage 5 (40–49 Weeks)**: `Api Biru Cyan` (`#00F0FF`, ~1,800°C) — Pure gas combustion / hottest flame.
  - **Stage 6 (50+ Weeks / 1 Year+)**: `Api Ungu Plasma` (`#C084FC`, >2,200°C) — Cosmic plasma peak.
- **Personal Records (PRs) Deck**: Deterministic calculation of verified all-time records across distance, duration, elevation, pace, and speed.
- **Century Ride (100 km) Tachometer**: Progress gauge tracking aerobic endurance milestones.

### 7. Activity Registry & Mass Telemetry Grouping (`/activities`)
- **Interactive KPI Summaries**: High-density cards for Total Sessions, Cumulative Distance, Moving Time, Average Speed, and Elevation Gain.
- **Multi-Dimensional Categorization**: Group workouts by Sport Type, Training Category, Monthly Mesocycle, or Distance Tier.
- **Scanning Density Controls**: One-click toggle between **Detailed (Rinci)** and **Compact (Padat)** single-line HUD scanning modes.
- **Batch Management**: Bulk selection and updating of sport disciplines and training categories.

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend Framework** | **Next.js 16.4.6** (App Router, Server Actions, Partial Prerendering, Turbopack) |
| **UI Library & Design** | **React 19.3.0**, **Tailwind CSS v4**, Lucide React, Obsidian Telemetry Tokens |
| **Language & Typings** | **TypeScript 5 (Strict Mode)** — 100% of files strictly `< 300 lines` |
| **Primary Database** | **PostgreSQL 16** via `pg` connection pool with automatic local JSON fallback store |
| **Computational Engine** | **Python 3.14**, FastAPI, Uvicorn, Pytest, AnyIO |
| **Security & Auth** | Cryptographic HMAC-SHA256 session integrity, AES-256-GCM token encryption, BOLA Defense |
| **Ingestion & OCR** | Tesseract.js / Python Vision image processing pipeline |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `20.x` or higher
- **npm** `10.x` or higher
- **Python** `3.12` or `3.14` *(Required for the Python analytics engine)*
- **PostgreSQL 16** *(Optional — system automatically activates JSON storage fallback if unconfigured)*

### 1. Installation

```bash
git clone https://github.com/Alfiansyahp2/a-coach.git
cd a-coach
npm install
```

### 2. Python Engine Setup

```bash
cd python_engine
python -m venv .venv
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and configure your database or Strava credentials:

```bash
cp .env.example .env.local
```

### 4. Database Initialization & Seeding (Optional)

Choose between the general synthetic demo dataset or private personal athlete data:

```bash
# Seed 1: General Synthetic Demo Dataset (Open-source safe, 100% anonymized)
npm run seed

# Seed 2: Private Personal Athlete Data (Strava OCR imports & personal health dossiers)
npm run seed:personal
```

### 5. Running the Application

You can run Next.js alone, the Python engine alone, or both simultaneously:

```bash
# Run Next.js and Python Engine concurrently (Recommended):
npm run dev:all

# Or run Next.js standalone:
npm run dev

# Or run Python FastAPI engine standalone:
npm run dev:python
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Automated Test Suites

The platform enforces rigorous end-to-end verification across 6 test suites comprising **88 total automated test cases**:

```bash
# Run ALL 6 test suites in sequence (Health, Coach, Streak, BOLA, Multi-Week, Pytest):
npm run test:all
```

Or execute individual test suites:

```bash
# 1. Athlete Health & Joint Readiness Suite (31 tests)
npm run test:health

# 2. Coach Periodization & Goal Matching Suite (5 tests)
npm run test:coach

# 3. Weekly Streak & Thermodynamic Flame Suite (21 tests)
npm run test:streak

# 4. BOLA Defense & Session Security Suite (5 tests)
npm run test:bola

# 5. Multi-Week Recap & Sports Science Bridge Suite (10 tests)
npm run test:multi-week-recap

# 6. Python Banister & Computational Engine Tests (16 tests)
npm run test:python

# 7. Strict TypeScript Compilation Check (0 errors)
npx tsc --noEmit

# 8. Turbopack Production Build Verification (34/34 routes)
npm run build
```

---

## 📐 Clean Architecture & Quality Governance

- **Strict Line Limit Enforcement**: Every source file in `src/` is mandated to remain strictly **under 300 lines of code**. Large components are systematically decomposed into modular sub-components, custom hooks, and pure domain engines.
- **Anti-AI-Slop Visual Policy**: No generic rounded corporate templates or low-contrast gray text. The UI utilizes dark/light graphite surfaces, vibrant sports tokens (`--color-cycling` `#00F0FF`, `--color-running` `#FF5500`, `--color-fasting` `#7C3AED`/`#A78BFA`), and high-precision tabular figures (`font-tabular`).
- **BOLA (Broken Object Level Authorization) Protection**: All API endpoints enforce cryptographic session token verification to prevent unauthorized cross-tenant data access.

---

## 📖 Comprehensive Documentation

For complete architectural blueprints, database DDL specifications, and design guidelines, consult the master documentation ecosystem in [`docs/README.md`](./docs/README.md):

* **[00. Foundation](./docs/00-foundation/)**: Project vision, non-negotiable principles, glossary, and roadmaps.
* **[01. Product Requirements](./docs/01-product/)**: PRD, user journeys, functional specs, and acceptance criteria.
* **[02. Design Governance](./docs/02-design/)**: Anti-AI-slop rules, Obsidian design system, color tokens, and calendar variant catalog.
* **[03. Software Architecture](./docs/03-architecture/)**: C4 diagrams, PostgreSQL schema, API contracts, ADRs, and background workers.
* **[10. Changelog Archive](./docs/10-changelog/)**: Complete chronological engineering logs organized by feature, refactor, and security milestones.

---

## 📄 License

Proprietary and confidential. All rights reserved.
