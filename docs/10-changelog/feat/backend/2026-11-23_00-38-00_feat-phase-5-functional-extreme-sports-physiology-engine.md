# Changelog: Implementasi Fase 5 Mesin Fisiologi Fungsional & Ekstrem (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-23 00:38:00 WIB
- **Tipe**: `feat(python-engine)` / `feat(sports-science)` / `test(unit)`
- **Commit Message Rujukan**: `feat(python): implement phase 5 functional fitness and extreme sports physiology engine with metcon power, finger pulley tension, landing grf, surf paddle ratio, and wrist compression` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-23_00-38-00_feat-phase-5-functional-extreme-sports-physiology-engine.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-23_00-38-00_feat-phase-5-functional-extreme-sports-physiology-engine.md)

---

## 1. Latar Belakang & Rasional Perubahan

Berdasarkan rencana bertahap pada dokumen spesifikasi induk [`docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md), setelah penyelesaian Fase 1 (Kekuatan), Fase 2 (Bela Diri), Fase 3 (Beregu/Lapangan), dan Fase 4 (Raket & Presisi), eksekusi kini mencapai **Fase 5: Mesin Fisiologi Fungsional & Ekstrem (*Functional Fitness & Extreme Sports*)**.

Kelompok olahraga ini (CrossFit/Hyrox, Panjat Tebing/Bouldering, Senam Artistik, Surfing, dan Skateboarding) menuntut profil fisiologis dan biomekanis unik yang sangat menantang:
1. **Daya Kerja Metcon & Penalti Transisi (*CrossFit/Hyrox Metcon Power Output*)**: Memisahkan kerja mekanis aktif murni dari waktu transisi/diam untuk menghitung output daya rerata dalam Watt serta menghitung rasio penalti transisi.
2. **Beban Katrol Fleksor Jari A2/A4 (*Climbing Pulley Tension*)**: Pada pegangan *closed crimp*, katrol tendon jari menahan gaya $3.0–4.0\times$ gaya normal ujung jari ($F_{\text{pulley}} \ge 400\text{ N}$ memicu risiko ruptur akut dan mengunci waktu istirahat 72 jam).
3. **Puncak Gaya Reaksi Tanah Pendaratan (*Drop Shock Peak GRF*)**: Pendaratan dari matras bouldering atau dismount senam dihitung menggunakan teorema usaha-energi deselerasi dalam kelipatan berat badan (*Body Weight/BW*).
4. **Rasio Kerja Dayung vs Menunggang Ombak (*Surfing Paddle-to-Wave Ratio*)**: Kuantifikasi waktu mendayung berjam-jam melawan waktu singkat berselancar di ombak (rasio $10:1$ s.d. $20:1$) serta deteksi kelelahan isometrik ekstensi torakalis.
5. **Beban Asimetri Unilateral Skateboard**: Mengukur ketidakseimbangan stres antara kaki tumpuan depan (*stance leg*) dan kaki pendorong (*push leg*).
6. **Kompresi Aksial Pergelangan Tangan Senam (*Gymnastics Wrist Compression*)**: Tekanan beban gravitasi saat handstand, pommel horse, atau vault.

---

## 2. Rincian Modul & Implementasi Fase 5

### A. Mesin Fisiologi Fungsional & Ekstrem (`python_engine/domain/physiology/`)
1. **[`functional_extreme_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/functional_extreme_engine.py)**:
   - `calculate_metcon_power_output(work_joules, total_sec, transition_sec)`: Menghitung daya rerata (Watts) dan persentase penalti transisi.
   - `calculate_finger_pulley_tension(fingertip_force_n, crimp_lever_factor, crimp_count)`: Menghitung gaya katrol A2/A4 dan mengklasifikasikan risiko ruptur tendon (*Low, Moderate, High*).
   - `evaluate_landing_peak_grf(drop_height_m, athlete_weight_kg, mat_damping_factor, decel_distance_m)`: Kuantifikasi gaya tumbukan tanah puncak dalam Newton dan kelipatan BW.
   - `calculate_surf_paddle_ratio(paddle_min, wave_ride_min, wave_count)`: Rasio waktu mendayung vs berselancar serta indeks ketegangan erektor punggung atas.
   - `evaluate_skateboard_asymmetry_load(push_kicks_count, drops_count, stance)`: Indeks asimetri beban muskuloskeletal tungkai bawah.
   - `evaluate_gymnastics_wrist_compression(handstand_seconds, athlete_weight_kg, apparatus)`: Beban kompresi sendi pergelangan tangan berbobot alat (*Floor, Pommel Horse, Vault, Rings*).
   - `evaluate_functional_extreme_session(session)`: Orkestrator evaluasi sesi terpadu dengan preskripsi jendela pemulihan adaptif 24–72 jam.

