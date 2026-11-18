# Data Visualization Guidelines & Athletic Chart Standards

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Principal UI Designer & Telemetry Data Analyst  
**Related Documents:** [METRIC_DEFINITIONS.md](../05-domain-logic/METRIC_DEFINITIONS.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## 1. Core Principles of Athletic Data Visualization

1. **Zero Misleading Axes:**
   - Volume and distance charts must **always start at $Y=0$**. Never truncate the baseline to falsely exaggerate insignificant daily fluctuations.
2. **Pace Inversion Convention:**
   - In running, lower numbers represent faster velocity ($4:30\text{ min/km}$ is superior to $6:00\text{ min/km}$). When plotting pace trends, the Y-axis must reflect athletic convention (faster pace on top) or provide explicit directional cues.
3. **Clinical Aerobic Corridors:**
   - When visualizing Zone 2 endurance workouts, display a subtle shaded corridor representing the target heart rate or power band ($130–145\text{ bpm}$ or $180–210\text{ W}$). Deviations above or below this corridor should be immediately discernible.

---

## 2. Standard Telemetry Visualizations

### A. Weekly Volume Breakdown (Stacked 7-Day Matrix)
* **Type:** Stacked vertical bar chart across Monday through Sunday.
* **Sport Mapping:**
  - `Ride` / Cycling: Forest Jade / Emerald (`--color-cycling`).
  - `Run` / Running: Terracotta / Amber Orange (`--color-running`).
  - `CrossTraining` / Swim: Slate Blue.
* **Rest Day Representation:** Clear dashed or muted hollow indicators rather than blank voids, distinguishing planned recovery from missed sessions.

### B. Pace-Power Tactical HUD Matrix
* Visual scatter or dual-line plot correlating running pace against wattage/elevation gain.
* Tooltip displays: Exact date, Strava moving time, elapsed time, pace delta vs planned target, and average heart rate.

### C. 3-Point Joint Pain & Recovery Progression
* Visual progression tracking pain across 3 temporal checkpoints:
  1. *During Workout* (Immediate load impact).
  2. *Post-Workout* (Acute inflammatory response).
  3. *Next Morning* (Delayed biological reaction / effusion).
* Connects directly to the clinical gatekeeper: Any next-morning spike $> 3/10$ restricts subsequent running recommendations.

---

## 3. Anti-AI-Slop Chart Rules

* ❌ **Forbidden:** 3D pie charts, donut charts with neon glow halos, or decorative wavy area graphs that distort quantitative precision.
* ❌ **Forbidden:** Gratuitous particle animations or charts that take $> 300\text{ms}$ to render.
* ❌ **Forbidden:** Hallucinated recovery score gauges ("Bio-Battery 84%") without backing sensor telemetry.
* ✅ **Standard:** Clean, utilitarian, high-contrast SVG and canvas charts optimized for 60fps rendering.
