# Design Review & Quality Gate Checklist

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Creative Director, Principal UI Architect & Lead Quality Engineer  
**Related Documents:** [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md), [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [DESIGN_PHILOSOPHY.md](./DESIGN_PHILOSOPHY.md)

---

## 1. The 10 Mandatory Quality Gates (Must Verify Before Merge)

Before any UI component, view, modal, or page is merged into `main`, the engineer and reviewer must pass every single verification item below:

### 🛡️ 1. Anti-AI-Slop & Visual Integrity
- [ ] **Zero Purple/Indigo Gradients:** Does the screen strictly avoid generic SaaS linear gradients (e.g. `#4F46E5` -> `#9333EA`)?
- [ ] **No Bubble Radii on Data Chrome:** Are borders on metric cards, tables, and dialogs strictly $\le 8\text{px}$ (`rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`)? (*16px is reserved exclusively for the physical book cover*).
- [ ] **No Fake Motivational Cheerleading:** Is the copy stoic, direct, and factual? (No "You crushed it Champ! 🚀").
- [ ] **No Meaningless Sparkle Clutter:** Does every single icon serve a functional athletic or clinical purpose?

### 📏 2. Strict Clean Architecture File Size Bound
- [ ] **Under 300 Lines Rule:** Is the file strictly **`< 300 lines`**?
  - *If a component exceeds 300 lines, it MUST be decomposed into sub-components, helper files, or dedicated hooks.*

### 🔢 3. Tabular Typography & Glanceability
- [ ] **Monospace Tabular Numerals:** Are all distance, pace, speed, duration, heart rate, cadence, and power numbers styled with `font-mono font-tabular` (`tabular-nums`) to prevent horizontal jitter?
- [ ] **Commanding Visual Anchor:** Is there a single primary hero metric that immediately anchors the athlete's gaze?
- [ ] **Null Value Honesty:** Are missing sensor streams displayed as `--` rather than `0 bpm` or `0 W`?

### 🌍 4. Timezone Safety & Local Calendar Compliance
- [ ] **Timezone-Safe Date Formatting:** Does the component use `formatDateOnly(date)` from `@/lib/formatters` instead of naive `.toISOString().slice(0, 10)`?
- [ ] **No Dropped Weekend Sessions:** Do Sunday sessions in UTC+7 (Western Indonesia Time) map correctly to Sunday rather than Saturday?

### ⏪ 5. Retrospective Timeline Integrity
- [ ] **No Future Navigation on Historical Recaps:** Does the weekly recap navigation look exclusively backward at completed athletic history (`< Sebelumnya`, `● Minggu Berjalan`, `↺ Reset 1 Mgg Lalu`) without an empty "Minggu Depan >" button?

### 🏷️ 6. Data-Driven Semantic Badges
- [ ] **Zero Hardcoded Status Badges:** Are badges dynamically wired to live database state or props (e.g. `activitiesCount`, `streakWeeks`, `HOLD` / `READY` based on active injury status)?

### 📖 7. Tactile Physical Metaphors (Open Book Journal)
- [ ] **Double-Page Spread Integrity:** If displaying the activity notebook modal, does it feature authentic paper textures (`--color-book-grid` on left, `--color-book-line` on right), center crease shading, and the red ribbon bookmark?
- [ ] **Smooth Step Progression:** Does clicking "Lanjut" transition seamlessly between Lembar 1 (Telemetri & Parameter Sesi) and Lembar 2 (Check-in & Skrining Cedera)?

### 🩺 8. Clinical Gatekeeper & Joint Safety Integration
- [ ] **Borg CR10 Exertion Scale:** Is RPE captured on a standard 1–10 scale with clear Zone 2 aerobic guidance (RPE 3–4)?
- [ ] **3-Point Joint Pain Telemetry:** Are pain levels tracked across *Saat Sesi*, *Sesaat Pasca Sesi*, and *Keesokan Harinya*?
- [ ] **Biological Circuit Breakers:** Are checkboxes provided for joint swelling/effusion and joint instability?
- [ ] **New Injury Screening:** Does the flow allow reporting acute trauma with anatomical localization, side, severity, and mechanism?

### 🌓 9. Dual-Theme Contrast & Accessibility
- [ ] **WCAG 2.1 AA Compliance:** Do all text labels meet minimum 4.5:1 contrast against their surface in both **Graphite Obsidian** (Dark) and **Tactile Chalk Lab** (Light)?
- [ ] **Focus Rings & Keyboard Nav:** Can modals, inputs, sliders, and buttons be operated using keyboard tab and escape keys?

### 📱 10. Responsive Ergonomics
- [ ] **Centered Floating Toggle:** Is the sidebar toggle positioned at the vertical center (`top-1/2 -translate-y-1/2`) for effortless reach?
- [ ] **Viewport Gracefulness:** Does the UI adapt smoothly on mobile devices (375px), laptops (1024px), and ultra-wide displays without horizontal clipping?
