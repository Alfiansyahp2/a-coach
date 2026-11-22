# Changelog: Implementasi Fase 1 Mesin Fisiologi Kekuatan, Daya & Hipertrofi (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-21 19:35:00 WIB
- **Tipe**: `feat(python-engine)` / `feat(sports-science)` / `test(unit)`
- **Commit Message Rujukan**: `feat(python): implement phase 1 strength power and hypertrophy engine with brzycki 1rm, sheiko inol, tonnage, and vbt` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-21_19-35-00_feat-phase-1-strength-power-hypertrophy-engine-implementation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-21_19-35-00_feat-phase-1-strength-power-hypertrophy-engine-implementation.md)

---

## 1. Latar Belakang & Rasional Perubahan

Berdasarkan dokumen spesifikasi induk [`docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md), mesin perhitungan Python [`python_engine/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/) sebelumnya hanya mengkalkulasi beban kardiorespirasi (Banister TRIMP, denyut jantung, dan daya sepeda). Untuk cabang olahraga kekuatan murni (Powerlifting, Angkat Besi Olimpiade, Kalistenik, Strongman, dan Binaraga), pendekatan tersebut tidak akurat karena adaptasi neuromuskular dan pemulihan sistem saraf pusat (SSP) diatur oleh intensitas beban (%1RM), repetisi efektif, dan tonase mekanis.

Sesuai instruksi pengguna: *"buat phase 1 dulu jangan dilanjutkan ke phase selanjutnya"*, seluruh fokus implementasi dipusatkan secara eksklusif pada **Fase 1: Mesin Fisiologi Kekuatan, Daya & Hipertrofi** tanpa melangkah ke fase berikutnya.

---

## 2. Rincian Modul & Implementasi Fase 1

### A. Mesin Fisiologi Kekuatan Murni (`python_engine/domain/physiology/`)
1. **[`strength_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/strength_engine.py)**:
   - `calculate_brzycki_1rm(weight, reps)`: Rumus estimasi 1RM Matt Brzycki (1993) dengan batas repetisi terkalibrasi.
   - `calculate_epley_1rm(weight, reps)`: Rumus estimasi 1RM Epley (1985) sebagai pembanding multi-repetisi.
   - `calculate_volume_tonnage(sets, include_warmup)`: Akumulasi tonase kerja murni (kg) dengan opsi filter set pemanasan.
   - `calculate_sheiko_inol(reps, pct_1rm)`: Formula *Intensity of Number of Lifts* Boris Sheiko per set.
   - `calculate_session_inol(sets, known_1rm_map)`: Agregasi INOL per gerakan dan total sesi, dengan preservasi 1RM teruji milik atlet.
   - `evaluate_velocity_loss_cutoff(v_init, v_curr, threshold_pct)`: Evaluasi VBT (*Velocity-Based Training*) dengan pemotongan set otomatis jika penurunan kecepatan barbel $\ge 10\%$ atau $\ge 20\%$.
   - `calculate_calisthenics_torque(bodyweight_kg, lever_length_m, angle_deg)`: Torsi sendi statis manuver kalistenik (Planche / Front Lever).
   - `evaluate_strength_session(session)`: Orkestrator evaluasi sesi lengkap yang menghitung skor pengurasan SSP (*CNS Drain* skala 0–10), klasifikasi kelelahan (*Recovery, Optimal Accumulation, High Fatigue, Critical Overreaching*), serta rekomendasi jendela pemulihan (24 jam hingga 72 jam).

2. **[`models.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/models.py)**:
   - Dibuat model Pydantic baru: `StrengthSetInput`, `StrengthSessionInput`, dan `StrengthSessionResponse`.

3. **[`__init__.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/__init__.py)**:
   - Re-export seluruh model dan fungsi Fase 1 ke namespace modul fisiologi.

### B. Endpoint API FastAPI (`python_engine/api/`)
1. **[`coach_router.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/api/coach_router.py)**:
   - Menambahkan rute handler: `POST /calculate/coach/strength/evaluate` yang memvalidasi payload sesi kekuatan dan mengembalikan metrik evaluasi fisiologis secara langsung.

