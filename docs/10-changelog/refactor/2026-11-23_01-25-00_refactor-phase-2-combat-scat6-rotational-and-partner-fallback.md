# Changelog: Refaktor Fase 2 Protokol SCAT6 Rotasional, Fallback Lemparan Judo & Kelelahan Cengkeraman BJJ Gi (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-23 01:25:00 WIB
- **Tipe**: `refactor(sports-science)` / `feat(python-engine)` / `test(unit)`
- **Commit Message Rujukan**: `refactor(python): enhance phase 2 combat engine with scat6 rotational impact shear weighting, judo partner fallback weight, bjj gi grip fatigue, and empty session safeguard` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/refactor/2026-11-23_01-25-00_refactor-phase-2-combat-scat6-rotational-and-partner-fallback.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-23_01-25-00_refactor-phase-2-combat-scat6-rotational-and-partner-fallback.md)

---

## 1. Latar Belakang & Rasional Refaktor

Berdasarkan audit komprehensif pada Fase 2 ([`combat_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/combat_engine.py)), dilakukan penyempurnaan domain logic untuk mencakup biomekanika dan protokol keselamatan riil:
1. **Pembobotan Benturan Kepala Rotasional SCAT6 (*Angular/Rotational Shear Stress*)**: Pada bela diri kontak penuh (Tinju, MMA, Muay Thai), pukulan rotasional (*hook*, *overhand*, tendangan memutar) menimbulkan percepatan sudut (*angular acceleration*) yang meregangkan dan mencederai jaringan aksonal otak tengah (*midbrain axonal shearing*) jauh lebih berbahaya dibanding pukulan linear (*jab* langsung). Model kini menerapkan pembobotan $1.5\times$ untuk benturan rotasional dan trigger otomatis suspensi kontak 7 hari bila terakumulasi $\ge 6$ benturan rotasional.
2. **Fallback Berat Rekan Lemparan Judo/Sambo (*Nage-Waza Fallback*)**: Jika atlet berlatih bantingan namun bobot pasangan latihan tidak dicantumkan dalam telemetri (`partner_weight_kg is None`), sistem secara otomatis menggunakan fallback bobot badan referensi ($75.0\text{ kg}$) alih-alih menghasilkan $0\text{ kJ}$ kerja mekanis.
3. **Pengali Kelelahan Isometrik Cengkeraman BJJ Gi vs No-Gi**: Pertarungan BJJ dengan seragam Gi mewajibkan cengkeraman kerah dan lengan (*collar & sleeve grips*) intensif yang menguras tendon fleksor jari dan kompartemen lengan bawah secara masif. Ditambahkan faktor pengali kelelahan $1.25\times$ saat berlatih dengan Gi.
4. **Penanganan Sesi Pertarungan Kosong (*Empty Rounds Safeguard*)**: Jika input sesi tidak memiliki ronde aktif (durasi 0 atau daftar ronde kosong), evaluator mengembalikan status beban kontak fisik nihil dan verdict aman tanpa memicu pembagian nol.

---

## 2. Rincian Perubahan Modul

### A. Mesin Fisiologi Bela Diri (`python_engine/domain/physiology/`)
1. **[`combat_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/combat_engine.py)**:
   - `evaluate_concussion_scat6_gate(...)`: Menambahkan parameter `rotational_impacts`, formula $I_{\text{eff}} = (N_{\text{lin}} \cdot 1.0 + N_{\text{rot}} \cdot 1.5) \cdot k_{\text{gear}}$, serta trigger suspensi protektif jika $N_{\text{rot}} \ge 6$.
   - `calculate_throw_kinetic_work(...)`: Mendukung `partner_weight_kg: Optional[float] = None` dengan fallback aman ke `fallback_weight_kg = 75.0 kg`.
   - `evaluate_bjj_strain(...)`: Menambahkan parameter `is_gi: bool = False` dengan pengali isometrik cengkeraman lengan bawah $1.25\times$ untuk latihan Gi.
   - `evaluate_combat_session(...)`: Menambahkan *guard clause* ronde kosong yang mengembalikan `CombatSessionResponse` bersih dengan durasi 0.0 menit dan 0.0 beban kontak.

---

## 3. Matriks Formula Refaktor Fase 2

| Metrik / Fungsi | Formula Matematis Terkalibrasi (KaTeX) | Rasional Fisiologis & Medis |
|---|---|---|
| **SCAT6 Rotational Impact Shear** | $I_{\text{eff}} = (N_{\text{lin}} \cdot 1.0 + N_{\text{rot}} \cdot 1.5) \cdot (0.85 \text{ jika Headgear else } 1.0)$ | Mitigasi deformasi aksonal otak akibat torsi rotasional |
| **Rotational Concussion Gate Trigger** | $\text{Suspensi 7 Hari if } I_{\text{eff}} \ge 15.0 \lor N_{\text{rot}} \ge 6$ | Protokol pencegahan *Second Impact Syndrome* |
| **Judo Nage-Waza Fallback** | $W_{\text{throw}} = m_{\text{eff}} \cdot g \cdot h \cdot N_{\text{throw}}$, $m_{\text{eff}} = 75.0\text{ kg jika } m \text{ is None}$ | Menjamin estimasi energi mekanis tidak hilang saat data partner anonim |
| **BJJ Gi vs No-Gi Grip Fatigue** | $\text{Load} = t_{\text{mat}} \cdot RPE \cdot 1.35 \cdot (1.25 \text{ if Gi else } 1.0)$ | Kompensasi stres kontraksi isometrik tendon fleksor tangan & jari |

---

## 4. Rangkaian Pengujian Otomatis

1. **Suite Pengujian Pytest yang Diperbarui**:
   - Berkas: [`python_engine/tests/test_combat.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_combat.py) (Bertambah dari 10 menjadi 14 uji unit).
   - `test_throw_kinetic_work_fallback_weight`: Validasi fallback bobot 75.0 kg menghasilkan output yang identik dengan input eksplisit 75.0 kg (8.83 kJ untuk 10 lemparan).
   - `test_scat6_rotational_impacts_trigger`: Validasi 6 benturan rotasional langsung memicu gerbang gegar otak SCAT6 dan suspensi kontak 7 hari.
   - `test_bjj_gi_vs_nogi_fatigue_multiplier`: Validasi sesi BJJ Gi menghasilkan beban $1.25\times$ lebih tinggi dibanding No-Gi.
   - `test_evaluate_combat_session_empty_safeguard`: Validasi sesi pertarungan tanpa ronde aktif menghasilkan durasi 0.0, beban 0.0 AU, dan status nihil.
2. **Hasil Pytest**:
   - Perintah: `npm run test:python`
   - Hasil: **83 Passed, 0 Failed dalam 1.00 detik** (100% lulus tanpa regresi).
3. **Kepatuhan Batasan Baris Kode**:
   - `combat_engine.py`: 204 baris ($< 300$ baris).
   - `test_combat.py`: 168 baris ($< 300$ baris).
   - Status Git: *Uncommitted / Clean unstaged working tree*.
