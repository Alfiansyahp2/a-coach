# Design System Specification & Token Architecture

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Design Systems Architect  
**Related Documents:** [COLOR_SYSTEM.md](./COLOR_SYSTEM.md), [TYPOGRAPHY.md](./TYPOGRAPHY.md), [SPACING_AND_LAYOUT.md](./SPACING_AND_LAYOUT.md)

---

## 1. Design Token Schema

### Core Color Primitives
```css
:root {
  /* Surfaces */
  --surface-canvas: #090A0F;
  --surface-card: #12151D;
  --surface-card-hover: #171B26;
  --surface-modal: #151922;
  
  /* Borders */
  --border-subtle: #1F2430;
  --border-focus: #3A4256;
  --border-volt: rgba(212, 255, 0, 0.3);

  /* Typography */
  --text-primary: #F0F2F5;
  --text-secondary: #9BA3AF;
  --text-muted: #5A6272;
  
  /* Athletic Accents */
  --accent-volt: #D4FF00;
  --accent-cyan: #00F0FF;
  --accent-amber: #FF9500;
  --accent-crimson: #FF2A6D;
  --accent-purple: #B25DFF;
}
```

### Corner Radius Tokens
* `rounded-none` (`0px`): Primary data tables and split comparisons.
* `rounded-sm` (`4px`): Metric cards, calendar day slots, input fields.
* `rounded-md` (`6px`): Modals, dropdown drawers, primary action buttons.
* *(Note: Radii above 8px are forbidden to prevent bubble-slop aesthetics).*
