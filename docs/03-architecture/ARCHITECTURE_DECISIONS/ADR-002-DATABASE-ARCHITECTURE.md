# ADR-002: Normalized PostgreSQL with High-Speed Local File Fallback

**Status:** ACCEPTED  
**Date:** 2026-11-01  
**Deciders:** Database Architect, Backend Lead  

## Context
The platform requires a scalable relational schema with foreign key integrity. However, local developer onboarding and CI environments may lack an active PostgreSQL instance.

## Decision
Design a fully normalized PostgreSQL schema (`schema.sql`) accessed via `pg` pool, and wrap access in a unified repository (`lib/db.ts`) that automatically falls back to an atomic local file store (`.data/store.json`) when `DATABASE_URL` is not supplied.

## Consequences
* **Positive:** Zero friction for trial runs and UI development; seamless switch to production PostgreSQL.
* **Negative:** Need to maintain dual query logic within `lib/db.ts` during early phases.
