# Changelog: Pipeline Ingesti Aktivitas Strava & Auto-Matching Rekonsiliasi (`feat/strava-activity-ingestion`)

- **Tanggal & Waktu**: 2026-11-01 21:15:00 WIB
- **Tipe**: `feat(strava)` / `feat(api)` / `feat(db)` / `fix(hydration)` / `fix(types)`
- **Commit Message**: `feat(strava): implement incremental activity ingestion pipeline, rate-limit governance, auto-matching, and hydration fix`
- **Branch**: `feat/strava-activity-ingestion`

---

## 1. Latar Belakang & Kebutuhan Teknis

Berdasarkan spesifikasi arsitektur pada repositori `a-coach`:
1. [`docs/04-integrations/ACTIVITY_SYNCHRONIZATION.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/04-integrations/ACTIVITY_SYNCHRONIZATION.md)
2. [`docs/04-integrations/RATE_LIMITING.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/04-integrations/RATE_LIMITING.md)
3. [`docs/04-integrations/STRAVA_API_REFERENCE.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/04-integrations/STRAVA_API_REFERENCE.md)
4. [`docs/branch.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/branch.md) (Milestone Cabang: `feat/strava-activity-ingestion`)

### Masalah yang Ditemukan di Lapangan:
1. **Hydration Mismatch pada `<body>`**:
   - Ekstensi browser (seperti ColorZilla atau shortcut listener) menyisipkan atribut seperti `cz-shortcut-listen="true"` ke tag `<body>` sebelum hidrasi React selesai, memicu peringatan konsol Next.js: `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties`.
2. **Runtime TypeError `scheduled_date.localeCompare is not a function`**:
   - Driver PostgreSQL (`node-pg`) mengembalikan kolom bertipe SQL `DATE` sebagai instance JavaScript `Date`, bukan string. Akibatnya, pemanggilan `a.scheduled_date.localeCompare(...)` di `src/lib/ai-coach.ts` mengalami crash. Hal serupa juga berpotensi terjadi pada deserialisasi kolom `NUMERIC` (seperti `distance_meters`, `average_speed_mps`) yang dikembalikan sebagai string.
3. **Absensi Pipeline Sinkronisasi Aktivitas**:
   - Belum tersedia route handler `/api/strava/sync` yang mampu mengambil riwayat aktivitas atlet secara inkremental (`?after={timestamp}`), mematuhi kuota rate-limit Strava (100 req / 15 menit), meng-upsert data ke PostgreSQL, memicu rekonsiliasi rencana latihan (`runAutoMatch`), serta mencatat audit eksekusi ke `sync_logs`.

---

## 2. Solusi & Perubahan yang Diterapkan

### A. Perbaikan Masalah Hidrasi & Normalisasi Tipe Data
1. **Atribut Hidrasi di [`src/app/layout.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/layout.tsx)**:
   - Menambahkan properti `suppressHydrationWarning` pada tag `<html>` dan `<body>` untuk menetralkan injeksi atribut dari ekstensi peramban.
2. **Defensive Date & Numeric Parsing di [`src/lib/db.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts)**:
   - Membuat fungsi utilitas `normalizeActivityRow()` untuk memetakan field PostgreSQL ke tipe data JavaScript yang aman (`Number()` untuk kolom numeric, ISO strings untuk tanggal).
   - Menormalkan `getScheduledWorkouts()`, `createScheduledWorkout()`, dan `getFitnessGoals()` sehingga `scheduled_date` dan `target_date` selalu berupa format string `YYYY-MM-DD`.
3. **Guards di [`src/lib/ai-coach.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/ai-coach.ts) & [`src/lib/analytics.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/analytics.ts)**:
   - Menambahkan normalisasi defensif `toDateString` sebelum operasi `localeCompare` dan perbandingan tanggal.
4. **Formatters Fleksibel di [`src/lib/formatters.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/formatters.ts)**:
   - Memperluas `formatDate()` dan `formatDayOfWeek()` agar menerima argumen bertipe `string | Date`.

---

### B. Endpoint Ingesti Aktivitas & Tata Kelola Rate Limit ([`src/app/api/strava/sync/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/strava/sync/route.ts))
1. **`GET /api/strava/sync`**:
   - Menyediakan telemetri status sinkronisasi: status koneksi aktif, entri log sinkronisasi terakhir (`lastSync`), tanggal aktivitas terbaru (`latestActivityDate`), dan flag `hasActivities`.
