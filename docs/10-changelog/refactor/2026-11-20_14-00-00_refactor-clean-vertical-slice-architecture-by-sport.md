# Changelog: Implementasi Arsitektur Clean Vertical Slice per Cabang Olahraga (`refactor`)

- **Tanggal & Waktu**: 2026-11-20 14:00:00 WIB
- **Tipe**: `refactor(architecture)` / `refactor(domain)` / `test(architecture)`
- **Commit Message Rujukan**: `refactor(domain): implement clean vertical slice architecture by sport with core orchestration and 33 isolated domain slices` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Spesifikasi Rujukan**: [`docs/11-ai/08-SPESIFIKASI_ARSITEKTUR_CLEAN_VERTICAL_SLICE_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/08-SPESIFIKASI_ARSITEKTUR_CLEAN_VERTICAL_SLICE_CABOR.md)
- **Lokasi**: [`docs/10-changelog/refactor/2026-11-20_14-00-00_refactor-clean-vertical-slice-architecture-by-sport.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-20_14-00-00_refactor-clean-vertical-slice-architecture-by-sport.md)

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum pembaruan ini, seluruh agen kecerdasan buatan untuk 33 cabang olahraga diletakkan dalam satu folder flat di [`src/lib/domain/coach/agents/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/agents/). Struktur flat monolitik ini menimbulkan tantangan arsitektural yang signifikan:
1. **Beban Kognitif Tinggi (*High Cognitive Load*)**: Terdapat 36 berkas bercampur dalam satu direktori flat (kontrak, router, dan 33 berkas agen cabor).
2. **Pelanggaran Prinsip *Screaming Architecture***: Struktur folder tidak mencerminkan batas domain cabang olahraga secara mandiri.
3. **Risiko Polusi Impor Silang**: Potensi terjadinya impor silang (*cross-sport coupling*) antar cabang olahraga yang memiliki karakteristik biomekanika dan fisiologi berbeda.

Sesuai dengan cetak biru resmi [`docs/11-ai/08-SPESIFIKASI_ARSITEKTUR_CLEAN_VERTICAL_SLICE_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/08-SPESIFIKASI_ARSITEKTUR_CLEAN_VERTICAL_SLICE_CABOR.md), dilakukan migrasi menyeluruh ke pola **Vertical Slice Architecture by Sport** dengan jaminan **100% Zero Breaking Changes** dan **Zero Inter-Sport Coupling**.

---

## 2. Rincian Perubahan Modul & Komponen

### A. Inti Orkestrasi Sistem Sentral (`src/lib/domain/coach/core/`)
1. **[`contracts.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/core/contracts.ts) (73 baris)**:
   - Antarmuka universal `ISportCoachAgent`, tipe payload telemetri `SportTelemetryPayload`, dan spesifikasi evaluasi `SportPrescriptionOutput`.
2. **[`SportCoordinatorRouter.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/core/SportCoordinatorRouter.ts) (191 baris)**:
   - Orkestrator sentral registry agen cabor, penanganan singleton pattern, dynamic ingress dispatcher, dan integrasi arbitrase kelelahan sistemik (`GlobalSystemicFatigueArbiter`).
