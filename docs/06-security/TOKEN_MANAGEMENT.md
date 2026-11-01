# OAuth Token Management & AES-256-GCM Encryption

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Application Security Engineer  
**Related Documents:** [SECURITY_POLICY.md](./SECURITY_POLICY.md)

---

## 1. Cryptographic Standard: AES-256-GCM
All `access_token` and `refresh_token` strings are encrypted prior to persisting into `strava_tokens`.
* **Key Derivation:** `crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'strava-athlete-salt', 32)`.
* **Initialization Vector:** 16 cryptographically random bytes generated per encryption call.
* **Format:** `{iv_hex}:{auth_tag_hex}:{ciphertext_hex}`.
* **Authentication Tag:** 16-byte GCM tag verifying payload integrity; tampering throws an authentication error.
