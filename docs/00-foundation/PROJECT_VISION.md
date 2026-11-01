# Project Vision & Strategic North Star

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Product Architect & Product Management  
**Related Documents:** [PRODUCT_PRINCIPLES.md](./PRODUCT_PRINCIPLES.md), [PRODUCT_POSITIONING.md](./PRODUCT_POSITIONING.md), [PRODUCT_SCOPE.md](./PRODUCT_SCOPE.md)

---

## 1. Purpose
This document establishes the overarching vision, core problem definition, and philosophical boundaries for the **Personal Sports Training & Performance Platform**. It acts as the compass for all downstream product, engineering, and architectural decisions.

## 2. Scope
- **Applies to:** Core platform capabilities, brand positioning, long-term product direction, and target user segments.
- **Does not cover:** Tactical implementation code, specific UI layouts, or temporary MVP release toggles.

## 3. Context & The Core Problem
Endurance athletes (runners, cyclists, triathletes, hybrid athletes) face a fundamental disconnection in their training ecosystem:
1. **Recording vs. Prescribing:** Strava serves as the global standard social ledger for recorded workouts. However, Strava is inherently backward-looking (what occurred in the past). It lacks proactive, structured weekly workout periodization.
2. **Planned vs. Actual Disconnect:** Athletes either hold training prescriptions in their head, maintain messy spreadsheets, or pay for complex legacy tools (e.g. TrainingPeaks) that feel like 1990s desktop enterprise software.
3. **Data Without Meaning:** Commercial wearables dump thousands of data points (cadence, ground contact time, oscillations) without answering fundamental athletic questions: *Did I execute what I set out to do today? Is my running pace adapting? Am I at risk of an acute volume injury spike?*

## 4. Vision Statement & Core Value Proposition
> **"To build the world's most focused, intelligent, and aesthetically uncompromising personal athletic training companion—bridging prescribed intentions with empirical Strava activity data."**

### Core Questions the Platform Answers:
- *Training Volume:* How much volume have I accumulated across disciplines this week?
- *Performance Trend:* Is my aerobic pace efficiency adapting over 30, 90, and 180 days?
- *Habitual Consistency:* Am I maintaining discipline relative to my planned calendar?
- *Variance Analysis:* Exactly how did today's actual run differ from my prescribed target pace, distance, and duration?
- *Overload Protection:* Is my 7-day acute workload spiking faster than my 28-day chronic base (>10% rule)?

## 5. Constraints and Dependencies
- **Dependency:** Strava API v3 authorization and availability.
- **Constraint:** Platform must remain strictly a companion to Strava, never a competing social network.
- **Data Policy:** No fabrication of physiological or biomechanical metrics that are absent from raw sensor data.

## 6. Risks and Edge Cases
- **Risk:** Over-complicating the interface with excessive metrics (turning into a bloated analytics tool).
- **Mitigation:** Adhere strictly to the "Anti-AI-Slop" and high-density, minimalist design principles.

## 7. Verification
- Alignment reviews conducted at every product milestone against the primary questions listed in Section 4.

## 8. Open Questions
- *TBD:* Support for multi-user coach-athlete pairing in Phase 3 vs pure single-athlete focus in MVP.

## 9. References
- Strava API v3 Developer Documentation: https://developers.strava.com
- Jack Daniels' *Running Formula* (Periodization and VDOT principles)
- Gabbett, T. J. (2016). *The training—injury prevention paradox: should athletes be training smarter and harder?*
