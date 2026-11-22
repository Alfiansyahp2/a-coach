# Changelog: Refaktor Fase 3 (Beregu & Catapult PlayerLoad) dan Fase 4 (Raket & Sinkronisasi Presisi) (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-23 01:45:00 WIB
- **Tipe**: `refactor(sports-science)` / `feat(python-engine)` / `test(unit)`
- **Commit Message Rujukan**: `refactor(python): enhance phase 3 team engine with catapult sampling scaling and hamstring acute exposure, and phase 4 racquet engine with archery hold penalty and diastolic async gates` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/refactor/2026-11-23_01-45-00_refactor-phase-3-and-4-team-catapult-and-racquet-precision.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-23_01-45-00_refactor-phase-3-and-4-team-catapult-and-racquet-precision.md)

---

## 1. Latar Belakang & Rasional Refaktor

Sesuai rencana audit fisiologis menyeluruh pada Fase 3 ([`team_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/team_engine.py)) dan Fase 4 ([`racquet_precision_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/physiology/racquet_precision_engine.py)), dilakukan penyempurnaan domain logic untuk mengatasi perbedaan frekuensi instrumen telemetri dan batasan klinis atletik:

### A. Fase 3: Olahraga Beregu & Lapangan Intermiten
1. **Penskalaan Frekuensi Sampling Catapult PlayerLoad ($100\text{ Hz}$ IMU vs $10\text{ Hz}$ Wearable GPS)**:
   - Rumus resmi Catapult mengasumsikan sinyal akselerometer triaksial berkecepatan tinggi ($100\text{ Hz}$). Pada jam tangan pintar/sensor GPS konsumen ($10\text{ Hz}$ atau $1\text{ Hz}$), selisih diferensial per detik jauh lebih sedikit sehingga total PlayerLoad anjlok drastis jika tidak dinormalisasi. Ditambahkan faktor penskalaan $k_{\text{rate}} = \sqrt{100 / f_s}$ untuk mempertahankan ekuivalensi impuls mekanis tanpa memecah kompatibilitas mundur.
2. **Proteksi Paparan Sprint Akut Tanpa Fondasi Kronis (*Unconditioned Acute Sprint Hazard*)**:
   - Berdasarkan protokol pencegahan cedera *Aspetar Hamstring Project*, atlet yang berlari sprint $> 300\text{ m}$ tanpa baseline riwayat 4 pekan memiliki risiko robekan eksentrik biseps femoris tinggi (*HIGH*).
3. **Kriteria Ganda Beban Impak Pendaratan Tendon Patellar**:
   - Peringatan tendinopati patellar dan penguncian pliometrik 48 jam kini dipicu oleh ambang kuantitas lonjakan ($> 60$ lompatan) ATAU akumulasi energi kejut kinetik pendaratan ekstrem ($\ge 200\text{ kJ}$).
4. **Safeguard Sesi Beregu Kosong**:
   - Menangani `duration_minutes <= 0.0` secara deterministik dengan mengembalikan skor beban 0.0 AU dan jendela istirahat 0 jam.

### B. Fase 4: Olahraga Raket & Presisi Neuromuskular
1. **Penalti Waktu Tahan Busur Panahan (*Isometric Anchor Hold Fatigue*)**:
   - Menahan tarikan busur (*anchor hold*) melebihi $> 4.5\text{ detik}$ per anak panah menyebabkan desaturasi oksigen dan kelelahan isometrik akut pada otot penstabil skapula (*rhomboids* & *trapezius*). Diterapkan faktor pengali penalti beban $1.25\times$.
2. **Gerbang Kardiomotorik Asinkron Kritis (*Critical Diastolic Desynchronization*)**:
   - Pelepasan picu tembak presisi pada sinkronisasi diastolik di bawah $< 50\%$ kini diklasifikasikan sebagai `CRITICAL_ASYNC` akibat pulsasi arteri balistik sistolik (*ballistocardiography*) yang merusak stabilitas bidikan.
3. **Safeguard Sesi Raket Kosong**:
   - Menangani durasi 0.0 menit dengan aman tanpa memicu pembagian nol.
4. **Relaksasi Validasi Model Pydantic**:
   - Memperbarui `TeamSessionInput` dan `RacquetPrecisionSessionInput` dari `ge=1.0` menjadi `ge=0.0` agar sesi berdurasi 0 (aborted/empty) dapat divalidasi dengan aman oleh parser.

---

## 2. Matriks Formula Refaktor Fase 3 & 4

| Domain / Fungsi | Formula Matematis Terkalibrasi (KaTeX) | Rasional Fisiologis & Komputasi |
|---|---|---|
| **Catapult Rate Scaling** | $\text{PlayerLoad} = \sum \sqrt{\frac{\Delta y^2 + \Delta x^2 + \Delta z^2}{100}} \cdot \sqrt{\frac{100}{f_s}}$ | Menjaga konsistensi PlayerLoad antara perangkat 10 Hz GPS dan 100 Hz Catapult |
| **Aspetar Sprint Threshold** | $\text{Risk} = \text{HIGH if } d_{\text{sprint}} > 300\text{m} \text{ (tanpa chronic)}$ | Mencegah cedera regangan eksentrik hamstring saat paparan sprint akut pertama |
| **Patellar Energy Gate** | $\text{Warn} = (N_{\text{jump}} > 60) \lor (E_{\text{kinetic}} \ge 200\text{ kJ})$ | Proteksi terhadap *jumper's knee* pada lonjakan berbobot tinggi/unilateral |
| **Archery Hold Penalty** | $V_{\text{eff}} = V_{\text{raw}} \cdot (1.25 \text{ if } t_{\text{hold}} > 4.5\text{s else } 1.0)$ | Kompensasi kelelahan kontraksi isometrik penstabil skapula |
| **Diastolic Async Gate** | $\text{Class} = \text{CRITICAL\_ASYNC if } \text{Sync Rate} < 50\%$ | Menandai gangguan mikromotorik akibat hentakan denyut nadi sistolik |

---

## 3. Rangkaian Pengujian Otomatis

1. **Suite Pengujian Pytest yang Diperbarui**:
   - [`test_team.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_team.py): 14 uji unit (bertambah 4 uji unit baru).
   - [`test_racquet_precision.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/tests/test_racquet_precision.py): 13 uji unit (bertambah 3 uji unit baru).
2. **Hasil Pytest**:
   - Perintah: `npm run test:python`
   - Hasil: **90 Passed, 0 Failed dalam 0.80 detik** (100% lulus tanpa regresi).
3. **Kepatuhan Batasan Baris Kode ($< 300$ baris)**:
   - `team_engine.py`: 233 baris ($< 300$).
   - `test_team.py`: 171 baris ($< 300$).
   - `racquet_precision_engine.py`: 198 baris ($< 300$).
   - `test_racquet_precision.py`: 157 baris ($< 300$).
   - `models.py`: 234 baris ($< 300$).
   - `racquet_models.py`: 47 baris ($< 300$).
   - Status Git: *Uncommitted / Clean unstaged working tree*.
