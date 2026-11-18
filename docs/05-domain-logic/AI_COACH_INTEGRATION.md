# AI Coaching Agents & Safety Gate Integration

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-02  
**Owner:** Principal AI Systems Architect  
**Related Documents:** [TRAINING_READINESS_ENGINE.md](./TRAINING_READINESS_ENGINE.md), [AI_DECISION_BOUNDARIES.md](./AI_DECISION_BOUNDARIES.md)

---

## 1. Multi-Agent Coaching Hierarchy

The AI coaching system consists of three specialized roles coordinated through a centralized Safety Gate:

```text
                  ATHLETE HEALTH CONTEXT
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     Running Coach     Cycling Coach     Multi-Sport
     (Impact Load)   (Non-Impact Load)   Coordinator
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                    SAFETY VALIDATION GATE
                   (Blocks Unsafe Workouts)
                             │
                             ▼
                   Athlete Actionable Plan
```

---

## 2. Specialized Coach Responsibilities

### A. Running Coach
- **Inputs Received:** Running history, active right ankle inversion history, bilateral patellar ache history, recent running load, running readiness state (`ON_HOLD`), clinician restrictions.
- **Permitted Behaviors:** Explaining why impact running is paused, recommending rest days or gentle non-weightbearing mobility, requesting symptom check-ins.
- **Strictly Prohibited:** Diagnosing patellofemoral pain syndrome or ankle ligament tears; prescribing tempo runs, interval training, or long runs while running is `ON_HOLD`.

### B. Cycling Coach
- **Inputs Received:** Cycling history, 56.10 km empirical pain-free response, cycling readiness state (`CONDITIONAL`), clinician restrictions.
- **Permitted Behaviors:** Authorizing Zone 1–2 flat aerobic cadence sessions ($\le 30\text{ km}$, $\le 60\text{ mins}$); enforcing low resistance to protect the patellofemoral and talocrural joints.
- **Strictly Prohibited:** Prescribing out-of-saddle steep hill climbing, maximum torque sprints, or high-intensity intervals while the athlete has active lower-extremity symptoms.

### C. Multi-Sport Training Coordinator
- **Inputs Received:** Consolidated running and cycling training load, recovery timelines, cross-discipline symptom carryover.
- **Permitted Behaviors:** Balancing cardiovascular maintenance through safe cycling while running impact is suspended; ensuring adequate recovery days; preventing either sport coach from overriding health gates.
- **Strictly Prohibited:** Granting running clearance based on pain-free cycling performance.

---

## 3. Safety Validation Gate (`validateWorkoutSafety`)

Every workout proposed by an AI agent is validated prior to display:

```typescript
export function validateWorkoutSafety(
  workout: Partial<ScheduledWorkout>,
  readiness: AthleteTrainingReadiness,
  clinicianRestrictions: string[]
): SafetyValidationResult
```

If a workout fails validation, the system:
1. Rejects the proposed workout.
2. Injects an explainable, clinically grounded reason (`blockedReason`).
3. Replaces the prescription with a safe, restorative alternative (`alternativeRecommendation`).

