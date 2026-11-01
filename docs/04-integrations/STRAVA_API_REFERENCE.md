# Strava API v3 Endpoint Reference

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** API Integration Specialist  
**Related Documents:** [STRAVA_INTEGRATION.md](./STRAVA_INTEGRATION.md)

---

## 1. Endpoints Used by the Platform

### 1.1 Authorization Endpoint
* **URL:** `https://www.strava.com/oauth/authorize`
* **Method:** `GET`
* **Parameters:** `client_id`, `redirect_uri`, `response_type=code`, `approval_prompt=auto`, `scope=read,activity:read_all`, `state`.

### 1.2 Token Exchange & Refresh Endpoint
* **URL:** `https://www.strava.com/oauth/token`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Body (Authorization Code):** `{ client_id, client_secret, code, grant_type: "authorization_code" }`
* **Body (Refresh Token):** `{ client_id, client_secret, refresh_token, grant_type: "refresh_token" }`

### 1.3 Athlete Activities Endpoint
* **URL:** `https://www.strava.com/api/v3/athlete/activities`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <access_token>`
* **Query Parameters:**
  * `after`: Epoch seconds timestamp. Returns activities after this date.
  * `page`: Integer page index (default: 1).
  * `per_page`: Number of activities per page (max: 200, platform default: 100).
* **Reference:** https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
