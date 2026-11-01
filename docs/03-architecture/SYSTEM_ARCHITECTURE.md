# System Architecture & Technical Specifications

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Software Architect  
**Related Documents:** [TECH_STACK.md](./TECH_STACK.md), [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md), [DATA_FLOW.md](./DATA_FLOW.md)

---

## 1. Architectural Overview & Style
The platform is architected as a modular, decoupled full-stack application built upon **Next.js 16 (App Router)** and **React 19**, powered by **TypeScript** and supported by **PostgreSQL 16**.

```mermaid
flowchart TB
    subgraph Client [Client Presentation Tier]
        Browser[Athlete Web Browser / Mobile PWA]
        UIComp[React 19 Server & Client Components]
        Tailwind[Tailwind CSS v4 Obsidian Theme]
        Browser --- UIComp
        UIComp --- Tailwind
    end

    subgraph Server [Application Server Tier - Next.js 16]
        API[API Route Handlers /api/*]
        StravaClient[Strava Service lib/strava.ts]
        MatchingEngine[Matching Service lib/matching.ts]
        AnalyticsEngine[Analytics Service lib/analytics.ts]
        AICoach[AI Coach Engine lib/ai-coach.ts]
        CryptoService[Crypto Module AES-256-GCM lib/crypto.ts]
        DataLayer[Unified Data Layer lib/db.ts]

        API --> StravaClient
        API --> MatchingEngine
        API --> AnalyticsEngine
        API --> AICoach
        API --> DataLayer
        StravaClient --> CryptoService
        StravaClient --> DataLayer
        MatchingEngine --> DataLayer
    end

    subgraph DataTier [Storage & Persistence Tier]
        PG[(PostgreSQL 16 Relational DB)]
        LocalJSON[(Atomic Fallback Store .data/store.json)]
    end

    subgraph External [External Cloud Services]
        StravaAPI[Official Strava API v3]
    end

    Browser -->|HTTPS JSON Requests| API
    StravaClient -->|OAuth 2.0 & REST Fetch| StravaAPI
    DataLayer -->|Pooled TCP pg pool| PG
    DataLayer -.->|Fallback IO| LocalJSON
```

## 2. Component Responsibilities
* **Frontend Tier:** Renders dense athletic telemetry, manages local user interaction state, executes drag-and-drop calendar operations, and displays responsive SVG charts.
* **Serverless Route Handlers:** Acts as an authenticated API gateway, validating inputs, handling OAuth redirection and callbacks, enforcing token encryption, and running activity synchronization.
* **Crypto Service:** Encrypts and decrypts OAuth tokens using AES-256-GCM with unique 16-byte IVs.
* **Unified Data Layer:** Abstract repository decoupling PostgreSQL operations from local file storage fallback.
