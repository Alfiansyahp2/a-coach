# External Services & Cloud Dependencies

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Software Architect  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](../03-architecture/SYSTEM_ARCHITECTURE.md)

---

## 1. Cloud Dependency Inventory
1. **Strava API v3 (`https://www.strava.com`):**
   * Primary telemetry provider for activities, athlete profiles, and OAuth authorization.
   * SLA: Public SaaS API with standard web rate limits.
2. **Google Fonts CDN / Next Font (`next/font/google`):**
   * Serves `Geist Sans` and `Geist Mono` font subsets (bundled statically at build time).
   * Zero external runtime blocking latency.
