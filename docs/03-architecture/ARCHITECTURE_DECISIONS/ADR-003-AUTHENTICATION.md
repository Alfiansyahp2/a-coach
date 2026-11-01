# ADR-003: Single-Athlete Default with Multi-Tenant Schema Isolation

**Status:** ACCEPTED  
**Date:** 2026-11-01  
**Deciders:** Product Lead, Security Lead  

## Context
The product is currently designed as a Personal Training Platform for an individual athlete, but must support future multi-tenant expansion without schema restructuring.

## Decision
Every table links to a `user_id` foreign key. In MVP, all operations bind to a deterministic default UUID (`00000000-0000-0000-0000-000000000001`), which seamlessly transitions to authenticated session IDs in multi-user releases.
