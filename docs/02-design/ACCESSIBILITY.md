# Accessibility (a11y) & WCAG 2.1 AA Compliance

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** QA Architect & Accessibility Specialist  
**Related Documents:** [COLOR_SYSTEM.md](./COLOR_SYSTEM.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## 1. Contrast Ratios across Dual Themes

All user interface text and data readouts must strictly satisfy WCAG 2.1 AA contrast requirements ($4.5:1$ for normal body text, $3.0:1$ for large display numbers):

* **Graphite Obsidian (Dark Theme):**
  - Text Primary (`#F3F4EF`) on Card Surface (`#171C19`): Contrast ratio $> 14.2:1$ (Passes AAA).
  - Text Secondary (`#A6AFA8`) on Card Surface (`#171C19`): Contrast ratio $> 7.1:1$ (Passes AAA).
  - Cycling Accent (`#5FB395`) on Dark Surface: Contrast ratio $> 5.8:1$ (Passes AA).
* **Chalk Lab (Light Theme):**
  - Text Primary (`#171C19`) on Card Surface (`#FFFFFF`): Contrast ratio $> 15.6:1$ (Passes AAA).
  - Text Secondary (`#5C635E`) on Card Surface (`#FFFFFF`): Contrast ratio $> 5.4:1$ (Passes AA).

---

## 2. Keyboard Navigation & Focus Rings

* **Modals & Overlays:** Every modal dialog (`AddActivityModal`, `PostActivityCheckinModal`, `EditAthleteProfileModal`) must support closing via the `Escape` key and trapping focus inside the active dialog container.
* **Focus Rings:** Interactive elements must display high-visibility focus indicators when navigated via keyboard (`focus-visible:ring-2 focus-visible:ring-[var(--color-cycling)] focus-visible:outline-none`).
* **Open Book Navigation:** Page turning buttons (`LANJUT KE CHECK-IN`, `← Kembali ke Hal. 12-13`) must be directly reachable via Tab navigation.

---

## 3. Screen Reader Labels & Clinical Clarity

* Non-text icons (e.g. `Bike`, `Footprints`, `HeartPulse`, `ShieldAlert`) must carry meaningful `aria-label` attributes or accompanied text labels.
* Slider controls for joint pain (0–10) must explicitly state their current value and clinical interpretation via `aria-valuetext` (e.g. `aria-valuetext="0 dari 10, Bebas Nyeri Sepenuhnya"`).
* Banned: Decorative emojis without descriptive alt text.
