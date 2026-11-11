# Responsive Design & Multi-Viewport Breakpoints

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Senior Frontend Architect & UI Lead  
**Related Documents:** [SPACING_AND_LAYOUT.md](./SPACING_AND_LAYOUT.md), [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md)

---

## 1. Tactical Breakpoint System

The platform adapts across mobile smartphones (runner handheld), tablets, laptops, and ultra-wide desktop monitors:

| Breakpoint | Viewport Width | Sidebar Behavior | Open Book Modal Behavior |
| :--- | :---: | :--- | :--- |
| **Mobile (`sm`)** | `< 640px` | Collapsed to floating toggle / bottom navigation | Single stacked vertical page with scroll |
| **Tablet (`md`)** | `640px – 1023px` | Collapsed icon-rail with centered toggle button | Single column responsive card stack |
| **Desktop (`lg`)** | `1024px – 1439px` | Expandable 240px sidebar with floating edge toggle | Full double-page open book spread (`grid-cols-2`) |
| **Ultra-wide (`2xl`)** | `≥ 1440px` | Full sidebar + fixed width container (`max-w-7xl`) | Full double-page spread with optimal paper margins |

---

## 2. Specific Component Responsive Rules

### A. The Open Book Modal (`AddActivityModal.tsx`)
* On desktop screens (`lg:grid-cols-2`), the modal displays both facing pages simultaneously (Left page: OCR & Telemetry; Right page: Input form / Check-in) separated by the central crease and ribbon bookmark.
* On smaller screens (`< 1024px`), the book folds gracefully into a single-column layout, hiding the central book crease while preserving the paper texture backgrounds.

### B. AppSidebar Floating Toggle Positioning
* The sidebar toggle button is positioned at **the vertical center** of the screen (`top-1/2 -translate-y-1/2`), attached directly to the right border of the sidebar.
* This ensures that on any laptop or desktop screen, the athlete can toggle between collapsed icon mode and expanded full mode without moving their mouse to the bottom corner of the screen.
