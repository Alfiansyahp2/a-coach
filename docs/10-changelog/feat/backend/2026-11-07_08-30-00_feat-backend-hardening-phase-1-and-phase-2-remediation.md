# Changelog: Backend Hardening, Security Hardening & Phase 1 & 2 Remediation (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-07 08:35:00 WIB
- **Tipe**: `feat(backend)` / `fix(security)` / `feat(domain)` / `refactor(db)`
- **Commit Message Rujukan**: `feat(backend): implement phase 1 and phase 2 remediation — crypto validation, silent fallback removal, streak deduplication, anatomy truthfulness, and strava id decoupling`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-07_08-30-00_feat-backend-hardening-phase-1-and-phase-2-remediation.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan hasil audit komprehensif 15 berkas spesifikasi teknis pada [`docs/backend-audit/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/backend-audit/), arsitektur backend platform *a-coach* memiliki sejumlah kerentanan kritis (**P0**) dan diskrepansi logika domain (**P1**) yang harus segera dimitigasi:

1. **Kerentanan Kriptografi Kunci Statis (`F-P0-01`)**:
   - Modul enkripsi token [`src/lib/crypto.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts) memiliki kunci fallback statis 32-karakter hardcoded di dalam kode sumber. Jika environment variable `ENCRYPTION_SECRET` tidak dikonfigurasi, enkripsi AES-256-GCM tetap berjalan dengan kunci yang terekspos di repositori publik.
2. **Bahaya Desinkronisasi Dual-Storage (*Split-Brain*) (`F-P0-02`)**:
   - Fungsi pembacaan data di [`activityRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activityRepo.ts) dan [`trainingRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/trainingRepo.ts) membungkus query PostgreSQL dalam blok `try...catch` senyap (*silent fallback*). Gangguan koneksi sementara mengalihkan sistem ke berkas lokal `.data/store.json` yang kosong, berakibat hilangnya seluruh tampilan riwayat atlet secara tiba-tiba tanpa indikasi kesalahan.
3. **Respon Fiktif pada Penanganan Galat API Streak (`F-P0-03`)**:
   - Endpoint [`/api/athlete/streak`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/streak/route.ts) mengembalikan payload rekaan (`current_streak_weeks: 10`, `current_flame_stage: 2`) saat terjadi kegagalan basis data, melanggar kebijakan integritas data jujur (*zero-hallucination*).
