# Fitness Goals Dynamic Calculation Logic

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Backend Engineer  
**Related Documents:** [PRD.md](../01-product/PRD.md)

---

## 1. Goal Types & Progress Algorithms
1. **`DISTANCE_MONTHLY` (Monthly Mileage):**
   - `current_value`: Sum of `distance_meters` for activities where `start_date` falls between `start_date` and `target_date`.
   - `percentage`: `Math.min(100, (current_value / target_value) * 100)`.
2. **`FREQUENCY_WEEKLY` (Session Consistency):**
   - `current_value`: Count of completed workouts within current Monday-Sunday window.
   - `target_value`: Prescribed sessions (e.g. 4 sessions).
