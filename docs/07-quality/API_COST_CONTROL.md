# External API Usage & Quota Cost Control

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Backend Engineer  
**Related Documents:** [RATE_LIMITING.md](../04-integrations/RATE_LIMITING.md)

---

## 1. Quota Preservation Tactics
1. **Incremental Sync:** Re-fetching full historical activities is strictly banned; always pass `?after={max_timestamp}`.
2. **Request Deduplication:** Repeated clicks on "Sync Activities" within 10 seconds return cached results or acknowledge an ongoing sync task.
3. **In-Memory Caching:** Analytics summary aggregates are cached during active user sessions to avoid redundant database reads.
