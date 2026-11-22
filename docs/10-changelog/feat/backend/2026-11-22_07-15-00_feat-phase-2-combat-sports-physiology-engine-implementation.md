# Changelog: Implementasi Fase 2 Mesin Fisiologi Bela Diri & Kontak Fisik (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-22 07:15:00 WIB
- **Tipe**: `feat(python-engine)` / `feat(sports-science)` / `test(unit)`
- **Commit Message Rujukan**: `feat(python): implement phase 2 combat sports physiology engine with punch density, mma partitioned workload, scat6 concussion gate, throw kinetic work, tibial impact index, and bjj isometric strain` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-22_07-15-00_feat-phase-2-combat-sports-physiology-engine-implementation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-22_07-15-00_feat-phase-2-combat-sports-physiology-engine-implementation.md)

---

## 1. Latar Belakang & Rasional Perubahan

Melanjutkan implementasi modular dari dokumen spesifikasi induk [`docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md), setelah penyelesaian Fase 1 (Kekuatan & Hipertrofi), langkah berikutnya adalah **Fase 2: Mesin Fisiologi Bela Diri & Olahraga Kontak Fisik (*High-Intensity Combat Sports & Martial Arts*)**.

Cabang olahraga bela diri (Tinju, MMA, Brazilian Jiu-Jitsu/BJJ, Pencak Silat, Judo, Muay Thai, dan Kickboxing) memiliki profil fisiologis unik:
1. **Beban Asimetris & Multi-Modalitas**: Sesi sering kali memadukan pertarungan atas (*stand-up striking*) dan pertarungan bawah (*mat grappling/ground-and-pound*). Beban metabolik dan kontraksi isometrik pada gulat/mat jauh lebih tinggi per menit daripada pertarungan berdiri.
2. **Kinetika Impak & Risiko Mikro-Trauma Skeletomuskular**: Penyerapan energi impak tulang kering (*tibial impact*) saat menendang kantung berat/tulang lawan pada Muay Thai memerlukan indeks kalkulasi densitas dan pelindung (*shin guards*).
3. **Pekerjaan Kinetik Lemparan Gravitasi (Nage-Waza)**: Melempar lawan seberat 70–100 kg berkali-kali pada Judo menghasilkan akumulasi kerja mekanis gravitasi yang besar dalam satuan kilojoule (kJ).
4. **Protokol Keselamatan Gegar Otak SCAT6**: Kontak kepala (*head impacts*) membawa risiko trauma kepala ringan (*concussion*). Sistem memerlukan gerbang skrining (*clinical red-flag gate*) berbasis protokol internasional SCAT6 (*Sport Concussion Assessment Tool 6*) untuk secara deterministik memaksakan suspensi kontak (7 hingga 14 hari) jika terdapat gejala bendera merah (*red flags*).

---

## 2. Rincian Modul & Implementasi Fase 2

### A. Mesin Fisiologi Bela Diri (`python_engine/domain/physiology/`)
1. **[`combat_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/combat_engine.py)**:
   - `calculate_punch_density(total_punches, round_minutes)`: Menghitung intensitas pukulan per menit ronde.
   - `partition_mma_workload(standup_minutes, mat_minutes, rpe_strike, rpe_grapple)`: Menghitung partisi beban kerja kombinasi berdiri dan matras dengan pengali metabolik isometrik $1.35\times$.
   - `evaluate_concussion_scat6_gate(head_impacts, symptoms, has_headgear)`: Evaluasi gerbang gegar otak SCAT6 yang memindai gejala klinis (*dizziness, headache, nausea, amnesia, photophobia, diplopia, vomiting*), menentukan rekomendasi suspensi kontak, serta kalkulasi koefisien reduksi impak helm (20% reduksi).
   - `calculate_throw_kinetic_work(partner_weight_kg, throw_count, avg_lift_height_m)`: Perhitungan kerja mekanis lemparan Judo (kJ) melawan gravitasi $g = 9.80665 \text{ m/s}^2$.
   - `calculate_tibial_impact_index(kick_count, has_shin_guards, intensity_multiplier)`: Indeks akumulasi stres tulang kering Muay Thai dengan redaman 55% (*0.45 factor*) saat mengenakan *shin guards*.
   - `evaluate_bjj_strain(mat_time_minutes, avg_rpe, inversion_minutes)`: Evaluasi ketegangan isometrik dan serviks BJJ akibat posisi terbalik (*inversion/guard-playing*).
   - `evaluate_combat_session(session: CombatSessionInput) -> CombatSessionResponse`: Orkestrator evaluasi sesi bela diri holistik yang mengintegrasikan metrik ronde, beban terpartisi, kerja lemparan, stres tibial, gerbang SCAT6, dan rekomendasi jendela pemulihan 24–72 jam (atau $\ge 168$ jam bila terdeteksi suspensi gegar otak).

2. **[`models.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/models.py)**:
   - Menambahkan skema Pydantic: `CombatRoundInput`, `CombatSessionInput`, dan `CombatSessionResponse`.

3. **[`__init__.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/__init__.py)**:
   - Mengekspor seluruh fungsi dan model Fase 2 ke namespace domain fisiologi.

