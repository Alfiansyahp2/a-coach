# Anti-AI-Slop Visual Quality & Art Direction Policy

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Creative Director & Principal UI/UX Designer  
**Related Documents:** [DESIGN_PHILOSOPHY.md](./DESIGN_PHILOSOPHY.md), [COLOR_SYSTEM.md](./COLOR_SYSTEM.md), [DESIGN_REVIEW_CHECKLIST.md](./DESIGN_REVIEW_CHECKLIST.md)

---

## 1. Purpose & The Manifesto
AI coding agents and hurried engineers routinely default to generating **"AI Slop"**: homogeneous, generic SaaS templates characterized by purple/blue linear gradients, gratuitous rounded cards, low-density whitespace, and decorative clutter that insults serious athletes.

This document establishes an uncompromising design quality standard. The **Personal Sports Training & Performance Platform** must feel like a precision athletic instrument—akin to a military-spec Garmin telemetry unit, a Formula 1 telemetry dashboard, or a specialized aerospace tool.

---

## 2. The 5 Cardinal Anti-Patterns of AI Slop (Strictly Forbidden)

### 2.1 Layout Anti-Patterns
* ❌ **The "Everything is an Identical Card" Grid:** Dumping 12 identical rounded white/dark gray cards in a 3x4 grid with an icon in the top right.
* ❌ **Sidebar-Plus-Cards Cliché:** A generic 240px sidebar with 8 random icons, leading to a title and 4 generic metric cards with no visual hierarchy.
* ❌ **Excessive Decorative Whitespace:** Wasting 50% of the screen on empty margins instead of presenting dense, actionable athletic telemetry.
* ❌ **Gratuitous Glassmorphism:** Transparent blurred backgrounds (`backdrop-blur-md`) that degrade contrast, slow rendering performance, and obscure critical numbers.

### 2.2 Color Anti-Patterns
* ❌ **Generic "AI SaaS" Purple/Indigo Gradients:** Backgrounds fading from `#4F46E5` to `#9333EA`.
* ❌ **Color Used as Arbitrary Decoration:** Coloring a card border green or yellow just to add visual noise.
* ❌ **Poor Contrast & Washed-out Grays:** Low-contrast text (e.g. #6B7280 on #111827) that cannot be read by an athlete reviewing their run in direct sunlight or in a dim room.

### 2.3 Typography Anti-Patterns
* ❌ **Excessive Font Families:** Mixing 3+ typefaces on a single screen.
* ❌ **Proportional Numbers for Tabular Metrics:** Using non-tabular digits that cause pace, duration, and heart rate values to jump horizontally as numbers change.
* ❌ **Gigantic Empty Headings:** "Good Morning, Athlete! Ready to crush your goals today?" consuming 200px of vertical viewport before any data appears.

### 2.4 Component Anti-Patterns
* ❌ **Badge Overkill:** Putting a rounded pill badge on every single word.
* ❌ **Decorative Icons Without Functional Meaning:** Sticking an abstract sparkle, flame, or rocket icon next to every metric.
* ❌ **Over-rounded Corners:** Bizarre 32px or 40px bubble borders on analytical tables.

### 2.5 Content & Linguistic Anti-Patterns
* ❌ **Fake Motivational AI Babble:** "Keep pushing your limits! Champions are made in the dark!"
* ❌ **Hallucinated Diagnostics:** "Your biological recovery score is 74/100" without actual physiological sensor telemetry.

---

## 3. The 7 Mandatory Screen Scrutiny Questions
Before any UI page, modal, or component is committed, the designer or AI agent must be able to answer:
1. **What is the athlete's primary task on this screen?** (e.g. Schedule Wednesday's workout; check pace adherence).
2. **What single number or visualization is most critical?** (Visual anchor).
3. **What is strictly secondary or supporting?**
4. **What visual anchor immediately captures the eye?**
5. **Why does each visual element exist?** (If it's purely decorative, delete it).
6. **Does this layout maximize information density while preserving clarity?**
7. **Is this interface unmistakably athletic and distinct from a generic generic CRM dashboard?**

---

## 4. Permitted Aesthetic Language: Precision Athletic Instrument
* **Base Surface:** Ultra-deep obsidian (`#090A0F`) and dark slate (`#12151D`).
* **High Contrast Borders:** Crisp, subtle 1px slate boundaries (`#1F2430`).
* **Athletic Accents:** Focussed, high-visibility neon accents used exclusively for data status:
  * **Volt Lime (`#D4FF00`):** Active running, completed planned sessions, optimal progress.
  * **Cyan (`#00F0FF`):** Scheduled targets, future intentions, cycling metrics.
  * **Electric Amber (`#FF9500`):** Threshold effort, tempo workouts, warnings.
  * **Crimson (`#FF2A6D`):** Missed workouts, high acute injury volume spikes.
* **Typography:** Geist Mono for tabular numerical pace/duration; clean Geist Sans for labels.
