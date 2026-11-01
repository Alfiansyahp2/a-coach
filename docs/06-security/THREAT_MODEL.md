# Threat Modeling & Attack Vector Mitigations

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Application Security Engineer  
**Related Documents:** [SECURITY_POLICY.md](./SECURITY_POLICY.md)

---

## 1. STRIDE Threat Analysis Matrix

| Threat Category | Potential Attack Vector | Platform Mitigation | Verification Method |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Forged Strava callback code. | Random 16-byte state parameter set in HTTP-only cookie and validated on callback. | Automated OAuth callback tests. |
| **Tampering** | Modifying encrypted token ciphertext in DB. | AES-256-GCM authenticated encryption tag detects and rejects altered bytes. | Crypto unit tests with flipped bits. |
| **Repudiation** | Denying an activity sync occurred. | Audit logging of all sync requests with status and counts in `sync_logs`. | Database query inspection. |
| **Information Disclosure**| Exposing `STRAVA_CLIENT_SECRET` in client bundle. | Server-only execution in Next.js Route Handlers; verified by bundle audit. | Production bundle inspection. |
| **Denial of Service** | Exceeding Strava API rate limits. | Incremental timestamp fetching (`?after=`) and backoff on HTTP 429. | Load testing with mock rate limits. |
| **Elevation of Privilege**| Accessing another athlete's workout records. | Strict `user_id` binding on every query. | IDOR vulnerability tests. |