3. **[`index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/core/index.ts) (4 baris)**:
   - Barrel export resmi untuk fondasi inti orkestrasi.

### B. Vertical Slices per Cabang Olahraga (`src/lib/domain/coach/sports/`)
Dibentuk **33 direktori vertical slice terisolasi** di bawah `src/lib/domain/coach/sports/`, masing-masing memiliki berkas agen dan `index.ts`:

1. `sports/running/`: Distance Running & Marathon (`DistanceRunningCoachAgent.ts`)
2. `sports/road-cycling/`: Road Cycling (`RoadCyclingCoachAgent.ts`)
3. `sports/mtb-xc/`: Mountain Biking Cross-Country (`MtbXcCoachAgent.ts`)
4. `sports/powerlifting/`: Powerlifting SBD (`PowerliftingCoachAgent.ts`)
5. `sports/weightlifting/`: Olympic Weightlifting (`OlympicWeightliftingCoachAgent.ts`)
6. `sports/calisthenics/`: Calisthenics & Street Workout (`CalisthenicsCoachAgent.ts`)
7. `sports/strongman/`: Strongman & Heavy Carries (`StrongmanCoachAgent.ts`)
8. `sports/bodybuilding/`: Bodybuilding & Hypertrophy (`BodybuildingCoachAgent.ts`)
9. `sports/football/`: Football / Soccer (`FootballCoachAgent.ts`)
10. `sports/basketball/`: Basketball (`BasketballCoachAgent.ts`)
11. `sports/volleyball/`: Volleyball (`VolleyballCoachAgent.ts`)
12. `sports/futsal/`: Futsal (`FutsalCoachAgent.ts`)
13. `sports/rugby/`: Rugby Union & Sevens (`RugbyCoachAgent.ts`)
14. `sports/field-hockey/`: Field Hockey (`FieldHockeyCoachAgent.ts`)
15. `sports/boxing/`: Boxing (`BoxingCoachAgent.ts`)
16. `sports/mma/`: Mixed Martial Arts (`MmaCoachAgent.ts`)
17. `sports/bjj/`: Brazilian Jiu-Jitsu (`BjjCoachAgent.ts`)
18. `sports/pencak-silat/`: Pencak Silat (`PencakSilatCoachAgent.ts`)
19. `sports/judo/`: Judo & Sambo (`JudoCoachAgent.ts`)
20. `sports/muay-thai/`: Muay Thai & Kickboxing (`MuayThaiCoachAgent.ts`)
21. `sports/badminton/`: Badminton (`BadmintonCoachAgent.ts`)
22. `sports/tennis/`: Tennis (`TennisCoachAgent.ts`)
23. `sports/table-tennis/`: Table Tennis (`TableTennisCoachAgent.ts`)
24. `sports/archery/`: Archery (`ArcheryCoachAgent.ts`)
25. `sports/shooting/`: Sport Shooting (`ShootingCoachAgent.ts`)
26. `sports/swimming/`: Swimming (`SwimmingCoachAgent.ts`)
27. `sports/rowing/`: Rowing (`RowingCoachAgent.ts`)
28. `sports/triathlon/`: Triathlon (`TriathlonCoachAgent.ts`)
29. `sports/crossfit-hyrox/`: Functional Fitness (`FunctionalFitnessCoachAgent.ts`)
30. `sports/climbing/`: Sport Climbing (`SportClimbingCoachAgent.ts`)
31. `sports/gymnastics/`: Artistic Gymnastics (`GymnasticsCoachAgent.ts`)
32. `sports/surfing/`: Surfing (`SurfingCoachAgent.ts`)
33. `sports/skateboarding/`: Skateboarding (`SkateboardingCoachAgent.ts`)

4. **[`sports/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/sports/index.ts) (130 baris)**:
   - Master barrel export untuk 33 cabor, fungsi pendaftaran per kluster fisiologis (`registerDefaultEnduranceAgents`, `registerDefaultStrengthAgents`, `registerDefaultTeamSportsAgents`, `registerDefaultCombatSportsAgents`, `registerDefaultAquaticRacquetFunctionalAgents`), serta auto-bootstrap seluruh 33 cabor saat modul dimuat.

### C. Konsolidasi Direktori Transisional (`src/lib/domain/coach/agents/`) Menjadi Satu Berkas Tunggal
1. **Pembersihan 35 Berkas Shim 1-Baris**:
   - Seluruh 35 berkas individu di folder lama (`contracts.ts`, `SportCoordinatorRouter.ts`, dan 33 berkas `<SportName>CoachAgent.ts`) telah dihapus secara bersih guna menghindari polusi berkas 1-baris.
2. **Satu Berkas Tunggal Penjaga Kompatibilitas ([`agents/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/agents/index.ts)) (3 baris)**:
   - Direktori `src/lib/domain/coach/agents/` kini **hanya berisi satu berkas saja**: `index.ts`, yang mengekspor ulang `export * from '../core'` dan `export * from '../sports'`.
   - Mengalihkan referensi langsung di [`src/app/api/coach/multi-sport/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/coach/multi-sport/route.ts) dan [`scripts/tests/test_multi_sport_coordinator.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_multi_sport_coordinator.js) ke direktori kanonikal `src/lib/domain/coach/core/`, sehingga ekosistem bersih dari dependensi file tunggal yang usang.

---

## 3. Rangkaian Pengujian Otomatis & Verifikasi

- **Suite Pengujian Arsitektur Baru**: [`scripts/tests/test_vertical_slice_architecture.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_vertical_slice_architecture.js) (114 baris):
  - Memverifikasi keberadaan seluruh file di `core/` (3 checks).
  - Memverifikasi 33 folder cabor terisolasi beserta `index.ts` dan agennya (99 checks).
  - **Enforce Zero Inter-Sport Coupling**: Memverifikasi secara otomatis bahwa tidak ada cabor di bawah `sports/` yang mengimpor kode dari cabor lain (1 check).
  - Memverifikasi registrasi dan ketersediaan 33 agen di `SportCoordinatorRouter` (34 checks).
  - Memverifikasi kepatuhan batas baris kode `< 300 baris` pada seluruh file di bawah `sports/` (65 checks).
  - **Hasil**: **202 Passed, 0 Failed**.
- **Hasil Pengujian Terpadu (`npm run test:all`)**:
  - Lulus **18 dari 18 test suite** (**639+ pengujian lulus, 0 gagal**).
- **Next.js Turbopack Build**: `npm run build` sukses mengompilasi **35/35 rute** aplikasi dalam 3.4 detik dengan **0 kesalahan TypeScript**.
- **Disiplin Batas Baris Kode (`< 300 lines`)**:
  - `core/contracts.ts`: 73 baris
  - `core/SportCoordinatorRouter.ts`: 191 baris
  - `sports/index.ts`: 130 baris
  - Rata-rata berkas agen: 160–210 baris
  - **100% berkas berada di bawah batas 300 baris**.
