# ADR-004: Incremental Ingestion via Timestamp Filtering

**Status:** ACCEPTED  
**Date:** 2026-11-01  
**Deciders:** Principal Architect, Backend Lead  

## Context
Strava rate limits applications to 100 requests per 15 minutes. Re-fetching historical activities exhausts rate limits rapidly.

## Decision
Query the maximum `start_date` stored locally and pass it as `?after={timestamp}` to Strava's `/athlete/activities` endpoint, downloading only net-new or modified records.
