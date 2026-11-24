# Changelog: Refaktor Fase 1 Kalibrasi RPE/RIR 1RM & Progresi Tuas Kalistenik (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-23 01:10:00 WIB
- **Tipe**: `refactor(sports-science)` / `feat(python-engine)` / `test(unit)`
- **Commit Message Rujukan**: `refactor(python): enhance phase 1 strength engine with rts rpe/rir 1rm calibration, calisthenics leverage progression scaling, empty session safeguard, and heavy singles cns drain` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-23_01-10-00_refactor-phase-1-strength-rpe-calibration-and-calisthenics-levers.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-23_01-10-00_refactor-phase-1-strength-rpe-calibration-and-calisthenics-levers.md)

---

## 1. Latar Belakang & Rasional Refaktor

Berdasarkan hasil audit menyeluruh pada Fase 1 ([`strength_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/strength_engine.py)), teridentifikasi beberapa batasan praktis pada implementasi awal:
1. **Asumsi Beban Gagal (*Failure Assumption*) pada Rumus 1RM Konvensional**: Formula Brzycki dan Epley standar mengasumsikan repetisi dilakukan hingga titik gagal otot (*RPE 10 / 0 RIR*). Apabila seorang atlet mengangkat 100 kg sebanyak 5 repetisi pada RPE 8.0 (masih menyisakan 2 repetisi di tangki), formula lama menganggap kapasitas atlet hanya 112.5 kg. Dengan kalibrasi RIR (*Reps In Reserve*), kapasitas $1RM$ atlet terkoreksi akurat menjadi 120.0 kg (setara 7 repetisi efektif).
2. **Tuas Statis Kalistenik**: Manuver kalistenik (Planche dan Front Lever) menuntut progresi biomekanika sendi bahu dengan panjang tuas efektif yang berbeda secara signifikan (Tuck $50\%$, Advanced Tuck $65\%$, Straddle $82\%$, Full Planche $100\%$).
3. **Penanganan Sesi Kosong (*Empty Sets Safeguard*)**: Sesi tanpa set kerja aktif sebelumnya menghasilkan rata-rata RPE default (7.5). Kini ditangani secara aman dengan menghasilkan skor pengurasan SSP 0.0 dan status *RECOVERY*.
4. **Skalasi Non-Linier Latihan Beban Maksimal ($\ge 90\% 1RM$)**: Sesuai teori periodisasi Boris Sheiko, repetisi di atas $90\%$ memberikan deplesi SSP yang jauh lebih besar per repetisi dibanding repetisi sub-maksimal ($70\%$).

---

## 2. Rincian Perubahan Modul

### A. Mesin Fisiologi Kekuatan (`python_engine/domain/physiology/`)
1. **[`strength_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/strength_engine.py)**:
   - `calculate_brzycki_1rm(weight, reps, rpe=None)`: Menambahkan parameter `rpe` opsional untuk menghitung `effective_reps = reps + max(0.0, 10.0 - rpe)`.
   - `calculate_epley_1rm(weight, reps, rpe=None)`: Menambahkan penyesuaian RPE/RIR pada rumus Epley.
   - `calculate_calisthenics_torque(bodyweight_kg, lever_length_m, angle_deg, progression=None)`: Menambahkan kamus konstanta pengali tuas `CALISTHENICS_LEVER_PROGRESSIONS` (Tuck 0.50, Advanced Tuck 0.65, Straddle 0.82, Full 1.00).
   - `calculate_session_inol(sets, known_1rm_map)`: Meneruskan `s.rpe` ke estimasi 1RM otomatis sehingga atlet yang mengangkat dengan RPE sub-maksimal mendapatkan estimasi kapasitas 1RM yang adil dan akurat.
   - `evaluate_strength_session(session)`: Menambahkan *guard clause* sesi kosong dan faktor pengali beban berat $\ge 90\%$ (`heavy_count * 0.25`).

---

## 3. Matriks Formula Refaktor Fase 1

| Metrik / Fungsi | Formula Matematis Terkalibrasi (KaTeX) | Batas / Karakteristik Fisiologis |
|---|---|---|
| **RIR-Calibrated 1RM** | $r_{\text{eff}} = r + \max(0, 10 - RPE)$, $1RM = \frac{w}{1.0278 - (0.0278 \cdot r_{\text{eff}})}$ | Menghilangkan bias underestimasi pada set sub-maksimal |
| **Progresi Tuas Kalistenik** | $\tau = m \cdot g \cdot (L \times k_{\text{progresi}}) \cdot \cos(\theta)$ | $k \in \{0.50 \text{ (Tuck)}, 0.65 \text{ (Adv)}, 0.82 \text{ (Straddle)}, 1.00 \text{ (Full)}\}$ |
| **Sheiko Heavy CNS Factor** | $CNS = \min(10.0, (INOL \times 2.2) + (RPE \times 0.35) + (N_{\ge 90\%} \times 0.25))$ | Deplesi SSP non-linier pada latihan mendekati 1RM |

---

## 4. Rangkaian Pengujian Otomatis

1. **Suite Pengujian Pytest yang Diperbarui**:
   - Berkas: [`python_engine/tests/test_strength.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_strength.py) (Bertambah dari 8 menjadi 12 uji unit).
   - `test_rpe_calibrated_1rm_estimation`: Validasi 100 kg 5 reps @ RPE 10 (112.51 kg) vs @ RPE 8 (120.01 kg, kapasitas cadangan 2 RIR terdeteksi).
   - `test_calisthenics_progression_levers`: Validasi torsi atlet 70kg tuas 0.8m pada Tuck (274.68 Nm), Straddle (450.48 Nm), dan Full Planche (549.36 Nm).
   - `test_empty_strength_session_safeguard`: Validasi sesi tanpa set aktif menghasilkan 0.0 tonase, 0.0 CNS drain, dan status RECOVERY.
   - `test_heavy_singles_cns_drain_scaling`: Validasi 3 set repetisi tunggal pada deadlift 95% 1RM memberikan akumulasi deplesi SSP Sheiko yang terukur.
2. **Hasil Pytest**:
   - Perintah: `npm run test:python`
   - Hasil: **79 Passed, 0 Failed dalam 1.18 detik** (seluruh pengujian lulus 100%).
3. **Kepatuhan Batasan Kode**:
   - `strength_engine.py`: 271 baris ($< 300$ baris).
   - `test_strength.py`: 219 baris ($< 300$ baris).
   - Status Git: *Uncommitted / Clean working tree*.
