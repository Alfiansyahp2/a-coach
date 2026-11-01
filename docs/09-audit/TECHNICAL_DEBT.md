# Technical Debt Ledger & Remediation Schedule

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Engineering Lead  
**Related Documents:** [ROADMAP.md](../00-foundation/ROADMAP.md)

---

## 1. Technical Debt Inventory

| Debt ID | Module | Description | Severity | Impact | Remediation Plan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEBT-001** | Database | Dual-branch querying in `src/lib/db.ts` (PG vs Local store). | Low | Slight code verbosity. | Extract repository interfaces when PostgreSQL becomes primary in production. |
| **DEBT-002** | Webhooks | Background sync currently manual rather than push webhooks. | Low | User must click Sync. | Implement Strava Webhook subscription in Phase 2. |
