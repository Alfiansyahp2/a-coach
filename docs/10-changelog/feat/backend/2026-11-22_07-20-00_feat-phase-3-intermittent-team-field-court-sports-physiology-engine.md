# Changelog: Implementasi Fase 3 Mesin Fisiologi Beregu & Lapangan Intermiten (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-22 07:20:00 WIB
- **Tipe**: `feat(python-engine)` / `feat(sports-science)` / `test(unit)`
- **Commit Message Rujukan**: `feat(python): implement phase 3 team field court sports physiology engine with catapult playerload, bradley hsr zones, hamstring surge risk, jump shock load, and cmj decay` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-22_07-20-00_feat-phase-3-intermittent-team-field-court-sports-physiology-engine.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-22_07-20-00_feat-phase-3-intermittent-team-field-court-sports-physiology-engine.md)

---

## 1. Latar Belakang & Rasional Perubahan

Sesuai dengan rencana kerja bertahap pada dokumen spesifikasi induk [`docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md), setelah penyelesaian Fase 1 (Kekuatan) dan Fase 2 (Bela Diri), iterasi kini melangkah ke **Fase 3: Mesin Fisiologi Beregu & Lapangan Intermiten (*Intermittent Team, Field & Court Sports*)**.

Cabang olahraga beregu (Sepak Bola, Bola Basket, Bola Voli, Futsal, Rugbi, dan Hoki Lapangan) menuntut kuantifikasi beban mekanis multidireksional yang tidak dapat ditangkap oleh model kardiorespirasi linier standar:
1. **Beban Akselerometri Tri-Aksial (*Catapult PlayerLoad™*)**: Mengintegrasikan laju perubahan vektor akselerasi 3 dimensi ($a_x, a_y, a_z$) untuk merefleksikan stres mekanis total.
2. **Partisi Kecepatan Bradley HSR (*High-Speed Running*) & Proteksi Hamstring**: Pembagian jarak lari ke dalam zona intensitas (*Low, Moderate, HSR $19.8–25.1$ km/h, Sprint $\ge 25.2$ km/h*) serta deteksi lonjakan sprint $> 15\%$ terhadap beban kronis (*chronic baseline*) untuk mencegah cedera robekan biseps femoris.
3. **Kinetika Guncangan Pendaratan Lompatan & Tendinopati Patellar (*Jumper's Knee*)**: Evaluasi energi kinetik pendaratan ($E_{\text{jump}}$ dalam kJ) dengan faktor pengali pendaratan satu tungkai ($1.8\times$) dan peringatan otomatis penguncian latihan pliometrik 48 jam jika frekuensi lonjakan melebihi 60 kali/sesi.
4. **Penyusutan Neuromuskular CMJ (*Countermovement Jump Decay*)**: Mengukur degradasi eksentrik pra vs pasca-tanding ($\Delta h_{\text{CMJ}} \le -8\%$ menandakan kelelahan neuromuskular perifer, $\le -15\%$ kelelahan kritis).
5. **Stres Spesifik Cabor**:
   - *Futsal*: Laju mikrode-selerasi tajam ($a < -3.0 \text{ m/s}^2$) di lapangan keras dan beban eksentrik kuadrisep $1.5\times$ rumput.
   - *Rugbi*: Indeks tubrukan keras ($> 5g$ dan $> 8g$) serta gugus *Repeated High-Intensity Efforts* (RHIE) yang memicu protokol trauma benturan.
   - *Hoki Lapangan*: Durasi fleksi tulang belakang (*lumbar flexion* sudut $< 45^\circ$) sebagai prediktor regangan erektor spina.

---

## 2. Rincian Modul & Implementasi Fase 3

### A. Mesin Fisiologi Beregu (`python_engine/domain/physiology/`)
1. **[`team_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/team_engine.py)**:
   - `calculate_catapult_player_load(accel_series)`: Integrasi perubahan akselerasi triaksial diskrit.
   - `partition_bradley_hsr(speed_samples_mps, sample_interval_s)`: Partisi deret waktu kecepatan ke 4 zona Bradley, jumlah bout sprint, dan kecepatan puncak.
   - `evaluate_hamstring_strain_risk(sprint_distance_m, chronic_avg_sprint_m)`: Evaluasi ambang batas lonjakan sprint $> 15\%$.
   - `evaluate_jump_shock_load(athlete_weight_kg, jump_heights_m, single_leg_count, default_jump_count)`: Kinetika energi impak pendaratan (kJ) dan deteksi ambang batas $> 60$ lonjakan.
   - `evaluate_cmj_decay(pre_match_cmj_m, post_match_cmj_m)`: Skrining depresiasi eksentrik neuromuskular.
   - `evaluate_futsal_micro_decelerations(decel_count, duration_minutes)`: Laju deselerasi keras per 10 menit dan kuadrisep shock AU.
   - `evaluate_rugby_collisions(high_g, severe_g, rhie)`: Skor benturan tubrukan dan penentuan protokol waktu istirahat 24–72 jam.
   - `evaluate_hockey_lumbar_strain(flexion_min, duration_min)`: Indeks kelelahan erektor spina posisi membungkuk.
   - `evaluate_team_session(session: TeamSessionInput) -> TeamSessionResponse`: Orkestrator evaluasi holistik sesi beregu/lapangan.

