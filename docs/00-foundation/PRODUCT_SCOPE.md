# Product Scope: MVP vs Post-MVP Boundaries

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Product Architect  
**Related Documents:** [PRD.md](../01-product/PRD.md), [ROADMAP.md](./ROADMAP.md)

---

## 1. Purpose
Establishes rigid boundaries between what is included in the MVP and what is deferred to subsequent milestones.

## 2. Scope Boundary Table

| Feature Domain | In Scope (MVP) | Post-MVP / Phase 2 | Explicitly Excluded |
| :--- | :--- | :--- | :--- |
| **Strava Integration** | Official OAuth 2.0, token auto-refresh, incremental sync, activity history fetching. | Webhook subscriptions, automated background cron workers. | Segment leaderboards, social commenting, kudos ingestion. |
| **Training Planner** | 7-day weekly calendar, 11 workout classifications, target pace/distance/duration, manual status toggling. | Multi-week training plan templates, iCal calendar export sync. | Complex multi-year macrocycle periodization software. |
| **Workout Comparison** | Automatic date/sport heuristic matching, manual match/override, delta calculations (distance, pace, duration, completion %). | Split-by-split interval matching (e.g. matching 400m track lap splits against plan). | Automated real-time audio pacing during workout. |
| **Analytics** | 7d/30d/90d/1y time filters, volume progression, pace trends, elevation gain, personal records. | Custom multi-year date range picker, power duration curves. | VO2 max modeling without sensor telemetry. |
| **AI Coach** | Grounded statistical insights: 10% volume spike alert, ACWR ratio, consistency score, next week layout advice. | LLM conversational chat assistant ("Chat with your Training Plan"). | Medical diagnosis, injury treatment prescription. |
| **Data Engine** | Normalized PostgreSQL schema, AES-256-GCM token encryption, local file store fallback. | Multi-region database replication, Redis caching tier. | Blockchain or decentralized storage. |

## 3. Non-Negotiable MVP Deliverables
1. Functional Strava OAuth 2.0 handshake with token encryption at rest.
2. Incremental activity ingestion engine respecting rate limits.
3. Weekly calendar planner with structured workout creation.
4. Heuristic comparison engine computing distance, duration, and pace deltas.
5. High-density athletic dashboard and analytics suite.
6. Grounded rule-based AI training insights.
