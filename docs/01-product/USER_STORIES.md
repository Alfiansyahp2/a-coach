# User Stories & Acceptance Criteria

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Product Requirements Engineer  
**Related Documents:** [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md), [PRD.md](./PRD.md)

---

## US-001: Strava OAuth Authentication
* **As an** endurance athlete,  
  **I want to** connect my personal Strava account with one click,  
  **So that** my real-world activities are imported securely without me having to manually export GPX files.
* **Acceptance Criteria:**
  - Given an unauthenticated athlete, when they click "Connect with Strava", they are redirected to Strava's official authorization page with CSRF state validation.
  - Given a successful callback with granted permissions, the server encrypts access and refresh tokens using AES-256-GCM and persists them in the database.
  - Given expired credentials, the server automatically refreshes the token without disrupting the user session.

## US-002: Weekly Structured Training Planning
* **As a** competitive runner,  
  **I want to** schedule structured workouts across the days of the week with prescribed target distance, pace, and intensity,  
  **So that** I have a clear, disciplined training plan before my week begins.
* **Acceptance Criteria:**
  - Given the weekly calendar view, the user can create a workout on any day with category, target distance (km), target pace (min/km), and intensity zone.
  - The calendar immediately displays the workout card with category-specific color coding.
  - The user can edit or delete any planned session prior to or after execution.

## US-003: Automated Planned vs. Actual Comparison
* **As an** athlete reviewing my training session,  
  **I want to** see an immediate side-by-side comparison of my prescribed workout against my recorded Strava activity,  
  **So that** I know whether I maintained the prescribed pacing discipline.
* **Acceptance Criteria:**
  - When an activity is synced whose date and sport match an open workout, the system automatically links them.
  - The UI displays variance: Distance Delta ($pm 	ext{meters}$), Pace Delta ($pm 	ext{seconds/km}$), and Completion Percentage.
  - The athlete can manually match or unmatch an activity if the heuristic is uncertain.

## US-004: Training Volume & Overload Safety Analytics
* **As an** injury-conscious athlete,  
  **I want to** see my weekly volume progression and acute workload ratio,  
  **So that** I am alerted if I increase my mileage by more than 10-15% week-over-week.
* **Acceptance Criteria:**
  - The analytics dashboard displays weekly volume stacked bar charts.
  - If current 7-day distance exceeds previous week by $>15%$, a warning badge is displayed citing the 10% rule.
  - Insights are grounded in logged mileage with zero fabricated physiological claims.
