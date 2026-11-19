# Changelog: Multi-Sport AI Coordinator, Shared Science Kernels, and Sport Telemetry Persistence (Phase 1)

- **Tanggal & Waktu**: 2026-11-18 10:30:00 WIB
- **Tipe**: `feat(backend)` / `feat(domain)` / `feat(ai-coaching)` / `feat(architecture)`
- **Commit Message Rujukan**: `feat(backend): implement multi-sport ai coordinator, shared physiological kernels, and sport telemetry schema (phase 1)`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-18_10-30-00_feat-multi-sport-ai-coordinator-and-shared-science-kernels-phase-1.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit komprehensif terhadap sistem AI Coaching pada modul [docs/11-ai/01-AUDIT_SISTEM_AI_COACHING_EXISTING.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/01-AUDIT_SISTEM_AI_COACHING_EXISTING.md), teridentifikasi sejumlah keterbatasan fundamental yang membatasi sistem ke dalam bias monolitik:

1. **Bias Monolitik Olahraga Tunggal (*Endurance-Centric Monolith*)**:
   - Sistem kepelatihan AI sebelumnya hanya terbiasa menangani telemetri olahraga siklis aerobik (Lari dan Bersepeda berbasis GPS Strava).
   - Ketika atlet mencatat cabang olahraga non-GPS atau cabor anaerobik/kekuatan (seperti *Weightlifting*, *Basketball*, *Bouldering*, *Badminton*, *Swimming*, atau *Gymnastics*), sistem tidak memiliki mekanisme perhitungan beban kerja internal yang setara dan presisi.
2. **Ketiadaan Engine Universal Beban Internal (*Universal Internal Load Engine*)**:
   - Tanpa sensor daya (watt) atau GPS, beban latihan tidak dapat dinilai menggunakan TSS (*Training Stress Score*) konvensional. Dibutuhkan engine universal berbasis *Session-RPE* tervalidasi sains olahraga (Carl Foster et al., 2001) yang mampu mengukur beban latihan (*Arbitrary Units* / AU), monotonitas mingguan, dan regangan (*training strain*).
3. **Risiko Halusinasi & Ketiadaan *Safety Circuit Breaker***:
   - Tanpa pemisahan agen per cabor (*decoupled agents*), model AI monolitik rentan memberikan rekomendasi latihan yang berbahaya bagi atlet yang memiliki riwayat cedera sendi (misalnya menganjurkan sesi *box jump* eksplosif pada atlet dengan riwayat *anterior knee pain*).
4. **Ketiadaan Rasio Beban Akut:Kronis (*ACWR*) & Periodisasi Blok Modern**:
   - Belum adanya penghitungan rasio *Acute:Chronic Workload Ratio* (Tim Gabbett, 2016) untuk mencegah *workload spike* di atas zona bahaya ($ACWR \ge 1.5$).
   - Pola periodisasi masih menggunakan pendekatan linear klasik tanpa menerapkan *Block Periodization* (Vladimir Issurin & Tudor Bompa) yang memperhitungkan masa paruh efek latihan sisa (*residual training effects*).

Pembaruan **Phase 1** ini mengeksekusi fondasi arsitektur dari [docs/11-ai/07-ROADMAP_IMPLEMENTASI_BERTAHAP.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/07-ROADMAP_IMPLEMENTASI_BERTAHAP.md), membangun *Clean Architecture Multi-Agent Coordinator*, 3 *Shared Scientific Kernels*, serta lapisan persistensi telemetri multi-cabor di PostgreSQL dan *offline-first JSON store*.

---

## 2. Rincian Perubahan Teknis Berdasarkan Implementasi

### A. Kontrak Bersih & Taksonomi Telemetri Multi-Sport (`src/types/sportTelemetry.ts` & `src/lib/domain/coach/agents/contracts.ts`)

