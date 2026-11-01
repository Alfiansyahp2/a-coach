# Background Jobs & Asynchronous Synchronization

**Status:** PROPOSED (Scheduled for Phase 2)  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Backend Engineer  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

---

## 1. Background Execution Model
* **MVP:** Synchronization is triggered on-demand by the athlete via the "Sync Activities" button or on initial dashboard load.
* **Phase 2 (Automated Background Ingestion):**
  * Cron schedule running every 6 hours via Next.js scheduled worker or external webhook.
  * Checks active connections where `is_active = true`.
  * Runs token expiry checks and executes incremental activity sync.
  * Throttled with 1-second delay between users to avoid exceeding application-level rate limits.
