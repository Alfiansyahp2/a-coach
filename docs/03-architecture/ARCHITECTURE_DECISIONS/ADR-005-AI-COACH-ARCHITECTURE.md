# ADR-005: Grounded Deterministic AI Insights with Zero Biometric Hallucination

**Status:** ACCEPTED  
**Date:** 2026-11-01  
**Deciders:** Product Architect, QA Lead  

## Context
Many AI fitness apps hallucinate physiological scores (e.g. guessing VO2 max or recovery without sensors), destroying athlete trust.

## Decision
The AI Coach module generates insights using deterministic sports science algorithms (ACWR ratio, 10% volume overload rule, empirical pace progression). Insights cite the exact supporting data points.
