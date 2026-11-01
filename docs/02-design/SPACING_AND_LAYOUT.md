# Spacing, Layout Grid & Density Principles

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal UI Designer  
**Related Documents:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md)

---

## 1. 4px Baseline Grid
All padding, margin, and gap parameters must align to an 8-point system with 4px sub-increments:
* `space-1` (4px): Hairline margins, badge padding.
* `space-2` (8px): Icon-to-text gap, compact table cell padding.
* `space-4` (16px): Card internal padding, calendar column gaps.
* `space-6` (24px): Major section separation, modal padding.
* `space-8` (32px): Page header margins.

## 2. Layout Structure & Density
* **Sidebar Navigation Width:** `240px` fixed on desktop; collapses to bottom navigation bar on mobile viewports.
* **Main Content Area:** Fluid width with max-width container cap (`max-w-7xl` = 1280px) to prevent over-stretching on ultra-wide monitors.
* **Information Density:** High density. An athlete should see their full 7-day calendar, primary volume bar chart, and upcoming workouts on a standard 1080p display without scrolling through yards of empty white space.
