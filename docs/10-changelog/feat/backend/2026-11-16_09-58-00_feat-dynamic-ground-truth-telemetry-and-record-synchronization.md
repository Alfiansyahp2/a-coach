# Changelog: Dynamic Ground-Truth Telemetry Engine & Static Hardcoding Remediation (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-16 09:58:00 WIB
- **Tipe**: `feat(backend)` / `fix(domain)` / `fix(records)` / `refactor(database)`
- **Commit Message Rujukan**: `feat(backend): dynamic ground-truth telemetry engine, equipment mileage subquery, and personal record synchronization`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-16_09-58-00_feat-dynamic-ground-truth-telemetry-and-record-synchronization.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit komprehensif terhadap telemetri atlet dan temuan visual di antarmuka (khususnya tampilan statis `56.1 km / 5000 km` pada kartu perlengkapan dan tidak berubahnya rekor personal atlet setelah menuntaskan sesi 62.4 km pada 13 November 2026), teridentifikasi sejumlah inkonsistensi arsitektural dan *false logic* di lapisan basis data, domain engine, serta presentasi:

1. **Akumulasi Jarak Perlengkapan Statis (*Static Equipment Mileage*)**:
   - Kolom `accumulated_distance_meters` pada tabel `athlete_equipment` diinisialisasi secara statis pada migrasi 3 November 2026 dengan nilai `56100.00` meter (56.1 km) untuk *Trek Marlin 7 Hardtail*, dan tidak pernah dikalkulasi ulang dari riwayat aktivitas riil di tabel `activities`.
   - Padahal, data empiris di basis data mencatat **29 sesi sepeda** dengan akumulasi jarak nyata mencapai **750.14 km**, serta **10 sesi lari** dengan total **65.11 km**.
2. **Rekor Personal Terkunci pada Nilai Statis (*Stale Personal Records Lock*)**:
   - Atlet telah memecahkan rekor jarak terjauh sepeda pada 13 November 2026 dengan rute *"pajarakan (62.4 km)"* sejauh **62.37 km**.
   - Namun, tabel `personal_records` di PostgreSQL dan logika penggabungan di `src/app/page.tsx` (`dbEnhanced`) memprioritaskan baris statis basis data (`...p`), sehingga nilai lama (`56.10 km` dari 29 September 2026) terus menimpa hasil kalkulasi dinamis `computePersonalRecords(activities)`.
3. **Kontradiksi Logika & Metrik (*Metric Contradiction & False Logic*)**:
   - Pada `src/lib/domain/records/personalRecordsEngine.ts`, kategori `40K+ Endurance Ride` menyaring sesi $\ge 40\text{ km}$, namun menyeleksi aktivitas berdasarkan kecepatan tertinggi (`curKmh > bestKmh`), sementara nilai yang ditampilkan ke pengguna adalah jarak (`record_display: distKm km`). Hal ini menyebabkan sesi 56.10 km (kecepatan 21.4 km/h) mengalahkan sesi 62.37 km (kecepatan 21.0 km/h) dalam kategori yang berlabel *Endurance Distance*.
4. **Ketidaksesuaian Satuan Target (*Unit Mismatch*) & Nilai Statis di Tampilan UI**:
   - Komponen `CyclingCoachView.tsx` mencampuradukkan satuan meter (`100000`) dan kilometer (`100`), mengakibatkan persentase target Century Ride terhitung $624\%$ dan sisa jarak menjadi minus ($-62.3\text{ km}$).
   - Teks string literal `"56.10 km"` tertulis secara *hardcoded* di dalam JSX `CyclingCoachView.tsx` dan `AthleteHealthDirectives.tsx`, serta nilai *fallback* statis `|| 56.1` di `MacroObjectivesStrip.tsx`.

Pembaruan ini menuntaskan seluruh *false logic* dan *hardcoding* di atas, menjadikan seluruh kalkulasi rekor, akumulasi kilometer peralatan, dan target latihan 100% dinamis dan bersumber dari *ground-truth activities* di PostgreSQL.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Lapisan Database & Query Dinamis (`src/lib/db/equipmentRepo.ts` & `goalRepo.ts`)