### C. Dokumen Spesifikasi Induk AI (`docs/11-ai/`)
1. **[`09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md)**:
   - Menambahkan Seksi 10: *Roadmap Implementasi Bertahap (Multi-Phase Rollout Plan)* yang membagi eksekusi ke dalam 6 fase terukur, menandai Fase 1 sebagai aktif/selesai.

---

## 3. Matriks Formula Matematis Fase 1

| Metrik / Fungsi | Formula Matematis (KaTeX) | Batas / Interpretasi Fisiologis |
|---|---|---|
| **Brzycki 1RM** | $1RM = \frac{w}{1.0278 - (0.0278 \times r)}$ | Paling akurat untuk repetisi $r \le 10$ |
| **Epley 1RM** | $1RM = w \times \left(1 + \frac{r}{30}\right)$ | Formula pembanding linier |
| **Volume Tonase** | $V_{\text{tonase}} = \sum (\text{Sets} \times \text{Reps} \times \text{Load [kg]})$ | Mengabaikan set pemanasan (*is_warmup=True*) |
| **Sheiko INOL** | $INOL = \frac{\text{Reps}}{100 - \%1RM}$ | $<0.4$ (Ringan), $0.4–1.0$ (Optimal), $1.0–2.0$ (Keras), $>2.0$ (Ekstrem) |
| **VBT Cut-off** | $\Delta v_{\text{loss}} = \frac{v_{\text{init}} - v_{\text{curr}}}{v_{\text{init}}} \times 100\%$ | $\ge 10\%$ (Stop set daya), $\ge 20\%$ (CNS Depletion parah) |
| **Torsi Kalistenik** | $\tau = m \times g \times L \times \cos(\theta)$ | Torsi sendi bahu pada penahanan statis |
| **CNS Drain** | $CNS = \min(10.0, (INOL \times 2.2) + (RPE_{\text{avg}} \times 0.35))$ | $\ge 8.5$ memicu mandatory rest 72 jam |

---

## 4. Rangkaian Pengujian Otomatis & Verifikasi

1. **Suite Pengujian Pytest Baru**:
   - Berkas: [`python_engine/tests/test_strength.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_strength.py) (8 uji unit baru).
   - `test_brzycki_and_epley_1rm_estimation`: Validasi eksak $1RM$ pada 1 rep, 5 rep, 10 rep, dan nilai 0.
   - `test_volume_tonnage_calculation`: Validasi eksklusi set pemanasan (1.500 kg vs 2.100 kg).
   - `test_sheiko_inol_calculation`: Validasi 5 reps @ 80% = 0.25 INOL, 3 reps @ 90% = 0.30 INOL.
   - `test_session_inol_accumulation`: Validasi akumulasi multi-gerakan (Squat + Bench) dengan preservasi 1RM teruji.
   - `test_velocity_based_training_loss_cutoff`: Validasi batas penurunan kecepatan 5% (safe), 12.5% (cut-off), dan 25% (severe).
   - `test_calisthenics_lever_torque`: Validasi torsi atlet 70 kg tuas 0.8m = 549.36 Nm.
   - `test_evaluate_strength_session_full_lifecycle`: Validasi sesi SBD Powerlifting terpadu (tonase 2.800 kg, 25 reps, pemulihan $\ge 36$ jam).
   - `test_strength_api_endpoint`: Validasi endpoint HTTP `/calculate/coach/strength/evaluate` via Starlette TestClient (Status 200 OK).
2. **Hasil Pytest**:
   - Perintah: `npm run test:python`
   - Hasil: **24 Passed, 0 Failed dalam 0.85 detik** (sebelumnya 16 passed, bertambah 8 tes baru).
3. **Hasil Regresi Keseluruhan**:
   - Perintah: `npm run test:all`
   - Hasil: **Seluruh 18 test suite lulus 100% (639+ assertions di JS/TS + 24 uji Pytest)**.
4. **Hasil Turbopack Build**:
   - Perintah: `npm run build`
   - Hasil: **35/35 routes terkompilasi sukses (0 error TypeScript)**.

---

## 5. Ringkasan Status Akhir

- **Fase 1 (Kekuatan & Hipertrofi)**: **SELESAI & DIVERIFIKASI 100%**.
- **Fase 2 s.d. Fase 6**: **DITAHAN (*ON-HOLD*)** sesuai arahan pengguna.
- **Git State**: Seluruh berkas baru dan modifikasi berada pada *unstaged working tree* (**tanpa git commit**).
