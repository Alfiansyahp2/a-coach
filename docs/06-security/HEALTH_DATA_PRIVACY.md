# Health Data Privacy, Access Control & Audit Compliance

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-02  
**Owner:** Information Security & Compliance Specialist  
**Related Documents:** [SECURITY_OVERVIEW.md](./SECURITY_OVERVIEW.md), [AUTHENTICATION.md](../03-architecture/AUTHENTICATION.md)

---

## 1. Compliance Scope & Sensitivity Classification

Health information (injury mechanisms, subjective pain logs, clinical assessments, physical limitations) constitutes **Protected Sensitive Data**. 

### Three Golden Safeguards
1. **Strict User Scoping:** Every health entity (`athlete_profiles`, `athlete_injuries`, `athlete_pain_logs`, `athlete_medical_assessments`, `athlete_training_readiness`) has a mandatory foreign key `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`.
2. **Immutable Audit Trail:** All mutations (creates, updates, clinician overrides) write an entry to `health_audit_trail` capturing the before and after state, timestamp, and modifying entity.
3. **No Cross-Athlete Leakage:** Telemetry endpoints strictly scope data by authenticated user identifier; unauthenticated requests are rejected.

---

## 2. Encryption at Rest & Token Protection

- Sensitive OAuth credentials and tokens remain encrypted with AES-256-GCM via `src/lib/crypto.ts`.
- Database connections enforce encrypted TLS transports (`sslmode=require` in production).

---

## 3. Data Integrity & Non-Fabrication Guarantee

The AI subsystem operates under a **Zero-Fabrication Policy**:
- Unknown laboratory metrics (FTP, VO2max, HRmax) remain `null` in storage and are presented as `"Unmeasured"` in the UI.
- No medical diagnosis can be generated or inferred by AI prompt completion.
- Clinician restrictions cannot be altered or bypassed by non-clinician actors.

