# A-COACH — REPOSITORY-AWARE BACKEND LOGIC & API FLOW AUDIT
## Document 09: Security, Cryptographic Architecture & Authorization Posture

> **Audit Date**: 2026-11-07  
> **Core Cryptographic Module**: [`src/lib/crypto.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts)  
> **API Security Scope**: 16 Route Handlers in `src/app/api/`  
> **Threat Modeling Framework**: OWASP Top 10 API Security Risks (2023)

---

### 1. Cryptographic Implementation Analysis

The platform implements symmetric token encryption in [`src/lib/crypto.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts) intended for OAuth refresh and access tokens:

```typescript
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || 'e4f9b8c3d2e1a0f9e8d7c6b5a4938271e0d9c8b7a69584736251403928172635';
  return crypto.scryptSync(secret, 'strava-athlete-salt', 32);
}
```

#### Cryptographic Strengths:
1. **Authenticated Encryption (AEAD)**: Uses `aes-256-gcm` which prevents ciphertext tampering via a 16-byte authentication tag (`tag.toString('hex')`).
2. **Fresh Initialization Vectors**: Every encryption call invokes `crypto.randomBytes(16)` to generate a cryptographically strong unique IV.
3. **Decryption Tag Verification**: [`decryptToken`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts#L45) calls `decipher.setAuthTag(tag)`. If ciphertext or IV is modified, OpenSSL throws an authentication tag mismatch error, preventing bit-flipping attacks.

---

### 2. Critical Security Vulnerabilities

#### Vulnerability 1: Hardcoded Fallback Secret in Source Code (P0)
- **File**: [`src/lib/crypto.ts#L8`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts#L8)
- **Code**:
  ```typescript
  const secret = process.env.ENCRYPTION_SECRET || 'e4f9b8c3d2e1a0f9e8d7c6b5a4938271e0d9c8b7a69584736251403928172635';
  return crypto.scryptSync(secret, 'strava-athlete-salt', 32);
  ```
- **Vulnerability**: A 64-character static hex string is committed directly to the Git repository. If an operator deploys the platform without explicitly setting `ENCRYPTION_SECRET` in production, all OAuth tokens are encrypted using a publicly accessible key.
- **Static Salt**: The key derivation function uses a static salt `'strava-athlete-salt'` rather than a unique per-user or dynamic cryptographic salt.
- **Remediation**:
  ```typescript
  function getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret || secret.trim().length < 32) {
      throw new Error('[FATAL SECURITY EXCEPTION] ENCRYPTION_SECRET is not configured or too short. Aborting.');
    }
    return crypto.scryptSync(secret, process.env.ENCRYPTION_SALT || 'salt-minimum-32-bytes', 32);
  }
  ```

---

#### Vulnerability 2: Unauthenticated APIs & Broken Object Level Authorization (BOLA) (P1)
- **Scope**: All 16 Next.js Route Handlers (`src/app/api/*`).
- **Audit Finding**:
  - The application lacks an authentication middleware (`middleware.ts`) or session token validator.
  - Every API route accepts `userId` from query parameters (`?userId=...`) or JSON body (`body.user_id`), falling back to `DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'`.
  - **No Session Verification**: Anyone with network access can send a `POST /api/athlete/injuries` or `POST /api/athlete/checkin` and overwrite clinical data, modify goals, or view telemetry for any user ID without credentials.
- **OWASP Classification**: *API1:2023 Broken Object Level Authorization (BOLA)* and *API2:2023 Broken Authentication*.
- **Remediation**: Integrate a session-based or JWT authentication guard (e.g. NextAuth/Auth.js or Iron Session) validating the session user ID before executing repository operations.

---

### 3. SQL Injection & Parameter Sanitization Audit

A systematic scan of all database queries across [`src/lib/db/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/) was performed:

| Repository File | Query Method | Parameter Sanitization | Result |
|---|---|---|---|
| `activityRepo.ts` | `pgPool.query(sql, [params])` | Parameterized ($1, $2, $3...) | **SAFE** |
| `healthRepo.ts` | `pgPool.query(sql, [params])` | Parameterized ($1, $2, $3...) | **SAFE** |
| `trainingRepo.ts` | `pgPool.query(sql, [params])` | Parameterized ($1, $2, $3...) | **SAFE** |
| `goalRepo.ts` | `pgPool.query(sql, [params])` | Parameterized ($1, $2, $3...) | **SAFE** |
| `userRepo.ts` | `pgPool.query(sql, [params])` | Parameterized ($1, $2, $3...) | **SAFE** |

**Conclusion**: The repository adheres strictly to parameterized SQL queries via `pgPool.query()`. No string interpolation or concatenation of raw user input into SQL statements was detected.

---

### 4. CSRF & State Verification in OAuth Flow

In [`src/app/api/auth/strava/authorize/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/authorize/route.ts):
- A cryptographically random 16-byte state is generated: `crypto.randomBytes(16).toString('hex')`.
- State is set in an `httpOnly`, `sameSite: 'lax'` cookie with a 10-minute expiry (`maxAge: 600`).
- The callback route ([`src/app/api/auth/strava/callback/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/callback/route.ts)) verifies that the incoming `state` parameter matches the cookie, preventing CSRF authorization injection attacks.
- Note: Although currently dormant due to unconfigured Strava keys, the OAuth handshake security pattern is architecturally sound.

