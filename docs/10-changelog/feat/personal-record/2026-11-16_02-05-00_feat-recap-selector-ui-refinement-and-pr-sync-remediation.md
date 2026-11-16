# Changelog: Penyempurnaan Tampilan Selektor Siklus Rekapitulasi & Remediasi Sinkronisasi Rekor Personal (`feat/personal-record`)

- **Tanggal & Waktu**: 2026-11-16 02:05:00 WIB
- **Tipe**: `feat(ui)` / `fix(telemetry)` / `data(db)` / `refactor(styles)`
- **Commit Message Rujukan**: `feat(recap): eliminate native desktop scrollbar on cycle selector and synchronize ground-truth personal records` *(Uncommitted Working Tree)*
- **Branch**: `feat/personal-record`
- **Lokasi**: [`docs/10-changelog/feat/personal-record/2026-11-16_02-05-00_feat-recap-selector-ui-refinement-and-pr-sync-remediation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/personal-record/2026-11-16_02-05-00_feat-recap-selector-ui-refinement-and-pr-sync-remediation.md)

---

## 1. Latar Belakang Masalah & Kebutuhan Atlet

Berdasarkan audit antarmuka performa dan verifikasi langsung terhadap tampilan dashboard:

1. **Intrusi Scrollbar Horizontal Native Desktop pada Selektor Siklus**:
   - Pada halaman rekapitulasi [`/recap`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapHub.tsx), bilah navigasi cepat histori siklus mingguan (`PILIH SIKLUS:`) menggunakan kelas Tailwind `overflow-x-auto scrollbar-thin`.
   - Di peramban Windows desktop (Edge/Chrome/Firefox), hal ini memicu munculnya bilah *native scrollbar* tebal berwarna abu-abu/putih lengkap dengan tombol panah kiri-kanan (`◀` dan `▶`). Bilah scroll ini memakan ruang vertikal secara berlebihan, merusak estetika gelap *Graphite Obsidian*, dan mengganggu pengalaman pengguna.
2. **Ketergantungan Jalur Berkas Statis pada Skrip Sinkronisasi Rekor**:
   - Skrip pemeliharaan [`scripts/maintenance/sync_personal_records.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/maintenance/sync_personal_records.js) sebelumnya membaca dari `data/imported_activities.json` yang sudah usang dan tidak ada di repositori, sehingga pembaruan tabel `personal_records` di PostgreSQL gagal berjalan otomatis.
   - Akibatnya, 3 rekor statis *dummy seed* lama (`5K 20:30`, `10K 42:30`, dan `Half Marathon 1:36:00` dengan `activity_id: null`) tertinggal di basis data, memicu anomali jumlah rekor (`Rekor 9`) serta menimpa rekor 5K asli atlet ($31:55$) dan memunculkan rekor Half Marathon fiktif.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Utilitas Universal Anti-Scrollbar (`src/app/globals.css`)
Menambahkan utilitas global `.no-scrollbar` yang menyembunyikan scrollbar OS tanpa menghilangkan fungsi geser alami (*smooth touch / mouse swipe*):
```css
/* Universal No-Scrollbar utility (hides native scrollbars across Chrome, Edge, Safari, Firefox) */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### B. Desain Ulang Bilah Selektor Histori Siklus (`src/components/recap/WeeklyRecapHub.tsx`)
1. **Eliminasi Scrollbar Kaku**: Mengganti kelas pemicu `scrollbar-thin` dengan `no-scrollbar scroll-smooth`.
2. **Pembungkusan Kontainer Terpadu**: Membungkus label `PILIH SIKLUS:` dan deretan tombol pil ke dalam bilah alat terpadu dengan latar belakang kartu berbayang tipis (`p-1.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs`).
3. **Tipografi Responsif**: Label siklus menyesuaikan diri secara adaptif (`hidden sm:inline` untuk `PILIH SIKLUS:` dan `sm:hidden` untuk `SIKLUS:`).

### C. Harmonisasi Kartu Rekap Dasbor (`src/components/analytics/WeeklyRecapCard.tsx`)
Menerapkan kelas `no-scrollbar` pada bilah pil riwayat siklus di kartu rekap widget dasbor taktis.

### D. Modernisasi Sumber Data Skrip Sinkronisasi Rekor (`scripts/maintenance/sync_personal_records.js`)
1. Mengubah skrip agar terhubung langsung ke basis data PostgreSQL (`SELECT * FROM activities WHERE user_id = $1 ORDER BY start_date ASC`) dengan fallback ke `.data/store.json`.
2. Menghapus 3 rekor dummy unlinked dan menyelaraskan 8 rekor multi-sport terverifikasi (4 Lari + 4 Sepeda) dengan `activity_id` nyata ke PostgreSQL dan `.data/store.json`:
   - `5K Benchmark`: **31:55** (Run)
   - `10K Benchmark`: **1:24:20** (Run)
   - `Longest Run`: **12.33 km** (Run)
   - `Best Aerobic Pace`: **6:23 /km** (Run)
   - `Longest Ride`: **62.37 km** (Ride)
   - `Fastest Speed (≥20K)`: **23.8 km/h** (Ride)
   - `Max Elevation Climb`: **▲ 224 m** (Ride)
   - `40K+ Endurance Ride`: **56.10 km** (Ride)

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture*)

| Berkas yang Dimodifikasi | Baris Kode | Batas Maksimum | Status |
| :--- | :---: | :---: | :---: |
| `src/app/globals.css` | **137** | < 300 | ✅ Patuh (Aman) |
| `src/components/recap/WeeklyRecapHub.tsx` | **290** | < 300 | ✅ Patuh (Aman) |
| `src/components/analytics/WeeklyRecapCard.tsx` | **289** | < 300 | ✅ Patuh (Aman) |
| `scripts/maintenance/sync_personal_records.js` | **298** | < 300 | ✅ Patuh (Aman) |

---

## 4. Hasil Verifikasi Sistem

1. **Sinkronisasi Database**:
   - Skrip `node scripts/maintenance/sync_personal_records.js` berhasil dieksekusi dengan exit code 0.
   - Tabel `personal_records` di PostgreSQL terverifikasi memuat **8 rekor multi-sport terverifikasi** dengan tautan `activity_id` valid.
2. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Error**.
3. **Seluruh Rangkaian Uji Regresi (`npm run test:all`)**:
   - Status: **109/109 PASSED (100% Green)**.
4. **Next.js Production Build (`npm run build`)**:
   - Status: **34/34 rute sukses terkompilasi (0 error, 0 warning)**.
5. **Pohon Kerja Git**:
   - Seluruh perubahan berada di *unstaged working tree* tanpa commit git langsung (`NO DIRECT COMMITS`).