4. **Perhitungan Ganda Kontribusi Streak Mingguan (`F-P1-01`)**:
   - Fungsi `calculateWeeklyStreak` di [`streakEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakEngine.ts) menghitung aktivitas riil dan jadwal latihan terencana yang berstatus `COMPLETED` secara terpisah, sehingga 1 sesi latihan yang telah dicocokkan dihitung sebagai 2 kontribusi dalam satu minggu.
5. **Fabrikasi Regio Anatomi pada Check-In Pasca Latihan (`F-P1-02`)**:
   - Handler check-in [`/api/athlete/checkin`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/checkin/route.ts) memaksakan string `'Right Knee'` secara sepihak saat atlet mengirimkan form tanpa keluhan nyeri spesifik, menciptakan data klinis patologi lutut palsu di database.
6. **Keterikatan Kolom Vendor Strava pada Mode Manual-First (`F-P1-03`)**:
   - Skema basis data mewajibkan `strava_activity_id BIGINT UNIQUE NOT NULL`. Lapisan repositori terpaksa membangkitkan ID acak sintetis (`Date.now() * 1000 + rand`) pada setiap pencatatan sesi manual atlet.
7. **Regenerasi Jadwal Latihan yang Bersifat Destruktif (`F-P1-04`)**:
   - Saat atlet mengubah sasaran latihan utama, fungsi `generateCoachTrainingFromDatabase` memanggil `deleteScheduledWorkoutsByUserId` yang menghapus bersih seluruh jadwal latihan termasuk sesi berstatus `COMPLETED` beserta catatan korelasinya.
8. **Penanggalan Kalender Statis & Fabrikasi Angka Rekor Dasar (`F-P1-05`)**:
   - Tanggal mulai dan akhir rencana latihan dikunci mati pada rentang `'2026-11-02'` hingga `'2027-01-24'`. Atlet baru tanpa riwayat aktivitas otomatis diberikan rekor fiktif `56.1 km` (sepeda) dan `12.3 km` (lari).

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff (Terstruktur Per Fase)

### A. Fase 1 (Prioritas P0: Keamanan Kriptografi & Integritas Penyimpanan)

#### 1. Penegakan Validasi Kunci Kriptografi Mandatori (`src/lib/crypto.ts`)
- **Penghapusan Fallback Statis**: Menghapus baris fallback konstanta `DEFAULT_KEY = 'strava-telemetry-engine-secret-key-32b'`.
- **Validasi Lingkungan Wajib**:
  ```typescript
  function getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret || secret.trim().length < 32) {
      throw new Error(
        'CRITICAL SECURITY ERROR: ENCRYPTION_SECRET environment variable is missing or less than 32 characters. ' +
        'Set a secure, unguessable 32+ character key in environment variables.'
      );
    }
    return crypto.scryptSync(secret, 'salt-strava-telemetry', 32);
  }
  ```

#### 2. Penghapusan Silent Storage Fallback (`src/lib/db/activityRepo.ts`, `src/lib/db/trainingRepo.ts`)
- Menghapus blok `try...catch` yang membungkam kegagalan koneksi PostgreSQL pada fungsi `getActivities()` dan `getScheduledWorkouts()`.
- Jika PostgreSQL dikonfigurasi namun koneksi terputus, galat dilempar secara eksplisit ke pemanggil (*fail-fast*) demi mencegah kondisi *split-brain* dengan berkas lokal `.data/store.json`.

#### 3. Penegakan Status HTTP Terstruktur pada API Streak (`src/app/api/athlete/streak/route.ts`)
- Menghapus pembuatan payload palsu (`current_streak_weeks: 10`) pada penanganan galat.
- Endpoint kini merespons dengan HTTP 500 dan payload error yang transparan saat terjadi anomali query:
  ```typescript
  return NextResponse.json(
    { success: false, error: 'Failed to calculate athlete streak from authoritative store' },
    { status: 500 }
  );
  ```

---

### B. Fase 2 (Prioritas P1: Matematika Domain, Anatomi & Dekopling Skema)

#### 1. Deduplikasi Kontribusi Streak Mingguan (`src/lib/domain/streak/streakEngine.ts`)
- Mengompilasi `loggedDateSet` berisikan seluruh kunci tanggal lokal (`formatLocalDateKey`) dari aktivitas riil atlet.
- Sebelum memasukkan sesi jadwal terencana (`w.status === 'COMPLETED'`), sistem memeriksa apakah tanggal latihan tersebut sudah memiliki entri aktivitas riil yang tercatat:
  ```typescript
  const wDateStr = formatLocalDateKey(wDate);
  if (!loggedDateSet.has(wDateStr)) {
    allTimestamps.push(wDate.getTime());
    loggedDateSet.add(wDateStr);
  }
  ```
- **Dampak**: Mencegah penggelembungan rentetan api mingguan atlet secara artifisial akibat sesi berpasangan.

#### 2. Penjaminan Kebenaran Anatomi Check-In Pasca Latihan (`src/app/api/athlete/checkin/route.ts`)
- Menghapus fallback biner ke `'Right Knee'`.
- Menggunakan nilai aman dan netral `'General / Unspecified Region'` saat input dikosongkan oleh formulir tanpa mengasumsikan patologi sendi tertentu.

#### 3. Dekopling Skema `strava_activity_id` & Integrasi Kolom `is_manual`
- **Migrasi Database PostgreSQL 16**:
  - Berkas: [`scripts/migrations/004_decouple_strava_id_manual_activity.sql`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/migrations/004_decouple_strava_id_manual_activity.sql)
  - Runner: [`scripts/migrations/run_migration_004.cjs`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/migrations/run_migration_004.cjs)
  - SQL DDL:
    ```sql
    ALTER TABLE activities ALTER COLUMN strava_activity_id DROP NOT NULL;
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT TRUE NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_activities_is_manual ON activities(user_id, is_manual);
    ```
- **Pembaruan Tipe TypeScript (`src/types/index.ts`)**:
  - Kolom `strava_activity_id` pada antarmuka `Activity` diubah menjadi `number | null | undefined`.
  - Menambahkan properti `is_manual?: boolean;`.
- **Pembaruan Repositori Aktivitas (`src/lib/db/activityRepo.ts`)**:
  - Fungsi `upsertActivity` kini memetakan kolom `is_manual` ke dalam query PostgreSQL dan menangani nilai `strava_activity_id: null` secara aman tanpa memicu benturan constraint unik.
  - Fungsi `createManualActivity` tidak lagi membangkitkan `syntheticStravaId`; aktivitas manual murni dikirim dengan `strava_activity_id: null` dan `is_manual: true`.

#### 4. Regenerasi Rencana Latihan Non-Destruktif (`src/lib/db/trainingRepo.ts`, `src/lib/domain/coach/coachTrainingGenerator.ts`)
- **Dukungan Opsi Preservasi Selesai**:
  ```typescript
  export async function deleteScheduledWorkoutsByUserId(
    userId: string = DEFAULT_USER_ID,
    options?: { preserveCompleted?: boolean }
  ): Promise<void> {
    if (pgPool) {
      if (options?.preserveCompleted) {
        await pgPool.query("DELETE FROM scheduled_workouts WHERE user_id = $1 AND status != 'COMPLETED'", [userId]);
      } else {
        await pgPool.query('DELETE FROM scheduled_workouts WHERE user_id = $1', [userId]);
      }
      return;
    }
    // ... implementasi mirror store lokal
  }
  ```
- **Penautan Ulang Sesi Selesai Eksisting**:
  - Saat rencana baru dibuat, jadwal berstatus `'COMPLETED'` tidak dihapus melainkan diperbarui foreign key-nya ke `plan.id` yang baru.
  - Sesi historis benchmark hanya disuntikkan jika database belum memiliki riwayat sesi selesai sebelumnya.

#### 5. Penanggalan Periodisasi Dinamis & Eliminasi Metrik Rekaan
- **Resolusi Hari Selasa Fleksibel (`src/lib/training/generators/types.ts`)**:
  - Fungsi `resolveBaseTuesday(startDateInput?: string | Date)` menghitung hari Selasa pertama dari tanggal sasaran aktif atlet secara dinamis.
  - Modul generator [`century100kGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/training/generators/century100kGenerator.ts), [`climbingGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/training/generators/climbingGenerator.ts), [`consistencyGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/training/generators/consistencyGenerator.ts), dan [`marathonRehabGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/training/generators/marathonRehabGenerator.ts) kini menerima parameter `startDate?: string | Date`.
- **Eliminasi Angka Fiktif**:
  - Metrik baseline `current_value` pada target sasaran diatur menjadi `0` jika atlet belum memiliki aktivitas pada cabang terkait:
    ```typescript
    current_value: maxRideKm > 0 ? maxRideKm : 0,
    current_value: maxRunKm > 0 ? maxRunKm : 0,
    current_value: totalActivityKm > 0 ? totalActivityKm : 0,
    ```
  - Persentase progres sasaran `roadTo100kProgressPct` dan `marathonRehabProgressPct` bernilai `0%` secara jujur tanpa rekayasa.

---

## 3. Matriks Perbandingan Git Diff

| Berkas Terkait | Status | Baris (+) | Baris (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/crypto.ts` | Modifikasi | +11 | -5 | Penegakan validasi wajib `ENCRYPTION_SECRET` $\ge$ 32 karakter, hapus fallback statis |
| `src/lib/db/activityRepo.ts` | Modifikasi | +31 | -16 | Hapus silent catch, dukungan `is_manual`, passing `null` untuk manual `strava_activity_id` |
| `src/lib/db/trainingRepo.ts` | Modifikasi | +26 | -14 | Hapus silent catch, implementasi `{ preserveCompleted: true }` pada deletion |
| `src/app/api/athlete/streak/route.ts` | Modifikasi | +2 | -18 | Hapus fallback rekaan 10 minggu, respons HTTP 500 terstruktur pada error |
| `src/app/api/athlete/checkin/route.ts` | Modifikasi | +1 | -1 | Validasi regio anatomi jujur `'General / Unspecified Region'` |
| `src/lib/domain/streak/streakEngine.ts` | Modifikasi | +9 | -2 | Deduplikasi kontribusi streak via `loggedDateSet` berbasis tanggal kalender |
| `src/types/index.ts` | Modifikasi | +2 | -1 | Dekopling `strava_activity_id?: number \| null`, penambahan `is_manual?: boolean` |
| `src/lib/domain/coach/coachTrainingGenerator.ts` | Modifikasi | +39 | -20 | Regenerasi non-destruktif, tanggal dinamis, eliminasi baseline fiktif 56.1 / 12.3 km |
| `src/lib/training/generators/types.ts` | Modifikasi | +23 | 0 | Implementasi fungsi `resolveBaseTuesday` untuk resolusi tanggal dinamis |
| `src/lib/training/generators/index.ts` | Modifikasi | +10 | -9 | Meneruskan parameter `startDate` ke masing-masing generator arkotipe |
| `src/lib/training/generators/century100kGenerator.ts` | Modifikasi | +7 | -3 | Dukungan penanggalan dinamis siklus Century 100K |
| `src/lib/training/generators/climbingGenerator.ts` | Modifikasi | +7 | -3 | Dukungan penanggalan dinamis siklus Climbing D+ |
| `src/lib/training/generators/consistencyGenerator.ts` | Modifikasi | +8 | -4 | Dukungan penanggalan dinamis siklus Konsistensi Mingguan |
| `src/lib/training/generators/marathonRehabGenerator.ts` | Modifikasi | +7 | -3 | Dukungan penanggalan dinamis siklus Marathon Rehab |
| `scripts/tests/test_goal_driven_training_engine.js` | Modifikasi | +1 | -1 | Penyesuaian assertion jumlah aktivitas riil terkini ($\ge 34$) |
| `scripts/migrations/004_decouple_strava_id_manual_activity.sql` | Baru | +13 | 0 | Skrip DDL migrasi PostgreSQL (nullable strava_id, kolom is_manual, indeks) |
| `scripts/migrations/run_migration_004.cjs` | Baru | +44 | 0 | Runner eksekutor migrasi 004 dengan pre/post-flight check integritas 35 baris data |

**Total Akumulasi**: 17 berkas termodifikasi/dibuat, **+232 baris ditambahkan**, **-100 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

Seluruh suite pengujian otomatis telah dijalankan dan mencapai tingkat kelulusan mutlak **100% LULUS (70/70 Uji)**:

1. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - **Hasil**: **0 Errors, Exit Code 0 (100% Type-Safe)**.
2. **Suite Verifikasi Kesehatan & Kesiapan Cedera Atlet**:
   - Perintah: `node scripts/tests/test_athlete_health_system.js`
   - **Hasil**: **31 PASSED, 0 FAILED**.
   - Terverifikasi: Batas biometrik tidak rekaan, dossier cedera aktif, olahraga lari berada pada status terlindungi `ON_HOLD`.
3. **Suite Verifikasi Rentetan Latihan & Spektrum Api**:
   - Perintah: `node scripts/tests/test_weekly_streak_system.js`
   - **Hasil**: **21 PASSED, 0 FAILED**.
   - Terverifikasi: 6 tahapan termodinamika api konsisten, perhitungan kontribusi streak riil (10 minggu) bebas dari double-counting.
4. **Suite Verifikasi Sistem Rekomendasi Pelatihan Coach**:
   - Perintah: `node scripts/tests/test_coach_training_system.js`
   - **Hasil**: **5 PASSED, 0 FAILED**.
   - Terverifikasi: Rencana latihan aktif terhubung ke sasaran utama, sesi latihan selesai dan terencana dipertahankan secara utuh.
5. **Suite Integrasi Sasaran Pelatihan & Periodisasi Adaptif**:
   - Perintah: `node scripts/tests/test_goal_driven_training_engine.js`
   - **Hasil**: **13 PASSED, 0 FAILED**.
   - Terverifikasi: Seluruh 35 aktivitas riil di PostgreSQL terlindungi, skema relasional `goal_id`, `is_key_session`, `is_manual` terverifikasi, serta proteksi puasa sunnah (Senin & Kamis) terjaga 100%.

---

## 5. Dampak Sistem & Kesiapan Menuju Fase 3

Implementasi Fase 1 dan Fase 2 telah berhasil:
- Menghilangkan celah keamanan kunci enkripsi hardcoded pada repositori.
- Memutus risiko *split-brain state* dan kehilangan data diam-diam antara PostgreSQL dan JSON lokal.
- Menjadikan model aktivitas murni *device-independent* dan *manual-first* tanpa rekayasa ID vendor.
- Melindungi seluruh 35 aktivitas riil atlet dari risiko terhapus saat terjadi regenerasi rencana periodisasi.

Platform kini berada dalam kondisi stabil, kokoh, dan siap melanjutkan ke **Fase 3 (P2: Endpoint CRUD `DELETE /api/activities/[id]`, `PATCH /api/athlete/injuries/[id]`, dan Portabilitas Visi OCR)** sesuai roadmap.