2. **[`extreme_models.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/extreme_models.py)**:
   - Skema Pydantic independen: `FunctionalExtremeSessionInput` dan `FunctionalExtremeSessionResponse`.

3. **[`models.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/models.py)** & **[`__init__.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/__init__.py)**:
   - Re-export seluruh model dan fungsi Fase 5 ke namespace domain fisiologi.

### B. Endpoint API FastAPI (`python_engine/api/`)
1. **[`coach_router.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/api/coach_router.py)**:
   - Menambahkan rute handler: `POST /calculate/coach/extreme/evaluate` yang memvalidasi payload telemetri sesi fungsional & ekstrem dan mengembalikan hasil kalkulasi secara langsung.

---

## 3. Matriks Formula Matematis Fase 5

| Metrik / Fungsi | Formula Matematis (KaTeX) | Batas / Interpretasi Fisiologis |
|---|---|---|
| **Metcon Power Output** | $P_{\text{metcon}} = \frac{W_{\text{joules}}}{t_{\text{total}} - t_{\text{transisi}}}$ | Satuan Watt, mencerminkan output metabolisme glikolitik aktif |
| **Transition Penalty** | $\text{Penalty}\% = \frac{t_{\text{transisi}}}{t_{\text{total}}} \times 100\%$ | Mengukur efisiensi pergantian pos latihan |
| **Finger Pulley Tension** | $F_{\text{pulley}} = F_{\text{fingertip}} \times \text{Lever Factor}$ | $F \ge 400\text{ N}$ memicu alarm risiko ruptur katrol A2/A4 |
| **Landing Peak GRF** | $\text{GRF} = \frac{m \cdot g \cdot h}{d \cdot (1 + \text{damping})} + m \cdot g$ | $\ge 8.0\text{ BW}$ memicu alarm guncangan sendi lutut/tumit |
| **Paddle-to-Wave Ratio** | $\text{Ratio} = \frac{t_{\text{dayung}}}{t_{\text{ombak}}}$ | Rasio $10:1$ s.d. $20:1$; $> 90\text{m}$ memicu kelelahan torakalis |
| **Skate Asymmetry Index** | $\text{Index} = (N_{\text{push}} \times 0.15) + (N_{\text{drop}} \times 1.8)$ | $> 300$ dorongan memicu alarm ketidakseimbangan postural |
| **Wrist Axial Compression** | $\text{Load} = \frac{t_{\text{handstand}}}{60} \times m \times \text{Factor}_{\text{alat}}$ | Faktor alat: Floor 1.0, Pommel Horse 1.4, Vault 1.6 |

---

## 4. Rangkaian Pengujian Otomatis & Verifikasi

1. **Suite Pengujian Pytest Baru**:
   - Berkas: [`python_engine/tests/test_functional_extreme.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_functional_extreme.py) (10 uji unit baru).
   - `test_calculate_metcon_power_output`: Validasi 120.000J dalam 600s dengan transisi 60s = 222.22W dan 10% penalti.
   - `test_calculate_finger_pulley_tension_safe`: Validasi 60N ujung jari * 3.5 = 210.0N (LOW risk).
   - `test_calculate_finger_pulley_tension_high_risk`: Validasi 120N ujung jari * 3.5 = 420.0N (HIGH risk ruptur).
   - `test_evaluate_landing_peak_grf_bouldering`: Validasi drop 2.5m panjat tebing dengan peredaman matras busa.
   - `test_calculate_surf_paddle_ratio`: Validasi 100m dayung vs 5m ombak (20.0 ratio, alarm aktif) vs 30m dayung (10.0 ratio, aman).
   - `test_evaluate_skateboard_asymmetry_load`: Validasi 200 dorongan (aman) vs 400 dorongan (alarm kelebihan beban asimetris).
   - `test_evaluate_gymnastics_wrist_compression`: Validasi handstand lantai (130 AU) vs vault berlebih (alarm kompresi).
   - `test_evaluate_functional_extreme_session_crossfit_flow`: Validasi integrasi sesi CrossFit penuh.
   - `test_evaluate_functional_extreme_session_climbing_high_pulley_flow`: Validasi sesi panjat tebing dengan risiko ruptur tinggi memicu jendela pemulihan 72 jam.
   - `test_extreme_api_endpoint`: Validasi endpoint HTTP `POST /calculate/coach/extreme/evaluate` via TestClient (Status 200 OK).
2. **Hasil Pytest**:
   - Perintah: `npm run test:python`
   - Hasil: **64 Passed, 0 Failed dalam 1.03 detik** (bertambah 10 uji unit dari 54 uji sebelumnya).
3. **Kepatuhan Batasan Kode**:
   - `functional_extreme_engine.py`: 227 baris ($< 300$ baris).
   - `extreme_models.py`: 59 baris ($< 300$ baris).
   - `models.py`: 277 baris ($< 300$ baris).
   - `coach_router.py`: 148 baris ($< 300$ baris).
   - `__init__.py`: 163 baris ($< 300$ baris).
   - `test_functional_extreme.py`: 135 baris ($< 300$ baris).
   - Status Git: *Uncommitted / Clean working tree*.
