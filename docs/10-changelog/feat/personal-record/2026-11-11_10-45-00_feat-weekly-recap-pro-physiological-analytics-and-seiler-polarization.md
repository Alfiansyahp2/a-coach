# Changelog: Weekly Recap Engine Upgrade to Pro Level — Foster sRPE, Seiler 80/20 Polarization & WoW Progression (`feat/personal-record`)

- **Tanggal & Waktu**: 2026-11-11 10:45:00 WIB
- **Tipe**: `feat(analytics)` / `feat(physiology)` / `feat(domain)` / `feat(ui)` / `feat(api)`
- **Commit Message Rujukan**: `feat(analytics): implement pro weekly recap engine with foster srpe, weekly tss, seiler 80/20 polarization, wow delta, and periodization phase detection` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/personal-record`
- **Lokasi**: `docs/10-changelog/feat/personal-record/2026-11-11_10-45-00_feat-weekly-recap-pro-physiological-analytics-and-seiler-polarization.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit komprehensif terhadap sistem rekapitulasi mingguan sebelumnya ([`weeklyRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapEngine.ts)), teridentifikasi kesenjangan analitik mendasar yang membedakan sistem pencatat biasa dengan **standar pelatih olahraga ketahanan profesional (*Pro Endurance Coach*)**:

1. **Ilusi Beban Eksternal Linier (*Distance Fallacy*)**:
   - Sistem lama hanya menjumlahkan jarak total ($\text{km}$), durasi ($\text{jam}$), elevasi ($\text{m}$), dan kalori. Di dunia *sport science*, **jarak bisa menipu**: sesi sepeda 50 km santai di Zone 2 datar menuntut adaptasi biologis dan waktu pemulihan yang sangat berbeda dengan 50 km tanjakan terjal di Zone 4.
2. **Ketiadaan Beban Fisiologis Internal (*Internal Load*)**:
   - Belum ada perhitungan stres metabolik internal sesungguhnya, seperti **Foster Session-RPE Workload** ($\text{sRPE} \times \text{Durasi Menit}$) maupun **Weekly TSS (Training Stress Score)**.
3. **Ketiadaan Audit Polarisasi Intensitas 80/20 (Stephen Seiler Model)**:
   - Pelatih pro memantau apakah atlet mematuhi prinsip polarisasi: $\ge 75\text{--}80\%$ waktu di Zone 1–2 (Aerobik Fondasi) dan $< 20\%$ di Zone 3–5. Sistem lama belum mengelompokkan distribusi waktu per zona detak jantung, sehingga gagal mendeteksi jika atlet terjebak di *"Black Hole of Training"* (terlalu banyak di Zone 3 tempo yang melelahkan saraf tanpa membangun mitokondria murni).
4. **Ketiadaan Komparasi Dinamis Minggu-ke-Minggu (*Week-over-Week Delta*)**:
   - Rekap mingguan sebelumnya berdiri sendiri tanpa komparasi terhadap minggu lalu, sehingga sistem tidak dapat memvalidasi aturan kenaikan volume aman $\le 10\%$ (*10% volume rule*).
5. **Ketiadaan Deteksi Siklus Periodisasi Makro**:
   - Belum ada identifikasi otomatis apakah minggu ini merupakan minggu *Base Build*, *Peak Overload*, atau minggu *Deload / Recovery Week* (siklus 3:1).

Pembaruan ini meningkatkan seluruh alur komputasi rekap mingguan ke **Level PRO** melalui integrasi **Python Sports Science Core Engine**, **Layer Domain Resilien Next.js**, dan **Komponen Antarmuka Polarisasi Interaktif**.

---

## 2. Rincian Implementasi & Rekayasa Sistem

### A. Core Engine Fisiologi Saintifik (`python_engine/domain/physiology/`)

Dibuat mesin kalkulator rekap profesional di layer Python FastAPI:

1. **Model Data Pydantic ([`python_engine/domain/physiology/models.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/models.py) - 132 baris)**:
   - Menambahkan schema tipe kuat: `PolarizationBreakdown`, `WoWDelta`, `MusculoskeletalStrain`, `WeeklyProRecapPayload`, dan `WeeklyProRecapResponse`.

