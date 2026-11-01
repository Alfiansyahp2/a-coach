# Application Security Policy & Standards

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Application Security Engineer  
**Related Documents:** [TOKEN_MANAGEMENT.md](./TOKEN_MANAGEMENT.md), [THREAT_MODEL.md](./THREAT_MODEL.md)

---

## 1. Security Architecture Principles
* **Defense in Depth:** Multiple layers of control (OAuth CSRF tokens, server-side route isolation, authenticated AES-256-GCM token storage).
* **Least Privilege:** Request only the minimum required OAuth scopes (`read,activity:read_all`); never request write privileges.
* **Zero Client Exposure:** Secret keys (`STRAVA_CLIENT_SECRET`, `ENCRYPTION_SECRET`) never exist in client-side bundles.
* **SQL Injection Prevention:** All database operations through `pg` use strict parameterized queries ($1, $2, ...).
