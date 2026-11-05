# Changelog: Open Book Style Add Activity Telemetry Modal (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-05 19:10:00 WIB
- **Tipe**: `feat(ui)` / `feat(modal)` / `feat(telemetry)` / `feat(design-system)`
- **Commit Message Rujukan**: `feat(ui): redesign add activity telemetry modal into realistic two-page open book notebook logbook`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-05_19-10-00_feat-open-book-activity-telemetry-notebook-modal.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum implementasi ini, modal pencatatan aktivitas telemetri baru (`AddActivityModal`) menggunakan desain dialog pop-up konvensional satu kolom (*single-column generic card modal*):

1. **Kepadatan Informasi & Beban Gulir (*Scroll Fatigue*)**:
   - Komponen pengunggah gambar telemetri berbasis AI Vision (OCR), pemilihan kategori cabang olahraga, isian manual (nama, tanggal, jarak, jam/menit/detik, elevasi), hasil kinematika terhitung, evaluasi klinis intensitas Zone 2 (skala Borg CR10), serta proteksi cedera sendi ditumpuk dalam satu kolom vertikal panjang. Pengguna harus menggulir berkali-kali untuk meninjau formulir.
2. **Ketiadaan Nuansa Jurnal Lapangan Fisik (*Athletic Field Notebook*)**:
   - Sebagai platform yang berfokus pada pelatihan atlet ketahanan (*Endurance Performance Lab*), pengalaman mencatat sesi latihan seharusnya mencerminkan buku logbook harian atlet (*athlete training journal*), di mana bukti foto dan evaluasi subjektif tercatat layaknya lembaran buku fisik yang dibuka di atas meja kerja.
3. **Pemisahan Kontekstual Antara Bukti Telemetri dan Formulir Isian**:
   - Pada desain modal lama, pengguna yang mengunggah screenshot Strava/Garmin tidak dapat melihat pratinjau bukti foto secara berdampingan dengan isian formulir yang diekstrak, sehingga verifikasi data menjadi kurang intuitif.

Pembaruan ini merombak total antarmuka modal menjadi **Tampilan Buku Terbuka (Open Book / Two-Page Athletic Logbook Spread)** yang membagi informasi menjadi dua halaman buku berdampingan dengan lipatan punggung buku, pita pembatas fisik, dan tekstur lembaran kertas bergaris (*ruled paper lines*).

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Rekayasa Kontainer Buku Terbuka Dua Halaman (`src/components/activity/modal/AddActivityModal.tsx`)

File modal utama direstrukturisasi dari kontainer vertikal tunggal menjadi layout bentangan dua halaman (*two-page open book spread*) responsif berukuran `max-w-6xl`:

1. **Bingkai Buku Terbuka & Efek Kedalaman (*Open Book Hull*)**:
   ```tsx
   <div className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl bg-[#0a0f0c] p-2.5 sm:p-4 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_2px_#27372d,0_10px_30px_rgba(16,185,129,0.1)] border border-[#233228] relative overflow-hidden">
     {/* Pita Pembatas Buku Merah/Emas di Punggung Buku Tengah Atas */}
     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-8 bg-gradient-to-b from-rose-600 via-rose-700 to-rose-800 rounded-b-md shadow-md z-30 flex items-end justify-center pb-1 pointer-events-none">
       <div className="w-3 h-1 bg-amber-400/60 rounded-full" />
     </div>
   ```
2. **Lipatan Tengah Punggung Buku (*Book Crease & Spine Shadow*)**:
   - Diimplementasikan menggunakan gradien linear `from-black/50 via-black/80 to-black/50` di posisi `left-1/2 -translate-x-1/2` untuk menciptakan ilusi lekukan kertas dan jahitan punggung buku (*spine binding*).
3. **Tekstur Kertas Bergaris (*Ruled Paper Pattern*)**:
   - Menambahkan garis horizontal hijau zamrud transparan (*ruled line 28px*) serta garis margin vertikal merah marun (*red margin rule*) pada posisi `38px` dari sisi kiri halaman menggunakan inline background-image CSS:
     ```css
     linear-gradient(to right, rgba(239, 68, 68, 0.35) 1px, transparent 1px),
     linear-gradient(to bottom, rgba(52, 211, 153, 0.06) 1px, transparent 1px)
     ```

---

### B. Arsitektur Halaman Kiri (Left Page: Bukti Telemetri & Kinematika)

Halaman kiri difungsikan sebagai area dokumentasi bukti fisik sesi:
1. **Penomoran Lembar & Kalender Dinamis**:
   - Header menampilkan `HALAMAN 12 • LOG TELEMETRI` beserta tanggal sesi terformat dalam bahasa Indonesia (`Kamis, 5 Nov 2026`).
2. **Integrasi Pratinjau Lampiran OCR (`ActivityImageUploader`)**:
   - Menempatkan area ekstraksi OCR di sisi kiri sehingga atlet dapat memindai screenshot Strava/Garmin tanpa kehilangan konteks visual isian form.
