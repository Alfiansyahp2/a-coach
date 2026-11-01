# Product Success Metrics & KPIs

**Status:** PROPOSED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Product Manager & Data Analyst  
**Related Documents:** [PRD.md](./PRD.md)

---

## 1. Primary Success Metrics (North Star)
* **Weekly Planned vs. Actual Match Rate:**
  $$	ext{Match Rate} = rac{	ext{Completed Matched Workouts}}{	ext{Total Scheduled Workouts}} 	imes 100%$$
  * *Target:* $>75%$ of non-rest planned workouts successfully matched with actual Strava activities.

## 2. Technical & Integration Reliability Metrics
* **OAuth Handshake Success Rate:** $>99.0%$ of initiated OAuth authorizations complete without callback errors.
* **Token Auto-Refresh Reliability:** $100%$ of expired access tokens successfully refreshed before API calls without requiring user re-authentication.
* **Sync Latency:** Average sync runtime $< 2.5	ext{ seconds}$ for incremental fetches under 50 activities.
* **Rate Limit Incident Rate:** $0$ unhandled HTTP 429 errors resulting in application crashes.

## 3. User Discipline & Athletic Impact Metrics
* **Weekly Training Consistency:** Percentage of athletes maintaining $ge 3$ completed workouts per week.
* **Overuse Injury Prevention Awareness:** Athlete response rate to 10% volume spike warnings (adjusting planned volume downward following an alert).
* **Pace Adherence Accuracy:** Average pace delta narrowing over consecutive 4-week training cycles (demonstrating improved workout pacing discipline).
