# Athlete Health Context & Multi-Sport Architecture

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-02  
**Owner:** Principal AI Systems Architect & Sports Science Software Engineer  
**Related Documents:** [TRAINING_READINESS_ENGINE.md](../05-domain-logic/TRAINING_READINESS_ENGINE.md), [AI_COACH_INTEGRATION.md](../05-domain-logic/AI_COACH_INTEGRATION.md), [ATHLETE_HEALTH_SCHEMA.md](./ATHLETE_HEALTH_SCHEMA.md)

---

## 1. Executive Summary & Legal/Clinical Boundary

The platform operates as an **Injury-Aware Training Intelligence System** integrating empirical Strava telemetry with athlete-reported physical conditions, symptom progression, and clinical constraints.

> [!IMPORTANT]
> **Clinical & Legal Notice:** This system is a sports training decision-support platform, **NOT** a medical diagnostic device, clinical treatment provider, or autonomous return-to-sport clearance authority. Clinician-defined restrictions strictly override any algorithm, coach recommendation, or AI output.

---

## 2. Seven Inviolable Domain Distinctions

The architecture strictly distinguishes between the following seven categories:
1. **Historical Injury:** Prior anatomical trauma (e.g., right ankle inversion sprain 3–6 months ago with ~2 months swelling).
2. **Current Symptoms:** Active subjective signals (e.g., occasional right ankle pain, mild bilateral anterior knee pain post-run).
3. **Functional Capacity:** Demonstrated biomechanical abilities (e.g., normal walking, normal stairs, 56.10 km cycling tolerance).
4. **Sport-Specific Activity Tolerance:** Asymmetric loading tolerance (e.g., closed-chain low-impact cycling tolerated vs. high-impact repetitive running causing symptoms).
5. **Training Readiness:** Current software-computed permission to execute a specific sport discipline (`READY`, `CONDITIONAL`, `ON_HOLD`, `REQUIRES_CLINICAL_REVIEW`, `RESTRICTED_BY_CLINICIAN`, `UNKNOWN`).
6. **Medical Assessment Status:** State of professional evaluation (`PENDING_CLINICAL_ASSESSMENT`, `CLINICALLY_ASSESSED`, `UNDER_TREATMENT`, `DISCHARGED_CLEARED`).
7. **Clinician-Defined Restrictions:** Explicit boundaries set by licensed medical professionals (e.g., "no plyometrics", "max cycling distance 30 km").

---

## 3. Centralized Health Context Architecture

All downstream consumers—Running Coach, Cycling Coach, Multi-Sport Coordinator, and UI Dashboards—consume a single authoritative health context:

```text
                  ATHLETE PROFILE
                         |
                         v
             ATHLETE HEALTH CONTEXT
                         |
            +------------+------------+
            |            |            |
            v            v            v
       INJURY HISTORY  PAIN LOG   RECOVERY LOG
            |            |            |
            +------------+------------+
                         |
                         v
             TRAINING READINESS ENGINE
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
        RUNNING       CYCLING     MULTI-SPORT
         COACH         COACH      COORDINATOR
             |           |           |
             +-----------+-----------+
                         |
                         v
              TRAINING RECOMMENDATIONS
                         |
                         v
                SAFETY VALIDATION
                         |
                         v
                ATHLETE DASHBOARD
```

---

## 4. Athlete Physical Baseline & Physiological Unknowns Policy

### Verified Baseline (Apex Athlete)
- **Age:** 22
- **Height:** 170.0 cm
- **Weight:** 65.0 kg
- **BMI:** 22.5
- **Resting Heart Rate:** 68 bpm
- **Weekly Availability:** 2–3 days/week
- **Primary Disciplines:** Running and Cycling

### Explicitly Unknown Physiological Measurements
The system records `null` (unmeasured) for the following parameters until validated clinical or sensory testing is completed:
- Maximum Heart Rate ($\text{HR}_{\max}$)
- Lactate Threshold Heart Rate (LTHR)
- Functional Threshold Power (FTP)
- $\text{VO}_2\max$
- Running Threshold Pace
- Cycling Power Zones
- Sleep and Nocturnal HRV Baseline

> [!CAUTION]
> The AI Coach is strictly prohibited from fabricating individualized heart-rate or power zones in the absence of validated sensory measurements.

