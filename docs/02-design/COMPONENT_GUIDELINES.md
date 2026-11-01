# Component Guidelines & Anatomy

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Design Systems Architect  
**Related Documents:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## 1. MetricCard Component
* **Anatomy:**
  1. Top Label: 12px uppercase muted title (e.g. `WEEKLY VOLUME`).
  2. Hero Value: 28px Geist Mono primary value (e.g. `42.19`).
  3. Inline Unit: 14px secondary unit (e.g. `km`).
  4. Delta Footer: +12% vs last week badge with directional arrow.
* **States:** Default, Hover (subtle border highlight), Loading skeleton.

## 2. WeeklyCalendarDay Component
* **Anatomy:**
  1. Day Header: Day of week (`MON`) + Date (`NOV 4`).
  2. Scheduled Workout Pill: Category color strip, planned distance, status checkmark.
  3. Matched Activity Slot: Shows actual Strava activity name and pace delta badge.
  4. Quick Add Button: Compact `+` button visible on hover to schedule a workout.

## 3. ComparisonCard Component
* **Anatomy:**
  1. Dual Column Split: Left column (Prescribed Plan) vs Right column (Executed Actual).
  2. Visual Delta Indicators:
     - Distance variance: $+0.42\text{ km}$ (Volt green if within 5%, amber if over/under).
     - Pace variance: $-5\text{s /km}$ (Volt green if faster, amber if slower).
  3. Adherence Score pill: e.g. `98% ADHERENCE`.
