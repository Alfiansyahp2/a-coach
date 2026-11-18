# Changelog: Decoupled Endurance Flagship Agents & Multi-Sport Activity Ingestion (`feat/strava-activity-ingestion`)

- **Tanggal & Waktu**: 2026-11-18 11:45:00 WIB
- **Tipe**: `feat(strava)` / `feat(domain)` / `feat(ai-coaching)` / `feat(ingestion)` / `refactor(agents)`
- **Commit Message Rujukan**: `feat(strava-activity-ingestion): implement decoupled endurance flagship agents, multi-sport activity ingestion, and clinical safety gates (phase 2)`
- **Branch**: `feat/strava-activity-ingestion`
- **Lokasi**: `docs/10-changelog/feat/strava-activity-ingestion/2026-11-18_11-45-00_feat-decoupled-endurance-flagship-agents-and-multi-sport-ingestion.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum implementasi ini, proses ingesti aktivitas dari Strava API (`Ride`, `Run`, `VirtualRide`, `MountainBikeRide`, `GravelRide`) diproses secara umum ke dalam tabel `activities` tanpa memiliki *intelligence layer* khusus yang mampu mengevaluasi kinematika, sistem energi, dan batas keselamatan biomekanika spesifik tiap cabang olahraga:

1. **Penyatuan Logika Monolitik (*Monolithic Coupling*)**:
   - Seluruh logika evaluasi latihan sebelumnya tertumpuk di dalam `aiCoachEngine.ts`, mencampuradukkan aturan lari dan bersepeda ke dalam satu fungsi generik. Hal ini menyebabkan risiko halusinasi AI (*AI hallucinations / AI slop*) serta kesulitan memperluas logika ke cabor-cabor spesifik lain di dunia.
2. **Ketiadaan Pemisahan Disiplin Bersepeda (*Road vs Mountain Bike*)**:
   - Aktivitas sepeda gunung (*MountainBikeRide* / MTB XC) diperlakukan sama persis dengan sepeda jalan raya (*Road Cycling*), mengabaikan faktor tanjakan berkadens rendah berdaya torsi ekstrem (*low cadence high-torque climbing*), laju pendakian vertikal (*VAM - Vertical Ascent in Meters/Hour*), dan risiko cedera traumatik benturan jatuh (*crash / clavicle trauma*).
3. **Ketiadaan Protokol Terstruktur Rehabilitasi Lari (*Return-to-Run / RTR*)**:
   - Sesi lari (*Run*) tidak memiliki integrasi protokol *Return-to-Run (RTR)* 4-fase untuk atlet yang sedang dalam pemulihan cedera tungkai bawah (*Right Ankle ATFL sprain* dan *Bilateral Anterior Knee Pain*), serta belum ada pembatas kenaikan volume mingguan otomatis (*10% Rule Volume Limiter*).
4. **Ketiadaan API Endpoint Terdedikasi untuk Evaluasi Telemetri Multi-Cabor**:
   - Platform memerlukan rute API terstandarisasi untuk menerima telemetri aktivitas (baik hasil ingesti Strava maupun input manual) dan mengarahkannya ke agen cabor yang tepat dengan proteksi otorisasi *Broken Object Level Authorization (BOLA)*.

Pembaruan **Phase 2** ini menghadirkan **tiga agen cabor endurance terpisah (*Decoupled Endurance Flagship Agents*)**, penyelarasan router berbasis alias Strava, dan endpoint REST API `/api/coach/multi-sport` yang terintegrasi langsung dengan lapisan persistensi telemetri.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Tiga Agen Flagship Cabor Endurance Mandiri (`src/lib/domain/coach/agents/`)

Setiap agen mengimplementasikan kontrak `ISportCoachAgent` secara terisolasi tanpa saling ketergantungan:

1. **Distance Running Coach Agent (`DistanceRunningCoachAgent.ts`)**:
   - Berkas mandiri berukuran 195 baris yang berfokus pada lari jarak menengah hingga maraton.
   - **Metrik Khusus**: Jarak (km), kecepatan rerata (*mps / pace*), kadens langkah (*SPM*), elevasi, dan fase rehabilitasi `rtrPhase`.
   - **Return-to-Run (RTR) 4-Fase**:
     - *Fase 1*: Evaluasi toleransi jalan cepat 30 menit tanpa nyeri.
     - *Fase 2*: Protokol interval jalan-joging (rasio 1:2, maks 20 menit).
     - *Fase 3*: Lari santai kontinu aerobik Zone 2 (maks 25-30 menit, kontur datar).
     - *Fase 4*: Beban lari penuh tanpa restriksi klinis.
   - **Biological Circuit Breaker**:
     - Jika atlet melaporkan nyeri sendi ($\text{pain} \ge 1$), bengkak, atau instabilitas pada pergelangan kaki / lutut, sirkuit keselamatan langsung mengunci progresi beban (`is_progressive_overload_allowed = false`), melarang lari turunan (*downhill*), plyometrics, dan sprint, serta mengarahkan ke *cross-training low-impact* (sepeda Zone 2 flat atau renang).
   - **Evaluasi Biomekanika Kadens**:
     - Memeriksa kadens langkah: jika $< 160$ SPM, agen memberikan instruksi bertahap menuju $170-180$ SPM untuk mereduksi gaya reaksi tanah (*ground reaction force*) dan gaya pengereman lutut.
   - **Aturan Progresi Volume 10%**:
     - Menghitung rasio kenaikan jarak mingguan terhadap minggu sebelumnya; memicu peringatan stabilisasi jika kenaikan $> 10-15\%$.

2. **Road Cycling Coach Agent (`RoadCyclingCoachAgent.ts`)**:
   - Berkas mandiri berukuran 186 baris yang berfokus pada balap sepeda jalan raya.
   - **Metrik Khusus**: Daya rerata (*Watts*), Normalized Power (*NP*), rasio $W/\text{kg}$, persentase FTP, kadens (*RPM*), dan pengeluaran energi (*work kJ*).
   - **Kalkulasi Rasio Daya & FTP (Andy Coggan)**:
     - Menghitung rasio $W/\text{kg} = \frac{\text{Watts}}{\text{Berat Badan}}$ dan persentase intensitas terhadap batas ambang fungsional (% FTP).
   - **Efisiensi Kadens Pedal**:
     - Mengidentifikasi *gear grinding* kadens rendah ($< 75$ RPM pada lintasan datar) yang meningkatkan gaya tekan patelofemoral lutut dan menghabiskan glikogen otot lebih cepat. Menginstruksikan kadens efisien $85-95$ RPM.
   - **Preskripsi Karbohidrat & Glikogen Bertingkat (Asker Jeukendrup 2014)**:
     - Durasi $\le 90$ menit: $30\text{g/jam}$.
     - Durasi $90 - 150$ menit: $60\text{g/jam}$.
     - Durasi $> 150$ menit ($> 2.5$ jam): $75\text{g/jam}$ karbohidrat campuran glukosa:fruktosa.
   - **Kompatibilitas Sendi Beban Tertutup (*Closed-Chain Advantage*)**:
     - Memanfaatkan sifat non-benturan sepeda untuk memelihara kapasitas aerobik mitokondria atlet yang sedang dibatasi lari.

3. **Mountain Bike XC Coach Agent (`MtbXcCoachAgent.ts`)**:
   - Berkas mandiri berukuran 190 baris yang menangani sepeda gunung lintas alam dan gravel.
   - **Metrik Khusus**: Elevasi kumulatif, tanjakan terjal (*steep climb*), kadens rerata, laju pendakian vertikal (*VAM*), dan kelelahan vibrasi (*trail vibration RPE*).
   - **Proteksi Sendi Patela pada Tanjakan Terjal**:
     - Mendeteksi tanjakan terjal dengan putaran pedal lambat ($< 70$ RPM) pada atlet dengan riwayat keluhan lutut; otomatis mengunci beban tanjakan ekstrem (*out-of-saddle torque mashing*) dan merekomendasikan rasio sprocket teringan atau rute datar.
   - **Kalkulasi Laju Elevasi Vertikal (VAM)**:
     $$VAM = \frac{\text{Elevation Gain (m)} \times 60}{\text{Waktu Pendakian (menit)}}$$
   - **Emergency Safety Halt (Trauma Jatuh / Crash)**:
     - Memeriksa catatan keluhan jatuh dari sepeda (*crash*); memicu penghentian darurat untuk skrining fraktur tulang selangka (*clavicle*), dislokasi bahu, dan gegar otak (*concussion*).
   - **Analisis Kelelahan Penanganan Teknis (*Arm Pump Fatigue*)**:
     - Menilai kelelahan neuromuskular ekstremitas atas akibat getaran medan berbatu/berakar.

---

### B. Sport Coordinator Router & Penyelarasan Alias Ingesti Strava (`SportCoordinatorRouter.ts`)

1. **Resolusi Cabor Berbasis Alias Strava**:
   - Meningkatkan fungsi `getAgent(sportCode)` dan `hasAgent(sportCode)` pada `SportCoordinatorRouter`:
     - Selain pencocokan kode standar (`SPORT_DISTANCE_RUNNING`, `SPORT_ROAD_CYCLING`, `SPORT_MTB_XC`), router secara otomatis menguji metode `agent.canHandle(sportCode)`.
     - Ingesti Strava dengan `sport_type` seperti `'Run'`, `'Ride'`, `'VirtualRide'`, `'MountainBikeRide'`, `'GravelRide'`, atau `'TRAIL_RUN'` langsung terpetakan ke agen spesialis yang sesuai tanpa modifikasi payload.
2. **Auto-Registration Bootstrap (`src/lib/domain/coach/agents/index.ts`)**:
   - Fungsi `registerDefaultEnduranceAgents` otomatis mendaftarkan ketiga agen flagship ke singleton `sportCoordinatorRouter` saat modul dimuat.

---

### C. Multi-Sport API Endpoint Terproteksi BOLA (`src/app/api/coach/multi-sport/route.ts`)

Berkas baru berukuran 100 baris yang menyediakan antarmuka REST API:
1. **`GET /api/coach/multi-sport`**:
   - Menerima parameter `?mode=agents` untuk mengembalikan daftar seluruh agen yang aktif terdaftar beserta metadata klaster dan standar sains olahraganya.
   - Mengambil riwayat telemetri multi-sport terverifikasi untuk pengguna terautentikasi.
2. **`POST /api/coach/multi-sport`**:
   - Memvalidasi parameter wajib (`sportCode`, `durationMinutes`, `sessionRpe`).
   - Meneruskan payload ke `sportCoordinatorRouter.dispatchTelemetry(payload)`.
   - Menyimpan hasil preskripsi dan beban sesi ke tabel PostgreSQL `sport_activity_telemetry` via `saveSportActivityTelemetry`.
   - Mengembalikan respons JSON berisikan `prescription` terperinci dan `recordId`.
3. **Proteksi Otorisasi BOLA**:
   - Seluruh pemanggilan diverifikasi oleh `verifyUserAuthorization(request)` dengan token sesi kriptografis HMAC-SHA256.

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/domain/coach/agents/DistanceRunningCoachAgent.ts` | Baru | +195 | 0 | Agen Lari Jarak Jauh: RTR 4-fase, 10% volume limiter, ATFL circuit breaker, kadens SPM |
| `src/lib/domain/coach/agents/RoadCyclingCoachAgent.ts` | Baru | +186 | 0 | Agen Balap Sepeda: Daya W/kg, Coggan FTP, kadens 85-95 RPM, nutrisi Jeukendrup |
| `src/lib/domain/coach/agents/MtbXcCoachAgent.ts` | Baru | +190 | 0 | Agen Sepeda Gunung: Torsi tanjakan, VAM vertikal, emergency crash halt, patella safety |
| `src/lib/domain/coach/agents/index.ts` | Baru | +32 | 0 | Barrel export modul agen & fungsi auto-register default endurance agents |
| `src/lib/domain/coach/index.ts` | Baru | +10 | 0 | Barrel export terpadu seluruh engine coaching, agen, dan shared kernels |
| `src/app/api/coach/multi-sport/route.ts` | Baru | +100 | 0 | Endpoint REST API multi-sport (GET agents/records & POST dispatch preskripsi) |
| `src/lib/domain/coach/agents/SportCoordinatorRouter.ts` | Modifikasi | +16 | -7 | Dukungan pencocokan alias dinamis (`canHandle`) untuk ingesti Strava |
| `src/lib/domain/coach/agents/contracts.ts` | Modifikasi | +5 | 0 | Penambahan metode `canHandle(sportCode: string)` pada interface `ISportCoachAgent` |
| `scripts/tests/test_endurance_flagship_agents.js` | Baru | +272 | 0 | Suite pengujian otomatis 21 test case untuk ketiga agen endurance dan router |
| `package.json` | Modifikasi | +2 | -1 | Penambahan skrip `"test:endurance"` dan integrasi ke dalam `"test:all"` |

