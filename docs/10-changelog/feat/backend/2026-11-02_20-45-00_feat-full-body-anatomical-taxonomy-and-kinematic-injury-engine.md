# Changelog: Full-Body Anatomical Taxonomy, Interactive Body Selector, and Kinematic Injury Engine (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-02 20:45:00 WIB
- **Tipe**: `feat(backend)` / `feat(domain)` / `feat(anatomy)` / `feat(health)`
- **Commit Message Rujukan**: `feat(backend): implement full-body anatomical taxonomy, interactive body selector, and adaptive kinematic injury engine`
- **Branch**: `refactor`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-02_20-45-00_feat-full-body-anatomical-taxonomy-and-kinematic-injury-engine.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum implementasi ini, modul pendaftaran riwayat cedera dan dossier kesehatan atlet memiliki beberapa keterbatasan struktural:

1. **Input Teks Mentah Statis (*Plain-Text Manual Entry*)**:
   - Kolom `AREA TUBUH (BODY REGION)` pada modal pendaftaran cedera hanya berupa input teks HTML biasa dengan nilai bawaan statis *"Right Ankle"*. Pengguna dipaksa mengetik nama anatomi secara manual tanpa panduan klinis, standarisasi nomenklatur medis, atau pengelompokan wilayah tubuh.
2. **Ketiadaan Pemetaan Anatomi Keseluruhan Tubuh (*Lack of Full-Body Coverage*)**:
   - Sistem belum memiliki katalog wilayah anatomi yang mencakup **seluruh tubuh manusia** (dari kepala, leher, bahu, lengan, tulang belakang, panggul, paha, lutut, betis, engkel, hingga telapak kaki).
   - Komponen visual peta anatomi di [InjuryDossierTab.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/InjuryDossierTab.tsx) sebelumnya hanya memuat tombol *hardcoded* untuk "Anterior Knees" dan "Right Ankle", sementara area tubuh bagian atas dan tulang belakang hanya berupa elemen teks mati yang tidak interaktif.
3. **Logika Evaluasi Kesiapan Latihan Kaku (*Static String Coupling in Readiness Engine*)**:
   - Modul kalkulasi kesiapan latihan ([readinessEngine.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/readinessEngine.ts)) mengandalkan teks kaku yang menyebut *"right ankle stability"* dan *"bilateral anterior knee response"*. Jika atlet mencatat cedera pada area lain (misal: *Hamstring*, *Punggung Bawah / Lumbar*, *Tendon Achilles*, atau *Bahu*), logika evaluasi tidak dapat mengklasifikasikan dampaknya terhadap olahraga lari atau sepeda secara dinamis.

Pembaruan ini menghadirkan **Full-Body Anatomical Architecture & Kinematics Engine** yang mengubah seluruh alur pencatatan dari sekadar ketikan teks menjadi sistem interaktif terstruktur yang memetakan seluruh tubuh dan mengkalkulasi dampak latihan secara deterministik.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Modul Taksonomi Anatomi Otoritatif Terpusat ([`src/lib/anatomyUtils.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/anatomyUtils.ts))

Dibuat berkas baru berukuran 480 baris yang mendefinisikan taksonomi anatomi manusia untuk kedokteran olahraga dan pelatihan atletik:

1. **Tipe Data & Interface Otoritatif**:
   ```typescript
   export type AnatomicalZoneKey =
     | 'head_neck'
     | 'upper_limb'
     | 'axial_spine'
     | 'pelvis_hip'
     | 'thigh'
     | 'knee'
     | 'lower_leg'
     | 'ankle_achilles'
     | 'foot_plantar';

   export interface AnatomicalRegionMeta {
     id: string;
     name: string;
     clinicalTerm: string;
     zoneKey: AnatomicalZoneKey;
     zoneLabel: string;
     allowedSides: ('RIGHT' | 'LEFT' | 'BILATERAL' | 'AXIAL')[];
     defaultSide: 'RIGHT' | 'LEFT' | 'BILATERAL' | 'AXIAL';
     isLowerExtremity: boolean;
     isAxial: boolean;
     isUpperExtremity: boolean;
     runningImpactSeverity: 'HIGH_RISK' | 'MODERATE' | 'LOW';
     cyclingImpactSeverity: 'SAFE_FLAT' | 'MODERATE_TORQUE' | 'RESTRICTED_AERO';
     suggestedMechanism: string;
     suggestedTimeframe: string;
     suggestedLimitations: string;
     trainingGuidance: {
       running: string;
       cycling: string;
       crossTraining: string;
     };
   }
   ```

2. **Katalog 18 Titik Struktur Anatomi Terkalibrasi**:
   - **Kepala & Leher**: *Kepala (Head / Concussion Monitoring)*, *Leher & Cervical Spine*.
   - **Bahu & Lengan**: *Bahu (Shoulder / Rotator Cuff)*, *Lengan Atas (Biceps/Triceps)*, *Siku (Elbow - Epicondylitis)*, *Pergelangan Tangan & Jari (Wrist & Hand)*.
   - **Punggung & Core (Aksial)**: *Punggung Atas (Thoracic Spine)*, *Punggung Bawah & Pinggang (Lumbar Spine L1-S1)*, *Dada & Tulang Rusuk (Ribs & Thorax)*.
   - **Panggul & Pinggul**: *Sendi Pinggul (Hip Joint / Labrum)*, *Selangkangan & Adduktor (Groin)*, *Perut & Core (Abdominal Complex)*.
   - **Paha Depan & Belakang**: *Paha Belakang (Hamstring)*, *Paha Depan (Quadriceps)*, *Sisi Luar Paha (ITB / Iliotibial Band)*.
   - **Sendi Lutut**: *Lutut Anterior (Bilateral Knees - Patellofemoral & Patellar Tendon)*, *Lutut Medial / Meniskus (MCL & Meniscus Medial)*.
   - **Tungkai Bawah & Betis**: *Tulang Kering (Shin Splints / Tibia MTSS)*, *Otot Betis (Gastrocnemius / Soleus)*.
   - **Engkel & Tumit**: *Engkel Kanan (Right Ankle - ATFL/CFL)*, *Tendon Achilles (Achilles Tendinopathy)*.
   - **Telapak Kaki**: *Telapak Kaki (Plantar Fascia)*, *Jari Kaki & Metatarsal (Forefoot)*.

3. **Fungsi Resolusi Semantik Cerdas (`getAnatomicalRegion`)**:
   - Mendukung pencocokan ID langsung, nama bahasa Indonesia, terminologi klinis, maupun pencocokan *fuzzy substring*.
   - Jika pengguna memasukkan nama kustom baru di luar preset, sistem secara otomatis menghasilkan objek `AnatomicalRegionMeta` adaptif dengan klasifikasi kinematika (tungkai bawah vs tubuh atas) sehingga aplikasi tidak mengalami *runtime error*.

---

### B. Antarmuka Pemilih Anatomi Interaktif ([`src/components/health/hub/NewInjuryForm.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/NewInjuryForm.tsx))

