# Anti-AI-Slop Visual Quality & Athletic Telemetry Policy

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Creative Director, Principal UI/UX Architect & Lead Telemetry Engineer  
**Related Documents:** [DESIGN_PHILOSOPHY.md](./DESIGN_PHILOSOPHY.md), [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [COLOR_SYSTEM.md](./COLOR_SYSTEM.md), [DESIGN_REVIEW_CHECKLIST.md](./DESIGN_REVIEW_CHECKLIST.md)

---

## 1. Purpose & The Anti-Slop Manifesto

AI coding assistants, generative LLMs, and hurried developers routinely default to generating **"AI Slop"**: homogeneous, low-density, generic SaaS templates characterized by purple/indigo linear gradients, gratuitous rounded cards with 32px borders, meaningless pastel badge clouds, decorative sparkle icons, and cheerful cheerleading copy that insults serious endurance athletes.

This document establishes an **uncompromising quality standard** for the **Endurance Performance Lab & Telemetry System**. 

The platform must feel like an **authentic precision athletic instrument**—a hybrid between a mission-critical Garmin/Coros avionics telemetry HUD and a physical, leather-bound runner's tactical training journal. Every pixel, every millisecond, and every line of code must serve true physiological legibility, clinical joint protection, and deterministic athletic discipline.

---

## 2. The 8 Deadly Cardinal Anti-Patterns of AI Slop (Strictly Forbidden)

```
       ❌ GENERIC AI SLOP (FORBIDDEN)             ✅ ATHLETIC PRECISION TELEMETRY
┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐
│ ✨ Welcome back, Champ! Crushing it! 🚀  │  │ [LIVE] ZONE 2 RECOVERY BLOCK • 88.35 KM │
│                                         │  │                                         │
│ ┌──────────────┐   ┌──────────────────┐ │  │ ┌───────────────────┬─────────────────┐ │
│ │ 🔮 74/100    │   │ 💖 AI Health Bar │ │  │ │ RPE: 3.5 / 10     │ ATFL ENGKEL: 0  │ │
│ │ Recovery IQ  │   │  92% Fit Score   │ │  │ │ PACE: 5:48 /km    │ EFUSI: NIHIL    │ │
│ └──────────────┘   └──────────────────┘ │  │ └───────────────────┴─────────────────┘ │
│ (Purple/Indigo Gradient + Bubble Cards) │  │ (Monospace Tabular + Tactical Contrast) │
└─────────────────────────────────────────┘  └─────────────────────────────────────────┘
```

### 2.1 The "Generic SaaS Purple/Indigo Gradient & Bubble Cliché"
* ❌ **Forbidden:** Linear gradients fading from `#4F46E5` to `#9333EA`, floating bubble shapes, and 24px/32px rounded pill borders on analytical tables.
* ✅ **Standard:** Deep tactile surfaces (`--color-canvas: #111513` in Dark, `#F3F4EF` in Light), crisp 1px precision dividers (`#2C3530`), sharp tactical radii (`rounded-xs: 2px`, `rounded-sm: 4px`, `rounded-md: 6px`). Radii above 8px are banned for data chrome and reserved strictly for the physical book cover (16px).

### 2.2 Monolithic "God Component" Spaghetti Files
* ❌ **Forbidden:** Generating single 500–1,200 line mega-files containing UI, business logic, state reducers, and database calls in one unmaintainable AI blob.
* ✅ **Standard:** **Strict Clean Architecture limit: `< 300 lines` per file.** Every view must be modularized into discrete, testable sub-components (e.g. `AddActivityModal.tsx` 257 lines, `useAddActivityForm.ts` 171 lines, `AddActivityCheckinLeftPage.tsx` 194 lines, `AddActivityInjuryRightPage.tsx` 250 lines, `activitySubmissionHelpers.ts` 141 lines).

### 2.3 Naive Timezone & Temporal Slop
* ❌ **Forbidden:** Using naive `.toISOString().slice(0, 10)` in UTC that rolls back dates by 1 day in UTC+7 (Western Indonesia Time), silently dropping Sunday sessions, or rendering empty future weeks (*"Minggu Depan >"*) on retrospective weekly recaps.
* ✅ **Standard:** Timezone-safe local calendar authority using `formatDateOnly(date)` and deterministic Monday-to-Sunday boundaries. Retrospective recaps must look exclusively backward at completed athletic history (`< Sebelumnya`, `● Minggu Berjalan`, `↺ Reset 1 Mgg Lalu`).

### 2.4 Hallucinated Diagnostics & Fake Gamification Slop
* ❌ **Forbidden:** Inventing fake metrics ("AI Recovery IQ: 88%"), arbitrary XP points, cartoon flame badges, or empty cheerleading praise ("You're a rockstar!").
* ✅ **Standard:** Deterministic sports science and clinical taxonomy: Borg CR10 perceived exertion, 3-point joint pain telemetry (during session, post-session, next morning), verified Strava moving time vs elapsed time, and anatomical injury localization (ATFL ankle, patellar tendon, hamstring).

### 2.5 Proportional Font Jitter Slop
* ❌ **Forbidden:** Using variable-width proportional fonts for numerical readouts, causing split times, distances, heart rates, and power watts to jump and wobble as numbers update.
* ✅ **Standard:** Strict monospace tabular typography (`font-mono font-tabular`, `tabular-nums`) for all performance metrics. Numbers must remain rock-solid across updates.

### 2.6 The "Everything is a 3x4 Rounded Card" Cliché
* ❌ **Forbidden:** Mindlessly dumping 12 identical rounded gray cards in a flat grid with an icon in the top right.
* ✅ **Standard:** Purpose-built, hierarchical HUD layouts: Primary Hero telemetries, comparative split cards (Prescribed vs Executed), dual-page open book journal spreads, and interactive timeline grids.

### 2.7 Flat, Hardcoded Badge Slop
* ❌ **Forbidden:** Hardcoding decorative status pills (e.g. static `34` activities or permanent `PRO` tags) that ignore the athlete's real database state.
* ✅ **Standard:** Live data-driven semantic badges: Running Coach badge displaying `HOLD` (amber) when joint injury restrictions are active vs `READY` (green) when joint clearance is achieved; activity count reflecting live database records (`37`); health gate reflecting clinical clearance.

### 2.8 Disconnected Form Sprawl vs Tactile Physical Metaphors
* ❌ **Forbidden:** Generic multi-modal popup popovers that feel like generic CRM contact forms.
* ✅ **Standard:** Immersive, high-craft physical metaphors such as the **Open Book Activity Modal** (`AddActivityModal.tsx`):
  - Dual-page spread with authentic paper textures (`--color-book-grid` and `--color-book-line`).
  - Tactile center ribbon bookmark and crease shading.
  - Multi-step logical progression: Lembar 1 (Telemetri & Data Sesi) -> Lembar 2 (Check-in Pasca Sesi & Skrining Cedera Baru).

---

## 3. The 10 Golden Rules of Precision Athletic Telemetry

| # | Rule Name | Description & Requirement |
| :-: | :--- | :--- |
| **1** | **Strict File Modularity** | Every source file (`.ts`, `.tsx`) **MUST remain strictly under 300 lines**. Extract helpers, hooks, and sub-pages immediately. |
| **2** | **Tabular Font Enforcement** | All numbers representing distance, pace, speed, cadence, watts, and duration **MUST** use `font-mono font-tabular`. |
| **3** | **Dual-Theme Integrity** | UI must seamlessly support both **Graphite Obsidian** (Dark) and **Tactile Chalk Lab** (Light) without unreadable contrast. |
| **4** | **Clinical Safety First** | When joint pain $> 0$, swelling, or instability is reported, the system must trigger a safety circuit breaker (`HOLD`). |
| **5** | **Null Value Honesty** | If heart rate, power, or cadence telemetry was not recorded by a sensor, render `--` instead of `0 bpm` or `0 W`. |
| **6** | **Timezone-Safe Dates** | Never call `.toISOString().slice(0, 10)` on local midnight dates. Always use `formatDateOnly()` from `@/lib/formatters`. |
| **7** | **Retrospective Clarity** | Retrospective analytical recaps must never navigate to blank future weeks. Historical navigation must reflect reality. |
| **8** | **Tactile Craft Metaphor** | Maintain the paper and leather physicality of athletic training logs for journal modals and check-ins. |
| **9** | **Real-Time Data Attributable** | Badges and telemetry counters must always be wired to real server state or props, never static hardcoded strings. |
| **10**| **No Decorative Bloat** | If an icon, badge, border, or glow does not inform training load, pacing, or joint safety, **delete it**. |

---

## 4. The 7 Mandatory Screen Scrutiny Questions

Before any UI view, modal, or component is committed to the repository, the engineer or AI assistant must answer:

1. **What is the athlete's primary task on this screen?** (e.g. Log manual run; evaluate post-ride ankle pain; check weekly volume adherence).
2. **What single number or visualization is the visual anchor?** (e.g. 88.35 km total volume; 0/10 joint pain scale).
3. **What is strictly secondary or supporting?** (e.g. Weather notes, elevation gain, secondary pace deltas).
4. **Does this layout maximize information density without causing cognitive fatigue?**
5. **Why does each visual element exist?** (If it's purely decorative "AI sparkle slop", eliminate it immediately).
6. **Can this screen be understood at a glance after a grueling 30 km tempo run in direct sunlight or in a dim room?**
7. **Is this interface unmistakably athletic, tactical, and distinct from a generic SaaS template?**

---

## 5. Permitted Design System & Semantic Color Tokens

```css
/* Core Telemetry Tokens */
--color-canvas:          #111513 (Dark Obsidian)   / #F3F4EF (Light Chalk)
--color-surface-card:    #171C19 (Dark Graphite)   / #FFFFFF (Crisp White)
--color-surface-muted:   #1F2622 (Muted Graphite)  / #E8EAE3 (Subtle Chalk)
--color-border:          #2C3530 (Precision Slate) / #D8DBD0 (Light Slate)

/* Discipline & Status Accents */
--color-cycling:         #5FB395 (Emerald Jade)    / #4D947B (Forest Jade)
--color-running:         #E59A6D (Amber Orange)    / #D98757 (Terracotta)
--color-endurance:       #C5E87D (Neon Volt Lime)  / #B9DC72 (Volt Lime)
--color-alert-amber:     #F0B359 (Electric Amber)  / #E5A442 (Alert Amber)
--color-alert-red:       #E2726B (Bright Crimson)  / #D65F58 (Crimson Red)

/* Tactile Open Book Journal Tokens */
--color-book-cover:        #141916 (Deep Leather)  / #E5E7DF (Canvas Linen)
--color-book-cover-border: #242E28                 / #D0D4C7
--color-book-page-left:    #181E1A                 / #F8F9F5
--color-book-page-right:   #1B221D                 / #FFFFFF
--color-book-grid:         #242D27                 / #E4E7DE
--color-book-line:         #28332C                 / #E8EBE2
--color-book-margin:       #3A483F                 / #D8DDD2
--color-book-crease:       #111613                 / #D4D8CB
```
