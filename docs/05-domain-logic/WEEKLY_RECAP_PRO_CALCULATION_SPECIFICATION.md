# Spesifikasi Komprehensif & Audit Rekap Mingguan Level PRO

- **Dokumen**: `WEEKLY_RECAP_PRO_CALCULATION_SPECIFICATION.md`
- **Lokasi**: `docs/05-domain-logic/WEEKLY_RECAP_PRO_CALCULATION_SPECIFICATION.md`
- **Status**: PROPOSED / RFC (Ready for Implementation)
- **Versi**: 2.0
- **Tanggal**: 2026-11-11
- **Pemilik**: Principal Sports Scientist & Analytics Architect
- **Dokumen Terkait**:
  - [`METRIC_DEFINITIONS.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/05-domain-logic/METRIC_DEFINITIONS.md)
  - [`TRAINING_LOAD.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/05-domain-logic/TRAINING_LOAD.md)
  - [`REAL_WORLD_COACH_INTELLIGENCE_SPECIFICATION.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/05-domain-logic/REAL_WORLD_COACH_INTELLIGENCE_SPECIFICATION.md)
  - [`ATHLETE_HEALTH_INTELLIGENCE_SPECIFICATION.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/03-architecture/ATHLETE_HEALTH_INTELLIGENCE_SPECIFICATION.md)

---

## 1. Latar Belakang & Hasil Audit Sistem Saat Ini

Audit mendalam dilakukan terhadap seluruh alur kalkulasi rekap mingguan pada codebase `project_strava`, mencakup:
- [`src/lib/domain/analytics/weeklyRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapEngine.ts) (Orkestrator rentang waktu & penggabungan)
- [`src/lib/domain/analytics/weeklyRecapActivity.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapActivity.ts) (Agregasi aktivitas & breakdown olahraga)
- [`src/lib/domain/analytics/weeklyRecapInjury.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapInjury.ts) (Korelasi beban terhadap cedera & nyeri)
- [`src/app/api/athlete/weekly-recap/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/weekly-recap/route.ts) (API Route Handler)

### 1.1 Temuan Audit: Keterbatasan Sistem Rekap Konvensional

| Area Evaluasi | Implementasi Saat Ini | Keterbatasan Fisiologis |
| :--- | :--- | :--- |
| **Beban Latihan (*Workload*)** | Hanya mengagregasi beban eksternal: jarak ($\text{km}$), durasi, elevasi ($\text{m}$), dan kalori. | **Jarak bisa menipu**: Sesi 50 km Zone 2 di medan datar menuntut respons fisiologis yang berbeda total dibanding 50 km tanjakan Zone 4. |
| **Beban Internal Kardiovaskular** | Tidak ada metrik beban internal seperti **Foster sRPE Load** atau **Weekly TSS/TRIMP**. | Pelatih tidak dapat mengetahui stres metabolik internal sesungguhnya yang diserap sistem saraf dan otot atlet. |
| **Polarisasi Intensitas** | Hanya menghitung pace rata-rata dan speed rata-rata per cabang olahraga. | Tidak ada audit **Polarized 80/20 Seiler**: Tidak terdeteksi apakah atlet terjebak di *"Black Hole of Training"* (terlalu banyak di Zone 3). |
| **Tren Antar-Minggu (*Week-over-Week*)** | Rekap minggu ini berdiri sendiri tanpa perbandingan dinamis dengan minggu lalu. | Atlet tidak tahu apakah lonjakan volume minggu ini melanggar batas aman $10\text{--}15\%$ (*spike risk*). |
| **Diferensiasi Beban Sendi** | Hanya menghitung ada/tidaknya lari vs sepeda tanpa kuantifikasi gaya tumbukan. | Belum memisahkan beban mekanis impak vertikal lari ($2.5\text{--}3\times$ bobot tubuh) vs kayuhan tertutup (*closed-chain*) sepeda. |
| **Deteksi Siklus Periodisasi** | Status kepatuhan hanya dihitung dari persentase sesi yang selesai. | Tidak ada deteksi apakah minggu ini adalah minggu *Build*, *Peak*, atau *Deload / Recovery Week*. |

---

## 2. Definisi Matematika & Formula Rekap Level "PRO"

Untuk meningkatkan rekap mingguan setara platform profesional (*TrainingPeaks, WKO5, GoldenCheetah, Intervals.icu*), berikut adalah 5 formula standar industri yang wajib ditanamkan:

