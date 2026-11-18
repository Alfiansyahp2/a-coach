# Product Requirements Document (PRD)

**Status:** CONFIRMED & AUDITED  
**Version:** 2.0  
**Last Updated:** 2026-11-03  
**Owner:** Principal Product Architect & Product Requirements Engineer  
**Related Documents:** [FEATURE_SPECIFICATIONS.md](./FEATURE_SPECIFICATIONS.md), [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md), [SYSTEM_ARCHITECTURE.md](../03-architecture/SYSTEM_ARCHITECTURE.md)

---

## 1. Executive Summary
The **Personal Sports Training & Performance Platform** (Endurance Performance Lab) is an intelligent athletic companion integrated with the official Strava API v3. It bridges the critical divide between training prescription (weekly scheduled workouts), athletic execution (Strava activity telemetry), and biological recovery (biomechanical joint safety and injury intelligence).

---

## 2. Product Objectives
1. Connect Strava accounts securely via OAuth 2.0 without exposing client secrets.
2. Synchronize multi-sport activities incrementally with rate limit protection.
3. Provide a structured 12-Week Zone 2 training periodization calendar with heuristic planned vs actual matching.
4. Deliver high-precision variance analysis for distance, duration, and pace.
5. Provide multi-period analytical visualizations (7d, 30d, 90d, 1y) without vanity clutter.
6. Guard athlete joint health via a biomechanical safety gate restricting high-impact loading when injury history warrants.
7. Provide progressive macro milestone chaining (Century Ride 100km, Gran Fondo 150km, Double Century 200km) on a dedicated goals route (`/goals`).
8. Offer grounded AI training insights strictly anchored in empirical training logs.

---

## 3. Core Feature Matrix & Traceability

| Feature ID | Module | Feature Name | Priority | Status | Core Specification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-001** | Auth | Strava OAuth 2.0 Flow | P0 (Must Have) | [x] Selesai | Server-side authorization, state CSRF validation, token auto-refresh. |
| **FEAT-002** | Sync | Incremental Activity Ingestion | P0 (Must Have) | [x] Selesai | Ingestion of authorized activities, duplicate prevention, rate limit logging. |
| **FEAT-003** | Planner | 12-Week Training Periodization | P0 (Must Have) | [x] Selesai | Zone 2 plan generation, interactive 7-day grid, session dossiers. |
| **FEAT-004** | Compare | Planned vs Actual Engine | P0 (Must Have) | [x] Selesai | Automated heuristic matching, delta calculations ($Delta d, Delta t, Delta p$). |
| **FEAT-005** | Analytics | Multi-Period Charts & Multi-Sport PRs | P1 (Should Have) | [x] Selesai | Volume progression chart, dual-sport PR recognition (Running & Cycling). |
| **FEAT-006** | Goals | Progressive Milestone Chaining | P1 (Should Have) | [x] Selesai | Dedicated `/goals` route, Tier 2 & 3 cycling targets auto-unlocked when 100km met. |
| **FEAT-007** | AI Coach | Grounded Training Insights | P1 (Should Have) | [x] Selesai | ACWR calculation, 10% volume rule warning, recovery balancing. |
| **FEAT-008** | Registry | Activity Filter & Inspection | P1 (Should Have) | [x] Selesai | Dedicated `/activities` and `/activities/[id]` route with in-line editing. |
| **FEAT-009** | Health | Athlete Health & Joint Safety Gate | P0 (Must Have) | [x] Selesai | Biomechanical gate (Run ON_HOLD, Bike CONDITIONAL), anatomical body map, pain logs. |
| **FEAT-010** | Retention | Thermodynamic Flame Streak | P1 (Should Have) | [x] Selesai | 6-stage physical combustion temperature spectrum (Red ~800°C to Plasma >2,200°C). |
| **FEAT-011** | Ingestion | Activity Telemetry OCR Parser | P1 (Should Have) | [x] Selesai | Modal parsing screenshot uploads (Garmin/Apple/Strava) into telemetry fields. |
| **FEAT-012** | Design | Endurance Lab Dual-Theme System | P0 (Must Have) | [x] Selesai | Light (Chalk Lab) & Dark (Graphite Obsidian), sticky locked sidebar navigation. |

---

## 4. Non-Functional Requirements & Compliance Status

* [x] **Security (100% Compliant):** AES-256-GCM token encryption at rest. Zero tokens in browser code.
* [x] **Performance (100% Compliant):** Next.js 16 Partial Prerendering on all 22 routes. Direct DB access in Server Components.
* [x] **Database Integrity (100% Compliant):** Dual-layer architecture with PostgreSQL 16 connection pooling and atomic fallback. 34 authentic activities preserved.
* [x] **Design Integrity (100% Compliant):** Strict anti-AI-slop policy, tabular figures (`font-tabular`), zero generic SaaS gradients.
