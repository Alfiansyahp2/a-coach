# Accessibility (a11y) & WCAG 2.1 AA Compliance

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** QA Architect  
**Related Documents:** [COLOR_SYSTEM.md](./COLOR_SYSTEM.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## 1. Mandatory Accessibility Requirements
* **Color Contrast:** All body text and data labels meet WCAG 2.1 AA ratio ($ge 4.5:1$). Primary numbers in pure white on obsidian provide $> 16:1$.
* **Keyboard Navigation:** Every modal (Workout Creation, Manual Match, Strava Setup) can be closed via `Escape` and navigated via `Tab` / `Shift+Tab` with visible focus rings (`ring-2 ring-accent-volt`).
* **ARIA Roles:** Data visualization charts provide accessible `aria-label` summaries for screen reader users (e.g. `aria-label="Weekly distance chart: 42.2 kilometers total across 4 runs"`).
* **Reduced Motion:** Honor `prefers-reduced-motion` media queries by disabling all transition animations for users with vestibular sensitivities.