> **Audit Kepatuhan Arsitektur**: Seluruh berkas baru dan termodifikasi di dalam `src/` mematuhi batas ketat arsitektur dengan panjang **< 300 baris kode per berkas** (rentang 10 – 195 baris).

---

## 4. Hasil Pengujian & Jaminan Mutu

### A. Rangkaian Pengujian Otomatis (`npm run test:all`)
Total **122 Tests LULUS 100% (0 Gagal)**:
- `test:health`: **31 passed** (Profil kesehatan atlet, batas diagnostik patelofemoral, status kesiapan)
- `test:coach`: **5 passed** (Struktur target, program latihan, pencocokan sesi)
- `test:streak`: **21 passed** (Termodinamika api streak, transisi tahapan temperatur)
- `test:bola`: **5 passed** (Integritas token kriptografis & blokir serangan akses ilegal)
- `test:multi-week-recap`: **10 passed** (Otomatisasi Senin 00:00, mesosiklus 4-minggu, deload)
- `test:coordinator`: **13 passed** (Foster sRPE, Gabbett ACWR, Issurin periodization, fallback ingress)
- `test:endurance` (Suite Baru): **21 passed** (Verifikasi 3 agen endurance dan dispatch router)
- `test:python`: **16 passed** (FastAPI pytest Banister engine & streak calculator)

### B. Pemeriksaan Kompilasi TypeScript (`npx tsc --noEmit`)
- **Status**: `Exit code 0` (0 Errors, 100% Type-Safe).

### C. Build Produksi Next.js Turbopack (`npm run build`)
- **Status**: Berhasil mengompilasi dan mengoptimasi seluruh **35 rute aplikasi** (`35/35 routes generated`), termasuk `/api/coach/multi-sport`.

---

## 5. Dampak Sistem & Kesiapan Phase 3

Dengan rampungnya **Phase 2**, seluruh aktivitas lari dan bersepeda yang masuk melalui sinkronisasi Strava kini langsung ditangani oleh agen spesialis yang berlandaskan sains olahraga teruji. Pemisahan tanggung jawab ini mengeliminasi ketergantungan pada prompt monolitik dan memastikan atlet dengan gejala cedera sendi mendapatkan instruksi protektif yang aman secara klinis.

Sistem siap dilanjutkan ke **Phase 3: Klaster Kekuatan & Daya Maksimal (Powerlifting, Weightlifting, Calisthenics, Strongman, Bodybuilding)**.