3. **Papan Kinematika Tertulis (*Live Computed Kinematics Slate*)**:
   - Menghitung kecepatan linier ($v$) dan pace lari ($p$) secara instan dan menampilkannya dalam grid metrik bertinta jurnal:
     $$v = \frac{\text{numericDistanceKm}}{\text{totalDurationSeconds}} \times 3600 \quad (\text{km/jam})$$
     $$p = \left\lfloor\frac{s}{60}\right\rfloor : \left(s \pmod{60}\right) \quad (\text{menit:detik /km})$$

---

### C. Arsitektur Halaman Kanan (Right Page: Formulir Manual & Audit Medis)

Halaman kanan difungsikan sebagai lembaran entri form dan verifikasi klinis:
1. **Penomoran Lembar & Status Target**:
   - Header menampilkan `HALAMAN 13 • FORMULIR & AUDIT SENDI` dan badge sesi target pelatihan (misal: *Target: MTB Zone 2*).
2. **Formulir Isian Lapangan (`ActivityManualFormFields`)**:
   - Pemilihan cabang olahraga terformat dalam tombol stempel (*preset stamps*): Sepeda, Lari, Renang, Jalan, Gym/Beban, Umum, dan opsi cabang kustom.
   - Input judul sesi, waktu & tanggal, jarak tempuh, durasi 3 kolom (jam, menit, detik), serta elevasi gain.
3. **Pemeriksaan Klinis Intensitas & Sendi (`ActivityHealthCheckinFields`)**:
   - Skala Borg CR10 untuk verifikasi Zone 2 (RPE 3–4).
   - Skala proteksi nyeri sendi engkel kanan & kedua lutut (0-10) dengan peringatan visual berjenjang.
   - *Circuit-breaker checkbox* untuk pembengkakan (*swelling*) dan ketidakstabilan sendi (*instability*).
4. **Bilah Aksi Penulisan Jurnal**:
   - Tombol `"TULIS KE BUKU JURNAL"` dengan animasi feedback saat pengiriman payload ke REST API `/api/activities`.

---

### D. Penyelarasan Sub-komponen Input & Lampiran

1. **`ActivityImageUploader.tsx`**:
   - Mendesain ulang wadah dropzone gambar agar menyerupai klip foto polaroid (*photo clip attachment*) yang direkatkan ke lembaran jurnal catatan.
   - Menyediakan toggle transparansi teks mentah hasil pemindaian (*Raw OCR transcript preview*).
2. **`ActivityManualFormFields.tsx`**:
   - Menyelaraskan border input `#2b3a30`, warna latar field `#121915`, dan aksen fokus emerald `#10B981` agar menyatu dengan warna lembaran buku.
3. **`ActivityHealthCheckinFields.tsx`**:
   - Mengubah kartu audit menjadi lembar audit kesehatan sendi terstandarisasi dengan highlight visual target fisiologis.

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/components/activity/modal/AddActivityModal.tsx` | Modifikasi | +436 | -282 | Redesain total modal menjadi buku terbuka dua halaman (*two-page spread*), pita pembatas, & lipatan tengah |
| `src/components/activity/modal/ActivityManualFormFields.tsx` | Modifikasi | +88 | -64 | Penyesuaian tema kolom jurnal atlet, badge stempel olahraga, & field form |
| `src/components/activity/modal/ActivityImageUploader.tsx` | Modifikasi | +78 | -56 | Penataan area lampiran bukti foto OCR bergaya klip polaroid di lembaran kiri |
| `src/components/activity/modal/ActivityHealthCheckinFields.tsx` | Modifikasi | +64 | -48 | Penataan lembar audit klinis RPE Borg CR10 & pemantauan nyeri sendi |

**Total Perubahan**: 4 file termodifikasi, **+666 baris ditambahkan**, **-450 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - **Hasil**: Exit code `0` (0 Error, 100% Type-Safe).
2. **Verifikasi Produksi Build Next.js (Turbopack)**:
   - Perintah: `npm run build`
   - **Hasil**: Kompilasi selesai dalam 4.5s, seluruh 27 rute aplikasi (`/`, `/training`, `/coach/cycling`, `/coach/running`, `/activities`, `/health`, `/goals`, dsb.) berhasil teroptimasi tanpa kendala.
3. **Suite Pengujian Mingguan & Spektrum Termal Streak**:
   - Perintah: `npm run test:streak`
   - **Hasil**: **21 PASSED, 0 FAILED (100%)** mencakup validasi tier termal Api Oranye (Stage 2) pada database riil atlet.
4. **Pengujian Responsif & Perilaku Modal**:
   - Pada layar desktop (`lg:` ke atas): Menampilkan format dua halaman berdampingan secara utuh (*two-page spread*).
   - Pada layar mobile/tablet: Lembaran melipat secara proporsional dari atas ke bawah (*stacked pages*) tanpa merusak fungsi formulir maupun OCR.
5. **Verifikasi HTTP Endpoint Terkait**:
   - `http://localhost:3000/training` $\to$ **HTTP 200 OK**.
   - `http://localhost:3000/api/activities` $\to$ **HTTP 200 OK**.
