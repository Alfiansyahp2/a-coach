# Comprehensive Testing Strategy

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** QA Architect  
**Related Documents:** [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md)

---

## 1. Testing Pyramid
1. **Unit Tests:**
   * Pure mathematical functions: Pace conversions (`formatters.ts`), ACWR ratio (`ai-coach.ts`), delta variance calculations (`matching.ts`).
   * Cryptographic integrity: AES-256-GCM encryption/decryption round-trip and auth tag tampering detection (`crypto.ts`).
2. **Integration Tests:**
   * Route handlers with mock Strava responses: OAuth authorization redirect, code exchange, token refresh on expiration, and sync upserts.
   * Database repository: CRUD operations against PostgreSQL and local fallback store.
3. **E2E & Acceptance Tests:**
   * Full user journey: creating a workout on Wednesday calendar, syncing activity, verifying auto-matching and delta calculations.
