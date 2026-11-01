# a-coach

An athletic training and performance platform designed for endurance athletes, powered by Next.js and integrated with the Strava API.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## Features

- **Strava Synchronization**: Connect with Strava to automatically sync activities, pace, and biometric telemetry.
- **Training Calendar**: Schedule workouts, set target paces, and track weekly mileage.
- **Planned vs. Actual Comparison**: Compare prescribed workouts against real telemetry with execution metrics.
- **Training Insights**: Science-backed volume progression analysis, recovery tracking, and consistency scoring.
- **Dual Storage Support**: Built on PostgreSQL with a seamless local fallback mode for quick development.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL 16 (via `pg`) / Local JSON Store
- **Security**: AES-256-GCM token encryption

---

## Getting Started

### Prerequisites

- Node.js `20.x` or higher
- npm `10.x` or higher
- PostgreSQL `16.x` *(Optional — automatically uses local fallback if unconfigured)*

### 1. Installation

```bash
git clone https://github.com/Alfiansyahp2/a-coach.git
cd a-coach
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and set your credentials as needed:

```bash
cp .env.example .env.local
```

### 3. Database Setup (Optional)

If using PostgreSQL, run the seed script to apply the schema and sample data:

```bash
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint checks |
| `npm run seed` | Seeds initial data into PostgreSQL |

---

## Documentation

For detailed architectural decisions, API specifications, and domain logic, explore the [Documentation Directory](./docs/README.md).

---

## License

Proprietary and confidential. All rights reserved.
