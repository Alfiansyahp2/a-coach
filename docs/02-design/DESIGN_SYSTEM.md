# Design System Specification & Token Architecture

**Status:** CONFIRMED & SYNCHRONIZED  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Design Systems Architect & Principal UI Engineer  
**Related Documents:** [COLOR_SYSTEM.md](./COLOR_SYSTEM.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md), [TYPOGRAPHY.md](./TYPOGRAPHY.md), [SPACING_AND_LAYOUT.md](./SPACING_AND_LAYOUT.md)

---

## 1. Dual-Theme Semantic Token Schema

The platform implements the **Endurance Performance Lab Design System**, operating across two synchronized modes: **Graphite Obsidian** (Dark) and **Tactile Chalk Lab** (Light).

### Core Surface & Content Tokens

```css
:root {
  /* Canvas & Viewport Ground */
  --color-canvas: #F3F4EF;            /* Light: Tactile Chalk */
  --color-surface-card: #FFFFFF;      /* Light: Crisp White Card */
  --color-surface-muted: #E8EAE3;     /* Light: Muted Substrate */
  --color-border: #D8DBD0;            /* Light: 1px Slate Border */

  /* Text & Hierarchy */
  --color-text-primary: #171C19;      /* Light: Deep Graphite */
  --color-text-secondary: #5C635E;    /* Light: Technical Mid-tone */
  --color-text-muted: #8A928C;        /* Light: Inactive / Caption */

  /* Athletic Disciplines & Telemetry */
  --color-cycling: #4D947B;           /* Forest Jade (Non-impact) */
  --color-running: #D98757;           /* Terracotta Orange (Impact load) */
  --color-endurance: #B9DC72;         /* Volt Lime (Optimal status) */
  --color-alert-amber: #E5A442;       /* Alert Amber (Threshold/Caution) */
  --color-alert-red: #D65F58;         /* Crimson Red (Joint safety hold) */

  /* Tactile Open Book Journal System */
  --color-book-cover: #E5E7DF;
  --color-book-cover-border: #D0D4C7;
  --color-book-page-left: #F8F9F5;
  --color-book-page-right: #FFFFFF;
  --color-book-grid: #E4E7DE;
  --color-book-line: #E8EBE2;
  --color-book-margin: #D8DDD2;
  --color-book-crease-start: rgba(0, 0, 0, 0.04);
  --color-book-crease-mid: rgba(0, 0, 0, 0.12);
}

.dark {
  /* Canvas & Viewport Ground */
  --color-canvas: #111513;            /* Dark: Deep Obsidian */
  --color-surface-card: #171C19;      /* Dark: Dark Graphite Card */
  --color-surface-muted: #1F2622;     /* Dark: Muted Substrate */
  --color-border: #2C3530;            /* Dark: Precision Slate Border */

  /* Text & Hierarchy */
  --color-text-primary: #F3F4EF;      /* Dark: Chalk White */
  --color-text-secondary: #A6AFA8;    /* Dark: Cool Technical Silver */
  --color-text-muted: #646E67;        /* Dark: Slate Inactive */

  /* Athletic Disciplines & Telemetry */
  --color-cycling: #5FB395;           /* Emerald Jade */
  --color-running: #E59A6D;           /* Amber Orange */
  --color-endurance: #C5E87D;         /* Neon Volt Lime */
  --color-alert-amber: #F0B359;       /* Electric Amber */
  --color-alert-red: #E2726B;         /* Bright Crimson */

  /* Tactile Open Book Journal System */
  --color-book-cover: #141916;
  --color-book-cover-border: #242E28;
  --color-book-page-left: #181E1A;
  --color-book-page-right: #1B221D;
  --color-book-grid: #242D27;
  --color-book-line: #28332C;
  --color-book-margin: #3A483F;
  --color-book-crease-start: rgba(0, 0, 0, 0.5);
  --color-book-crease-mid: rgba(0, 0, 0, 0.9);
}
```

---

## 2. Tactical Corner Radius Tokens

To maintain the precision instrument aesthetic and eliminate rounded "AI bubble slop":

| Token | CSS Value | Usage & Application |
| :--- | :---: | :--- |
| `rounded-none` | `0px` | Data split comparison columns, table borders, timeline axes |
| `rounded-xs` | `2px` | Tactical status badges, day slots, small metric indicators |
| `rounded-sm` | `4px` | Standard metric cards, dossier headers, input fields |
| `rounded-md` | `6px` | Interactive buttons, dropdown menus, HUD container panels |
| `rounded-lg` | `8px` | Standard dialog modals, telemetry pods, alert banners |
| `rounded-xl` | `12px` | Open book inner page leaf container |
| `rounded-2xl` | `16px` | Physical open book leather outer cover (`AddActivityModal`) |
| `rounded-full`| `9999px` | Floating edge toggle buttons, small status dots, user avatars |

> [!CAUTION]
> Arbitrary bubble borders (`rounded-2xl` or `rounded-3xl` on metric cards or data tables) are strictly banned under [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md).

---

## 3. Thermodynamic Flame Heat Spectrum (Streak Retention)

Calibrated to the 6 physical combustion temperature stages across rolling 52-week training streaks:

| Streak Stage | Combustion Temp | Color Token | Glow & Aura Spec |
| :--- | :---: | :--- | :--- |
| **Tier 1 (1–3 Mgg)** | $\sim 800^\circ\text{C}$ | `#D65F58` (Crimson) | Subtle red thermal aura |
| **Tier 2 (4–7 Mgg)** | $\sim 1,100^\circ\text{C}$ | `#D98757` (Terracotta) | Amber thermal dispersion |
| **Tier 3 (8–11 Mgg)** | $\sim 1,400^\circ\text{C}$ | `#E5A442` (Golden Amber) | Concentrated luminous ring |
| **Tier 4 (12–19 Mgg)** | $\sim 1,700^\circ\text{C}$ | `#4D947B` (Volt Emerald) | Intense chromatic halo |
| **Tier 5 (20–35 Mgg)** | $\sim 2,000^\circ\text{C}$ | `#00F0FF` (Electric Cyan) | High-temperature plasma ring |
| **Tier 6 (36+ Mgg)** | $> 2,200^\circ\text{C}$ | `#A855F7` (Plasma Violet) | Maximum radiant crown |

---

## 4. Layout Architecture & Clean Code Standard

1. **Information Density:** High-density, glanceable telemetry. No decorative whitespace purely for aesthetics.
2. **File Size Bound:** Strict Clean Architecture limit of `< 300 lines` per file.
3. **Typography:** Monospace tabular figures (`font-mono font-tabular`) mandatory for all times, paces, distances, heart rates, watts, and cadences.
