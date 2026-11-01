# Application Security Verification Checklist

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Application Security Engineer  
**Related Documents:** [SECURITY_POLICY.md](./SECURITY_POLICY.md)

---

## Security Verification Gate

- [ ] **No Client Secrets in Browser:** Verified that `STRAVA_CLIENT_SECRET` and `ENCRYPTION_SECRET` are never prefixed with `NEXT_PUBLIC_`.
- [ ] **CSRF State Validation:** Verified that OAuth callback strictly validates `state` against an HTTP-only, secure cookie.
- [ ] **AES-256-GCM Encryption:** Verified that tokens stored in database are encrypted with random 16-byte IV and 16-byte auth tag.
- [ ] **SQL Injection Defense:** Verified that 100% of PostgreSQL queries use parameterized arguments.
- [ ] **Tenant Isolation:** Verified that every data query includes `WHERE user_id = $1`.
- [ ] **Rate Limit Guard:** Verified that the sync engine intercepts HTTP 429 and aborts gracefully without crashing.
