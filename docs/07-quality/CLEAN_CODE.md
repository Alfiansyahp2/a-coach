# Clean Code & Architectural Separation of Concerns

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Software Architect  
**Related Documents:** [CODE_STANDARDS.md](./CODE_STANDARDS.md)

---

## 1. Separation of Concerns
1. **Presentation Layer (`src/components/`):** Pure rendering and local UI state; zero direct database queries or external API calls.
2. **API Route Handlers (`src/app/api/`):** Request validation, parameter parsing, error status mapping, and delegation to domain services.
3. **Domain Services (`src/lib/`):** Pure business logic (matching algorithms, pace conversions, ACWR calculations).
4. **Data Access Layer (`src/lib/db.ts`):** Encapsulated database queries; components never call raw SQL.
