# PERSONAL SPORTS TRAINING & PERFORMANCE PLATFORM

## MASTER PRODUCT, DESIGN & ENGINEERING DOCUMENTATION ECOSYSTEM

---

**Status:** CONFIRMED & AUDITED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Integration:** Official Strava API v3  
**Architecture:** Next.js 16 (App Router) • React 19 • TypeScript • Tailwind CSS v4 • PostgreSQL 16 • AES-256-GCM  

---

## 🏛️ OVERVIEW & PURPOSE

This documentation ecosystem serves as the authoritative source of truth for the **Personal Sports Training & Performance Platform**. It governs all product discovery, engineering architecture, design systems, athletic domain logic, application security, and AI development rules.

Every important technical statement in this knowledge base is categorized by verification status:

* `CONFIRMED`: Verified from actual repository implementation or authoritative Strava API documentation.
* `PROPOSED`: Architecturally planned and verified design for upcoming development phases.
* `TBD`: Requires a future product or business decision.

---

## 📂 DOCUMENTATION DIRECTORY MAP

### [00. Foundation](./00-foundation/)

Establishes the philosophical, strategic, and linguistic foundation of the platform.

* [**PROJECT_VISION.md**](./00-foundation/PROJECT_VISION.md) — North star vision, core problem definition, and long-term direction.
* [**PRODUCT_PRINCIPLES.md**](./00-foundation/PRODUCT_PRINCIPLES.md) — The 8 non-negotiable product tenets.
* [**PRODUCT_SCOPE.md**](./00-foundation/PRODUCT_SCOPE.md) — Rigorous MVP vs Post-MVP boundary definitions.
* [**PRODUCT_POSITIONING.md**](./00-foundation/PRODUCT_POSITIONING.md) — Competitive differentiation vs Strava, TrainingPeaks, and Garmin.
* [**GLOSSARY.md**](./00-foundation/GLOSSARY.md) — Exhaustive athletic and technical vocabulary.
* [**ROADMAP.md**](./00-foundation/ROADMAP.md) — 6-phase engineering milestones, dependencies, and exit criteria.

---

### [01. Product Requirements](./01-product/)

Comprehensive product specifications, user personas, and functional requirements.

* [**PRD.md**](./01-product/PRD.md) — Master Product Requirements Document.
* [**USER_PERSONAS.md**](./01-product/USER_PERSONAS.md) — Detailed personas (Competitive Marathoner, Triathlete, Habitual Runner).
* [**USER_JOURNEYS.md**](./01-product/USER_JOURNEYS.md) — End-to-end user journey sequence diagrams.
* [**USER_STORIES.md**](./01-product/USER_STORIES.md) — User stories with measurable acceptance criteria.
* [**FEATURE_SPECIFICATIONS.md**](./01-product/FEATURE_SPECIFICATIONS.md) — In-depth breakdown of major system capabilities.
* [**FUNCTIONAL_REQUIREMENTS.md**](./01-product/FUNCTIONAL_REQUIREMENTS.md) — Traceable functional specifications (FR-001 to FR-008).
* [**NON_FUNCTIONAL_REQUIREMENTS.md**](./01-product/NON_FUNCTIONAL_REQUIREMENTS.md) — SLAs for security, latency, and reliability.
* [**ACCEPTANCE_CRITERIA.md**](./01-product/ACCEPTANCE_CRITERIA.md) — Testable Given/When/Then scenarios.
* [**MVP_DEFINITION.md**](./01-product/MVP_DEFINITION.md) — Essential capabilities vs deferred enhancements.
* [**SUCCESS_METRICS.md**](./01-product/SUCCESS_METRICS.md) — Quantitative KPIs and reliability targets.

---

### [02. Design Governance — Anti-AI-Slop System](./02-design/)

Uncompromising visual art direction designed to prevent generic, repetitive SaaS dashboard aesthetics.

