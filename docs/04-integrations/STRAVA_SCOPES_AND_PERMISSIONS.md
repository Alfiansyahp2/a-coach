# Strava Scopes & Permissions Governance

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** API Integration Specialist  
**Related Documents:** [STRAVA_OAUTH_FLOW.md](./STRAVA_OAUTH_FLOW.md)

---

## 1. Requested Scopes Matrix

| Scope | Required? | Justification | Impact if Rejected by User |
| :--- | :--- | :--- | :--- |
| `read` | **Yes** | Ingest basic athlete profile (name, username, avatar) to establish account linkage. | OAuth handshake fails; account cannot be personalized. |
| `activity:read_all` | **Yes** | Ingest public and private activities, including runs starting inside privacy zones. | Workouts marked private on Strava cannot be compared or analyzed. |
| `activity:write` | **No (Excluded)**| Write operations are out of scope for MVP. Minimizes permission footprint. | N/A (enhances user trust). |

## 2. Principle of Least Privilege
The platform asks only for read access. Athletes are reassured during authorization that the application cannot delete, modify, or post activities to their public Strava profile.
