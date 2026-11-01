# Strava OAuth 2.0 Flow & Lifecycle Specification

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** API Integration Specialist & Security Engineer  
**Related Documents:** [STRAVA_SCOPES_AND_PERMISSIONS.md](./STRAVA_SCOPES_AND_PERMISSIONS.md)

---

## 1. Handshake Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Athlete
    participant App as Web App
    participant Server as /api/auth/strava/*
    participant Strava as Strava OAuth Server

    Athlete->>App: Clicks "Connect with Strava"
    App->>Server: GET /api/auth/strava/authorize
    Server->>Server: Generate random 16-byte hex state
    Server-->>Athlete: Set-Cookie: strava_oauth_state & 302 Redirect to Strava
    Athlete->>Strava: GET /oauth/authorize?client_id=...&scope=read,activity:read_all&state=...
    Strava-->>Athlete: Displays Strava Permissions Dialog
    Athlete->>Strava: Approves authorization
    Strava-->>Server: Callback GET /api/auth/strava/callback?code=...&state=...
    Server->>Server: Validate state matches stored cookie (CSRF Defense)
    Server->>Strava: POST /oauth/token (code, client_id, client_secret)
    Strava-->>Server: 200 OK (access_token, refresh_token, athlete data)
    Server->>Server: Encrypt tokens via AES-256-GCM
    Server->>Server: Upsert into database
    Server-->>Athlete: 302 Redirect to /?connected=true
```

## 2. Revocation & Disconnect Flow
When an athlete clicks "Disconnect Strava" in Settings:
1. Server retrieves active decrypted access token.
2. Server calls `POST https://www.strava.com/oauth/deauthorize` with `Authorization: Bearer <token>`.
3. Server updates `strava_connections.is_active = false`.
