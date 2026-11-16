# Changelog: Real-World Coach Intelligence, Banister PMC Engine & Daily Auto-Regulation (`feat/training`)

- **Tanggal & Waktu**: 2026-11-11 10:25:00 WIB
- **Tipe**: `feat(coach)` / `feat(physiology)` / `feat(domain)` / `feat(ui)` / `feat(api)`
- **Commit Message Rujukan**: `feat(coach): implement real-world coach intelligence, banister impulse-response pmc engine, aerobic decoupling, and daily auto-regulation briefing` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/training`
- **Lokasi**: `docs/10-changelog/feat/training/2026-11-11_10-25-00_feat-real-world-coach-intelligence-and-banister-pmc-engine.md`

---

## 1. Latar Belakang & Kebutuhan Atlet

Sebelum peningkatan ini, modul pelatih cerdas (*AI Coach*) di `project_strava` mengandalkan aturan ambang batas statis (*rule-based thresholds*):
1. **Keterbatasan Beban Latihan Sederhana**: Beban latihan hanya dihitung dari rasio jarak 7 hari vs 14 hari dengan aturan kenaikan jarak 10%. Sistem belum memperhitungkan intensitas kardiovaskular nyata, durasi, denyut jantung (*heart rate*), maupun respons stres fisiologis internal.
2. **Ketiadaan Auto-Regulasi Dinamis**: Jadwal latihan yang diresepkan bersifat kaku. Ketika atlet mengalami kelelahan akut (*overreaching*), tidur buruk, atau gejala nyeri sendi lutut/engkel kambuh, kalender tidak beradaptasi secara otomatis.
3. **Ketiadaan Evaluasi Pasca Latihan (*Session Debrief*)**: Setelah sesi olahraga selesai dicatat, sistem belum mengaudit kepatuhan zona (*zone compliance*) maupun memeriksa *aerobic decoupling* (*cardiac drift*).
4. **Penyelarasan Konteks Nyata Atlet**: Atlet memiliki target makrosiklus menyelesaikan 100 km *First Century Ride* (MTB) dan rehabilitasi bertahap lari (*Return-to-Run*), dengan rutinitas ibadah puasa Sunnah setiap **Senin dan Kamis**.

Untuk memenuhi standar **Pelatih Olahraga Ketahanan (Endurance Coach) & Sport Scientist di Dunia Nyata**, sistem ditingkatkan dengan mengintegrasikan **Model Fisiologi Banister (CTL/ATL/TSB)**, **Audit Telemetri Pasca Latihan (Cardiac Drift & ZCI)**, dan **Auto-Regulasi Harian Taktis**.

---

## 2. Rincian Implementasi & Rekayasa Arsitektur

### A. Core Engine Fisiologi Saintifik (`python_engine/domain/physiology/`)

Dibuat modul pemodelan fisiologi numerik murni di dalam Python FastAPI Engine:

1. **Model Data Pydantic ([`python_engine/domain/physiology/models.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/models.py) - 83 baris)**:
   - Mendefinisikan skema input/output tipe kuat untuk `TRIMPCalculationInput`, `SessionLoadInput`, `PMCDataPoint`, `AthletePhysiologyProfile`, `PMCPayload`, `PMCResponse`, `DecouplingInput`, dan `DecouplingResponse`.