### 2.1 Metrik 1: Dual Workload Metric (External vs Internal Load)

#### A. External Workload
$$\text{Total Distance} = \sum_{i=1}^n D_i \quad (\text{km}), \quad \text{Total Elevation} = \sum_{i=1}^n E_i \quad (\text{m})$$

#### B. Internal Workload (Foster Session-RPE Load)
Untuk atlet yang berlatih tanpa power meter kontinu, metode Foster sRPE adalah standar emas *sport science*:
$$\text{Foster sRPE Load} = \sum_{i=1}^n (\text{RPE}_i \times \text{Duration}_{i,\text{min}}) \quad (\text{Arbitrary Units / AU})$$
*Klasifikasi Beban Mingguan Foster:*
- $< 1,200\text{ AU}$: **Beban Ringan / Deload Week** (Pemulihan).
- $1,200\text{--}2,200\text{ AU}$: **Beban Optimal / Build Week** (Peningkatan adaptasi aerobik aman).
- $> 2,200\text{ AU}$: **Beban Ekstrem / Overreaching Week** (Risiko kelelahan akumulatif tinggi).

#### C. Weekly Physiological Stress Score (TSS / TRIMP)
$$\text{Weekly TSS} = \sum_{i=1}^n \text{TSS}_i \quad \text{(dari Banister Engine)}$$

#### D. Training Monotony & Strain
$$\text{Monotony} = \frac{\bar{L}}{\text{SD}_L} \quad (\text{Rasio rata-rata beban harian terhadap deviasi standar})$$
$$\text{Strain} = \text{Total Weekly Load} \times \text{Monotony}$$
*Jika $\text{Monotony} > 2.0$ dan $\text{Strain} > 4,000$, atlet berisiko tinggi mengalami sindrom overtraining dan imunosupresi.*

---

### 2.2 Metrik 2: Seiler 80/20 Polarized Intensity Distribution

Distribusi durasi mingguan dikelompokkan ke dalam model 3-zona Stephen Seiler:

```
                            DISTRIBUSI INTENSITAS MINGGUAN
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
       Zona 1-2 (Rendah)             Zona 3 (Sedang)              Zona 4-5 (Tinggi)
       Aerobik / Mitokondria         Tempo / Sweetspot            Threshold / VO2max
       Target: 75 – 85%              Target: 5 – 15%              Target: 5 – 10%
```

#### Rumus Distribusi Persentase:
$$\%Z_{1-2} = \frac{\text{Durasi } Z_1 + \text{Durasi } Z_2}{\text{Total Durasi}} \times 100\%$$
$$\%Z_3 = \frac{\text{Durasi } Z_3}{\text{Total Durasi}} \times 100\%$$
$$\%Z_{4-5} = \frac{\text{Durasi } Z_4 + \text{Durasi } Z_5}{\text{Total Durasi}} \times 100\%$$

#### Evaluasi Pelatih:
- **Optimal Polarized**: $\%Z_{1-2} \ge 75\%$.
- **Black Hole Alert**: $\%Z_3 > 25\%$. Pelatih memperingatkan:
  > *"Terlalu banyak waktu dihabiskan di Zone 3 (Tempo). Intensitas ini menimbulkan kelelahan glikogenik tinggi tanpa memberikan stimulus mitokondria murni seperti Zone 2."*

---

### 2.3 Metrik 3: Week-over-Week (WoW) Dynamic Delta

Menghitung perubahan relatif terhadap minggu sebelumnya ($W_{-1}$):
$$\Delta \text{Volume (\%)} = \left( \frac{\text{Volume}_W - \text{Volume}_{W-1}}{\text{Volume}_{W-1}} \right) \times 100\%$$
$$\Delta \text{TSS (\%)} = \left( \frac{\text{TSS}_W - \text{TSS}_{W-1}}{\text{TSS}_{W-1}} \right) \times 100\%$$

#### Matriks Keamanan WoW:
- **$\Delta \le 10\%$**: *Safe Progressive Overload* (Mematuhi kaidah 10%).
- **$10\% < \Delta \le 20\%$**: *Moderate Surge* (Perlu monitor nyeri sendi 48 jam).
- **$\Delta > 20\%$**: *Volume Spike Warning* (Peringatan risiko cedera tendon/ligamen).

---

