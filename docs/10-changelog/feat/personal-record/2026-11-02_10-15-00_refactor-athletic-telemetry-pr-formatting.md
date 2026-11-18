# Changelog: Standardisasi Format Telemetri Rekor Pribadi & Eliminasi Notasi Informal (`feat/personal-record`)

- **Tanggal & Waktu**: 2026-11-02 10:15:00 WIB
- **Tipe**: `refactor(ui)` / `fix(telemetry)` / `data(db)` / `docs(standards)`
- **Commit Message**: `refactor(personal-records): standardize athletic telemetry format and eliminate informal at-notation`
- **Branch**: `feat/personal-record`

---

## 1. Latar Belakang & Masalah Tampilan

Pada implementasi tolok ukur performa multi-sport sebelumnya, metrik tolok ukur untuk kategori bersepeda jarak jauh `40K+ Endurance Ride` disajikan dengan format:
```text
56.1 km @ 21.4 km/h
```

Hal ini menimbulkan kendala teknis dan estetika antarmuka:
1. **Ketidaksesuaian Standar Atletik**:
   Di platform telemetri dan analisis keolahragaan profesional seperti Strava, Garmin Connect, maupun TrainingPeaks, simbol `@` (*"at"*) tidak pernah digunakan pada kartu tolok ukur (*Personal Records*). Simbol `@` merupakan format percakapan/slang informal bahasa Inggris yang rancu dan tidak baku dalam sistem metrik atletik.
2. **Masalah Tata Letak & Pembungkusan Teks (*Awkward Word Wrapping*)**:
   String gabungan `56.1 km @ 21.4 km/h` memiliki panjang 19+ karakter. Pada resolusi kartu metrik dengan font monospace tabular berukuran besar (`text-xl font-bold font-mono`), teks terpotong dan patah ke baris berikutnya (`56.1 km @ 21.4` di baris atas, dan `km/h` sendirian di baris bawah), yang merusak konsistensi grid visual *Obsidian Telemetry*.
3. **Kebutuhan Konsistensi dengan Kartu Lain**:
   Seluruh kartu benchmark lainnya (`23.8 km/h`, `▲ 125 m`, `56.10 km`, `6:23 /km`, `31:55`, `1:24:20`, `12.33 km`) menampilkan metrik nilai utama tunggal yang bersih dalam 1 baris, dengan detail pelengkap ditempatkan rapi pada baris subteks.

---

## 2. Rincian Implementasi & Perubahan

### A. Mesin Kalkulasi PR Dinamis (`src/lib/personalRecords.ts`)
- Memperbarui kalkulasi `40K+ Endurance Ride`:
  - **`record_display`**: Diubah dari `${distKm.toFixed(1)} km @ ${kmh.toFixed(1)} km/h` menjadi `${distKm.toFixed(2)} km` (`56.10 km`).
  - **`subtext`**: Kecepatan rata-rata dan durasi dipindahkan ke slot telemetri sekunder: `Avg ${kmh.toFixed(1)} km/h • ${formatDuration(durSec)} century pace`.
  - Format angka utama kini konsisten 2 desimal presisi dan muat utuh dalam 1 baris tanpa *line wrap*.

### B. Skrip Sinkronisasi & Migrasi Basis Data (`scripts/sync_personal_records.js`)
- Memperbarui fungsi `computePRs(activities, userId)` pada baris tolok ukur ketahanan 40K+:
  ```javascript
  // 2D. 40K+ Endurance Ride
  prs.push({
    user_id: userId,
    activity_id: best40k.id,
    sport_type: 'Ride',
    category: '40K+ Endurance Ride',
    record_value: Math.round(distKm * 10) / 10,
    record_display: `${distKm.toFixed(2)} km`,
    achieved_date: best40k.start_date,
  });
  ```
- Menjalankan sinkronisasi ulang ke PostgreSQL 16 (`sport_training`). Kolom `record_display` pada tabel `personal_records` untuk kategori `40K+ Endurance Ride` terverifikasi terbarui menjadi `'56.10 km'`.

### C. Pembaruan Spesifikasi Domain Teknis (`docs/05-domain-logic/PERSONAL_RECORDS.md`)
- Memperbarui tabel tolok ukur bersepeda:
  - Format tampilan diselaraskan dari `XX.X km @ YY.Y km/h` menjadi `XX.XX km` (presisi $0.01$).
  - Aturan pencatatan menegaskan bahwa kecepatan rata-rata disajikan pada subteks pendukung (`Avg 21.4 km/h • century pace`).

---

## 3. Hasil Verifikasi

1. **Integritas Basis Data PostgreSQL**:
   ```text
   ┌─────────┬────────────────────────┬────────────────┬────────────┐
   │ (index) │ category               │ record_display │ sport_type │
   ├─────────┼────────────────────────┼────────────────┼────────────┤
   │ 0       │ '40K+ Endurance Ride'  │ '56.10 km'     │ 'Ride'     │
   │ 1       │ 'Fastest Speed (≥20K)' │ '23.8 km/h'    │ 'Ride'     │
   │ 2       │ 'Longest Ride'         │ '56.10 km'     │ 'Ride'     │
   │ 3       │ 'Max Elevation Climb'  │ '▲ 125 m'      │ 'Ride'     │
   │ 4       │ '10K Benchmark'        │ '1:24:20'      │ 'Run'      │
   │ 5       │ '5K Benchmark'         │ '31:55'        │ 'Run'      │
   │ 6       │ 'Best Aerobic Pace'    │ '6:23 /km'     │ 'Run'      │
   │ 7       │ 'Longest Run'          │ '12.33 km'     │ 'Run'      │
   └─────────┴────────────────────────┴────────────────┴────────────┘
   ```
2. **Verifikasi Server & Rendering Antarmuka**:
   - Respon stream SSR `http://localhost:3000/` diverifikasi mengandung `56.10 km` dan subteks `Avg 21.4 km/h • 2:37:00 century pace`.
   - String `@ 21.4` dipastikan 100% lenyap dari kode dan respon HTML (`Contains @ 21.4: false`).
   - Tampilan visual kartu metrik presisi, proporsional, dan bebas dari pembungkusan baris ganjil.
3. **Integritas Berkas Changelog Sebelumnya**:
   - Berkas [`docs/10-changelog/feat/personal-record/2026-11-02_09-45-00_feat-multi-sport-personal-records.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/personal-record/2026-11-02_09-45-00_feat-multi-sport-personal-records.md) dikembalikan utuh tanpa perubahan (bersih/unmodified).

