# Design Review & Quality Gate Checklist

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Creative Director & Principal UI Designer  
**Related Documents:** [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md)

---

## Quality Gate Verification Items (Must Check Before Merge)

- [ ] **Anti-AI-Slop Audit:** Does the screen avoid generic purple/blue gradients and bubble cards?
- [ ] **Tabular Figures:** Are all pace, distance, and duration numbers using tabular figures (`font-tabular`)?
- [ ] **Visual Anchor:** Is there one commanding hero metric or chart that immediately captures focus?
- [ ] **Contrast Verification:** Does all secondary text pass WCAG 2.1 AA contrast on the dark canvas?
- [ ] **Empty States:** Are clean, meaningful empty states provided when no activities or workouts exist?
- [ ] **Null Handling:** Are missing sensors displayed as `--` rather than `0 bpm`?
- [ ] **Keyboard Nav:** Can all modals and inputs be operated without a mouse?
- [ ] **Responsive Test:** Does the 7-day calendar reflow gracefully on a 375px mobile viewport?