1. **Taksonomi Fisiologis 6 Klaster & 3 Jalur Energi (`sportTelemetry.ts`)**:
   - Mendefinisikan klaster fisiologis global:
     - `ENDURANCE_AEROBIC`: Cabor dominan oksidatif berkepanjangan (Running, Cycling, Swimming, Rowing, XC Skiing, Triathlon).
     - `POWER_STRENGTH`: Cabor neuromuskular fosfagen (Weightlifting, Powerlifting, Calisthenics, Track Sprint).
     - `MIXED_ANAEROBIC_AEROBIC`: Cabor interval intermiten dengan lonjakan laktat (Football, Basketball, Badminton, Tennis, Boxing).
     - `NEUROMUSCULAR_AGILITY`: Cabor koordinasi, refleks, dan teknik neuromuskular (Gymnastics, Bouldering, Skateboarding).
     - `FLEXIBILITY_ARTISTIC`: Cabor mobilitas, kontrol postural, dan fleksibilitas (Yoga, Pilates, Diving, Figure Skating).
     - `TACTICAL_COGNITIVE`: Cabor presisi psikomotor dan konsentrasi (Archery, Sport Shooting, Chess/Esports).
   - Mendefinisikan model telemetri universal `SportTelemetryPayload` yang menampung `universalLoad` (Session-RPE, Durasi, HR) dan `sportSpecificMetrics` (Pace, Cadence, Watt, RPE-RIR, Tonnage, Stroke Rate, VO2 max).
   - Mendefinisikan model preskripsi formal `SportPrescriptionOutput` yang mencakup fase periodisasi, limit beban ACWR, rest interval, nutrisi, protokol pencegahan cedera, dan justifikasi jurnal ilmiah.

2. **Kontrak Agen Terpisah (*Decoupled Agent Interface*) (`contracts.ts`)**:
   - Standarisasi antarmuka `ISportCoachAgent`:
     ```typescript
     export interface ISportCoachAgent {
       readonly metadata: SportCoachMetadata;
       evaluateTelemetry(payload: SportTelemetryPayload): Promise<SportPrescriptionOutput>;
       canHandle(sportCode: string): boolean;
     }
     ```
   - Setiap agen masa depan diwajibkan mengimplementasikan kontrak ini secara mandiri, mencegah terjadinya penggabungan kode (*no monolith blending*).

---

### B. Tiga Mesin Sains Fisiologi Bersama (*Shared Scientific Kernels*)

Direktori: `src/lib/domain/coach/kernels/`

1. **Carl Foster Session-RPE Universal Load Kernel (`fosterSessionRpeKernel.ts`)**:
   - Mengimplementasikan rumus *Foster Session-RPE* (Foster et al., 2001, *Journal of Strength and Conditioning Research*):
     $$\text{Training Load (AU)} = \text{Borg CR-10 RPE} \times \text{Session Duration (menit)}$$
   - Menghitung metrik beban mingguan:
     - $\text{Total Weekly Load} = \sum \text{Session Load}$
     - $\text{Monotony} = \frac{\text{Mean Daily Load}}{\text{Standard Deviation Daily Load}}$
     - $\text{Training Strain} = \text{Total Weekly Load} \times \text{Monotony}$
   - Memicu deteksi batas risiko klinis:
     - `HIGH_MONOTONY` jika $\text{Monotony} \ge 2.0$ (risiko overtraining / kelelahan neuroendokrin).
     - `CRITICAL_STRAIN` jika $\text{Strain} \ge 4000\text{ AU}$ (risiko infeksi saluran pernapasan atas / ISPA dan degradasi performa).

2. **Tim J. Gabbett ACWR Injury Prevention Kernel (`gabbettAcwrKernel.ts`)**:
   - Mengimplementasikan rasio beban kerja akut terhadap kronis (Gabbett, 2016, *British Journal of Sports Medicine*):
     $$ACWR = \frac{\text{Acute Load (Beban 7 Hari)}}{\text{Chronic Load Average (Rata-rata 28 Hari)}}$$
   - Memetakan spektrum risiko cedera:
     - `UNDERLOAD` ($ACWR < 0.8$): Penurunan kebugaran (*fitness detraining*).
     - `SWEET_SPOT` ($0.8 \le ACWR \le 1.3$): Zona adaptasi optimal dengan risiko cedera terendah.
     - `ELEVATED_RISK` ($1.3 < ACWR < 1.5$): Peningkatan kelelahan jaringan.
     - `DANGER_ZONE` ($ACWR \ge 1.5$): Lonjakan beban berbahaya (*spike*), risiko cedera jaringan lunak meningkat 2–4 kali lipat.
   - Menyediakan fungsi `calculateSafeLoadCeiling`: menghitung batas beban aman maksimal agar sesi berikutnya tidak melompati angka $ACWR = 1.3$.

3. **Vladimir Issurin & Tudor Bompa Block Periodization Kernel (`issurinBlockPeriodizationKernel.ts`)**:
   - Mengembangkan *state machine* periodisasi blok modern dengan tiga fase bertingkat:
     - `ACCUMULATION`: Pengembangan fondasi aerobik, hipertrofi, dan kekuatan dasar (volume tinggi, intensitas sub-maksimal).
     - `TRANSMUTATION`: Transformasi kapasitas dasar ke daya tahan spesifik cabang olahraga, toleransi laktat, dan daya ledak (*power endurance*).
     - `REALIZATION`: Pemulihan superkompensasi, *tapering* volume 40–60%, pemeliharaan intensitas tinggi, dan kesiapan kompetisi.
   - Mengintegrasikan hukum masa paruh efek latihan sisa (*residual training effects*):
     - Daya tahan aerobik & Kekuatan maksimal: 30 hari ($\pm 5$ hari).
     - Daya tahan anaerobik / toleransi glikolitik: 18 hari ($\pm 4$ hari).
     - Kecepatan maksimal & daya ledak alaktat: 5 hari ($\pm 3$ hari).

