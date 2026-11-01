# AI Coding Agent Governance & Operating Rules

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** AI Development Governance Specialist & Principal Architect  
**Related Documents:** [ANTI_AI_SLOP.md](../02-design/ANTI_AI_SLOP.md), [CODE_STANDARDS.md](../07-quality/CODE_STANDARDS.md)

---

## 1. Purpose & Authority
This document establishes non-negotiable rules for AI coding assistants (including Antigravity, Claude Code, GitHub Copilot, Cursor). AI agents working on this codebase must strictly obey these directives.

---

## 2. The 15 Mandatory Rules for AI Coding Agents

1. **Read Relevant Documentation First:** Before writing or modifying any code, the agent must inspect the corresponding specification in `/docs`. Never invent technical decisions that contradict the documentation.
2. **Inspect Existing Implementations First:** Never assume what exists. Inspect existing utilities in `src/lib/` and types in `src/types/` before creating duplicate functions.
3. **Follow the Established Clean Architecture:** Respect module boundaries:
   - Components live in `src/components/`.
   - API endpoints live in `src/app/api/`.
   - Business algorithms live in `src/lib/`.
   - Entities live in `src/types/index.ts`.
4. **No Unnecessary External Dependencies:** Do not install random npm packages when a lightweight native solution (or existing utility) already suffices.
5. **Never Duplicate Existing Functionality:** Use existing formatters (`formatDistance`, `formatPaceSeconds`, `speedMpsToPace`) from `src/lib/formatters.ts`.
6. **No Mocking or Fabricating Real Integrations:** Never create fake Strava credentials, fake successful OAuth redirects, or mock data pretending to be live API syncs. If credentials are unset, display clear setup instructions.
7. **Never Expose Credentials to the Client:** Client components (`"use client"`) must never import or read `STRAVA_CLIENT_SECRET` or `ENCRYPTION_SECRET`.
8. **Validate All External Data:** Never trust incoming payloads from Strava or client forms without validation and null checking.
9. **Respect User Authorization:** Every database query touching athlete data must bind to `user_id`.
10. **Tabular Numerals for Athletic Metrics:** Every UI metric displaying pace, distance, heart rate, or duration must use monospace tabular numbers (`font-tabular`).
11. **Never Silently Ignore Errors:** Always log errors or propagate meaningful error structures. Never write empty `catch (e) {}` blocks.
12. **Update Documentation After Architectural Changes:** If a schema column or API route is modified, immediately update `/docs/03-architecture/`.
13. **Report Implementation Status Honestly:** Categorize statements accurately: `CONFIRMED`, `PROPOSED`, or `TBD`. Never present a proposed feature as working software.
14. **Do Not Claim a Feature is Complete Without Verification:** Run `npm run build` and verify functionality before reporting completion.
15. **Do Not Refactor Unrelated Modules:** Confine edits strictly to the requested feature; avoid unsolicited mass refactorings.

---

## 3. Handling Conflicts Between Documentation and Code
If an AI agent discovers a contradiction between existing code and documentation:
1. Do not silently rewrite working code.
2. Flag the discrepancy explicitly to the human engineer.
3. Determine whether the code or documentation is the authoritative ground truth before proceeding.
