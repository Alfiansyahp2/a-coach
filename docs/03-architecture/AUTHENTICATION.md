# Authentication & Authorization Architecture

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Application Security Engineer  
**Related Documents:** [TOKEN_MANAGEMENT.md](../06-security/TOKEN_MANAGEMENT.md)

---

## 1. Distinction: App Authentication vs Strava Authorization
* **App Authentication:** Identifies the user within the platform (via default user ID in MVP, extending to JWT session cookies in multi-user Phase 2).
* **Strava Authorization:** OAuth 2.0 delegated authorization permitting the platform to read activity data on behalf of the athlete.

## 2. Token Security Protocol
* Tokens are transmitted over HTTPS exclusively.
* Client code never receives the plaintext Strava `access_token` or `refresh_token`.
* Server-side route handlers decrypt tokens on-demand in memory, perform the request, and discard plaintext tokens from memory upon garbage collection.