### 2.4 Metrik 4: Musculoskeletal Strain Ratio (Impak vs Non-Impak)

Memisahkan beban berdasarkan sifat biomekanika kontak sendi:
$$\text{Impact Ratio} = \frac{\text{Durasi Lari}}{\text{Total Durasi Latihan}} \times 100\%$$
$$\text{Non-Impact Ratio} = \frac{\text{Durasi Sepeda MTB}}{\text{Total Durasi Latihan}} \times 100\%$$

- **Indeks Beban Sendi (Joint Mechanical Stress)**:
  Jika atlet dalam masa rehabilitasi engkel/lutut (`ON_HOLD` / `CONDITIONAL`), $\text{Impact Ratio}$ wajib $= 0\%$. Keberhasilan rekap mingguan dinilai dari kemampuannya memusatkan $100\%$ volume kardiorespirasi pada sepeda putaran tertutup tanpa memicu pembengkakan.

---

### 2.5 Metrik 5: Periodization Phase & Deload Detector

Sistem secara otomatis mengidentifikasi fase mingguan dalam siklus makro 12-minggu:
1. **Base Build Week**: Peningkatan beban teratur $\Delta \text{Volume} \in [0\%, 10\%]$.
2. **Overload Week**: Puncak blok latihan dengan sesi jarak terpanjang.
3. **Deload / Recovery Week**: Penurunan beban terencana $\Delta \text{Volume} \in [-40\%, -20\%]$ untuk memungkinkan superkompensasi jaringan lunak dan pengisian ulang glikogen.

---

## 3. Desain Arsitektur Teknis (Clean Architecture)

```
[ Frontend: Next.js 16 (React 19) ]
   ├── WeeklyRecapHub.tsx (Tampilan Lengkap Rekap Pro)
   └── WeeklyRecapCard.tsx (Widget Ringkas Dashboard)
           │
           ▼  (REST API JSON)
[ BFF Layer: Next.js Route Handlers (`src/app/api/athlete/weekly-recap`) ]
   ├── Membaca Database (Activities, Workouts, Pain Logs, Responses)
   └── Memanggil Python Gateway / Local Fallback
           │
           ▼  (HTTP Client)
[ Core Engine: Python FastAPI (`python_engine/domain/physiology/`) ]
   ├── weekly_recap_calculator.py (Kalkulasi Foster sRPE, Seiler 80/20, WoW Delta, Monotony)
   └── banister_engine.py (TSS & ACWR Aggregation)
```

---

## 4. Rencana Spesifikasi Antarmuka Pengguna (UI Upgrade)

Pada antarmuka [`WeeklyRecapHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapHub.tsx), akan ditambahkan:
1. **Diagram Polarisasi 80/20**: Visualisasi bar horizontal menunjukkan persentase waktu di Zona Hijau (Z1–2), Zona Kuning (Z3), dan Zona Merah (Z4–5).
2. **Widget Beban Fisiologis Ganda**: Menampilkan Foster sRPE Load dan Weekly TSS berdampingan dengan Total Jarak.
3. **Badge Status Periodisasi**: Menandai minggu sebagai `BUILD WEEK`, `PEAK OVERLOAD`, atau `DELOAD WEEK`.
4. **Indikator Tren WoW**: Menampilkan badge delta $\Delta\% \text{ Jarak}$ dan $\Delta\% \text{ TSS}$ berwarna hijau/amber.

---

## 5. Roadmap Eksekusi Bertahap

- [ ] **Fase 1 (Python Core Engine)**:
  - Bangun `python_engine/domain/physiology/weekly_recap_calculator.py` untuk menghitung Foster sRPE, 80/20 distribution, monotony, dan WoW delta.
  - Buat endpoint FastAPI `/calculate/coach/weekly-recap`.
  - Buat unit test pytest di `python_engine/tests/test_weekly_recap.py`.
- [ ] **Fase 2 (Gateway & TypeScript Types)**:
  - Perbarui `src/lib/domain/analytics/weeklyRecapTypes.ts` dengan atribut metrik pro.
  - Integrasikan pemanggilan ke Python via `coachPythonClient.ts` dengan fallback lokal.
- [ ] **Fase 3 (UI Enhancement)**:
  - Tambahkan visualisasi 80/20 bar dan Foster workload card di `WeeklyRecapHub.tsx` dan `WeeklyRecapWorkloadSection.tsx`.

