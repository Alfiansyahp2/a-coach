# Tech Stack Specifications & Rationales

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Software Architect  
**Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

---

## 1. Confirmed Technology Matrix

| Layer | Technology | Version | Justification & Responsibility |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.4.3` | Unifies server-side route handlers with fast React 19 UI; zero-leakage API security. |
| **Language** | TypeScript | `5.x` | End-to-end type safety across domain entities, Strava payloads, and database records. |
| **Styling** | Tailwind CSS | `4.x` | High-density styling, instant token customization, zero runtime CSS overhead. |
| **Icons** | Lucide React | `^1.x` | Crisp, consistent athletic symbols (Activity, Flame, Zap, Compass, CheckCircle). |
| **Database** | PostgreSQL | `16.x` | ACID-compliant relational storage, native UUIDs, JSONB flexibility, high-performance indexing. |
| **DB Driver** | `pg` (node-postgres) | `^8.13` | Lightweight, native TCP connection pooling, zero binary compilation friction. |
| **Encryption** | Node.js `crypto` | Built-in | Native AES-256-GCM authenticated cipher for token security at rest. |
| **Runtime** | Node.js | `v20.20` | LTS stability and native ES module support. |
