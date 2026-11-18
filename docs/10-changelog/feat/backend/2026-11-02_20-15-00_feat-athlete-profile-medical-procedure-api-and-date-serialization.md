# Changelog: Athlete Profile PUT Handler, Dedicated Medical Procedure API, and Date Serialization Hardening (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-02 20:15:00 WIB
- **Tipe**: `feat(backend)` / `fix(backend)` / `feat(api)` / `feat(health)`
- **Commit Message Rujukan**: `feat(backend): implement athlete profile PUT route, dedicated medical procedure endpoint, and harden PostgreSQL DATE serialization`
- **Branch**: `refactor`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-02_20-15-00_feat-athlete-profile-medical-procedure-api-and-date-serialization.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Saat melakukan integrasi penuh antara antarmuka formulir atlet (*modal dialog*) dan repositori data klinis, teridentifikasi tiga kendala krusial pada lapisan backend dan serialization:

1. **HTTP 405 Method Not Allowed & Respon Kosong (*Empty Body Crash*)**:
   - Komponen formulir [EditAthleteProfileModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/EditAthleteProfileModal.tsx) mengirimkan pembaruan data biometrik atlet menggunakan HTTP method `PUT` ke endpoint `/api/athlete/profile`.
   - Route handler [src/app/api/athlete/profile/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/profile/route.ts) sebelumnya hanya mengekspor fungsi `GET` dan `POST`.
   - Next.js App Router secara otomatis mengembalikan status `HTTP 405 Method Not Allowed` dengan body kosong (0 bytes). Ketika client mengeksekusi `await res.json()`, runtime JavaScript melempar error:
     `SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`.

2. **Ketiadaan Endpoint Dedicated untuk Prosedur Medis (`/api/athlete/medical-procedure`)**:
   - Modal profil memisahkan alur pembaruan biometrik dasar dengan pencatatan tindakan fisioterapi/prosedur klinis berkala.
   - Jalur endpoint `src/app/api/athlete/medical-procedure/route.ts` belum tersedia di sistem, mengakibatkan error `HTTP 404 Not Found` ketika atlet atau fisioterapis mencatat sesi rehabilitasi mandiri atau perubahan status *clearance*.

