# Data Visualization Guidelines & Chart Standards

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal UI Designer & Data Analyst  
**Related Documents:** [METRIC_DEFINITIONS.md](../05-domain-logic/METRIC_DEFINITIONS.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## 1. Chart Selection Standards
1. **Training Volume Progression:** Vertical stacked bar chart. Each bar represents one day (or week), with stacked colors representing sports (Volt = Run, Cyan = Bike, Blue = Swim).
2. **Pace Trend:** Clean line chart with subtle area gradient below. Baseline axis is inverted or standard depending on athlete convention (lower seconds/km represents faster velocity).
3. **Heart Rate vs Pace:** Dual-line scatter/trend plot showing cardiac drift over chronological workouts.

## 2. Visual Rules for Charts
* **No Misleading Y-Axes:** Distance and volume bar charts must always anchor at zero ($Y=0$). Never truncate the bottom axis to artificially exaggerate small changes.
* **Gridlines:** Minimal, faint horizontal gridlines (`rgba(255, 255, 255, 0.05)`). Zero vertical gridlines to reduce visual clutter.
* **Tooltips:** Custom obsidian tooltip showing exact date, sport type, distance ($0.01\text{ km}$ precision), moving time, and pace.