2. **Mesin Beban & Pemodelan Banister ([`python_engine/domain/physiology/banister_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/banister_engine.py) - 193 baris)**:
   - **Banister Exponential TRIMP**: Menghitung *Training Impulse* berbasis cadangan denyut jantung (*Heart Rate Reserve / HRR*):
     $$\text{HRR} = \frac{\text{HR}_{\text{avg}} - \text{HR}_{\text{rest}}}{\text{HR}_{\text{max}} - \text{HR}_{\text{rest}}}$$
     $$\text{TRIMP} = D \times \text{HRR} \times 0.64 \times e^{1.92 \times \text{HRR}}$$
   - **Perhitungan Harian Rekursif EWMA**:
     $$\text{CTL}_t = \text{CTL}_{t-1} + \frac{\text{TSS}_t - \text{CTL}_{t-1}}{42} \quad \text{(Fitness Fondasi 42 Hari)}$$
     $$\text{ATL}_t = \text{ATL}_{t-1} + \frac{\text{TSS}_t - \text{ATL}_{t-1}}{7} \quad \text{(Fatigue Akut 7 Hari)}$$
     $$\text{TSB}_t = \text{CTL}_t - \text{ATL}_t \quad \text{(Form / Kesegaran Atlet)}$$
   - **EWMA ACWR**: Menghitung rasio beban latihan $\text{ACWR} = \frac{\text{ATL}}{\text{CTL}}$.
   - **Matriks Klasifikasi Zona TSB**: Mengelompokkan status atlet ke dalam 5 zona klinis:
     - `HIGH_FATIGUE_OVERREACHING` ($\text{TSB} < -25$) $\rightarrow$ Batalkan intensitas, alihkan ke pemulihan aktif.
     - `OPTIMAL_OVERLOAD` ($-25 \le \text{TSB} < -10$) $\rightarrow$ Beban adaptif terukur.
     - `NEUTRAL_MAINTENANCE` ($-10 \le \text{TSB} \le 10$) $\rightarrow$ Keseimbangan stabil.
     - `PEAK_RACE_FORM` ($10 < \text{TSB} \le 25$) $\rightarrow$ Kondisi prima siap event 100K Century Ride.
     - `DETRAINING_TRANSITION` ($\text{TSB} > 25$) $\rightarrow$ Aktivasi kembali sesi Zone 2.

3. **Mesin Audit Telemetri & Decoupling ([`python_engine/domain/physiology/decoupling_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/decoupling_engine.py) - 141 baris)**:
   - **Aerobic Decoupling / Cardiac Drift ($Pw:HR$)**: Mendeteksi kenaikan detak jantung relatif terhadap daya/kecepatan di paruh akhir sesi. Drift $\ge 5\%$ menandakan deplesi glikogen, dehidrasi, atau kelelahan kardiovaskular.
   - **Zone Compliance Index (ZCI)**: Mengaudit kedisiplinan atlet menjaga intensitas di zona target (misal $\ge 75\%$ di Zone 2).
   - **Sintesis Komentar & Rekomendasi Taktis Pelatih**: Memberikan evaluasi pasca sesi yang memadukan skor nyeri sendi, pembengkakan, dan telemetri denyut jantung.

4. **REST API Router ([`python_engine/api/coach_router.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/api/coach_router.py) - 45 baris)**:
   - Mendaftarkan endpoint `/calculate/coach/pmc`, `/calculate/coach/debrief`, dan `/calculate/coach/trimp`.
   - Diintegrasikan ke [`python_engine/main.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/main.py).

5. **Unit Test Pytest Komprehensif ([`python_engine/tests/test_banister.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_banister.py) - 145 baris)**:
   - 6 pengujian unit otomatis mencakup validasi matematika TRIMP, kalkulasi PMC, audit debrief tanpa nyeri, debrief dengan nyeri sendi, dan endpoint API (**12/12 pytest passed**).

---

### B. Layer Gateway Integrasi & BFF (Next.js TypeScript)

1. **Kontrak Tipe Data ([`src/types/coach.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/types/coach.ts) - 64 baris)**:
   - Mendefinisikan interface `PMCDataPoint`, `PMCResponse`, `SessionDebriefResult`, dan `DailyCoachBriefing`.
   - Diekspor melalui [`src/types/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/types/index.ts).

2. **Klien Gateway HTTP Terpadu ([`src/lib/api/coachPythonClient.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/api/coachPythonClient.ts) - 178 baris)**:
   - Menyediakan fungsi `computePMCViaPython` dan `computeDebriefViaPython` dengan koneksi asinkron ke service Python.
   - Dilengkapi fungsi *pure TypeScript fallback* (`computeLocalPMCFallback` dan `computeLocalDebriefFallback`) sehingga sistem tetap 100% resilien jika engine Python sedang offline.

3. **Mesin Pengarah Harian & Auto-Regulasi ([`src/lib/domain/coach/dailyCoachBriefingEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/dailyCoachBriefingEngine.ts) - 134 baris)**:
   - Mentriangulasikan skor kesiapan, riwayat cedera aktif, nilai TSB, dan jadwal puasa Senin & Kamis.
   - Memberikan sapaan waktu (*Selamat Pagi/Siang/Malam*), status auto-regulasi hari ini, rekomendasi menu, dan 3 pilar instruksi taktis:
     - **Nutrisi/Fueling**: Asupan karbohidrat cair $40\text{--}60\text{ g/jam}$ dan hidrasi isotonik.
     - **Kadens / Biomekanika**: Menjaga putaran lancar $\ge 85\text{ RPM}$ untuk memproteksi sendi patellofemoral.
     - **Kriteria Berhenti (*Red Flags*)**: Batasan rasa nyeri $\ge 2/10$ untuk menghentikan latihan.

4. **Next.js Route Handlers**:
   - [`src/app/api/coach/pmc/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/coach/pmc/route.ts) (30 baris): Menyajikan data kurva PMC dan status kesegaran harian atlet.
   - [`src/app/api/coach/debrief/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/coach/debrief/route.ts) (49 baris): Menerima telemetri sesi dan skala nyeri pasca latihan untuk menghasilkan audit instan.

---

### C. Komponen Antarmuka Interaktif Pelatih (`src/components/coach/`)

1. **Pengarah Taktis Harian ([`src/components/coach/CoachDailyBriefingCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachDailyBriefingCard.tsx) - 111 baris)**:
   - Menampilkan sapaan personal pelatih, status auto-regulasi harian (*Beban Terukur*, *Deload*, atau *Proteksi Sendi*), banner kalibrasi puasa (Senin & Kamis), dan grid instruksi taktis (Nutrisi, Kadens, Red Flags).