### B. Endpoint API FastAPI (`python_engine/api/`)
1. **[`coach_router.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/api/coach_router.py)**:
   - Menambahkan rute handler: `POST /calculate/coach/combat/evaluate` yang memvalidasi payload sesi bela diri dan mengembalikan metrik evaluasi fisiologis secara langsung.

---

## 3. Matriks Formula Matematis Fase 2

| Metrik / Fungsi | Formula Matematis (KaTeX) | Batas / Interpretasi Fisiologis |
|---|---|---|
| **Punch Density** | $D_{\text{punch}} = \frac{N_{\text{punch}}}{T_{\text{round}} [\text{menit}]}$ | Volume output tinju/menit per ronde |
| **MMA Workload** | $WL_{\text{MMA}} = (t_{\text{standup}} \times RPE_{\text{strike}}) + (t_{\text{mat}} \times RPE_{\text{grapple}} \times 1.35)$ | Pengali $1.35\times$ untuk kontraksi isometrik gulat |
| **SCAT6 Concussion Gate** | $\text{RedFlags} \cap \text{Symptoms} \neq \emptyset \implies \text{Suspensi } 7–14\text{ Hari}$ | Pengecekan klinis wajib tanpa kompromi |
| **Throw Work (Nage-Waza)** | $W_{\text{throw}} = \frac{N_{\text{throw}} \times m_{\text{partner}} \times g \times h_{\text{lift}}}{1000} \text{ [kJ]}$ | Kerja gravitasi lemparan Judo |
| **Tibial Impact Index** | $I_{\text{tibial}} = N_{\text{kick}} \times (1 - \text{damping}) \times \text{multiplier}$ | Redaman 55% saat menggunakan pelindung tulang kering |
| **BJJ Isometric Strain** | $S_{\text{BJJ}} = (t_{\text{mat}} \times RPE_{\text{avg}}) + (t_{\text{inversion}} \times 1.5)$ | Stres serviks/leher pada posisi guard inversion |

---

## 4. Rangkaian Pengujian Otomatis & Verifikasi

1. **Suite Pengujian Pytest Baru**:
   - Berkas: [`python_engine/tests/test_combat.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_combat.py) (10 uji unit baru).
   - `test_calculate_punch_density`: Validasi 90 pukulan dalam 3 menit = 30.0 pukulan/menit, dan penanganan round 0 menit = 0.0.
   - `test_partition_mma_workload`: Validasi 10 menit standup @ RPE 7 + 10 menit mat @ RPE 8 = 178.0 AU.
   - `test_evaluate_concussion_scat6_clean`: Validasi tanpa gejala klinis/impak minim $\to$ Cleared to train.
   - `test_evaluate_concussion_scat6_flagged`: Validasi gejala klinis pusing & sakit kepala memicu suspensi kontak 168 jam (7 hari) dan status `suspension_recommended`.
   - `test_calculate_throw_kinetic_work`: Validasi 20 lemparan atlet 75 kg ketinggian 1.2 m = 17.65 kJ.
   - `test_calculate_tibial_impact_index`: Validasi perbedaan impak tulang kering telanjang (120.0) vs menggunakan shin guards (54.0).
   - `test_evaluate_bjj_strain`: Validasi 45 menit mat @ RPE 7 + 15 menit inversion = 337.5 strain.
   - `test_evaluate_combat_session_mma_flow`: Validasi evaluasi sesi MMA 3 ronde penuh secara end-to-end.
   - `test_evaluate_combat_session_with_concussion_lock`: Validasi sesi dengan benturan kepala keras dan gejala gegar otak menghasilkan waktu pemulihan $\ge 168$ jam.
   - `test_combat_api_endpoint`: Validasi endpoint HTTP `POST /calculate/coach/combat/evaluate` via TestClient (Status 200 OK).
2. **Hasil Pytest**:
   - Perintah: `npm run test:python`
   - Hasil: **34 Passed, 0 Failed dalam 0.80 detik** (bertambah 10 uji unit dari 24 uji sebelumnya).
3. **Hasil Regresi Keseluruhan**:
   - Perintah: `npm run test:all`
   - Hasil: **Seluruh 18 test suite lulus 100% (639+ assertions di JS/TS + 34 uji Pytest)**.
4. **Hasil Turbopack Build**:
   - Perintah: `npm run build`
   - Hasil: **Lulus 100% (35/35 rute terkompilasi dalam 10.9 detik tanpa error)**.
5. **Kepatuhan Batasan Kode**:
   - `combat_engine.py`: 234 baris ($< 300$ baris).
   - `models.py`: 210 baris ($< 300$ baris).
   - `coach_router.py`: 95 baris ($< 300$ baris).
   - `__init__.py`: 97 baris ($< 300$ baris).
   - `test_combat.py`: 167 baris ($< 300$ baris).
   - Status Git: *Uncommitted / Clean working tree*.
