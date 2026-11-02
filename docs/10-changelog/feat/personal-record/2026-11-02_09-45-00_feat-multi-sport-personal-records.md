# Changelog: Multi-Sport Personal Records (PR) Benchmarks & Interactive Showcase (`feat/personal-record`)

- **Tanggal & Waktu**: 2026-11-02 09:45:00 WIB
- **Tipe**: `feat(analytics)` / `feat(ui)` / `feat(db)` / `docs(domain)`
- **Commit Message**: `feat(analytics): implement multi-sport personal records engine and interactive showcase`
- **Branch**: `feat/personal-record`

---

## 1. Latar Belakang & Kebutuhan Atlet

Sebelum pembaruan ini, bagian **Personal Records (PR) Benchmarks** pada dashboard performa hanya menampilkan 3 kartu statis berisikan data lari *dummy* tanpa relasi ke data aktivitas sebenarnya (`activity_id: null`):
- 5K (`20:30`), 10K (`42:30`), dan Half Marathon (`1:36:00`).

Permasalahan dan keterbatasan arsitektur lama:
1. **Tidak Ada Rekor Bersepeda (Cycling / Ride)**:
   Meskipun pengguna memiliki 24 aktivitas bersepeda dengan jarak tempuh hingga $56.10\text{ km}$ dan elevasi hingga $125\text{ m}$, sistem sama sekali tidak memiliki tolok ukur rekor untuk sepeda.
2. **Ketiadaan Hubungan Data Nyata (*Data Provenance Integrity*)**:
   Rekor lama merupakan data statis tiruan yang tidak terhubung dengan sesi latihan nyata pada basis data PostgreSQL maupun `.data/store.json`.
3. **Ketiadaan Navigasi & Konteks Aktivitas**:
   Pengguna tidak dapat mengklik kartu rekor untuk melihat rute GPS, sensor denyut jantung, atau telemetri tempat rekor tersebut dicapai.

Kebutuhan antarmuka & rekayasa sistem:
1. **Pemisahan Cabang Olahraga (*Dual-Discipline Separation*)**:
   - **Running (Lari - Volt Lime `#D4FF00`)**: 5K Benchmark, 10K Benchmark, Longest Run, Best Aerobic Pace.
   - **Cycling (Sepeda - Electric Cyan `#00F0FF`)**: Longest Ride, Fastest Sustained Speed (≥20K), Max Elevation Climb, 40K+ Endurance Ride.
2. **Interaktivitas & Navigasi**:
   - Segmented filter controls (`All`, `Run`, `Ride`).
   - Tautan langsung ke halaman telemetri sesi rute bersangkutan (`/activities/[id]`).
   - Penampilan nama sesi latihan dan tanggal pencapaian.
3. **Kepatuhan Desain Anti-AI-Slop**:
   - Mematuhi standar `docs/02-design/ANTI_AI_SLOP.md` dan `COLOR_SYSTEM.md`.
   - Palet obsidian telemetry `#090A0F`, `#12151D`, dan `#161922`.
   - Tipografi monospace tabular (`font-tabular font-mono`) pada seluruh angka catatan rekor.

---

## 2. Rincian Implementasi

### A. Mesin Kalkulasi PR Dinamis (`src/lib/personalRecords.ts`)
- Mengembangkan fungsi murni `computePersonalRecords(activities, userId)` yang mengevaluasi seluruh aktivitas terverifikasi dan menghasilkan tolok ukur nyata:
  - **5K & 10K Run Splits**: Menghitung kecepatan rata-rata pada sesi $\ge 5\text{ km}$ dan $\ge 10\text{ km}$, kemudian memproyeksikan estimasi waktu finish benchmark.
  - **Longest Run & Longest Ride**: Mengidentifikasi jarak terjauh dalam satu sesi berkelanjutan.
  - **Fastest Speed (≥20K)**: Mengidentifikasi kecepatan rata-rata tertinggi pada sesi sepeda jarak jauh.
  - **Max Elevation Climb**: Mengidentifikasi akumulasi tanjakan vertikal tertinggi.

### B. Komponen Antarmuka Pengguna (`src/components/PersonalRecordsDeck.tsx`)
- Komponen client interaktif dengan state filter `selectedSport` (`All` | `Run` | `Ride`).
- Kartu rekor modular dengan badge tipe olahraga (`RUN` / `RIDE`) dan warna aksen semantik yang konsisten.
- Integrasi ikonografi minimalis (`Trophy`, `Calendar`, `ArrowUpRight`).
- Pembungkusan elemen kartu dengan Next.js `<Link href={`/activities/${pr.activity_id}`}>` jika `activity_id` tersedia.

### C. Penyesuaian Skema & Sinkronisasi Database (`schema.sql` & `src/lib/db.ts`)
- **Skema Basis Data**:
  - Menambahkan kolom `sport_type VARCHAR(20) DEFAULT 'Run'` pada tabel `personal_records`.
- **Query Database (`src/lib/db.ts`)**:
  - Mengupdate fungsi `getPersonalRecords(userId)` dengan query `LEFT JOIN activities` untuk mengambil `activity_name` dan memetakan `sport_type` secara otomatis.
- **Skrip Sinkronisasi (`scripts/sync_personal_records.js`)**:
  - Skrip otomatis yang menghapus rekor statis lama dan menyelaraskan 8 rekor nyata ke PostgreSQL dan `.data/store.json`.

### D. Integrasi Dashboard Utama (`src/app/page.tsx`)
- Menggantikan kode kartu rekor lama pada baris 285 dengan komponen `<PersonalRecordsDeck prs={prs} />`.
- Menyelaraskan tata letak grid di kolom kanan (5-kolom) bersama kalender rencana latihan dan target kebugaran.

### E. Penyelarasan Dokumentasi Teknis (`docs/`)
- **`docs/05-domain-logic/PERSONAL_RECORDS.md`**: Menulis ulang spesifikasi standar tolok ukur multi-sport, rumus matematis perhitungan split pace, toleransi jarak, serta pedoman presentasi visual.
- **`docs/01-product/FUNCTIONAL_REQUIREMENTS.md`**: Memperbarui spesifikasi kebutuhan fungsional `FR-ANAL-003` untuk mencakup pelacakan rekor lari dan sepeda secara komprehensif.
- **`docs/01-product/PRD.md`**: Memperbarui matriks fitur `FEAT-005` untuk mendukung pengenalan rekor pribadi multi-sport.

---

## 3. Hasil Verifikasi

- **Build Turbopack**: `npm run build` sukses dengan exit code 0.
- **TypeScript**: 0 error pada seluruh modul (`PersonalRecordsDeck.tsx`, `personalRecords.ts`, `db.ts`, `types/index.ts`).
- **Rute yang Dihasilkan**:
  - `◐ /` (Partial Prerender - Dashboard Utama)
  - `◐ /activities` (Partial Prerender - Manajemen Aktivitas)
  - `◐ /activities/[id]` (Partial Prerender dynamic streaming - Detail Telemetri)
- **Verifikasi Basis Data**:
  - 8 rekor multi-sport tersimpan di PostgreSQL tabel `personal_records` dengan `activity_id` yang valid dan terhubung langsung ke tabel `activities`.