2. **Grafik Kurva Fisiologi PMC ([`src/components/coach/PerformanceManagementChart.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/PerformanceManagementChart.tsx) - 236 baris)**:
   - Visualisasi SVG interaktif kurva Banister:
     - Kurva **Fitness (CTL 42 hari)** berwarna cyan solid.
     - Kurva **Fatigue (ATL 7 hari)** berwarna merah muda putus-putus.
     - Bar beban harian (*Daily Load TRIMP*).
     - 4 counter telemetri (Fitness, Fatigue, Form TSB, EWMA ACWR).
     - Hover tooltip interaktif untuk menginspeksi titik riwayat latihan.

3. **Kartu Audit Pasca Latihan ([`src/components/coach/CoachSessionDebriefCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachSessionDebriefCard.tsx) - 76 baris)**:
   - Menampilkan skor kepatuhan zona (*Zone Compliance Index*), status *Cardiac Drift*, evaluasi klinis toleransi sendi, dan rekomendasi pemulihan.

4. **Integrasi Coach Hub ([`src/components/coach/CoachHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachHub.tsx) - 108 baris)**:
   - Mengintegrasikan pengarah harian (*Daily Briefing*) dan grafik PMC di atas tab navigasi pelatih lari & sepeda.

---

## 3. Kepatuhan Batas Baris (*Clean Architecture 300-Line Rule*)

Semua file yang dibuat dan dimodifikasi memenuhi batas maksimal **300 baris**:

| File / Modul | Baris Kode | Status Batas 300 Baris |
| :--- | :---: | :---: |
| `src/components/coach/CoachHub.tsx` | **108** | ✅ Memenuhi (<300 baris) |
| `src/components/coach/PerformanceManagementChart.tsx` | **236** | ✅ Memenuhi (<300 baris) |
| `src/components/coach/CoachDailyBriefingCard.tsx` | **111** | ✅ Memenuhi (<300 baris) |
| `src/components/coach/CoachSessionDebriefCard.tsx` | **76** | ✅ Memenuhi (<300 baris) |
| `src/lib/domain/coach/dailyCoachBriefingEngine.ts` | **134** | ✅ Memenuhi (<300 baris) |
| `src/lib/api/coachPythonClient.ts` | **178** | ✅ Memenuhi (<300 baris) |
| `src/types/coach.ts` | **64** | ✅ Memenuhi (<300 baris) |
| `src/app/api/coach/pmc/route.ts` | **30** | ✅ Memenuhi (<300 baris) |
| `src/app/api/coach/debrief/route.ts` | **49** | ✅ Memenuhi (<300 baris) |
| `python_engine/domain/physiology/models.py` | **83** | ✅ Memenuhi (<300 baris) |
| `python_engine/domain/physiology/banister_engine.py` | **193** | ✅ Memenuhi (<300 baris) |
| `python_engine/domain/physiology/decoupling_engine.py` | **141** | ✅ Memenuhi (<300 baris) |
| `python_engine/api/coach_router.py` | **45** | ✅ Memenuhi (<300 baris) |
| `python_engine/main.py` | **43** | ✅ Memenuhi (<300 baris) |
| `python_engine/tests/test_banister.py` | **145** | ✅ Memenuhi (<300 baris) |

---

## 4. Hasil Verifikasi & Jaminan Kualitas

1. **Pengujian Python Pytest Engine**:
   ```bash
   npm run test:python
   # 12 passed in 1.20s (FastAPI Streak + Banister PMC + Decoupling)
   ```

2. **Validasi Kompilasi TypeScript**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Nol error, tipe data terverifikasi penuh)
   ```

3. **Pengujian Sistem Rentetan Mingguan**:
   ```bash
   node scripts/tests/test_weekly_streak_system.js
   # 21 PASSED, 0 FAILED
   ```

4. **Kompilasi Produksi Next.js (Turbopack)**:
   ```bash
   npm run build
   # 34 routes compiled & prerendered successfully
   ```

---

## 5. Kepatuhan Ketat Status Git

Sesuai instruksi pengguna (*"jangan langsung di commit, paham?!"*):
- **TIDAK ADA git commit** yang dijalankan.
- Seluruh 15 file baru dan termodifikasi tetap berada di dalam status **unstaged working tree** untuk ditinjau langsung oleh pengguna.