Komponen form telah dirombak secara menyeluruh:

1. **Pills Filter Zona Anatomi**:
   - Tombol seleksi cepat: `🌐 Semua Tubuh`, `Kepala & Leher`, `Bahu & Lengan`, `Punggung & Core`, `Panggul & Pinggul`, `Paha`, `Lutut`, `Tungkai Bawah & Betis`, `Engkel & Achilles`, `Telapak Kaki`, serta `✍️ Area Kustom...`.
2. **Visual Grid Wilayah Tubuh**:
   - Setiap wilayah anatomi ditampilkan dalam kartu interaktif dengan lencana kinematika:
     - `Hentakan Lari` (merah): Wilayah beban gravitasi tinggi saat lari.
     - `Postur Spinal` (amber): Wilayah sensitif terhadap kompresi dan posisi bungkuk sepeda.
     - `Upper Body` (hijau): Wilayah bebas beban impak kaki.
3. **Sinkronisasi Sisi Tubuh Otomatis (*Smart Side Constraint*)**:
   - Memilih area aksial (Punggung Bawah, Leher, Kepala, Core) otomatis mengunci sisi ke `Punggung/Tengah (AXIAL)`.
   - Memilih anggota gerak (Lutut, Engkel, Bahu, Paha, Betis) mengaktifkan pilihan `Kanan (RIGHT)`, `Kiri (LEFT)`, atau `Kedua Sisi (BILATERAL)`.
4. **Auto-Complete Templat Klinis (*Smart Template Suggestion*)**:
   - Memilih bagian tubuh otomatis mengisi kolom *Mekanisme Cedera*, *Rentang Waktu*, dan *Keterbatasan Fungsional* dengan deskripsi medis yang realistis, yang tetap bebas disesuaikan atau diedit oleh atlet.
5. **HUD Simulasi Dampak Latihan Langsung (*Live Biomechanical Simulation HUD*)**:
   - Memberikan transparansi seketika kepada atlet mengenai dampak cedera terhadap izin latihan lari dan sepeda sebelum tombol simpan ditekan.
6. **Proteksi Respons Server (*Safe Response Parsing*)**:
   - Menggunakan `res.text()` dan `JSON.parse()` dengan proteksi *try-catch* untuk memastikan tidak ada lagi error *unexpected end of JSON*.

---

### C. Peta Anatomi Dinamis Seluruh Tubuh di Dossier ([`src/components/health/hub/InjuryDossierTab.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/InjuryDossierTab.tsx))

1. **Peta Kolom Kiri Berbasis 9 Zona Anatomi**:
   - Memindai seluruh array `injuries` secara dinamis.
   - Wilayah yang memiliki cedera aktif ditandai dengan indikator merah muda berdenyut (`#FF2A6D`), tingkat keparahan (*Ringan*, *Sedang*, *Berat*), serta panduan olahraga (*Lari Ditunda • Sepeda Flat Aman*).
   - Wilayah yang tidak mengalami cedera disajikan sebagai baris tenang berlabel hijau `BEBAS GEJALA / STABIL`.
