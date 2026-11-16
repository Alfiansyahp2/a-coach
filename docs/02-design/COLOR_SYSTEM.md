# Color System & Semantic Intent

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Principal UI Designer & Creative Director  
**Related Documents:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md), [VISUAL_DIRECTION.md](./VISUAL_DIRECTION.md)

---

## 1. Dual-Theme Semantic Color Architecture

The platform implements the **Endurance Performance Lab Design System**, providing high contrast and instant legibility across both daylight athletic conditions and dark recovery environments.

| Semantic Token | Light Theme: Chalk Lab | Dark Theme: Graphite Obsidian | Primary Use Case |
| :--- | :--- | :--- | :--- |
| `--color-canvas` | `#F3F4EF` (Tactile Chalk) | `#111513` (Deep Obsidian) | Full viewport ground canvas |
| `--color-surface-card` | `#FFFFFF` (Crisp White) | `#171C19` (Dark Graphite) | Metric cards, dossiers, modals |
| `--color-surface-muted` | `#E8EAE3` (Subtle Chalk) | `#1F2622` (Muted Graphite) | Inner blocks, progress tracks, table headers |
| `--color-border` | `#D8DBD0` (Light Slate) | `#2C3530` (Graphite Slate) | 1px precision telemetry borders |
| `--color-text-primary` | `#171C19` (Graphite Black) | `#F3F4EF` (Chalk White) | High-contrast values, headers, labels |
| `--color-text-secondary` | `#5C635E` (Mid-tone Gray) | `#A6AFA8` (Cool Silver) | Units, secondary descriptions, timestamps |
| `--color-text-muted` | `#8A928C` (Muted Gray) | `#646E67` (Slate Gray) | Inactive tabs, disabled indicators |
| `--color-cycling` | `#4D947B` (Forest Jade) | `#5FB395` (Emerald Jade) | Cycling telemetry, cadence, non-impact load |
| `--color-running` | `#D98757` (Terracotta Orange) | `#E59A6D` (Amber Orange) | Running telemetry, pace, impact load |
| `--color-endurance` | `#B9DC72` (Volt Lime) | `#C5E87D` (Neon Volt Lime) | Completed workouts, optimal consistency |
| `--color-alert-amber` | `#E5A442` (Alert Amber) | `#F0B359` (Electric Amber) | Conditional caution, volume thresholds |
| `--color-alert-red` | `#D65F58` (Crimson Red) | `#E2726B` (Bright Crimson) | Joint safety restriction, active injury warning |

---

## 2. Physical Open Book Journal Color Tokens

Designed specifically for the tactical field journal activity modal (`AddActivityModal.tsx`):

| Semantic Token | Light Theme (Chalk Paper) | Dark Theme (Obsidian Paper) | Purpose |
| :--- | :--- | :--- | :--- |
| `--color-book-cover` | `#E5E7DF` (Canvas Linen) | `#141916` (Deep Leather) | Outer leather book casing |
| `--color-book-cover-border`| `#D0D4C7` (Embossed Edge) | `#242E28` (Stitched Border)| Subtle leather perimeter border |
| `--color-book-page-left` | `#F8F9F5` (Off-white Leaf) | `#181E1A` (Dark Charcoal) | Facing left page surface |
| `--color-book-page-right`| `#FFFFFF` (Crisp White Leaf) | `#1B221D` (Deep Slate Leaf) | Facing right page surface |
| `--color-book-grid` | `#E4E7DE` (20px Graph Grid) | `#242D27` (Technical Grid) | Telemetry & sensor slider background |
| `--color-book-line` | `#E8EBE2` (28px Ruled Lines)| `#28332C` (Ruled Paper) | Journal notes & form background |
| `--color-book-margin` | `#D8DDD2` (Left Margin Line)| `#3A483F` (Vertical Margin) | Traditional 38px ruled paper margin |
| `--color-book-crease` | `rgba(0, 0, 0, 0.08)` | `rgba(0, 0, 0, 0.7)` | Central spine folding shadow |
| **Ribbon Bookmark** | `#BE123C` to `#9F1239` (Crimson) | `#9F1239` to `#881337` (Deep Rose) | Centered silk bookmark drop |

---

## 3. Thermodynamic Flame Heat Spectrum (Streak Retention)

Calibrated to the 6 physical combustion temperature stages across rolling 52-week training streaks:

| Streak Stage | Temperature Range | Flame Color Token | Glow & Aura Spec |
| :--- | :---: | :--- | :--- |
| **Tier 1 (1–3 Mgg)** | $\sim 800^\circ\text{C}$ (Api Merah Awal) | `#D65F58` (Crimson) | Subtle red thermal aura |
| **Tier 2 (4–7 Mgg)** | $\sim 1,100^\circ\text{C}$ (Api Jingga Oranye) | `#D98757` (Terracotta) | Amber thermal dispersion |
| **Tier 3 (8–11 Mgg)** | $\sim 1,400^\circ\text{C}$ (Api Kuning Emas) | `#E5A442` (Golden Amber) | Concentrated luminous ring |
| **Tier 4 (12–19 Mgg)** | $\sim 1,700^\circ\text{C}$ (Api Hijau Volt) | `#4D947B` (Volt Emerald) | Intense chromatic halo |
| **Tier 5 (20–35 Mgg)** | $\sim 2,000^\circ\text{C}$ (Api Biru Cyan) | `#00F0FF` (Electric Cyan) | High-temperature plasma ring |
| **Tier 6 (36+ Mgg)** | $> 2,200^\circ\text{C}$ (Api Ungu Plasma) | `#A855F7` (Plasma Violet) | Maximum radiant crown |

---

## 4. Anti-AI-Slop Color Rules
* ❌ **Forbidden:** Generic SaaS purple/indigo linear gradients (`#4F46E5` -> `#9333EA`).
* ❌ **Forbidden:** Arbitrary rainbow card borders used as meaningless decoration.
* ✅ **Standard:** Color conveys clinical and athletic meaning exclusively:
  - Green / Jade: Non-impact, cleared joint state, completed session.
  - Orange / Terracotta: Running impact load, pace metrics.
  - Amber: Caution, threshold effort, metabolic warning.
  - Red / Crimson: Joint restriction, active injury, missed planned session.
