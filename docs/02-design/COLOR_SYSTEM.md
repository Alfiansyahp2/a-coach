# Color System & Semantic Intent

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal UI Designer  
**Related Documents:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## 1. Semantic Color Mapping

| Semantic Role | Hex Value | Contrast Ratio on Canvas | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#090A0F` | N/A | Deepest ground layer for all views. |
| **Surface Card** | `#12151D` | 1.2:1 vs Canvas | Primary card container surface. |
| **Text Primary** | `#F0F2F5` | 16.8:1 (AAA) | Numerical values, headers, primary labels. |
| **Text Secondary**| `#9BA3AF` | 7.9:1 (AAA) | Subheadings, units (`km`, `min/km`), dates. |
| **Text Muted** | `#5A6272` | 3.5:1 (AA Graphic)| Inactive labels, disabled states, empty slots. |
| **Volt Lime** | `#D4FF00` | 14.5:1 (AAA) | Completed runs, distance target achieved. |
| **Cyan** | `#00F0FF` | 12.8:1 (AAA) | Scheduled workouts, cycling activities. |
| **Electric Amber**| `#FF9500` | 8.5:1 (AAA) | Tempo sessions, volume caution warnings. |
| **Crimson** | `#FF2A6D` | 6.2:1 (AAA) | Missed workouts, high injury risk ACWR alerts. |

## 2. Sport Type Color Palette
* **Running (All disciplines):** Volt Lime (`#D4FF00`)
* **Cycling (Road, Gravel, Virtual):** Electric Cyan (`#00F0FF`)
* **Swimming:** Deep Azure (`#0091FF`)
* **Strength / Conditioning:** Warm Bronze (`#D97706`)
* **Rest Day / Recovery:** Muted Slate (`#4B5563`)
