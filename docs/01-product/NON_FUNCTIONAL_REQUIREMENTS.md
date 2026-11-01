# Non-Functional Requirements (NFR)

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Software Architect & QA Architect  
**Related Documents:** [PERFORMANCE_BUDGET.md](../07-quality/PERFORMANCE_BUDGET.md), [SECURITY_POLICY.md](../06-security/SECURITY_POLICY.md)

---

## 1. Security & Compliance
* **NFR-SEC-001:** All Strava API credentials, Client Secrets, and tokens must never be transmitted to or accessible by client browser JavaScript.
* **NFR-SEC-002:** Storage of access and refresh tokens must use AES-256-GCM authenticated encryption at rest.
* **NFR-SEC-003:** All user queries must be strictly tenant-isolated using the authenticated `user_id`.
* **NFR-SEC-004:** OWASP Top 10 mitigation: Parameterized SQL queries to prevent SQL injection; strict input validation to prevent XSS.

## 2. Performance & Responsiveness
* **NFR-PERF-001:** API response latency for dashboard summaries must not exceed 200ms under standard local network conditions.
* **NFR-PERF-002:** First Contentful Paint (FCP) must be under 800ms.
* **NFR-PERF-003:** Cumulative Layout Shift (CLS) must remain under 0.05 during calendar date transitions and chart rendering.
* **NFR-PERF-004:** Recharts/SVG data visualizations must render without frame drops (>50 fps).

## 3. Reliability & Availability
* **NFR-REL-001:** In the event of PostgreSQL connection failure or unconfigured credentials, the platform must gracefully fall back to local atomic file storage (`.data/store.json`) without throwing unhandled exceptions.
* **NFR-REL-002:** Strava rate limiting must be gracefully caught; the application must never crash when HTTP 429 is encountered.

## 4. Usability & Accessibility
* **NFR-ACC-001:** Minimum WCAG 2.1 AA color contrast ratio (4.5:1 for normal text, 3:1 for large graphical elements) on the dark obsidian background.
* **NFR-ACC-002:** All interactive modal dialogs and calendar navigation buttons must be fully operable via keyboard navigation (Tab, Enter, Escape).
