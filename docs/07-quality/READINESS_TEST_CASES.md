# Training Readiness Engine Test Matrix & Verification Cases

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-02  
**Owner:** QA Automation Engineer & Sports Science Advisor  
**Related Documents:** [TRAINING_READINESS_ENGINE.md](../05-domain-logic/TRAINING_READINESS_ENGINE.md)

---

## 1. Test Suite Summary

The verification suite (`scripts/test_athlete_health_system.js`) executes 32 automated checks verifying:
1. Ground-truth physical baseline integrity (Age 22, 170cm, 65kg, BMI 22.5, RHR 68).
2. Explicit null preservation for unmeasured metrics (HRmax, LTHR, FTP, VO2max).
3. Right ankle and bilateral knee tracking with `PENDING_CLINICAL_ASSESSMENT`.
4. Asymmetric readiness: Running is `ON_HOLD`; Cycling is `CONDITIONAL`.
5. Safety circuit breakers: Acute swelling or joint instability transitions both sports to `ON_HOLD`.
6. Clinician restriction precedence over AI recommendations.
7. Post-activity check-in ingestion and audit trail logging.

---

## 2. Test Execution Command

```powershell
node scripts/test_athlete_health_system.js
```

### Expected Output
```text
======================================================================
🧪 RUNNING ATHLETE HEALTH & INJURY-AWARE READINESS VERIFICATION SUITE
======================================================================
...
======================================================================
🏁 TEST RESULTS: 32 PASSED, 0 FAILED
======================================================================
```

