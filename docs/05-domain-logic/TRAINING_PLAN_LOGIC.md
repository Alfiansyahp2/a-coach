# Weekly Planning Logic & Progression Rules

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Product Architect  
**Related Documents:** [WORKOUT_CLASSIFICATION.md](./WORKOUT_CLASSIFICATION.md)

---

## 1. Calendar Scheduling Rules
1. **Consecutive Hard Days Warning:** The system evaluates adjacent calendar days. If two high-intensity workouts (Intervals, Tempo, Long Run) are scheduled back-to-back ($Day_{i}$ and $Day_{i+1}$), the platform flags a recovery warning.
2. **Weekly Volume Summation:** Total prescribed distance is computed dynamically as workouts are added or rescheduled.
3. **Status Transitions:**
   - `PLANNED`: Default state upon creation.
   - `COMPLETED`: Transitioned automatically when an ingested activity is matched.
   - `MISSED`: Transitioned if scheduled date has passed and no activity was matched.
   - `SKIPPED`: Manually marked by athlete when life circumstances require omitting a session.