---

### C. Sport Coordinator Router & Universal Safety Guard (`src/lib/domain/coach/agents/SportCoordinatorRouter.ts`)

1. **Dynamic Agent Registry & Singleton Router**:
   - Menyediakan registrasi runtime dinamis via `SportCoordinatorRouter.registerAgent(agent)`.
   - Menjamin isolasi penuh antar agen spesifik cabor.
2. **Universal Safety Circuit Breaker**:
   - Memvalidasi status cedera aktif dan skor nyeri (*joint pain score*):
     - Jika atlet melaporkan nyeri sendi ($\text{pain} \ge 1$) atau pembengkakan (*swelling* = true) pada area sendi terkait cabor, sirkuit pengaman otomatis memutus izin beban progresif (`progressiveOverloadAllowed = false`).
     - Merestriksi output preskripsi ke status `REHABILITATION_DELOAD` dengan restriksi benturan sendi tinggi.
3. **Fallback Grounded Ingress**:
   - Jika cabang olahraga yang dicatat belum memiliki agen terkalibrasi khusus dalam registry, sistem secara otomatis mengeksekusi *fallback* berbasis sains empiris (kalkulasi Foster Session-RPE dan evaluasi ACWR).
   - Menghasilkan preskripsi yang 100% berlandaskan data beban terukur, mencegah AI generatif mengarang angka atau menghasilkan halusinasi (*anti-AI-slop*).

---

### D. Skema Database & Dual Persistence Layer (`schema.sql`, `sportTelemetryRepo.ts`, `client.ts`)

1. **Skema PostgreSQL Tabel 18 (`schema.sql`)**:
   - Menambahkan tabel `sport_activity_telemetry`:
     ```sql
     CREATE TABLE IF NOT EXISTS sport_activity_telemetry (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
       sport_code VARCHAR(50) NOT NULL,
       sport_name VARCHAR(100) NOT NULL,
       cluster VARCHAR(50) NOT NULL,
       dominant_energy_system VARCHAR(50) NOT NULL,
       session_duration_minutes NUMERIC(8, 2) NOT NULL,
       rpe_borg_cr10 NUMERIC(3, 1) NOT NULL,
       session_load_au NUMERIC(10, 2) NOT NULL,
       heart_rate_avg NUMERIC(5, 1),
       heart_rate_max NUMERIC(5, 1),
       sport_specific_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
       athlete_feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
       prescription JSONB NOT NULL DEFAULT '{}'::jsonb,
       activity_date DATE NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     );
     CREATE INDEX IF NOT EXISTS idx_sport_activity_telemetry_user_sport 
       ON sport_activity_telemetry(user_id, sport_code, activity_date DESC);
     ```
2. **Migrasi Database Terotomasi (`scripts/migrations/migrate_sport_telemetry_schema.js`)**:
   - Skrip migrasi dieksekusi secara mulus pada PostgreSQL lokal, memvalidasi keberadaan tabel dan indeks.
3. **Dual Persistence Repository (`sportTelemetryRepo.ts`)**:
   - Mengimplementasikan `saveSportTelemetryRecord`, `getSportTelemetryByUserId`, dan `getSportTelemetryByActivityId`.
   - Mendukung fallback otomatis ke `.data/store.json` saat PostgreSQL tidak aktif, menjaga arsitektur *100% offline-first* tanpa dependensi cloud berbayar.

---

### E. Rangkaian Pengujian Otomatis (*Test Suite*) (`scripts/tests/test_multi_sport_coordinator.js`)

Membangun 13 unit test komprehensif yang memverifikasi seluruh komponen Phase 1:
- **Test 1–3**: Pengujian Foster Session-RPE (kalkulasi AU tunggal 315 AU, total beban mingguan 1605 AU, monotonitas 1.12, dan pemicu alarm *critical strain* pada beban tinggi monoton).
- **Test 4–6**: Pengujian Gabbett ACWR (*Sweet Spot* 0.8–1.3, deteksi *Underload*, dan penguncian *progressive overload* saat berada di *Danger Zone* $\ge 1.5$).
- **Test 7–8**: Pengujian Issurin Block Periodization (transisi fase *Accumulation* ke *Transmutation* dan retensi efek residual).
- **Test 9–11**: Pengujian Router & Agent Registry (*Fallback Grounded Ingress*, pemutusan sirkuit pada nyeri sendi, dan pendaftaran serta eksekusi agen mandiri Powerlifting).
- **Test 12–13**: Pengujian penyimpanan dan pembacaan telemetri di repositori basis data.