1. **Subquery Korelasi Otomatis pada Perlengkapan (`equipmentRepo.ts`)**:
   - Mengubah `getAthleteEquipment` dari pembacaan kolom pasif menjadi *correlated SQL subquery* yang menghitung akumulasi jarak secara dinamis dan *real-time*:
     ```sql
     SELECT
       e.*,
       COALESCE(
         (
           SELECT SUM(a.distance_meters)
           FROM activities a
           WHERE a.user_id = e.user_id
             AND (
               (e.sport_type = 'Ride' AND (a.sport_type ILIKE '%ride%' OR a.sport_type ILIKE '%cycl%'))
               OR (e.sport_type = 'Run' AND a.sport_type ILIKE '%run%')
               OR (a.sport_type = e.sport_type)
             )
         ),
         e.accumulated_distance_meters
       ) AS dynamic_accumulated_distance_meters
     FROM athlete_equipment e
     WHERE e.user_id = $1;
     ```
   - Pada *fallback local store*, fungsi menerapkan `reduce` dinamis terhadap array aktivitas lokal.
   - Mengarahkan `getAthleteEquipmentSummary` untuk mendelegasikan panggilan ke `getAthleteEquipment` demi menjaga konsistensi data tunggal.

2. **Perhitungan Dinamis Target Kebugaran (`goalRepo.ts`)**:
   - Mengubah `getFitnessGoals` untuk menghitung `dynamic_current_value` via ekspresi `CASE`:
     - **100 km Century Ride**: Mengambil `MAX(distance_meters) / 1000.0` untuk aktivitas sepeda $\to$ **62.4 km**.
     - **Marathon Pathway**: Mengambil `MAX(distance_meters) / 1000.0` untuk aktivitas lari $\to$ **12.3 km**.
     - **Akumulasi 12-Minggu**: Mengambil `SUM(distance_meters) / 1000.0` dari sesi setelah `start_date` $\to$ **183.7 km**.
   - Merefaktor `getPrimaryFitnessGoal` untuk menggunakan `getFitnessGoals(userId)` agar tidak terjadi inkonsistensi query ganda.

---

### B. Lapisan Domain Engine & Koreksi Logika Rekor (`personalRecordsEngine.ts` & `src/app/page.tsx`)

1. **Koreksi Logika *Endurance Benchmark* (`src/lib/domain/records/personalRecordsEngine.ts`)**:
   - Memperbaiki kriteria komparasi pada kategori `40K+ Endurance Ride`:
     ```typescript
     // SEBELUM: Menggunakan speed padahal label dan display bertipe jarak (false logic)
     // SESUDAH: Menggunakan jarak endurance terjauh secara konsisten
     const rides40k = rides.filter((r) => Number(r.distance_meters || 0) >= 40000);
     if (rides40k.length > 0) {
       const best40k = rides40k.reduce((best, cur) => {
         const bestDist = Number(best.distance_meters || 0);
         const curDist = Number(cur.distance_meters || 0);
         return curDist > bestDist ? cur : best;
       });
       // ...
     }
     ```
   - Hasil: Rekor *40K+ Endurance Ride* kini secara akurat merefleksikan pencapaian terbaru **62.37 km** (sesi 13 November 2026), bukan lagi tertahan di 56.10 km.

2. **Sinkronisasi Dinamis Otoritatif pada Dashboard (`src/app/page.tsx`)**:
   - Memperbaiki penggabungan `displayPrs` agar kalkulasi dinamis dari aktivitas nyata (`computedPrs`) membarui data rekor basis data secara otomatis:
     ```typescript
     const dbEnhanced = prs.map((p: any) => {
       const m = computedPrs.find(
         (c) =>
           c.category.toLowerCase().includes(p.category.toLowerCase()) ||
           p.category.toLowerCase().includes(c.category.toLowerCase())
       );
       if (!m) return p;
       return {
         ...p,
         record_value: m.record_value,
         record_display: m.record_display,
         achieved_date: m.achieved_date,
         activity_id: m.activity_id,
         activity_name: m.activity_name || p.activity_name,
         subtext: m.subtext || p.subtext,
       };
     });
     ```

---

### C. Pembersihan Hardcoding pada Komponen UI (`CyclingCoachView`, `AthleteHealthDirectives`, `MacroObjectivesStrip`)

1. **`CyclingCoachView.tsx`**:
   - Menambahkan normalisasi satuan target: `centuryTargetKm = rawTarget > 500 ? rawTarget / 1000 : rawTarget`.
   - Mengganti teks literal `56.10 km` dengan ekspresi dinamis `{maxRideKm > 0 ? `${maxRideKm.toFixed(1)} km` : "jarak dasar"}`.
   - Memperbaiki kalkulasi progres `centuryProgressPct` dan gap sisa jarak `remainingGapKm`.
2. **`AthleteHealthDirectives.tsx` & `AthleteHealthDeck.tsx`**:
   - Menambahkan prop dinamis `maxVerifiedRideKm` (dihitung dari `recentActivities`).
   - Menggantikan string `"56.10 km"` pada baris 139 dan 146 dengan `${maxVerifiedRideKm.toFixed(1)} km`.
