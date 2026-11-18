# A-COACH — REPOSITORY-AWARE BACKEND LOGIC & API FLOW AUDIT
## Document 07: Weekly Training Streak, Thermodynamic Flame Spectrum & Gamification Safety

> **Audit Date**: 2026-11-07  
> **Core Module**: Weekly Training Streak & Flame Engine  
> **Domain File**: [`src/lib/domain/streak/streakEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakEngine.ts)  
> **API Route**: [`src/app/api/athlete/streak/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/streak/route.ts)  
> **Verification Suite**: [`scripts/tests/test_weekly_streak_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_weekly_streak_system.js) (21/21 Passing)

---

### 1. Weekly Streak Philosophy & ISO Week Calculations

The `a-coach` platform implements a calendar-week streak cadence rather than a daily streak. This deliberate physiological design prevents athlete burnout and aligns with weekly microcycles:
- **Core Rule**: An athlete maintains their active training streak by logging **at least 1 session during each calendar week** (Monday 00:00:00 to Sunday 23:59:59.999).
- **Grace Period**: Athletes have 7 full days to maintain their streak, accommodating planned rest days (e.g. Monday and Thursday fasting) and recovery windows.

#### ISO Calendar Week Math:
```typescript
export function getMondayOfWeek(dateInput: Date | string): Date {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const diff = (day === 0 ? -6 : 1) - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff, 0, 0, 0, 0);
}

export function getSundayOfWeek(mondayInput: Date): Date {
  return new Date(mondayInput.getFullYear(), mondayInput.getMonth(), mondayInput.getDate() + 6, 23, 59, 59, 999);
}
```

---

### 2. Thermodynamic Flame Heat Spectrum Progression

Streak longevity is mapped to thermodynamic combustion stages, progressing from initial embers to cosmic plasma:

| Stage | Tier Name | Weeks Active | Temperature | Hex Color | Glow Effect | Description |
|---|---|---|---|---|---|---|
| **Stage 0** | `Api Padam` | 0 Weeks | 0°C | `#5A6272` | Gray (0.2) | Extinguished — complete 1 session this week to ignite flame. |
| **Stage 1** | `Api Merah` | 1–9 Weeks | ~800°C | `#EF4444` | Red (0.5) | Initial ember / least hot; establishing baseline habit. |
| **Stage 2** | `Api Oranye` | 10–19 Weeks | ~1,100°C | `#F97316` | Orange (0.5)| Sustained flame / medium heat; habitual consistency. |
| **Stage 3** | `Api Kuning Emas`| 20–29 Weeks | ~1,300°C | `#EAB308` | Gold (0.5) | High heat consistency; aerobic foundation solid. |
| **Stage 4** | `Api Putih Terang`| 30–39 Weeks | ~1,500°C | `#F8FAFC` | White (0.65)| White-hot intensity; high dedication. |
| **Stage 5** | `Api Biru Cyan` | 40–49 Weeks | ~1,800°C | `#00F0FF` | Cyan (0.65) | Pure gas combustion / hottest flame; approaching full year. |
| **Stage 6** | `Api Ungu Plasma`| 50+ Weeks | >2,200°C | `#C084FC` | Purple (0.7) | Cosmic plasma peak; 1 year+ elite discipline. |

#### Live Telemetry from PostgreSQL 16:
- **Active Current Streak**: **10 Weeks**
- **Flame Status**: **Stage 2: Api Oranye (~1,100°C)**
- **Hex Code**: `#F97316`
- **Weeks to Next Tier**: **10 weeks remaining** to unlock Stage 3 (Api Kuning Emas at 20 weeks).

---

### 3. Critical Code Defects in Streak Engine

#### Defect 1: Session Double-Counting Bug (P1)
In [`src/lib/domain/streak/streakEngine.ts#L205`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakEngine.ts#L205):
```typescript
  // 1. Gather all activity dates
  const timestamps: number[] = [];

  for (const act of activities) {
    if (act.start_date) {
      const t = new Date(act.start_date).getTime();
      if (!isNaN(t)) timestamps.push(t);
    }
  }

  // Also include COMPLETED workouts from the schedule if any
  for (const w of workouts) {
    if (w.status === 'COMPLETED' && w.scheduled_date) {
      const t = new Date(w.scheduled_date).getTime();
      if (!isNaN(t)) timestamps.push(t);
    }
  }

  timestamps.sort((a, b) => a - b);
  const totalContributions = timestamps.length;
```

**Root Cause**:
When an athlete records a manual activity that matches a scheduled workout, the workout's status is updated to `COMPLETED`.
When `calculateWeeklyStreak` runs:
1. It pushes `act.start_date` to `timestamps`.
2. It loops through `workouts`, finds the `COMPLETED` workout, and pushes `w.scheduled_date` to `timestamps`.
3. As a result, **1 training session counts as 2 contributions** (`totalContributions` increments by 2)!

**Impact**:
Total contributions displayed on the athlete's badge and profile is artificially inflated and inaccurate.

**Remediation**:
Deduplicate contributions by indexing by unique date or ignoring scheduled workouts that have an existing `workout_activity_match` record.

---

#### Defect 2: Data Fabrication in API Error Handler (P1)
In [`src/app/api/athlete/streak/route.ts#L28`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/streak/route.ts#L28):
```typescript
  } catch (error: any) {
    console.warn('[Streak API Fallback Triggered]:', error.message);
    return NextResponse.json({
      success: true,
      currentStreakWeeks: 9,
      longestStreakWeeks: 9,
      isFlameBurning: true,
      isFlameAtRisk: false,
      totalContributions: 34,
      heatTier: {
        stage: 1,
        name: 'Api Merah',
        ...
      },
    });
  }
```

**Root Cause & Impact**:
If the database connection fails or queries timeout, the API route silently masks the failure by returning a **hardcoded fake payload** claiming 9 weeks and 34 contributions.
This directly violates the product requirement: *"Missing metrics must never be fabricated."*

---

### 4. Gamification vs Clinical Safety Evaluation

A persistent risk in athletic software is that streak incentives pressure injured athletes to train against clinical advice. In `a-coach`:
- The engine requires only **1 session per calendar week**, allowing an athlete on an injury protocol to perform a gentle mobility, walk, or physical therapy session to maintain their flame without aggravating high-impact joint injuries.
- However, if the athlete is placed on complete clinical rest (`RESTRICTED_BY_CLINICIAN`), the flame should provide an explicit **"Medical Freeze"** status so the athlete is not penalized with `Api Padam` for adhering to physician orders.