2. **Kalkulator Rekap Pro ([`python_engine/domain/physiology/weekly_recap_calculator.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/weekly_recap_calculator.py) - 271 baris)**:
   - **Foster Session-RPE Workload**:
     $$\text{Foster sRPE Load} = \sum_{i=1}^n (\text{RPE}_i \times \text{Duration}_{i,\text{min}}) \quad (\text{AU})$$
   - **Weekly TSS / TRIMP**: Akumulasi beban stres fisiologis mingguan dari Banister Engine.
   - **Training Monotony & Strain**:
     $$\text{Monotony} = \frac{\bar{L}}{\text{SD}_L}, \quad \text{Strain} = \text{Weekly Load} \times \text{Monotony}$$
     Mendeteksi bahaya overtraining jika $\text{Monotony} > 2.0$.
   - **Model Polarisasi Seiler 3-Zona**:
     - *Zone 1–2 (Low Intensity / Aerobik)*: $<75\% \text{ HR}_{\text{max}}$.
     - *Zone 3 (Moderate Intensity / Tempo)*: $75\text{--}85\% \text{ HR}_{\text{max}}$.
     - *Zone 4–5 (High Intensity / Threshold & VO2max)*: $>85\% \text{ HR}_{\text{max}}$.
     - Mengeluarkan klasifikasi `OPTIMAL_POLARIZED_80_20` jika $\%Z_{1-2} \ge 75\%$ atau `BLACK_HOLE_WARNING` jika $\%Z_3 > 25\%$.
   - **Week-over-Week (WoW) Progression Delta**:
     $$\Delta \text{Volume (\%)} = \left( \frac{\text{Volume}_W - \text{Volume}_{W-1}}{\text{Volume}_{W-1}} \right) \times 100\%$$
     Mengeluarkan flag keamanan `SAFE` ($\le 10\%$), `MODERATE_SURGE` ($10\text{--}20\%$), `SPIKE_WARNING` ($>20\%$), atau `DELOAD_DETECTED` ($<-25\%$).
   - **Musculoskeletal Impact Strain Ratio**:
     Memisahkan persentase durasi lari berimpak tinggi ($2.5\text{--}3\times$ bobot tubuh) vs sepeda tertutup (*closed-chain*) non-impak untuk memproteksi pemulihan cedera engkel dan lutut.
   - **Periodization Phase & Bridge Advice**:
     Mendeteksi fase mingguan (`BASE_BUILD`, `PROGRESSIVE_OVERLOAD`, `PEAK_WEEK`, `DELOAD_RECOVERY`) dan merumuskan saran jembatan taktis untuk minggu berikutnya.

3. **REST API Endpoint ([`python_engine/api/coach_router.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/api/coach_router.py) - 65 baris)**:
   - Menambahkan rute `POST /calculate/coach/weekly-recap`.

4. **Pengujian Pytest Otomatis ([`python_engine/tests/test_weekly_recap.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_weekly_recap.py) - 121 baris)**:
   - 4 unit test baru memverifikasi kalkulasi Foster sRPE, polarisasi Seiler, delta WoW, dan endpoint API (**16/16 pytest lolos 100%**).

---

### B. Layer Domain & Logika Agregasi Next.js (`src/lib/domain/analytics/`)

1. **Kontrak Tipe Data ([`src/lib/domain/analytics/weeklyRecapTypes.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapTypes.ts) - 174 baris)**:
   - Menambahkan interface `WeeklyProMetrics` pada kontrak `WeeklyActivityAndInjuryRecap`.

2. **Kalkulator Pro Resilien TypeScript ([`src/lib/domain/analytics/weeklyRecapProCalculator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapProCalculator.ts) - 175 baris)**:
   - Mengimplementasikan seluruh formula matematika Foster sRPE, Weekly TSS, Monotony, Seiler 80/20, WoW delta, dan beban sendi secara lokal di TypeScript sebagai jaminan sistem tetap menyajikan metrik pro dengan presisi penuh meskipun service Python sedang offline.

3. **Orkestrator Rekap Mingguan ([`src/lib/domain/analytics/weeklyRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapEngine.ts) - 140 baris)**:
   - Menghubungkan perhitungan `computeLocalWeeklyProMetrics` ke dalam objek return `WeeklyActivityAndInjuryRecap`.

---

### C. Komponen Antarmuka Interaktif Pengguna (`src/components/`)

