# a-coach

> **High-Performance Athletic Telemetry, Injury-Aware Coaching & Adaptive Training Platform**  
> Powered by **Next.js 16 (App Router)**, **React 19**, **PostgreSQL 16**, and integrated with the **Official Strava API v3**.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Test%20Suites-58%2F58%20Passing-success?style=flat-square)](./scripts/)

---

## 🏛️ Overview & Product Philosophy

**a-coach** is not merely an activity viewer—it is a deterministic athletic command platform designed for endurance athletes and coaches. The platform bridges empirical workout telemetry with physiological safety, adhering strictly to the **Grounded Indicator Protocol**:

1. **Zero Hallucination / Grounded Metrics**: Physiological unknown metrics (such as HRmax, LTHR, FTP, VO2max) remain strictly labeled as `UNKNOWN` unless clinically measured and calibrated.
2. **Injury-First Periodization**: Training load and progression are gated by objective joint dossiers and empirical symptom reports.
3. **Weekly Cadence & Flame Retention**: Consistency is cultivated through weekly commitments (Monday–Sunday) to prevent overuse injuries while sustaining long-term training habits.

---

## ⚡ Key Modules & Capabilities

### 1. Athlete Health & Injury-Aware Readiness Engine (`/health`)
- **Authoritative Biometric Profile**: Tracks calibrated height, weight, BMI, resting heart rate (RHR), and weekly training availability (e.g., 2–3 days/week).
- **Full-Body Anatomical Taxonomy**: Multi-quadrant body mapping covering Head & Neck, Upper Body & Trunk, Pelvis & Hips, and Lower Extremities.
- **Injury Dossiers & Clinical Boundaries**: Tracks specific injury dossiers (e.g., Right Ankle, Bilateral Anterior Knees) with clinical statuses and history of joint swelling.
- **Biological Circuit Breakers**: Automatically locks progressive overload when acute swelling or joint instability is reported.
- **Medical & Physiotherapy Logging**: Records clinical interventions, imaging, and physical therapy sessions.
- **Post-Activity Subjective Check-in Modal**:
  - Ingested sessions sorted chronologically descending (`⭐ [TERBARU]` at the very top).
  - Direct deep links (`/activities/[id]`) to inspect telemetry before submitting subjective ratings.
  - Multi-dimensional pain ratings (during, immediately after, next day) and structural circuit breaker checks.

### 2. Weekly Training Streak & Thermodynamic Flame Engine
- **Obsidian 3-Column Streak Card**: Displays **Total Contributions**, **Current Streak**, and **Longest Streak** separated by clean vertical dividers.
- **Weekly Retention Protocol**: Built around ISO calendar weeks (Monday 00:00:00 to Sunday 23:59:59) so endurance athletes can balance high-volume workouts and recovery without the risk of daily overuse injuries.
- **Thermodynamic Flame Heat Spectrum**: The flame icon and circular glowing ring dynamically evolve through physical combustion temperature stages:
  - **Stage 1 (1–9 Weeks)**: `Api Merah` (`#EF4444`, ~800°C) — Initial ember / least hot.
  - **Stage 2 (10–19 Weeks)**: `Api Oranye` (`#F97316`, ~1,100°C) — Sustained flame / medium heat.
  - **Stage 3 (20–29 Weeks)**: `Api Kuning Emas` (`#EAB308`, ~1,300°C) — High heat consistency.
  - **Stage 4 (30–39 Weeks)**: `Api Putih Terang` (`#F8FAFC`, ~1,500°C) — White-hot intensity.
  - **Stage 5 (40–49 Weeks)**: `Api Biru Cyan` (`#00F0FF`, ~1,800°C) — Pure gas combustion / hottest flame.
  - **Stage 6 (50+ Weeks / 1 Year+)**: `Api Ungu Plasma` (`#C084FC`, >2,200°C) — Cosmic plasma peak.

### 3. Tactical Command Deck & Periodization Calendar
- **Interactive Multi-Tab Command Deck**: Switch seamlessly between **Jadwal (Workouts)**, **Sasaran (Macro Goals)**, and **Rekor (PRs)**.
- **12-Week Zone 2 Endurance Plan**: Prescribed aerobic base workouts with automatic activity matching against real Strava sessions.
- **Personal Records (PRs) Engine**: Deterministic calculation of best distances, paces, and power outputs across running and cycling.

### 4. Activity Registry & Mass Telemetry Grouping (`/activities`)
- **Interactive KPI Summary Cards**: Instant telemetry overviews (Total Sessions, Distance, Moving Time, Average Pace/Speed, Elevation) with one-click filtering.
- **Multi-Dimensional Grouping**: Group activities by Sport Type, Training Category, Monthly Cycle, or Distance Range.
- **Density Controls**: Toggle between **Detailed (Rinci)** and **Compact (Padat)** single-line scanning modes.
- **Dynamic Sport Extensibility**: Dynamically register new sports (e.g. Swim, Trail Run, Rowing) with custom icons, color accents, and telemetry fields.
- **Batch Group Selection**: Select all activities in a category with a single checkbox to bulk-update sports or training categories.

### 5. Telemetry Bridge & Security
- **Official Strava API v3 OAuth Handshake**: Token exchange, automated refresh, and rate-limiting compliance.
- **AES-256-GCM Token Encryption**: Encrypted storage for access and refresh tokens.
- **Dual-Layer Architecture**: Robust PostgreSQL 16 database with an automatic local JSON storage fallback for offline development.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.4 (App Router, Server Actions, Suspense Streaming) |
| **UI & Styling** | React 19, Tailwind CSS v4, Lucide Icons |
| **Language** | TypeScript 5 (Strict Mode) |
| **Database** | PostgreSQL 16 via `pg` (with JSON fallback store) |
| **Security** | AES-256-GCM Cryptographic Key Management |
| **OCR Ingestion** | Tesseract.js / Python Vision processing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `20.x` or higher
- **npm** `10.x` or higher
- **PostgreSQL 16** *(Optional — system automatically defaults to local JSON storage if unconfigured)*

### 1. Installation

```bash
git clone https://github.com/Alfiansyahp2/a-coach.git
cd a-coach
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure your credentials as needed:

```bash
cp .env.example .env.local
```

### 3. Database Initialization & Seeding (Optional)

Choose between the general synthetic demo dataset or private personal athlete data:

```bash
# Seed 1: General Synthetic Demo Dataset (Open-source safe, 100% anonymized)
npm run seed

# Seed 2: Private Personal Athlete Data (Strava OCR imports & personal dossiers, kept in .gitignore)
npm run seed:personal
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Test Suites

The platform includes comprehensive automated verification suites covering clinical logic, training progression, and gamified streak mechanics:

```bash
# 1. Athlete Health & Injury-Aware Readiness Engine (32 tests)
node scripts/test_athlete_health_system.js

# 2. Coach Periodization & Telemetry Matching Suite (5 tests)
node scripts/test_coach_training_system.js

# 3. Weekly Training Streak & Flame Progression Suite (21 tests)
node scripts/test_weekly_streak_system.js

# 4. Strict TypeScript Compilation Check
npx tsc --noEmit
```

---

## 📖 Comprehensive Documentation

For full architectural blueprints, functional specifications, and design governance, visit the [Documentation Directory](./docs/README.md).

---

## 📄 License

Proprietary and confidential. All rights reserved.
