# Product Principles & Tenets

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Product Manager & UX Lead  
**Related Documents:** [PROJECT_VISION.md](./PROJECT_VISION.md), [ANTI_AI_SLOP.md](../02-design/ANTI_AI_SLOP.md)

---

## 1. Purpose
Defines the immutable guiding principles that resolve design conflicts, engineering tradeoffs, and feature prioritization.

## 2. Scope
Applies across all user experience, data presentation, algorithmic modeling, and architectural designs.

## 3. The 8 Immutable Tenets

### 1. Accuracy Over Visual Decoration
Every graph, number, and status indicator must communicate actionable truth. A metric is never displayed solely because "it looks cool on a dashboard".

### 2. Actual Data Over Fabricated Telemetry
If an athlete runs without a heart rate strap or power meter, the UI must display clean null states (`--`). We never interpolate, guess, or synthesize physiological metrics (VO2 max, lactate threshold, recovery scores) without empirical sensor backing.

### 3. Prescribed vs. Actual is the Hero Interaction
The central soul of the application is comparative variance: Prescribed Workout ($W$) vs. Executed Strava Activity ($A$). Everything in the UI revolves around planning a session and evaluating execution accuracy.

### 4. Grounded AI, Zero Hallucination
AI features function as analytical assistants, not synthetic physicians. All AI insights cite the specific mathematical delta or logged activity supporting their advice.

### 5. Intentional Art Direction (Anti-AI-Slop)
Reject generic SaaS dashboard aesthetics, gratuitous purple/blue gradients, and repetitive rounded card grids. Embody a dark, athletic obsidian aesthetic inspired by high-performance instrument telemetry.

### 6. Athlete Control Over Automation
The system offers automated heuristic matching between workouts and activities, but the athlete always retains final manual override authority.

### 7. Performance & Latency as Features
Calendar interactions, metric filtering, and dashboard views must render instantly (<200ms API, zero visual layout shift).

### 8. Privacy & Token Isolation by Default
Athlete OAuth credentials, private activities, and training plans are encrypted at rest and isolated by tenant ID at the database layer.

## 4. Verification
Feature proposals that violate any of these eight tenets must be rejected during product discovery.