1. **Seksi Analisis Pro ([`src/components/analytics/WeeklyRecapProMetricsSection.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapProMetricsSection.tsx) - 194 baris)**:
   - **Diagram Batang Polarisasi 80/20 Seiler**: Visualisasi bar bertumpuk horisontal dengan warna Cyan (Zone 1-2), Amber (Zone 3), dan Merah (Zone 4-5) disertai badge evaluasi klinis.
   - **4 Counter Telemetri Fisiologis**: Foster sRPE Load (AU), Weekly TSS, WoW Volume Delta (%), dan Rasio Proteksi Sendi (% MTB non-impak).
   - **Badge Siklus Periodisasi**: Menampilkan status fase mingguan (`BASE BUILD`, `DELOAD RECOVERY`, dll.).
   - **Rekomendasi Jembatan Pelatih**: Arahan persiapan sesi untuk minggu depan.

2. **Halaman Hub Rekap Mingguan ([`src/components/recap/WeeklyRecapHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapHub.tsx) - 262 baris)**:
   - Mengintegrasikan `WeeklyRecapProMetricsSection` di halaman `/recap`.

3. **Widget Rekap Dashboard ([`src/components/analytics/WeeklyRecapWorkloadSection.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapWorkloadSection.tsx) - 112 baris & [`WeeklyRecapCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapCard.tsx) - 251 baris)**:
   - Menampilkan chip ringkasan beban internal fisiologis (Foster sRPE + TSS) berdampingan dengan jarak dan durasi.

---

### D. Kompatibilitas Turbopack Next.js 16 (`src/app/api/coach/`)

- Menyesuaikan handler API dynamic [`src/app/api/coach/pmc/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/coach/pmc/route.ts) dan [`src/app/api/coach/debrief/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/coach/debrief/route.ts) menggunakan `await connection()` dari `next/server` agar kompatibel penuh dengan `nextConfig.cacheComponents` pada Next.js 16.

---

## 3. Kepatuhan Batas Baris (*Clean Architecture Rule*)

Seluruh file yang dibuat dan dimodifikasi berada **di bawah 275 baris** (**0 file > 300 baris**):

| File / Modul | Baris Kode | Status Batas 300 Baris |
| :--- | :---: | :---: |
| `python_engine/domain/physiology/models.py` | **132** | ✅ Memenuhi (<300 baris) |
| `python_engine/domain/physiology/weekly_recap_calculator.py` | **271** | ✅ Memenuhi (<300 baris) |
| `python_engine/domain/physiology/__init__.py` | **51** | ✅ Memenuhi (<300 baris) |
| `python_engine/api/coach_router.py` | **65** | ✅ Memenuhi (<300 baris) |
| `python_engine/tests/test_weekly_recap.py` | **121** | ✅ Memenuhi (<300 baris) |
| `src/lib/domain/analytics/weeklyRecapTypes.ts` | **174** | ✅ Memenuhi (<300 baris) |
| `src/lib/domain/analytics/weeklyRecapProCalculator.ts` | **175** | ✅ Memenuhi (<300 baris) |
| `src/lib/domain/analytics/weeklyRecapEngine.ts` | **140** | ✅ Memenuhi (<300 baris) |
| `src/components/analytics/WeeklyRecapProMetricsSection.tsx` | **194** | ✅ Memenuhi (<300 baris) |
| `src/components/analytics/WeeklyRecapWorkloadSection.tsx` | **112** | ✅ Memenuhi (<300 baris) |
| `src/components/analytics/WeeklyRecapCard.tsx` | **251** | ✅ Memenuhi (<300 baris) |
| `src/components/recap/WeeklyRecapHub.tsx` | **262** | ✅ Memenuhi (<300 baris) |
| `src/app/api/coach/pmc/route.ts` | **29** | ✅ Memenuhi (<300 baris) |
| `src/app/api/coach/debrief/route.ts` | **48** | ✅ Memenuhi (<300 baris) |

---

## 4. Hasil Verifikasi & Jaminan Kualitas

1. **Pengujian Pytest Suite (Python Engine)**:
   ```bash
   npm run test:python
   # 16 passed in 1.09s (Streak + Banister + Debrief + Weekly Pro Recap)
   ```

2. **Validasi Tipe TypeScript**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Nol type error, kontrak antarmuka sinkron)
   ```

3. **Pengujian Sistem Rentetan Mingguan**:
   ```bash
   node scripts/tests/test_weekly_streak_system.js
   # 21 PASSED, 0 FAILED
   ```

4. **Kompilasi Produksi Next.js (Turbopack)**:
   ```bash
   npm run build
   # Compiled successfully in 3.6s
   # 34/34 routes lolos kompilasi & prerender
   ```

---

## 5. Kepatuhan Ketat Status Git

Sesuai instruksi ketat pengguna (*"jangan langsung di commit, paham?!"*):
- **TIDAK ADA git commit** yang dieksekusi.
- Seluruh 14 file yang dibuat dan dimodifikasi tetap berada di dalam status **unstaged working tree** untuk ditinjau langsung oleh pengguna.