2. **`POST /api/strava/sync`**:
   - **Verifikasi Koneksi**: Memastikan atlet terhubung ke Strava.
   - **Auto-Refresh Proaktif**: Memperoleh access token valid via `getValidAccessToken()`. Jika masa berlaku sisa < 5 menit, token otomatis disegarkan tanpa memutus alur pengguna.
   - **Lookup Inkremental**: Mengambil timestamp aktivitas terbaru dari database via `getLatestActivityDate()`. Jika belum ada aktivitas, default ke 30 hari ke belakang (`afterTimestamp`).
   - **Panggilan Strava API v3**: Memanggil `GET /api/v3/athlete/activities?after={afterTimestamp}&per_page=100`.
   - **Pemantauan Rate Limit**: Memeriksa header `x-ratelimit-limit` dan `x-ratelimit-usage`. Jika terjadi HTTP 429, sistem menangkap error dan mencatat status `RATE_LIMITED` di tabel `sync_logs`.
   - **Upsert Idempoten**: Menyimpan aktivitas via `upsertActivity()`. Mendeteksi row baru vs update menggunakan idiom PostgreSQL `(xmax = 0) AS is_created`.
   - **Auto-Matching Engine**: Menjalankan `runAutoMatch(userId, ingestedActivities)` untuk mencocokkan aktivitas fisik nyata dengan rencana latihan terjadwal pada hari yang sama, menghitung delta jarak, durasi, dan pace, serta menandai latihan menjadi `COMPLETED`.
   - **Audit Trail**: Merekam log lengkap ke `sync_logs` (durasi eksekusi, jumlah diambil, dibuat, dan diperbarui).

---

### C. Antarmuka Ingesti Telemetri ([`src/components/StravaConnectCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/StravaConnectCard.tsx))
- Menambahkan **Panel Sinkronisasi Inkremental** saat status atlet terhubung:
  - Tombol **"Sync Activities Now"** dengan indikator *loading spinner* ketika proses tarik data berlangsung.
  - Strip telemetri status sinkronisasi terakhir: badge status (`SUCCESS` / `RATE_LIMITED`), timestamp penyelesaian, jumlah aktivitas diambil (*fetched*), dibuat (*created*), dan diperbarui (*updated*).
  - Integrasi dengan `useRouter().refresh()` agar dasbor analitik dan kalender latihan langsung menampilkan data terkini segera setelah sinkronisasi tuntas.

---

## 3. Matriks File yang Diubah & Dibuat

| Berkas | Status | Deskripsi Perubahan |
| :--- | :---: | :--- |
| [`src/app/api/strava/sync/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/strava/sync/route.ts) | **Dibuat Baru** | Handler REST API untuk memicu ingesti aktivitas inkremental, rate limit interceptor, rekonsiliasi auto-matching, dan pencatatan audit `sync_logs`. |
| [`src/lib/db.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts) | **Diperbarui** | Ditambahkan `normalizeActivityRow`, `getLatestActivityDate`, `getLastSyncLog`, serta normalisasi pada `getActivities`, `upsertActivity`, dan `getWorkoutActivityMatches`. |
| [`src/lib/matching.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/matching.ts) | **Diperbarui** | Parsing tanggal aman dan perlindungan aritmatika numerik pada `calculateMatchDeltas` dan `runAutoMatch`. |
| [`src/components/StravaConnectCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/StravaConnectCard.tsx) | **Diperbarui** | Tombol aksi sinkronisasi langsung, status loader, dan indikator riwayat audit sinkronisasi. |
| [`src/app/layout.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/layout.tsx) | **Diperbarui** | Menambahkan `suppressHydrationWarning` untuk meniadakan konflik ekstensi browser pada `<body>`. |
| [`src/lib/ai-coach.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/ai-coach.ts) | **Diperbarui** | Proteksi konversi tanggal defensif sebelum memanggil `.localeCompare()`. |
| [`src/lib/analytics.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/analytics.ts) | **Diperbarui** | Penanganan aman komparasi string vs tanggal pada ringkasan mingguan dan latihan mendatang. |
| [`src/lib/formatters.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/formatters.ts) | **Diperbarui** | Menerima argumen bertipe `string | Date`. |

---

## 4. Hasil Verifikasi Build

```bash
npm run build
```
- **Exit code**: `0`
- **Compiler**: Next.js 16.4.3 (Turbopack)
- **TypeScript**: 0 error
- **Routes Generated**:
  - `◐ /` (Partial Prerender)
  - `ƒ /api/auth/strava/authorize` (Dynamic)
  - `ƒ /api/auth/strava/callback` (Dynamic)
  - `ƒ /api/auth/strava/disconnect` (Dynamic)
  - `○ /api/auth/strava/status` (Static)
  - `ƒ /api/strava/sync` (Dynamic)