2. **[`models.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/models.py)**:
   - Menambahkan skema Pydantic: `TeamSessionInput` dan `TeamSessionResponse`.

3. **[`__init__.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/__init__.py)**:
   - Re-export seluruh fungsi dan model Fase 3 ke namespace modul fisiologi.

### B. Endpoint API FastAPI (`python_engine/api/`)
1. **[`coach_router.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/api/coach_router.py)**:
   - Menambahkan rute handler: `POST /calculate/coach/team/evaluate` yang memvalidasi payload telemetri sesi beregu dan mengembalikan kalkulasi komprehensif.

---

## 3. Matriks Formula Matematis Fase 3

| Metrik / Fungsi | Formula Matematis (KaTeX) | Batas / Interpretasi Fisiologis |
|---|---|---|
| **Catapult PlayerLoad** | $PL = \sum_{t=1}^T \frac{\sqrt{(\Delta a_y)^2 + (\Delta a_x)^2 + (\Delta a_z)^2}}{100}$ | Satuan AU, merefleksikan beban kerja akselerometri triaksial |
| **Bradley HSR Zones** | $v \in [19.8, 25.1\text{ km/h}]$ (HSR), $v \ge 25.2\text{ km/h}$ (Sprint) | Standar zonasi lari sepak bola & lapangan profesional |
| **Hamstring Surge Risk** | $\Delta_{\text{sprint}}\% = \frac{D_{\text{sprint}} - D_{\text{chronic}}}{D_{\text{chronic}}} \times 100\%$ | Lonjakan $> 15\%$ memicu alarm strain biseps femoris |
| **Jump Shock Energy** | $E_{\text{jump}} = \sum (m \times g \times h_j \times \text{Factor}) / 1000 \text{ [kJ]}$ | Faktor 1.0 (bilateral), 1.8 (deselerasi unilateral) |
| **Patellar Tendon Lock** | $J > 60 \implies \text{Plyometric Lock } 48\text{ jam}$ | Pencegahan tendinopati patellar (*jumper's knee*) |
| **CMJ Neuromuscular Decay** | $\Delta h_{\text{CMJ}} = \frac{h_{\text{post}} - h_{\text{pre}}}{h_{\text{pre}}} \times 100\%$ | $\le -8\%$ (Kelelahan perifer), $\le -15\%$ (Kelelahan kritis) |
| **Rugby Collision Score** | $\text{Score} = (\text{HighG} \times 1.0) + (\text{SevereG} \times 2.5) + (\text{RHIE} \times 1.8)$ | Score $\ge 40$ atau Severe $\ge 10 \implies$ rest 72 jam |
| **Futsal Quad Shock** | $\text{Shock}_{\text{quad}} = N_{\text{decel}} \times 1.5$ | Deselerasi $a < -3.0 \text{ m/s}^2$ di lapangan keras |
| **Hockey Lumbar Strain** | $I_{\text{lumbar}} = t_{\text{flexion}} \times 1.2$ | Fleksi postur $> 30$ menit atau rasio $> 0.40 \implies$ alert |

---

## 4. Rangkaian Pengujian Otomatis & Verifikasi

1. **Suite Pengujian Pytest Baru**:
   - Berkas: [`python_engine/tests/test_team.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_team.py) (10 uji unit baru).
   - `test_calculate_catapult_player_load`: Validasi input kosong/single (0.0) dan deret sintetik triaksial eksak (1.50 AU).
   - `test_partition_bradley_hsr_zones`: Validasi partisi jarak low, mod, HSR (18m), sprint (16m), bout sprint (1), dan max speed (28.8 km/h).
   - `test_evaluate_hamstring_strain_risk_acute_surge`: Validasi sprint aman (180m vs 200m) vs lonjakan akut (+30% -> HIGH risk alarm).
   - `test_evaluate_jump_shock_load_and_patellar_warning`: Validasi sesi 30 lompatan (aman) vs 75 lompatan (>60 -> patellar warning & kunci 48 jam).
   - `test_evaluate_cmj_decay`: Validasi degradasi eksentrik -12% (ELEVATED), -20% (CRITICAL), dan +2% (FRESH).
   - `test_evaluate_futsal_micro_decelerations`: Validasi deselerasi futsal normal (7.5/10min) vs overload (17.5/10min -> DOMS alert).
   - `test_evaluate_rugby_collisions`: Validasi benturan rugbi moderat (22.2) vs benturan keras parah (12 severe -> 72h rest).
   - `test_evaluate_hockey_lumbar_strain`: Validasi postur hoki aman (15 menit) vs kelelahan erektor spina (35 menit -> alert).
   - `test_evaluate_team_session_football_full_flow`: Validasi integrasi aliran data sesi sepak bola 90 menit lengkap.
   - `test_team_api_endpoint`: Validasi endpoint HTTP `POST /calculate/coach/team/evaluate` via TestClient (Status 200 OK).
2. **Hasil Pytest**:
   - Perintah: `npm run test:python`
   - Hasil: **44 Passed, 0 Failed dalam 0.91 detik** (bertambah 10 uji unit dari 34 uji sebelumnya).
3. **Kepatuhan Batasan Kode**:
   - `team_engine.py`: 244 baris ($< 300$ baris).
   - `models.py`: 258 baris ($< 300$ baris).
   - `coach_router.py`: 114 baris ($< 300$ baris).
   - `__init__.py`: 121 baris ($< 300$ baris).
   - `test_team.py`: 165 baris ($< 300$ baris).
   - Status Git: *Uncommitted / Clean working tree*.