2. **Koneksi Alur Cepat (*1-Click Prefill Workflow*)**:
   - Mengklik area tubuh yang bebas gejala menampilkan status konfirmasi stabilitas sendi pada kolom kanan dan menyediakan tombol cepat **`+ Daftarkan Gejala di Area Ini`**.
   - Tombol tersebut otomatis membuka `NewInjuryForm` dengan area tubuh yang bersangkutan telah terisi secara *pre-filled*.

---

### D. Penyelarasan Kesiapan Latihan Lintas Tubuh ([`src/lib/readinessEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/readinessEngine.ts))

Fungsi [`evaluateTrainingReadiness`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/readinessEngine.ts#L17) kini mengadopsi klasifikasi dinamis dari `getAnatomicalRegion`:
1. **Analisis Cedera Tungkai Bawah (*Lower Extremity*)**:
   - Jika terdapat cedera aktif pada kaki/tungkai bawah, sistem mengunci status lari `runningReadiness = 'ON_HOLD'` dan menyusun alasan klinis dinamis yang menyebutkan seluruh nama bagian tubuh yang terdampak.
2. **Analisis Cedera Aksial / Tulang Belakang (*Axial & Spine*)**:
   - Mengizinkan lari santai permukaan halus (*CONDITIONAL*) dan menambahkan restriksi postur *aero tuck* pada sepeda.
3. **Analisis Anggota Tubuh Atas (*Upper Limb*)**:
   - Meloloskan lari dan membatasi tarikan stang sprint atau renang.
4. **Pencegahan Restriksi Medis Semu**:
   - Pada [src/lib/db/healthRepo.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/healthRepo.ts#L531-L535), restriksi mandatoris kini diverifikasi hanya berlaku untuk data yang berstatus `CLINICIAN_VERIFIED`, sehingga catatan mandiri atlet (`ATHLETE_ENTERED`) tidak secara keliru memicu status *UNDER_ACTIVE_REHAB*.

---

## 3. Matriks Perubahan Berkas

| Berkas | Jenis Perubahan | Deskripsi Singkat |
|---|---|---|
| `src/lib/anatomyUtils.ts` | **Berkas Baru** | Taksonomi anatomi tubuh lengkap (9 zona, 18 struktur), metadata kinematika olahraga, templat klinis, dan fungsi parser semantik. |
| `src/components/health/hub/NewInjuryForm.tsx` | Modifikasi Total | Penggantian input teks statis dengan pemilih anatomi interaktif, pills zona, kartu visual, constraint sisi otomatis, dan HUD simulasi. |
| `src/components/health/hub/InjuryDossierTab.tsx` | Modifikasi | Peta anatomi dinamis melingkupi 9 zona tubuh, pemantauan cedera aktif, tampilan status stabil, dan tombol 1-klik buka form baru. |
| `src/components/health/AthleteHealthHub.tsx` | Modifikasi | Menghubungkan state `prefillRegion` antara tab dossier dan form pendaftaran cedera baru. |
| `src/lib/readinessEngine.ts` | Modifikasi | Evaluasi kesiapan latihan multi-sport adaptif berbasis klasifikasi zona anatomi (tungkai bawah, aksial, ekstremitas atas). |
| `src/lib/db/healthRepo.ts` | Modifikasi | Filter `CLINICIAN_VERIFIED` pada evaluasi restriksi klinis dan pembersihan fallback restriksi semu. |
| `src/app/api/athlete/medical-procedure/route.ts` | Modifikasi | Normalisasi parameter restriksi medis klinis tanpa injeksi *string default* sewenang-wenang. |

---

## 4. Verifikasi & Hasil Pengujian

### A. Pengujian Kompilasi TypeScript
```bash
npx tsc --noEmit
# Exit Code: 0 (Zero errors)
```

### B. Pengujian Regression Test Suites
1. **Athlete Health & Injury-Aware Readiness Suite (`scripts/test_athlete_health_system.js`)**:
   - **32 PASSED, 0 FAILED**
   - Baseline biometrik 22 thn / 170 cm / 65 kg / RHR 68 bpm terverifikasi.
   - Ambang sensorik fisiologis (HRmax, LTHR, FTP, VO2max) tetap strictly UNKNOWN (tidak terfabrikasi).
   - 2 dossier cedera otoritatif (*Right Ankle* & *Bilateral Anterior Knees*) terpantau presisi.
   - Kesiapan lari *ON_HOLD*, sepeda *CONDITIONAL* (asimetris toleransi non-impak).
   - Audit trail kesehatan terverifikasi.
2. **Coach Training & Grounded Indicator Suite (`scripts/test_coach_training_system.js`)**:
   - **5 PASSED, 0 FAILED**
   - Active Training Plan, jadwal latihan terkalibrasi, workout-activity matching Strava, dan target Century/Marathon terverifikasi penuh.

### C. Pengujian Runtime Endpoint & Rendering Halaman
- `GET http://localhost:3000/health`: Mengembalikan **`HTTP 200 OK`** tanpa runtime crash.
- `POST /api/athlete/injuries`: Teruji mampu menerima pendaftaran cedera dinamis di seluruh titik anatomi tubuh baru (misal: *Hamstring*, *Lumbar Spine*, *Achilles*) dengan kalkulasi kesiapan latihan otomatis.

