# Recovery Heuristics & Boundary Logic

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Sports Science Advisor & QA Architect  
**Related Documents:** [AI_DECISION_BOUNDARIES.md](./AI_DECISION_BOUNDARIES.md)

---

## 1. What Can and CANNOT Be Inferred
* **What CAN Be Inferred:**
  - High volume accumulation without rest days.
  - Scheduling consecutive anaerobic or lactate threshold days.
  - Elevated heart rate at identical pace across sequential runs (potential cardiac drift / accumulated fatigue).
* **What CANNOT Be Inferred (Strictly Forbidden):**
  - Sleep quality, REM cycles, or nocturnal HRV without direct sensor streams.
  - Blood lactate concentration or muscle glycogen depletion percentages.
  - Medical recovery diagnoses.
