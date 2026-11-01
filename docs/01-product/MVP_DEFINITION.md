# Minimum Viable Product (MVP) Definition

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Product Manager  
**Related Documents:** [PRODUCT_SCOPE.md](../00-foundation/PRODUCT_SCOPE.md), [ROADMAP.md](../00-foundation/ROADMAP.md)

---

## 1. Executive Definition
The MVP represents the smallest coherent, fully functioning version of the platform that delivers transformative value: enabling an individual athlete to schedule workouts, ingest real Strava data, compare execution variances, and review injury-prevention volume analytics.

## 2. In-Scope MVP Capabilities
1. **Strava OAuth 2.0 Integration:** Secure connect, token encryption at rest, automatic token refresh, disconnect.
2. **Activity Synchronization:** Incremental sync engine, idempotent upserts, rate limit monitoring.
3. **Weekly Training Planner:** 7-day calendar, 11 workout classifications, target pace/distance/duration inputs, status toggling.
4. **Planned vs Actual Engine:** Heuristic auto-matching, manual match override, exact delta computations.
5. **Analytics & PRs:** Multi-period volume charts, pace progression, personal record showcase.
6. **Goals:** Monthly mileage & weekly consistency goal tracking.
7. **Grounded AI Coach:** ACWR ratio, 10% volume overload warnings, pace efficiency adaptations.
8. **Dual Data Layer:** PostgreSQL support with instant atomic local file store fallback.

## 3. Explicitly Deferred Post-MVP Features
* Social sharing or community feed.
* Real-time GPS tracking or recording from within the browser.
* Direct Strava write operations (e.g. creating Strava routes or renaming activities on Strava).
* Complex multi-week structured plan builder wizards.
* Wearable hardware Bluetooth pairing directly into the browser.
