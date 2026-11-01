# Interaction, Animation & Motion Rules

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Frontend Engineer & UI Designer  
**Related Documents:** [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md), [ACCESSIBILITY.md](./ACCESSIBILITY.md)

---

## 1. Motion Principles: Utilitarian & Immediate
* **No Slow Transitions:** Transitions must never delay user interaction. Maximum duration for UI feedback is **150ms** (`duration-150`).
* **Easing:** Cubic bezier snappy ease (`cubic-bezier(0.16, 1, 0.3, 1)`).
* **Banned Animations:**
  * ❌ Bouncing bouncy-ball modals.
  * ❌ Spinning icons during idle states.
  * ❌ Gratuitous 3D card tilt effects.

## 2. Loading & Skeleton Conventions
* Content skeletons must mimic the exact layout of incoming text and chart boxes using subtle opacity pulsing (`animate-pulse` on `#1F2430`).
* Data transitions (e.g. switching time ranges from 7d to 30d) must cross-fade smoothly without collapsing container height.