3. **`MacroObjectivesStrip.tsx`**:
   - Menghapus nilai *fallback* statis `|| 56.1` dan `|| 12.3`, menggantikannya dengan normalisasi nilai riil dari basis data dan aktivitas.
4. **`PersonalRecordsDeck.tsx`**:
   - Memperbarui konstanta *offline fallback* dari `623.3` km dan `65.2` km menjadi nilai riil terverifikasi: **750.1 km** (sepeda) dan **65.1 km** (lari).

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/db/equipmentRepo.ts` | Modifikasi | +60 | -28 | Correlated subquery kalkulasi jarak perlengkapan riil (Trek Marlin 7: 750.1 km) |
| `src/lib/db/goalRepo.ts` | Modifikasi | +34 | -20 | Dynamic SQL CASE statement untuk nilai terkini target (Century: 62.4 km) |
| `src/lib/domain/records/personalRecordsEngine.ts` | Modifikasi | +3 | -5 | Koreksi komparasi jarak endurance 40K+ (62.37 km vs 56.10 km) |
| `src/app/page.tsx` | Modifikasi | +7 | -2 | Penimpaan otomatis rekor statis DB oleh kalkulasi dinamis telemetri aktivitas |
| `src/components/coach/CyclingCoachView.tsx` | Modifikasi | +12 | -9 | Eliminasi unit mismatch meter/km & teks statis 56.10 km $\to$ dinamis |
| `src/components/health/AthleteHealthDeck.tsx` | Modifikasi | +9 | -1 | Kalkulasi `maxVerifiedRideKm` dari aktivitas dan penerusan ke directives |
| `src/components/health/AthleteHealthDirectives.tsx` | Modifikasi | +4 | -3 | Prop `maxVerifiedRideKm` dan penggantian teks statis 56.10 km |
| `src/components/training/MacroObjectivesStrip.tsx` | Modifikasi | +10 | -6 | Penghapusan fallback 56.1 & normalisasi satuan target |
| `src/components/records/PersonalRecordsDeck.tsx` | Modifikasi | +2 | -2 | Sinkronisasi fallback offline ke total telemetri riil (750.1 km & 65.1 km) |
| `scripts/maintenance/sync_dynamic_records.cjs` | Baru | +91 | 0 | Skrip sinkronisasi basis data satu arah untuk integritas PostgreSQL |

**Total Perubahan**: 10 file termodifikasi/dibuat, **+232 baris ditambahkan**, **-76 baris dihapus**. Seluruh file dalam `src/` tetap mematuhi batas arsitektural `< 300 baris`.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Eksekusi Skrip Sinkronisasi Empiris (`scripts/maintenance/sync_dynamic_records.cjs`)**:
   - `Trek Marlin 7 Hardtail`: Berhasil tersinkronisasi dari `56.1 km` $\to$ **750.1 km**.
   - `Nike Pegasus Trail 4`: Berhasil tersinkronisasi dari `12.3 km` $\to$ **65.1 km**.
   - `Century Ride Goal`: Berhasil tersinkronisasi dari `56.10 km` $\to$ **62.4 km**.
   - `Longest Ride PR`: Berhasil tersinkronisasi ke **62.37 km** (*pajarakan*, 2026-11-13).
   - `40K+ Endurance Ride PR`: Berhasil tersinkronisasi ke **62.37 km** (*pajarakan*, 2026-11-13).
2. **Pemeriksaan Kompilasi TypeScript (`npx tsc --noEmit`)**:
   - **Hasil**: Exit code 0, **0 Type Errors (100% Type-Safe)**.
3. **Seluruh Rangkaian Uji Otomatis (`npm run test:all`)**:
   - `test:health` $\to$ **31 PASSED, 0 FAILED**.
   - `test:coach` $\to$ **5 PASSED, 0 FAILED**.
   - `test:streak` $\to$ **21 PASSED, 0 FAILED**.
   - `test:bola` $\to$ **ALL TESTS PASSED (Keamanan BOLA Terverifikasi)**.
   - `test:multi-week-recap` $\to$ **10 PASSED, 0 FAILED**.
   - `test:python` $\to$ **16 PASSED, 0 FAILED**.
   - **Total**: 83 uji otomatis tuntas 100% tanpa kegagalan.
4. **Verifikasi Produksi Next.js (`npm run build`)**:
   - **Hasil**: Kompilasi berhasil dalam 4.1s. Seluruh 34 rute aplikasi terkompilasi dan teroptimasi secara sempurna tanpa eror.
