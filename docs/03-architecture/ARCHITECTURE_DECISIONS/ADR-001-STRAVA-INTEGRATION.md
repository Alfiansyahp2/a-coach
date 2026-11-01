# ADR-001: Server-Side Official Strava API v3 Integration

**Status:** ACCEPTED  
**Date:** 2026-11-01  
**Deciders:** Principal Architect, Security Lead  

## Context
Strava offers OAuth 2.0 authorization code grant. Many hobbyist apps execute token exchange in the browser, exposing `client_secret` to end users.

## Decision
Execute all token exchanges, token renewals, and activity fetches strictly on the server in Next.js Route Handlers. Encrypt all tokens using AES-256-GCM before writing to the database.

## Consequences
* **Positive:** Absolute security against Client Secret leakage; full compliance with Strava API Developer Agreement.
* **Negative:** Requires server execution environment (cannot be exported as a static SPA).
