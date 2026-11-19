# Changelog: Decoupled Strength, Power & Hypertrophy Multi-Sport AI Agents (Phase 3)

- **Tanggal & Waktu**: 2026-11-18 12:49:00 WIB
- **Tipe**: `feat(domain)` / `feat(strength)` / `feat(ai-coaching)` / `feat(sports-science)`
- **Commit Message Rujukan**: `feat(strength): implement decoupled strength, power, and hypertrophy ai agents, 1RM Brzycki kernel, and Sheiko INOL limiter (phase 3)`
- **Branch**: `feat/strava-activity-ingestion`
- **Lokasi**: `docs/10-changelog/feat/strava-activity-ingestion/2026-12-49-00_feat-strength-power-and-hypertrophy-multi-sport-agents-phase-3.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum implementasi ini, platform analitik atletik `project_strava` sangat condong pada cabor aerobik siklik (lari dan sepeda). Ketika atlet mencatatkan sesi latihan beban di gym, angkat besi, kalistenik, atau binaraga, sistem mengalami kekosongan komputasi fisiologis:

1. **Ketidaksesuaian Model Beban Aerobik untuk Olahraga Kekuatan**:
   - Metrik daya tahan seperti jarak (km), kecepatan (pace/kmh), atau TRIMP Banister tidak relevan untuk mengukur beban neuromuskular olahraga kekuatan yang didominasi jalur energi fosfagen ATP-PCr dan glikolitik laktat berdurasi singkat ($1 - 45\text{ detik}$).
2. **Ketiadaan Formula Kekuatan Maksimal (1RM) & Beban Volume (Tonase)**:
   - Platform belum memiliki mesin komputasi matematis tervalidasi untuk memproyeksikan kekuatan maksimal 1RM (*One-Rep Max*) dari set sub-maksimal tanpa memaksa atlet melakukan angkatan berbahaya ke titik kegagalan saraf (*true 1RM test failure*).
3. **Ketiadaan Pembatas Kelelahan Sistem Saraf Pusat (*CNS Fatigue Limiter*)**:
   - Latihan kekuatan intensitas tinggi ($\ge 80\% \text{ 1RM}$) mengakibatkan kelelahan sistem saraf pusat yang jauh melampaui kelelahan otot lokal. Tanpa algoritma pembatas seperti rasio INOL (*Intensity $\times$ Number of Lifts*), atlet berisiko tinggi mengalami *overtraining neuroendokrin* dan cedera avulsi tendon.
4. **Ketiadaan Deteksi Batas Biomekanika & *Junk Volume***:
   - Tidak ada pengaman biomekanika untuk mencegah cedera kompresi aksial tulang belakang (*lumbar spine L4-S1*), robekan tendon biseps distal, epikondilitis siku pada tuas kalistenik lengan lurus, maupun titik jenuh hipertrofi (*junk volume*) yang melebihi kapasitas sintesis protein otot.

Pembaruan **Phase 3** ini mengeksekusi arsitektur dari [docs/11-ai/07-ROADMAP_IMPLEMENTASI_BERTAHAP.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/07-ROADMAP_IMPLEMENTASI_BERTAHAP.md), membangun **Shared Strength Calculators Kernel** terpadu dan **lima agen cabor kekuatan independen (*Decoupled Strength & Power Agents*)**.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Shared Strength Calculators Kernel (`src/lib/domain/coach/kernels/strengthCalculatorsKernel.ts`)

Berkas baru berukuran 178 baris yang mengisolasi seluruh kalkulasi kekuatan neuromuskular tervalidasi sains olahraga:

1. **Formula Estimasi 1RM Brzycki (Matt Brzycki, 1993)**:
   - Menghitung proyeksi 1RM dari repetisi sub-maksimal ($\le 10$ reps):
     $$\text{1RM} = \text{Beban (kg)} \times \frac{36}{37 - \text{Reps}}$$
   - Memberikan klasifikasi validitas empiris:
     - Repetisi $1$: `DIRECT_1RM` (akurasi $100\%$).
     - Repetisi $\le 5$: `HIGH_VALIDITY`.
     - Repetisi $6 - 10$: `MODERATE_ESTIMATION`.
     - Repetisi $> 10$: `POOR_VALIDITY_HIGH_REPS` (akibat interferensi laktat anaerobik).
2. **Kalkulasi Volume Load (Tonase)**:
   $$\text{Tonnage} = \sum (\text{Sets} \times \text{Reps} \times \text{Beban})$$
3. **Kalkulator INOL (Intensity $\times$ Number of Lifts - Boris Sheiko & Hales 2010)**:
   $$\text{INOL} = \frac{\text{Jumlah Repetisi}}{100 - \%1\text{RM}}$$
   - Kategori beban sesi:
     - $< 0.4$: `VERY_LIGHT` (pemulihan aktif atau deload).
     - $0.4 - 1.0$: `OPTIMAL_WORK` (zona ideal adaptasi kekuatan).
     - $1.0 - 2.0$: `HARD_OVERLOAD` (sesi beban berat, butuh rest $\ge 48-72$ jam).
     - $> 2.0$: `EXCESSIVE_CNS_STRAIN` (kelelahan saraf pusat berlebih, wajib deload).
4. **Pemetaan RIR ke RPE Borg-Zourdos (Michael Zourdos et al., 2016)**:
   - Konversi matematis dua arah antara *Rating of Perceived Exertion (RPE)* skala 1–10 dan *Reps in Reserve (RIR)*.

---

### B. Lima Agen Cabor Mandiri Klaster Kekuatan & Daya Maksimal (`src/lib/domain/coach/agents/`)

1. **Powerlifting Coach Agent (`PowerliftingCoachAgent.ts`)**:
   - Berkas mandiri berukuran 224 baris untuk *Squat*, *Bench Press*, dan *Deadlift*.
   - **Metrik Khusus**: Pola gerak utama, set kerja, estimasi 1RM, RIR, dan kecepatan barbel.
   - **Spinal Circuit Breaker**: Mendeteksi keluhan fleksi lumbal atau nyeri kolumna vertebra; mengunci beban aksial berat ($>75\%$ 1RM) dan merekomendasikan protokol dekompresi *McGill Big 3* (Bird-Dog, Curl-Up, Side Plank).
   - **INOL CNS Fatigue Guard**: Memutus izin beban progresif jika akumulasi INOL sesi melebihi $2.0$.

2. **Olympic Weightlifting Coach Agent (`OlympicWeightliftingCoachAgent.ts`)**:
   - Berkas mandiri berukuran 219 baris untuk angkat besi Olimpiade (*Snatch* dan *Clean & Jerk*).
   - **Metrik Khusus**: Kecepatan gerak barbel (*bar velocity m/s*), kedalaman tangkapan (*catch depth*), dan tingkat kegagalan angkatan (*miss rate %*).
   - **Deteksi Kerusakan Koordinasi Kecepatan-Kekuatan**: Jika *miss rate* sesi melebihi $35\%$, agen mendeteksi kelelahan neuromuskular sepersekian detik dan menginstruksikan penurunan intensitas ke zona teknis ($70-75\%$).
   - **Wrist Sprain Circuit Breaker**: Mengunci posisi *catch overhead* saat nyeri pergelangan tangan terdeteksi, mengalihkan ke *Clean Pulls / Snatch Pulls*.

3. **Calisthenics & Street Workout Coach Agent (`CalisthenicsCoachAgent.ts`)**:
   - Berkas mandiri berukuran 202 baris untuk kekuatan beban tubuh dan tuas keahlian statis (*Planche*, *Front Lever*, *Muscle Up*).
   - **Metrik Khusus**: Tingkat progresi tuas biomekanika (Tuck $\to$ Adv Tuck $\to$ Straddle $\to$ Full), *Time Under Tension (TUT)*, dan regangan sendi siku.
   - **Elbow Tendon Safety Breaker**: Mengidentifikasi bahwa adaptasi tendon memerlukan waktu 4–6 kali lebih lambat dibanding otot; mengunci variasi tuas lengan lurus saat nyeri tendon biseps distal / epikondilitis terdeteksi, mengalihkan ke *bent-arm pulls/pushes* bebas nyeri.

4. **Strongman & Heavy Carries Coach Agent (`StrongmanCoachAgent.ts`)**:
   - Berkas mandiri berukuran 189 baris untuk event beban aksial berat (*Farmers Walk*, *Yoke Walk*, *Log Press*, *Atlas Stone*).
   - **Metrik Khusus**: Beban bawaan, jarak langkah, kompresi aksial, dan unit kerja $(\text{Beban} \times \text{Jarak} / 100)$.
   - **Biceps Tear & Axial Compression Prevention**: Melarang keras teknik tekuk lengan (*bent-arm lifting*) pada batu atlas atau deadlift *mixed-grip* tanpa strap guna mencegah ruptur tendon biseps. Menginstruksikan jeda pemulihan $72-96$ jam penuh untuk kolumna vertebra.

5. **Bodybuilding & Hypertrophy Coach Agent (`BodybuildingCoachAgent.ts`)**:
   - Berkas mandiri berukuran 202 baris untuk rekayasa hipertrofi otot rangka berbasis sains Brad Schoenfeld.
   - **Metrik Khusus**: Kelompok otot target, jumlah *hard sets* (set yang dibawa ke RIR 0–3), dan skor stres metabolik (*pump score*).
   - **Junk Volume Limiter**: Memicu peringatan jika satu sesi melebihi 10 *hard sets* untuk kelompok otot yang sama guna mencegah pemborosan energi anabolik.
   - **Preskripsi Nutrisi MPS (ISSN Position Stand)**: Protein $1.6 - 2.2\text{ g/kg}$ terbagi rata $4-5$ kali makan ($0.4\text{ g/kg}$ per makan) dengan ambang leusin $\ge 2.7\text{ gram}$.

---

### C. Pendaftaran Otomatis & Penyelarasan Router (`SportCoordinatorRouter.ts` & `index.ts`)

- Seluruh 5 agen kekuatan baru didaftarkan secara otomatis melalui fungsi `registerDefaultStrengthAgents()` di [src/lib/domain/coach/agents/index.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/agents/index.ts).
- Router kini mengorkestrasi total **8 agen cabor independen terkalibrasi** (3 Endurance + 5 Kekuatan).
- Seluruh endpoint dispatching dan REST API `/api/coach/multi-sport` kini mendukung kode olahraga maupun alias umum (*SBD, powerlifting, weightlifting, Snatch, calisthenics, strongman, bodybuilding, hypertrophy*).

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/domain/coach/kernels/strengthCalculatorsKernel.ts` | Baru | +178 | 0 | Kernel sains bersama: 1RM Brzycki, Volume Load Tonase, & Kalkulator INOL |
| `src/lib/domain/coach/agents/PowerliftingCoachAgent.ts` | Baru | +224 | 0 | Agen Powerlifting: SBD, estimasi 1RM, batasan INOL, & spinal circuit breaker |
| `src/lib/domain/coach/agents/OlympicWeightliftingCoachAgent.ts` | Baru | +219 | 0 | Agen Angkat Besi: Kecepatan barbel, deteksi miss rate >35%, & wrist safety |
| `src/lib/domain/coach/agents/CalisthenicsCoachAgent.ts` | Baru | +202 | 0 | Agen Kalistenik: Steven Low lever mechanics, TUT, & elbow tendon safety |
| `src/lib/domain/coach/agents/StrongmanCoachAgent.ts` | Baru | +189 | 0 | Agen Strongman: Heavy carries work units, pencegahan ruptur biseps, & recovery aksial |
| `src/lib/domain/coach/agents/BodybuildingCoachAgent.ts` | Baru | +202 | 0 | Agen Binaraga: Schoenfeld hypertrophy guidelines, junk volume limiter, & protein MPS |
| `src/lib/domain/coach/agents/index.ts` | Modifikasi | +37 | -3 | Registrasi otomatis 5 agen kekuatan & ekspor modul barrel agen |
| `src/lib/domain/coach/index.ts` | Modifikasi | +1 | 0 | Re-ekspor modul `strengthCalculatorsKernel` pada barrel coach terpusat |
| `scripts/tests/test_strength_power_agents.js` | Baru | +380 | 0 | Rangkaian 30 unit tests otomatis memvalidasi seluruh agen kekuatan & kernel |
| `package.json` | Modifikasi | +2 | -1 | Penambahan skrip `"test:strength"` dan integrasi ke dalam `"test:all"` |

