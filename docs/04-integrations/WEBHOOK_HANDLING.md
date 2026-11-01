# Strava Webhook Events Architecture (Phase 2)

**Status:** PROPOSED (Scheduled for Phase 2)  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Senior Backend Engineer  
**Related Documents:** [ACTIVITY_SYNCHRONIZATION.md](./ACTIVITY_SYNCHRONIZATION.md)

---

## 1. Webhook Handshake Protocol
Strava requires endpoint verification before dispatching push notifications:
* **Validation Request:** Strava sends a `GET` request with `hub.challenge` and `hub.verify_token`.
* **Validation Response:** Server validates token against `STRAVA_WEBHOOK_VERIFY_TOKEN` and echoes `{ "hub.challenge": challenge }` with HTTP 200 within 2 seconds.

## 2. Event Ingestion Pipeline
When an athlete logs an activity:
1. Strava sends `POST /api/webhooks/strava` with payload:
   ```json
   {
     "object_type": "activity",
     "object_id": 123456789,
     "aspect_type": "create",
     "owner_id": 998877,
     "event_time": 1730480000
   }
   ```
2. Server immediately responds `200 OK` to prevent webhook timeout.
3. Server dispatches an asynchronous task to fetch the activity by ID, upsert it, and run auto-matching.
