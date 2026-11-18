# Typography & Tabular Metric Formatting

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Design Systems Architect & Lead Frontend Engineer  
**Related Documents:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## 1. Font Families

* **Primary Monospace (Telemetry, Performance Data & Book Headers):**  
  `Geist Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`.
* **Primary Sans (Descriptive Prose, Section Subtitles & Body):**  
  `Geist Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`.

---

## 2. The Golden Rule of Numerical Readouts: Tabular Figures

In sports telemetry, an athlete's eyes scan split times, paces, cadence, and heart rates rapidly. **Variable-width proportional numbers cause horizontal jitter**, making columns wobble when digits tick from `1` to `8`.

Every single metric value in the platform **MUST** use:

```css
.font-tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

Combined with `font-mono`, this guarantees absolute pixel stability across live updates and dashboard cards.

---

## 3. Typographic Hierarchy Scale

| Role | Font Family | Size / Leading | Weight / Tracking | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Telemetry** | `Geist Mono` | `32px` / `1.1` | `font-bold` / `tracking-tight` | `88.35 km`, `01:32:00` |
| **Section Title** | `Geist Mono` | `18px` / `1.2` | `font-bold` / `tracking-tight` | `HALAMAN 14 • CHECK-IN PASCA LATIHAN` |
| **Card / HUD Title** | `Geist Mono` | `13px` / `1.3` | `font-bold` / `tracking-wide` (Uppercase) | `PARAMETER & METRIK SESI` |
| **Telemetry Label** | `Geist Sans` | `11px` / `1.4` | `font-semibold` / `uppercase tracking-wider` | `SKALA INTENSITAS RPE` |
| **Secondary Data Unit**| `Geist Mono`| `11px` / `1.3` | `font-medium` | `km/jam`, `min/km`, `bpm` |
| **Clinical Notes** | `Geist Sans` | `12px` / `1.5` | `font-normal` / `leading-relaxed` | Protokol keselamatan sendi |
| **Micro Caption** | `Geist Mono` | `9.5px` / `1.2`| `font-mono` | `Target fisiologis Zone 2: RPE 3-4` |

---

## 4. Anti-AI-Slop Typography Checklist

* ❌ **Forbidden:** Bizarre cursive display scripts or mixing 3+ unrelated font families.
* ❌ **Forbidden:** Gigantic, low-density marketing headers ("Good Morning, Champion! 🌟") consuming vertical screen space.
* ❌ **Forbidden:** Proportional numbers for stopwatch durations or split comparisons.
* ✅ **Standard:** Clean, technical, glanceable typography that conveys discipline and telemetry precision.
