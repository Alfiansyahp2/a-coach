# Typography & Tabular Metric Formatting

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Design Systems Architect  
**Related Documents:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [METRIC_DEFINITIONS.md](../05-domain-logic/METRIC_DEFINITIONS.md)

---

## 1. Font Families
* **Primary Sans (Headings & UI Chrome):** `Geist Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
* **Primary Monospace (Telemetry & Numbers):** `Geist Mono`, `SF Mono`, `Menlo`, `Consolas`, `monospace`.

## 2. Strict Numerical Rule: Tabular Figures
All numbers representing performance data (pace, distance, heart rate, elevation, durations, percentages) **MUST** use monospace tabular numbers:
```css
.font-tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```
*Rationale:* Without tabular numerals, changing digits causes jumping widths, destroying alignment in tables and split comparisons.

## 3. Type Hierarchy Scale
* **Display Metric:** `36px` / `font-bold` / `tracking-tight` / Geist Mono. (e.g. `10.42 km`).
* **Section Heading:** `20px` / `font-semibold` / `tracking-tight` / Geist Sans.
* **Card Title:** `14px` / `font-medium` / `text-text-secondary` / Uppercase tracking-wider.
* **Data Unit Label:** `12px` / `font-normal` / `text-text-muted` (e.g. `min/km`).
* **Body / Notes:** `14px` / `font-normal` / `leading-relaxed` / Geist Sans.
