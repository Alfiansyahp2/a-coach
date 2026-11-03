# Product Requirements Document (PRD)

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Product Architect & Product Requirements Engineer  
**Related Documents:** [FEATURE_SPECIFICATIONS.md](./FEATURE_SPECIFICATIONS.md), [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md), [SYSTEM_ARCHITECTURE.md](../03-architecture/SYSTEM_ARCHITECTURE.md)

---

## 1. Executive Summary
The **Personal Sports Training & Performance Platform** is an intelligent athletic companion integrated with the official Strava API v3. It bridges the critical divide between training prescription (weekly scheduled workouts) and athletic execution (Strava activity telemetry).

## 2. Product Objectives
1. Connect Strava accounts securely via OAuth 2.0 without exposing client secrets.
2. Synchronize multi-sport activities incrementally with rate limit protection.
3. Provide an intuitive 7-day weekly training planner supporting 11 workout classifications.
4. Deliver high-precision **Planned vs. Actual** variance analysis for distance, duration, and pace.
5. Provide multi-period analytical visualizations (7d, 30d, 90d, 1y) without vanity clutter.
6. Track personal records (PRs) and fitness goals with dynamic progress calculation.
7. Offer grounded AI training insights strictly anchored in empirical training logs.

## 3. User Personas (Summary)
* **Competitive Marathoner:** Requires strict tempo/interval pace guidance and 10% volume safety alerts.
* **Multi-Sport Athlete:** Needs unified calendar balancing running, cycling, swimming, and strength.
* **Habitual Fitness Builder:** Focuses on consistency, weekly session completion, and recovery days.

## 4. Core Feature Matrix & Traceability

| Feature ID | Module | Feature Name | Priority | Core Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **FEAT-001** | Auth | Strava OAuth 2.0 Flow | P0 (Must Have) | Server-side authorization, state CSRF validation, token auto-refresh. |
| **FEAT-002** | Sync | Incremental Activity Ingestion | P0 (Must Have) | Ingestion of authorized activities, duplicate prevention, rate limit logging. |
| **FEAT-003** | Planner | Weekly Training Calendar | P0 (Must Have) | 7-day grid, workout creation, target pace/distance/duration, status updates. |
| **FEAT-004** | Compare | Planned vs Actual Engine | P0 (Must Have) | Automated heuristic matching, manual match override, delta calculations. |
| **FEAT-005** | Analytics | Multi-Period Charts & Multi-Sport PRs | P1 (Should Have) | Stacked volume charts, pace trends, dual-sport PR recognition (Running & Cycling) with verified activity linkage. |
| **FEAT-006** | Goals | Goal Management | P1 (Should Have) | Distance, frequency, and pace goals with progress bars. |
| **FEAT-007** | AI Coach | Grounded Training Insights | P1 (Should Have) | ACWR calculation, 10% volume rule warning, recovery balancing. |
| **FEAT-008** | History | Activity Filter & Inspection | P2 (Nice to Have) | Searchable, paginated table with deep telemetry inspection. |

## 5. Non-Functional Requirements Summary
* **Security:** AES-256-GCM token encryption at rest. Zero tokens in browser code.
* **Performance:** Sub-200ms API response latency; zero cumulative layout shift (CLS < 0.05).
* **Resilience:** Automatic fallback to local atomic storage if PostgreSQL is unconfigured.
