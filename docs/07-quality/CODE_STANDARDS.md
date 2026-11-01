# Engineering Code Standards & Conventions

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Software Architect & QA Architect  
**Related Documents:** [CLEAN_CODE.md](./CLEAN_CODE.md)

---

## 1. TypeScript Strictness
* `strict: true` enabled in `tsconfig.json`.
* Zero usage of `any` for core domain entities (`Activity`, `ScheduledWorkout`, `User`).
* Discriminated unions used for sport types and workout categories.

## 2. Naming Conventions
* **Files:** PascalCase for React components (`MetricCard.tsx`), camelCase for utility modules and services (`formatters.ts`, `crypto.ts`).
* **Interfaces & Types:** PascalCase (`ScheduledWorkout`, `WorkoutActivityMatch`).
* **Constants:** UPPER_SNAKE_CASE (`DEFAULT_USER_ID`, `STRAVA_AUTH_URL`).