> **Audit Kepatuhan Arsitektur**: Seluruh berkas baru dan termodifikasi di dalam `src/` mematuhi batas arsitektural ketat dengan panjang **< 300 baris kode per berkas** (rentang 178 – 224 baris).

---

## 4. Hasil Pengujian & Jaminan Mutu

### A. Rangkaian Pengujian Otomatis (`npm run test:all`)
Total **152 Tests LULUS 100% (0 Gagal)**:
- `test:health`: **31 passed**
- `test:coach`: **5 passed**
- `test:streak`: **21 passed**
- `test:bola`: **5 passed**
- `test:multi-week-recap`: **10 passed**
- `test:coordinator`: **13 passed**
- `test:endurance`: **21 passed**
- `test:strength` (Suite Baru Phase 3): **30 passed**
- `test:python`: **16 passed**

### B. Pemeriksaan Kompilasi TypeScript (`npx tsc --noEmit`)
- **Status**: `Exit code 0` (0 Errors, 100% Type-Safe).

### C. Build Produksi Next.js Turbopack (`npm run build`)
- **Status**: Sukses mengompilasi dan mengoptimasi seluruh **35 rute aplikasi** (`35/35 routes generated`) tanpa error.

---

## 5. Dampak Sistem & Kesiapan Phase 4

Sistem kini memiliki pemahaman yang setara antara cabor aerobik jarak jauh dan cabor kekuatan fosfagen neuromuskular tinggi. Seluruh sesi gym dan angkat beban kini memiliki nilai beban internal yang terukur, estimasi 1RM yang aman, dan proteksi integritas muskuloskeletal.

Sistem siap dilanjutkan ke **Phase 4: Klaster Olahraga Beregu & Lapangan Intermiten (Football, Basketball, Volleyball, Futsal, Rugby, Field Hockey)**.
