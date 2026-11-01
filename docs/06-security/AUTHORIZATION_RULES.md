# Authorization Rules & Tenant Data Isolation

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Application Security Engineer  
**Related Documents:** [SECURITY_POLICY.md](./SECURITY_POLICY.md)

---

## 1. Tenant Data Isolation Rules
1. **Compulsory User ID Filtering:** Every database query selecting, updating, or deleting activities, workouts, goals, or matches must include `WHERE user_id = $1`.
2. **No IDOR (Insecure Direct Object References):** Looking up a workout or activity by its UUID alone is strictly forbidden; it must be scoped to the authenticated user's ID.
