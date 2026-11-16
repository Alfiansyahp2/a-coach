# Spacing, Layout Grid & Density Principles

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Principal UI Designer & Systems Architect  
**Related Documents:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## 1. 4px Tactical Baseline Grid

All margins, paddings, and flex/grid gaps must adhere to a strict 4px/8px incremental grid:

| Utility Token | Value | Applied Context |
| :--- | :---: | :--- |
| `gap-1` / `p-1` | `4px` | Micro badge padding, status pill borders |
| `gap-1.5` / `p-1.5` | `6px` | Compact button padding, input internal spacing |
| `gap-2` / `p-2` | `8px` | Icon-to-label spacing, compact table rows |
| `gap-3` / `p-3` | `12px` | Grid column spacing inside modal pages |
| `gap-4` / `p-4` | `16px` | Card internal padding, metric grid gutters |
| `gap-6` / `p-6` | `24px` | Major section margins, modal dialog padding |
| `gap-8` / `p-8` | `32px` | Page-level layout breaks |

---

## 2. High Information Density Architecture

* **Glanceable Telemetry:** Serious endurance athletes value data density over sprawling whitespace. A dashboard must provide weekly mileage, training load status, coach gatekeeper state, and today's planned session on a standard 1080p display without endless scrolling.
* **Open Book Physical Layout:**
  - Standard modal width: `max-w-6xl` (1152px) with a constrained height `max-h-[94vh]`.
  - Double-page split: Exactly `grid-cols-1 lg:grid-cols-2` with 0px gap, connected seamlessly by the central shaded crease (`w-8 border-x`).
  - Scrollable internal pages: Each leaf scrolls independently if content overflows, preserving the outer leather book frame.

---

## 3. Anti-AI-Slop Layout Rules

* ❌ **Forbidden:** Empty 80px margins that force critical data below the fold.
* ❌ **Forbidden:** Unbalanced "cards inside cards inside cards" nesting that wastes viewport width.
* ✅ **Standard:** Sharp, cohesive HUD containers with crisp 1px borders and direct visual hierarchy.