* [**ANTI_AI_SLOP.md**](./02-design/ANTI_AI_SLOP.md) — High-priority visual quality policy banning generic AI templates.
* [**DESIGN_PHILOSOPHY.md**](./02-design/DESIGN_PHILOSOPHY.md) — The "Quiet Craftsman Coach" design personality.
* [**VISUAL_DIRECTION.md**](./02-design/VISUAL_DIRECTION.md) — Comparative analysis of aesthetic directions (Obsidian Telemetry selected).
* [**DESIGN_SYSTEM.md**](./02-design/DESIGN_SYSTEM.md) — Token architecture (surfaces, borders, radii, shadows).
* [**COLOR_SYSTEM.md**](./02-design/COLOR_SYSTEM.md) — Semantic color tokens and sport-specific palettes.
* [**TYPOGRAPHY.md**](./02-design/TYPOGRAPHY.md) — Strict rules for tabular numerals (\`font-tabular\`) on all telemetry.
* [**SPACING_AND_LAYOUT.md**](./02-design/SPACING_AND_LAYOUT.md) — 4px/8px grid system and high-density layouts.
* [**COMPONENT_GUIDELINES.md**](./02-design/COMPONENT_GUIDELINES.md) — Anatomy and states for MetricCards, CalendarDays, and ComparisonCards.
* [**INTERACTION_AND_MOTION.md**](./02-design/INTERACTION_AND_MOTION.md) — Snappy 150ms transition rules; banned decorative motions.
* [**DATA_VISUALIZATION.md**](./02-design/DATA_VISUALIZATION.md) — Standards for volume charts, pace trends, and non-misleading axes.
* [**RESPONSIVE_DESIGN.md**](./02-design/RESPONSIVE_DESIGN.md) — Breakpoints from 375px mobile to 1440px desktop.
* [**ACCESSIBILITY.md**](./02-design/ACCESSIBILITY.md) — WCAG 2.1 AA compliance and screen reader guidelines.
* [**DESIGN_REVIEW_CHECKLIST.md**](./02-design/DESIGN_REVIEW_CHECKLIST.md) — Mandatory visual review gate before feature merge.
* [**CALENDAR_UI_DESIGN_VARIANTS_SPECIFICATION.md**](./02-design/CALENDAR_UI_DESIGN_VARIANTS_SPECIFICATION.md) — Master specification for 5+ interchangeable athletic calendar models (Month Grid, Week Agenda, Kinetic Bubble, Field Journal, Gantt PMC).

---

### [03. Software Architecture](./03-architecture/)

System design, C4 models, data lifecycles, and architecture decision records.

* [**SYSTEM_ARCHITECTURE.md**](./03-architecture/SYSTEM_ARCHITECTURE.md) — C4 Level 1 Context and Level 2 Container diagrams.
* [**TECH_STACK.md**](./03-architecture/TECH_STACK.md) — Technology matrix, library versions, and justifications.
* [**PROJECT_STRUCTURE.md**](./03-architecture/PROJECT_STRUCTURE.md) — Repository tree and directory conventions.
* [**DATABASE_SCHEMA.md**](./03-architecture/DATABASE_SCHEMA.md) — PostgreSQL relational specifications and DDL breakdown.
* [**DATA_FLOW.md**](./03-architecture/DATA_FLOW.md) — End-to-end data lifecycle from wearable to UI.
* [**API_DESIGN.md**](./03-architecture/API_DESIGN.md) — Internal REST API route handler contracts.
* [**AUTHENTICATION.md**](./03-architecture/AUTHENTICATION.md) — App authentication vs Strava authorization boundaries.
* [**BACKGROUND_JOBS.md**](./03-architecture/BACKGROUND_JOBS.md) — Asynchronous synchronization and scheduled polling.
* **Architecture Decisions (ADR):**
  * [**ADR-001**](./03-architecture/ARCHITECTURE_DECISIONS/ADR-001-STRAVA-INTEGRATION.md) — Server-Side Strava API Execution.
  * [**ADR-002**](./03-architecture/ARCHITECTURE_DECISIONS/ADR-002-DATABASE-ARCHITECTURE.md) — Normalized PostgreSQL with Local File Fallback.
  * [**ADR-003**](./03-architecture/ARCHITECTURE_DECISIONS/ADR-003-AUTHENTICATION.md) — Single-Athlete Default with Multi-Tenant Isolation.
  * [**ADR-004**](./03-architecture/ARCHITECTURE_DECISIONS/ADR-004-DATA-SYNCHRONIZATION.md) — Incremental Ingestion via Timestamp Filtering.
  * [**ADR-005**](./03-architecture/ARCHITECTURE_DECISIONS/ADR-005-AI-COACH-ARCHITECTURE.md) — Grounded Deterministic AI Insights.

---

### [04. Strava API v3 Integrations](./04-integrations/)

Detailed specifications for integrating with the official Strava API v3.

* [**STRAVA_INTEGRATION.md**](./04-integrations/STRAVA_INTEGRATION.md) — Integration objectives and capabilities.
* [**STRAVA_OAUTH_FLOW.md**](./04-integrations/STRAVA_OAUTH_FLOW.md) — Sequence diagrams for authorization code exchange and revocation.
* [**STRAVA_API_REFERENCE.md**](./04-integrations/STRAVA_API_REFERENCE.md) — Verified endpoint signatures, query parameters, and responses.
* [**STRAVA_SCOPES_AND_PERMISSIONS.md**](./04-integrations/STRAVA_SCOPES_AND_PERMISSIONS.md) — Detailed review of \`read\` and \`activity:read_all\`.
* [**ACTIVITY_SYNCHRONIZATION.md**](./04-integrations/ACTIVITY_SYNCHRONIZATION.md) — Incremental fetching, deduplication, and auto-matching.
* [**WEBHOOK_HANDLING.md**](./04-integrations/WEBHOOK_HANDLING.md) — Subscription handshakes and push notification architecture.
* [**RATE_LIMITING.md**](./04-integrations/RATE_LIMITING.md) — Throttling rules, telemetry headers, and 429 backoff.
* [**ERROR_HANDLING.md**](./04-integrations/ERROR_HANDLING.md) — Comprehensive external API failure recovery protocols.
* [**EXTERNAL_SERVICES.md**](./04-integrations/EXTERNAL_SERVICES.md) — External cloud dependency registry.

---

### [05. Sports Domain Logic & Algorithms](./05-domain-logic/)

Endurance sports science, athletic metric mathematics, and AI grounding boundaries.

* [**TRAINING_METHODOLOGY.md**](./05-domain-logic/TRAINING_METHODOLOGY.md) — Polarized 80/20 training and progressive overload science.
* [**WORKOUT_CLASSIFICATION.md**](./05-domain-logic/WORKOUT_CLASSIFICATION.md) — Taxonomy for all 11 workout classifications.
* [**TRAINING_PLAN_LOGIC.md**](./05-domain-logic/TRAINING_PLAN_LOGIC.md) — Weekly scheduling heuristics and status state transitions.
* [**METRIC_DEFINITIONS.md**](./05-domain-logic/METRIC_DEFINITIONS.md) — Exact mathematical formulas for pace, variances, and volume deltas.
* [**PERFORMANCE_METRICS.md**](./05-domain-logic/PERFORMANCE_METRICS.md) — Aerobic pace efficiency adaptations across 30, 90, and 180 days.
* [**TRAINING_LOAD.md**](./05-domain-logic/TRAINING_LOAD.md) — Acute:Chronic Workload Ratio (ACWR) and injury risk zones.
* [**RECOVERY_LOGIC.md**](./05-domain-logic/RECOVERY_LOGIC.md) — What can and cannot be inferred from activity telemetry.
* [**GOAL_CALCULATION.md**](./05-domain-logic/GOAL_CALCULATION.md) — Monthly mileage and weekly frequency completion algorithms.
* [**PERSONAL_RECORDS.md**](./05-domain-logic/PERSONAL_RECORDS.md) — Distance benchmark validation (1K, 5K, 10K, Half, Full).
* [**AI_DECISION_BOUNDARIES.md**](./05-domain-logic/AI_DECISION_BOUNDARIES.md) — Strict manifesto banning biometric hallucination and ungrounded advice.

---

### [06. Application Security & Privacy](./06-security/)

Security architecture, cryptographic protocols, and tenant isolation.

* [**SECURITY_POLICY.md**](./06-security/SECURITY_POLICY.md) — Application security standards and defenses.
* [**DATA_PRIVACY.md**](./06-security/DATA_PRIVACY.md) — Athlete data ownership and Strava privacy compliance.
* [**TOKEN_MANAGEMENT.md**](./06-security/TOKEN_MANAGEMENT.md) — AES-256-GCM authenticated cipher implementation.
* [**AUTHORIZATION_RULES.md**](./06-security/AUTHORIZATION_RULES.md) — Tenant data isolation and anti-IDOR mandates.
* [**THREAT_MODEL.md**](./06-security/THREAT_MODEL.md) — STRIDE threat modeling and mitigation matrix.
* [**DATA_RETENTION.md**](./06-security/DATA_RETENTION.md) — Retention and cascading purge protocols.
* [**SECURITY_CHECKLIST.md**](./06-security/SECURITY_CHECKLIST.md) — Mandatory security audit checklist.

---

### [07. Quality & Engineering Standards](./07-quality/)

Engineering excellence, code standards, test strategies, and performance budgets.

* [**CODE_STANDARDS.md**](./07-quality/CODE_STANDARDS.md) — Strict TypeScript and file naming conventions.
* [**CLEAN_CODE.md**](./07-quality/CLEAN_CODE.md) — Separation of concerns between UI, API, and Domain logic.
* [**TESTING_STRATEGY.md**](./07-quality/TESTING_STRATEGY.md) — Unit, integration, and end-to-end testing matrix.
* [**PERFORMANCE_BUDGET.md**](./07-quality/PERFORMANCE_BUDGET.md) — Quantitative latency SLAs and bundle size limits.
* [**ERROR_HANDLING.md**](./07-quality/ERROR_HANDLING.md) — Consistent JSON error responses and React error boundaries.
* [**API_COST_CONTROL.md**](./07-quality/API_COST_CONTROL.md) — Request deduplication and quota preservation.
* [**OBSERVABILITY.md**](./07-quality/OBSERVABILITY.md) — Structured logging and audit telemetry.
* [**DEFINITION_OF_DONE.md**](./07-quality/DEFINITION_OF_DONE.md) — The 6-point quality gate for feature acceptance.

---

### [08. Development & AI Agent Governance](./08-development/)

Development workflows, environment setup, and rules governing AI coding assistants.

* [**DEVELOPMENT_WORKFLOW.md**](./08-development/DEVELOPMENT_WORKFLOW.md) — Feature planning to release cycle.
* [**IMPLEMENTATION_PLAN.md**](./08-development/IMPLEMENTATION_PLAN.md) — Phased task breakdown and milestones.
* [**CODING_AGENT_RULES.md**](./08-development/CODING_AGENT_RULES.md) — **15 Mandatory Rules for AI Coding Agents** to prevent drift, duplicate code, or hallucinated integrations.
* [**GIT_CONVENTIONS.md**](./08-development/GIT_CONVENTIONS.md) — Conventional commit standards.
* [**branch.md**](./branch.md) — Git branching strategy, lifecycle management, and release gates.
* [**ENVIRONMENT_SETUP.md**](./08-development/ENVIRONMENT_SETUP.md) — Step-by-step local configuration guide.
* [**DEPLOYMENT.md**](./08-development/DEPLOYMENT.md) — Production hosting options and deployment secrets.
* [**CHANGE_MANAGEMENT.md**](./08-development/CHANGE_MANAGEMENT.md) — Requirements and ADR review processes.

---

### [09. Audits & Ledgers](./09-audit/)

Reusable audit frameworks and technical debt tracking.

* [**ARCHITECTURE_AUDIT.md**](./09-audit/ARCHITECTURE_AUDIT.md) — Module boundary and coupling review.
* [**SECURITY_AUDIT.md**](./09-audit/SECURITY_AUDIT.md) — Token vulnerability and injection audits.
* [**PERFORMANCE_AUDIT.md**](./09-audit/PERFORMANCE_AUDIT.md) — Build times, compilation, and bundle footprint audit.
* [**API_USAGE_AUDIT.md**](./09-audit/API_USAGE_AUDIT.md) — Strava quota consumption assessment.
* [**TECHNICAL_DEBT.md**](./09-audit/TECHNICAL_DEBT.md) — Structured technical debt ledger.
* [**DOCUMENTATION_AUDIT.md**](./09-audit/DOCUMENTATION_AUDIT.md) — Complete documentation coverage verification.
* [**AUDIT_LOG.md**](./09-audit/AUDIT_LOG.md) — Chronological history of completed audits.

---

### [10. Changelog & Release Notes](./10-changelog/)

Historical audit of system iterations, code evolution, and architectural changes.

* [**README.md**](./10-changelog/README.md) — Master engineering changelog index and 74-record ecosystem catalog.
* [**CHANGELOG.md**](./10-changelog/CHANGELOG.md) — Master foundation v1.0.0 changelog register and release notes.

---

## 🚀 GETTING STARTED

1. Read [00-foundation/PROJECT_VISION.md](./00-foundation/PROJECT_VISION.md) to understand the core mission.
2. Read [02-design/ANTI_AI_SLOP.md](./02-design/ANTI_AI_SLOP.md) before building or styling any UI component.
3. Read [08-development/CODING_AGENT_RULES.md](./08-development/CODING_AGENT_RULES.md) if you are an AI coding assistant.
4. Set up your local environment using [08-development/ENVIRONMENT_SETUP.md](./08-development/ENVIRONMENT_SETUP.md).
