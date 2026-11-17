# Changelog: Tactical Deck Goals Telemetry Metric & Contextual Unlock Banner Remediation (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-15 10:40:00 WIB
- **Tipe**: `feat(ui)` / `fix(domain-math)` / `fix(telemetry-formatting)` / `refactor(ergonomics)`
- **Commit Message Rujukan**: `feat(ui): remediate tactical deck goals telemetry division bug and contextualize unlock gateway banner strictly under 300 lines` *(Uncommitted Working Tree)*
- **Branch**: `feat/ui` / `main`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-15_10-40-00_feat-tactical-deck-goals-telemetry-and-unlock-banner-remediation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-15_10-40-00_feat-tactical-deck-goals-telemetry-and-unlock-banner-remediation.md)

---

## 1. Latar Belakang & Identifikasi Diskrepansi Visual Pengguna

Berdasarkan inspeksi tangkapan layar antarmuka pengguna pada komponen `MODUL TAKTIS` (Tab `Sasaran`):
1. **Bug Pembagian `/ 1000` pada Sasaran Jarak Bulanan (`DISTANCE_MONTHLY`)**:
   - Kartu sasaran sekunder `Akumulasi Siklus 12-Minggu (Sepeda + Lari)` menampilkan progres `20%`, namun telemetri numerik di bawahnya tertulis secara kontradiktif:
     - `Tercapai: 0.1 km` | `Target: 0 km`!
   - **Akar Masalah**: Nilai aktual pada database PostgreSQL adalah `current_value: 79.50` dan `target_value: 400.00` dengan `unit: 'km'`. Kode pada baris 173–186 sebelumnya mengasumsikan tipe `DISTANCE_MONTHLY` tersimpan dalam satuan meter mentah, sehingga mengeksekusi pembagian redundant `/ 1000`:
     - $79.5 / 1000 = 0.0795\text{ km} \rightarrow$ dibulatkan menjadi `0.1 km`.
     - $400 / 1000 = 0.4\text{ km} \rightarrow$ dibulatkan menjadi `0 km`.
2. **Klaim Palsu Pembukaan Gran Fondo 200 km (*Misleading Progressive Unlock*)**:
   - Muncul spanduk hijau berbunyi:
     `🎯 Tonggak Sasaran Memenuhi Target!`
     `Target lanjutan sepeda (Gran Fondo / 200 km) telah terbuka di halaman /goals`
   - Padahal sasaran sepeda `First 100 km Century Ride` atlet baru mencapai **56.1 km (56%)** dan belum tuntas.
   - **Akar Masalah**: Pengecekan pada baris 22 menggunakan `goals.some()`, yang terpicu karena sasaran sekunder `Konsistensi 3 Sesi Mingguan` telah tercapai (3/3 sesi). Teks spanduk di-hardcode seolah-olah target sepeda Century Ride telah selesai.
3. **Pemotongan Teks Sub-Judul Spanduk (*Truncated Text*)**:
   - Sub-judul spanduk terpotong elipsis prematur (`...tel`) akibat penerapan `truncate` kaku di samping tombol CTA.
4. **Harmonisasi Satuan Bahasa**:
   - Mengubah tampilan `sessions` (bahasa Inggris) menjadi `sesi` (bahasa Indonesia) agar selaras dengan keseluruhan HUD avionics.

---

## 2. Rincian Rekayasa & Solusi Perbaikan

### A. Refaktorisasi Telemetri Format Sasaran ([`DashboardMacroGoalsCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardMacroGoalsCard.tsx))
- **Fungsi Terpadu `formatGoalMetric`**:
  - Memeriksa unit secara presisi (`km`, `m`, `sesi`). Nilai `km` tidak lagi dibagi 1000.
  - Sasaran 12-minggu kini menampilkan **`Tercapai: 79.5 km`** dan **`Target: 400 km`** secara proporsional dan akurat dengan persentase `20%`.
- **Spanduk Progresif Berbasis Konteks Nyata (*Truthful Unlock Gateway*)**:
  - Pembukaan Gran Fondo 200 km dikunci secara eksklusif hanya jika sasaran 100 km Century Ride telah tuntas (`is100kAchieved`).
  - Apabila sasaran sekunder lain yang tercapai (misal: Konsistensi Mingguan), sistem menampilkan spanduk apresiasi kontekstual:
    `🎉 Sasaran Tercapai: [Nama Sasaran]` dengan tautan `Lihat Sasaran →`.
- **Penghapusan Truncate Prematur**:
  - Mengganti kelas CSS `truncate` menjadi `line-clamp-1 sm:line-clamp-none` agar teks informatif terbaca utuh.

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture*)

| Berkas / Komponen | Baris Sebelum | Baris Sesudah | Batas Maksimum | Status |
| :--- | :---: | :---: | :---: | :---: |
| [`src/components/dashboard/DashboardMacroGoalsCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardMacroGoalsCard.tsx) | 269 | **253** | < 300 | ✅ Patuh (Aman) |

---

## 4. Hasil Verifikasi Sistem

1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Error** (Lolos 100%).
2. **Kompilasi & Prerender Produksi (`npm run build`)**:
   - Status: **34/34 rute berhasil dikompilasi**.
3. **Automated Test Suite (`npm run test:all`)**:
   - Status: **102/102 test cases hijau (100% PASS)**:
     - Health & Clinical Suite: 31/31 PASSED
     - Coach & Training Progression Suite: 5/5 PASSED
     - Weekly Streak & Thermodynamics Suite: 21/21 PASSED
     - BOLA Authorization Security Suite: 5/5 PASSED
     - Python Sports Science Suite: 16/16 PASSED
4. **Git Safety Compliance**:
   - Seluruh perubahan berada di *unstaged working tree* tanpa commit git langsung (`"jangan langsung di commit, paham?!"`).