---

## 3. Matriks Perubahan Berkas (*File Matrix*)

| Lokasi Berkas | Status | Baris | Peran & Tanggung Jawab Arsitektural |
| :--- | :---: | :---: | :--- |
| `src/types/sportTelemetry.ts` | Baru | 67 | Kontrak tipe klaster, sistem energi, telemetri, dan preskripsi multi-sport. |
| `src/types/index.ts` | Modifikasi | 235 | Re-ekspor kontrak telemetri multi-sport ke interface global aplikasi. |
| `src/lib/domain/coach/agents/contracts.ts` | Baru | 63 | Antarmuka bersih `ISportCoachAgent` dan metadata agen terpisah. |
| `src/lib/domain/coach/kernels/fosterSessionRpeKernel.ts` | Baru | 96 | Engine kalkulasi beban internal Carl Foster Session-RPE, monotonitas, dan regangan. |
| `src/lib/domain/coach/kernels/gabbettAcwrKernel.ts` | Baru | 87 | Engine pencegahan cedera Tim Gabbett ACWR & kalkulator batas beban aman. |
| `src/lib/domain/coach/kernels/issurinBlockPeriodizationKernel.ts` | Baru | 89 | State machine periodisasi blok modern Issurin & Bompa serta efek residual. |
| `src/lib/domain/coach/agents/SportCoordinatorRouter.ts` | Baru | 135 | Router agen, circuit breaker keselamatan atlet, dan fallback grounded ingress. |
| `src/lib/db/sportTelemetryRepo.ts` | Baru | 144 | Dual-mode repository untuk persistensi data telemetri (PostgreSQL & JSON store). |
| `src/lib/db/client.ts` | Modifikasi | 173 | Inisialisasi skema store JSON lokal untuk entitas `sport_activity_telemetry`. |
| `src/lib/db/index.ts` | Modifikasi | 42 | Re-ekspor fungsi repositori telemetri ke namespace database aplikasi. |
| `schema.sql` | Modifikasi | 450 | Penambahan definisi DDL Tabel 18 `sport_activity_telemetry` dan indeks. |
| `scripts/migrations/migrate_sport_telemetry_schema.js` | Baru | 68 | Skrip migrasi skema tabel telemetri ke PostgreSQL lokal. |
| `scripts/tests/test_multi_sport_coordinator.js` | Baru | 260 | Rangkaian 13 automated tests untuk verifikasi menyeluruh Phase 1. |
| `package.json` | Modifikasi | 66 | Penambahan skrip `"test:coordinator"` dan integrasi ke dalam `"test:all"`. |

> **Audit Kepatuhan Arsitektur**: Seluruh berkas di dalam `src/` mematuhi batas arsitektural ketat dengan panjang **< 300 baris kode per berkas** (rentang 42 – 235 baris).

---

## 4. Hasil Pengujian & Jaminan Mutu (*Quality Gates*)

1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Errors / Clean Compile**.
2. **Automated Test Suite (`npm run test:all`)**:
   - Status: **101 Tests LULUS 100% (0 Gagal)**:
     - `test:health`: 31 passed
     - `test:coach`: 5 passed
     - `test:streak`: 21 passed
     - `test:bola`: 5 passed
     - `test:multi-week-recap`: 10 passed
     - `test:coordinator`: **13 passed (Suite Baru)**
     - `test:python`: 16 passed
3. **Next.js Production Build (`npm run build`)**:
   - Status: **Sukses 100% (Turbopack)**. Seluruh 34 rute aplikasi terkompilasi dan teroptimasi secara sempurna tanpa degradasi performa.

---

## 5. Dampak Sistem & Kesiapan Phase 2

Dengan rampungnya **Phase 1**, arsitektur backend kini memiliki fondasi ilmiah yang kokoh untuk mengorkestrasi 30+ agen cabang olahraga dunia. Seluruh data latihan non-GPS kini dapat diukur secara seragam menggunakan satuan beban internal (*Arbitrary Units*), terproteksi dari cedera berlebih oleh algoritma ACWR Gabbett, serta terstruktur rapi dalam siklus periodisasi blok modern.

Sistem siap dilanjutkan ke **Phase 2: Decoupled Endurance Flagship Agents (Running, Road Cycling, MTB XC)**.
