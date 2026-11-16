# Interaction, Animation & Motion Rules

**Status:** CONFIRMED & AUTHORITATIVE  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Senior Frontend Engineer & UI Designer  
**Related Documents:** [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md), [ACCESSIBILITY.md](./ACCESSIBILITY.md)

---

## 1. Motion Principles: Utilitarian, Snappy & Physical

Athletes navigating training schedules and reviewing telemetry require instant, predictable feedback. Motion must feel like a precision instrument:

* **Maximum Duration for UI Feedback:** **150ms** (`duration-150` to `duration-200`). Animations that exceed 200ms feel sluggish and delay workflow.
* **Snappy Easing:** Clean ease-out transitions (`cubic-bezier(0.16, 1, 0.3, 1)` or standard `ease-out`).
* **Tactile Transitions:**
  - **Open Book Page Turning:** Smooth cross-fade or subtle sliding transitions between Lembar 1 (Hal 12–13) and Lembar 2 (Hal 14–15).
  - **Floating Sidebar Toggle:** Micro hover scale (`hover:scale-110`) with horizontal chevron nudges (`group-hover:-translate-x-0.5`).

---

## 2. Banned AI Motion Anti-Patterns

* ❌ **Forbidden:** Bouncy, rubber-band spring animations on modal dialogs.
* ❌ **Forbidden:** Constant spinning or pulsing icons during idle states.
* ❌ **Forbidden:** Slow 600ms page entry reveals that block interactions.
* ❌ **Forbidden:** Gratuitous 3D card tilt effects that trigger dizziness.

---

## 3. Loading Skeletons & Status Transitions

* Skeletons must mimic the exact layout dimensions of incoming telemetry cards to prevent layout shift (CLS).
* Pulses should be subtle opacity shifts (`opacity-40` to `opacity-80`) rather than dramatic flashing.
* Modals utilize a backdrop blur cap of `backdrop-blur-md` with `bg-black/60` (or `bg-black/90` in dark mode) to maintain high readability while keeping GPU frame rates rock solid at 60fps.