3. **Runtime TypeError pada Serialization Tipe Data `DATE` PostgreSQL**:
   - Di [src/lib/db/client.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/client.ts#L25), konfigurasi database menerapkan `types.setTypeParser(1082, (val: string) => val);` untuk mencegah pergeseran zona waktu (*timezone shift*) pada kolom tanggal.
   - Akibatnya, seluruh kolom bertipe data `DATE` dari PostgreSQL (seperti `assessment_date` dan `follow_up_date`) dikembalikan ke aplikasi dalam bentuk **`string`** murni (`"2026-11-02"`), **bukan objek JavaScript `Date`**.
   - Di [src/lib/db/healthRepo.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/healthRepo.ts), fungsi `getAthleteMedicalAssessments` memanggil `r.assessment_date.toISOString().split('T')[0]`. Karena string tidak memiliki method `.toISOString()`, server merender pesan crash:
     `Runtime TypeError: r.assessment_date.toISOString is not a function`.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Dukungan HTTP Method `PUT` pada Profile Route
**Berkas:** [src/app/api/athlete/profile/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/profile/route.ts)

Menambahkan ekspor handler `PUT` yang secara transparan meneruskan request ke handler `POST` yang sudah ada:
```typescript
export async function PUT(req: NextRequest) {
  return POST(req);
}
```
*Manfaat*: Menjamin kompatibilitas mundur (*backward compatibility*) baik untuk client RESTful yang menggunakan konvensi `PUT` (update) maupun `POST` (upsert).

---

### B. Pembuatan Route Dedicated Prosedur Medis Klinis
**Berkas Baru:** [src/app/api/athlete/medical-procedure/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/medical-procedure/route.ts)

Menerapkan endpoint `POST` mandiri yang mengorkestrasi pencatatan rekam jejak medis dan revalidasi cache Next.js:
1. **Validasi & Normalisasi Parameter**:
   - Menerima `user_id`, `assessment_date`, `healthcare_provider_type`, `provider_name`, `clinical_findings`, `clinician_restrictions`, `rehabilitation_protocol`, dan status kelonggaran latihan (`clearance_granted`).
2. **Koneksi Otoritatif ke Health Engine**:
   - Memanggil `recordMedicalProcedureAndAssessment()` yang secara atomik memperbarui tabel `athlete_medical_assessments`, mengevaluasi ulang *training readiness*, serta mencatat *health audit trail*.
3. **Penyelarasan Cache (*Cache Invalidation*)**:
   - Memanggil `revalidatePath("/")`, `revalidatePath("/health")`, dan `revalidatePath("/training")` sehingga indikator kesiapan latihan dan dashboard atlet langsung terbarukan seketika tanpa perlu reload manual.

---

### C. Hardening Serialization Tanggal PostgreSQL (`formatDateOnly`)
**Berkas:** [src/lib/db/healthRepo.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/healthRepo.ts)

Mengimpor dan mengadopsi fungsi pembantu [`formatDateOnly`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/client.ts#L27-L37) yang tangguh menangani nilai string, objek `Date`, maupun `null`:

```typescript
// src/lib/db/client.ts
export function formatDateOnly(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') return val.split('T')[0];
  return String(val);
}
```

Penerapan pada repositori:
1. **Dossier Cedera (`getAthleteInjuries`)**:
   ```typescript
   estimated_injury_date: r.estimated_injury_date ? formatDateOnly(r.estimated_injury_date) : null,
   ```
2. **Asesmen Medis (`getAthleteMedicalAssessments`)**:
   ```typescript
   assessment_date: formatDateOnly(r.assessment_date),
   follow_up_date: r.follow_up_date ? formatDateOnly(r.follow_up_date) : null,
   ```

*Manfaat*: Menghilangkan 100% risiko error `toISOString is not a function` terlepas dari apakah driver database mengembalikan string (akibat parser OID 1082) atau objek Date asli.

---

### D. Penguatan Parsing Respons Client-Side (*Safe Parsing Resilience*)
**Berkas:** [src/components/health/EditAthleteProfileModal.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/EditAthleteProfileModal.tsx)

Menggantikan pemanggilan langsung `await res.json()` dengan pola *safe text parsing*:
```typescript
const bioText = await bioRes.text();
let bioData: any = {};
try {
  bioData = bioText ? JSON.parse(bioText) : {};
} catch {
  throw new Error(`Respon server tidak valid (${bioRes.status})`);
}

if (!bioRes.ok || !bioData.success) {
  throw new Error(bioData.error || bioData.message || "Gagal memperbarui biometrik atlet.");
}
```
*Manfaat*: Jika server merespons dengan kode error non-JSON (seperti HTML error 502/504 dari gateway atau empty body 405), UI tidak lagi melempar crash `Unexpected end of JSON input`, melainkan menampilkan pesan status yang jelas dan deskriptif kepada pengguna.

---

## 3. Matriks Perubahan Berkas

| Berkas | Jenis Perubahan | Deskripsi Singkat |
|---|---|---|
| `src/app/api/athlete/profile/route.ts` | Modifikasi | Menambahkan ekspor method `PUT` yang mendelegasikan ke `POST`. |
| `src/app/api/athlete/medical-procedure/route.ts` | **Berkas Baru** | Handler `POST` untuk pencatatan prosedur klinis, re-evaluasi kesiapan, dan revalidasi path cache. |
| `src/lib/db/healthRepo.ts` | Modifikasi | Mengganti pemanggilan rapuh `.toISOString()` dengan `formatDateOnly` pada `assessment_date`, `follow_up_date`, dan `estimated_injury_date`. |
| `src/components/health/EditAthleteProfileModal.tsx` | Modifikasi | Menerapkan parsing respons aman berbasis `text()` + `try-catch JSON.parse()` untuk proteksi payload kosong. |

---

## 4. Verifikasi & Hasil Pengujian

### A. Pengujian Endpoint HTTP
- **Simpan Profil Atlet (`PUT /api/athlete/profile`)**:
  - Request: `PUT` dengan nama "Altra", BB 65 kg, TB 170 cm, RHR 68 bpm, frekuensi 3 hari/minggu.
  - Respons: `HTTP 200 OK` dengan payload `{ success: true, user: { name: 'Altra', ... }, profile: { ... } }`.
- **Pencatatan Prosedur Medis (`POST /api/athlete/medical-procedure`)**:
  - Request: `POST` dengan tipe fisioterapi, deskripsi pemeriksaan berkala, dan re-evaluasi.
  - Respons: `HTTP 200 OK` dengan payload `{ success: true, assessment: { ... }, readiness: { ... } }`.

### B. Pengujian Navigasi Halaman
- `GET http://localhost:3000/health`: Mengembalikan **`HTTP 200 OK`** (bebas dari error `r.assessment_date.toISOString is not a function`).
- `GET http://localhost:3000/`: Mengembalikan **`HTTP 200 OK`**.
- `GET http://localhost:3000/activities`: Mengembalikan **`HTTP 200 OK`**.

### C. Verifikasi Kompilasi TypeScript
```bash
npx tsc --noEmit
# Exit Code: 0 (Zero errors)
```

### D. Regression Test Suites
1. **Athlete Health & Injury-Aware Readiness Suite (`scripts/test_athlete_health_system.js`)**:
   - **32 PASSED, 0 FAILED** (Profil fisik, ambang sensorik tak terfabrikasi, 2 dossier cedera, restriksi beban lari *ON_HOLD*, sepeda *CONDITIONAL*).
2. **Coach Training & Grounded Indicator Suite (`scripts/test_coach_training_system.js`)**:
   - **5 PASSED, 0 FAILED** (Pelatihan 12-minggu, pencocokan sesi Strava realita, target Century 100km & Marathon).

