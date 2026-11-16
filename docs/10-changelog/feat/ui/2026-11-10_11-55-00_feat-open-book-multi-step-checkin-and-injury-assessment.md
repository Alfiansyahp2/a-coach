# Changelog: Multi-Step Open Book Activity Logging to Post-Activity Check-in & New Injury Assessment (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-10 11:55:00 WIB
- **Tipe**: `feat(ui)` / `feat(activity)` / `feat(health)` / `refactor(ux)` / `perf(workflow)`
- **Commit Message Rujukan**: `feat(ui): implement multi-step open book activity logging to post-activity checkin and new injury assessment`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-10_11-55-00_feat-open-book-multi-step-checkin-and-injury-assessment.md`

---

## 1. Latar Belakang & Permintaan Pengguna

Berdasarkan tinjauan alur pencatatan sesi latihan pada modal buku jurnal (*Open Book Activity Modal*), sebelumnya proses pencatatan berlangsung dalam 1 lembar tunggal (*single page spread* Halaman 12 & 13). Pada lembar tersebut, formulir manual data sesi dan audit klinis sendi dipadatkan ke dalam satu kolom vertikal sempit. Kondisi ini membatasi kapasitas audit pasca sesi serta tidak menyediakan alur terintegrasi untuk mendeteksi trauma atau insiden cedera baru yang timbul selama latihan berlangsung.

Pengguna mengajukan permintaan spesifik beserta 2 lampiran visual:
> *"buat setelah mengisi ini berpindah ke halaman berikutnya dan berisi gambar ke 2 dan dapat satu lagi sperti cidera baru atau tidak"*

### Analisis Lampiran Pengguna:
1. **Gambar 1 (`media_1794285219880_b88d9eb5.jpg`)**:
   - Menampilkan modal buku jurnal terbuka:
     - **Halaman 12**: Bukti Fisik & Kinematika Sesi (Scanner OCR foto Strava/Garmin, pembacaan durasi, jarak, speed, dan pace).
     - **Halaman 13**: Formulir isian manual sesi (Nama sesi, waktu pelaksanaan, jarak tempuh, durasi waktu, elevasi naik, deskripsi lapangan).
     - *Masalah*: Di bawah formulir manual terdapat kontrol klinis sendi dasar yang sempit dan tombol langsung menyelesaikan jurnal tanpa evaluasi mendalam.
2. **Gambar 2 (`media_1794285222735_996b5b79.jpg`)**:
   - Menampilkan modal *Check-In Pasca Latihan* lengkap:
     - **Protokol Keselamatan Sendi**: Peringatan batas beban dan deteksi efusi/nyeri akut.
     - **Ringkasan Sesi Terkait**: Nama sesi, tanggal, jarak, dan durasi.
     - **1. Skala Nyeri Sendi (0 = Bebas Nyeri, 10 = Nyeri Berat)**: 3 slider (Saat Sesi Latihan, Sesaat Pasca Sesi, Keesokan Harinya).
     - **2. Indikator Biologis & Pembatasan Keamanan**: Checkbox *Pembengkakan Sendi Teramati?* dan *Ketidakstabilan / Sendi Goyang?*.
     - **Perceived Exertion (RPE 1-10)**: Skor Borg CR10.
     - **Catatan Subjektif Atlet**: Feedback sensasi sendi dan otot.
3. **Kebutuhan Fitur Tambahan ("dapat satu lagi seperti cedera baru atau tidak")**:
   - Evaluasi skrining insiden trauma baru pada sesi tersebut:
     - Pertanyaan klinis: *"Apakah timbul insiden atau cedera baru pada sesi latihan ini?"*.
     - Pilihan biner: `[ Tidak Ada Cedera Baru (Aman) ]` vs `[ Ya, Terjadi Insiden Cedera Baru ⚠️ ]`.
     - Jika dilaporkan cedera baru: formulir rincian anatomi sendi/otot, sisi tubuh, derajat keparahan awal (`MILD` / `MODERATE` / `SEVERE`), mekanisme insiden, dan catatan kronologi lapangan.
     - Data cedera langsung didaftarkan ke sistem rekam medis atlet (`POST /api/athlete/injuries`) dan memicu pembaruan kesiapan latihan (*readiness score*).

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Arsitektur Wizard Multi-Lembar Buku Jurnal (`src/components/activity/modal/AddActivityModal.tsx`)

Buku jurnal dirancang ulang menjadi alur multi-step 2 lembar (*two-spread open book wizard*) dengan transisi lembaran yang mulus tanpa merusak metafora buku fisik:

```tsx
{/* Lembar 1: Log Telemetri & Parameter Sesi (Hal 12-13) */}
{form.step === 1 ? (
  <>
    <AddActivityLeftPage {...form} />
    <AddActivityRightPage {...form} onNextStep={form.handleNextStep} />
  </>
) : (
  /* Lembar 2: Check-in Pasca Latihan & Skrining Cedera Baru (Hal 14-15) */
  <>
    <AddActivityCheckinLeftPage {...form} />
    <AddActivityInjuryRightPage {...form} onPrevStep={form.handlePrevStep} onSubmit={form.handleSubmit} />
  </>
)}
```

- **Pita Pembatas Tengah (*Ribbon Bookmark*)**: Dipertahankan di titik tengah vertikal buku (`absolute top-0 left-1/2`) sebagai pemisah estetis halaman kiri dan kanan.
- **Indikator Lembaran Dinamis**: Ditambahkan pada bilah kontrol kanan atas modal:
  - `form.step === 1` -> `Lembar 1: Log & Formulir (Hal 12-13)`
  - `form.step === 2` -> `Lembar 2: Check-in & Evaluasi (Hal 14-15)`

---

### B. Formulir Data Sesi & Tombol Transisi Lembar (`src/components/activity/modal/AddActivityRightPage.tsx`)

Didekomposisi menjadi komponen modular berukuran 156 baris untuk merender **Halaman 13**:
- Menampung seluruh kolom input manual: `sportType`, `name`, `startDate`, `distanceKm`, `durationHours/Minutes/Seconds`, `elevationMeters`, dan `description`.
- Tombol aksi di footer lembaran kanan:
  - `Batal / Tutup Lembaran`
  - `LANJUT KE CHECK-IN & EVALUASI →`: Menjalankan validasi input (nama aktivitas wajib diisi, serta jarak tempuh atau durasi harus bernilai valid) sebelum membalik ke Lembar 2.

---

### C. Halaman 14: Check-In Pasca Latihan (`src/components/activity/modal/AddActivityCheckinLeftPage.tsx`)

Komponen modular berukuran 194 baris yang mengimplementasikan seluruh elemen pada **Gambar 2** dengan tekstur kertas bergaris kotak jurnal (`var(--color-book-grid)`):

1. **Kotak Protokol Keselamatan Sendi**:
   ```tsx
   <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)]/90 border border-[var(--color-alert-amber)]/40 flex items-start gap-2.5 text-[10.5px]">
     <ShieldAlert className="w-4 h-4 text-[var(--color-alert-amber)] shrink-0 mt-0.5" />
     <p>
       <strong>Protokol Keselamatan:</strong> Data yang dilaporkan di sini langsung menentukan batas beban latihan sesi berikutnya. Hentikan latihan dan evaluasi bila timbul efusi atau nyeri akut.
     </p>
   </div>
   ```
2. **Kartu Ringkasan Sesi Terkait**:
   - Menampilkan badge jenis olahraga (`Ride`, `Run`, dsb.), nama sesi, tanggal kalender lokal, jarak tempuh, durasi total, dan kecepatan rata-rata atau pace.
3. **1. Skala Nyeri Sendi (0–10)**:
   - Disediakan 3 slider mandiri: *Saat Sesi Latihan*, *Sesaat Pasca Sesi*, dan *Keesokan Harinya*.
   - Nilai `0` ditandai warna hijau (Bebas Nyeri), sedangkan nilai `> 0` ditandai warna merah/amber penanda inflamasi.
4. **2. Indikator Biologis & Pembatasan Keamanan**:
   - Checkbox *Pembengkakan Sendi Teramati?*
   - Checkbox *Ketidakstabilan / Sendi Goyang?*
5. **Skala Beban Usaha (RPE Borg CR10)**:
   - Tombol selektor angka 1 sampai 10 dengan sorotan warna khusus pada skor 3–4 (*Zone 2 Aerobik*).
6. **Catatan Subjektif Atlet**:
   - Kolom isian teks untuk mencatat sensasi biomekanika, kekakuan sendi, atau respon beban.

---

### D. Halaman 15: Deteksi Insiden & Status Cedera Baru (`src/components/activity/modal/AddActivityInjuryRightPage.tsx`)

Komponen modular berukuran 250 baris dengan gaya margin lined paper (`var(--color-book-page-right)`) yang menjawab kebutuhan deteksi cedera baru:

1. **Pertanyaan Keputusan Klinis**:
   - Pilihan A: `[ ✓ Tidak Ada Cedera Baru (Aman) ]`
     - Menampilkan kartu jaminan: *"Status Sendi Terkendali & Aman. Sesi ini dicatat sebagai beban latihan adaptif normal tanpa pembatasan medis tambahan."*
   - Pilihan B: `[ ⚠️ Ya, Terjadi Cedera Baru ]`
     - Membuka formulir registrasi insiden trauma akut:
       - **Lokasi Anatomi**: Tombol cepat untuk `Engkel Kanan (ATFL)`, `Engkel Kiri`, `Lutut Kanan`, `Lutut Kiri`, `Tendon Achilles`, `Hamstring`, `Betis (Calf)`, `Paha Depan`, `Punggung Bawah`, `Bahu`, serta kolom isian teks bebas.
       - **Sisi Tubuh**: Selektor `Kanan` (`RIGHT`), `Kiri` (`LEFT`), atau `Kedua Sisi` (`BILATERAL`).
       - **Derajat Keparahan Awal**: Selektor `Ringan` (`MILD`), `Sedang` (`MODERATE`), atau `Berat` (`SEVERE`).
       - **Mekanisme Terjadinya Insiden**: Dropdown opsi `Terkilir / Twisting`, `Benturan / Impact Langsung`, `Nyeri Akut Mendadak`, `Beban Berlebih / Overuse`, atau `Tarikan Otot / Sprain`.
       - **Kronologi / Catatan Gejala Lapangan**: Textarea untuk mendokumentasikan rincian kejadian.
2. **Navigasi Footer**:
   - `← Kembali ke Hal. 12-13`: Membalikkan lembaran buku kembali ke Lembar 1 tanpa menghilangkan isian form.
   - `✓ TULIS LENGKAP KE JURNAL`: Menjalankan persistensi komprehensif ke basis data.

---

### E. State Management & Orkestrasi API Terpadu

1. **Hook Formulir (`src/components/activity/modal/useAddActivityForm.ts` - 171 baris)**:
   - Mengelola state wizard (`step: 1 | 2`), validasi input langkah 1 (`handleNextStep`), dan alur mundur (`handlePrevStep`).
   - Menyimpan seluruh parameter telemetri, respon check-in, dan data cedera dalam satu siklus hidup komponen yang terpadu.

2. **Helper Orkestrasi API (`src/components/activity/modal/activitySubmissionHelpers.ts` - 141 baris)**:
   - Mengonsolidasikan 3 panggilan jaringan secara berurutan:
     - **Tahap 1**: Memanggil `POST /api/activities` untuk menyimpan sesi latihan manual dan memicu pencocokan otomatis terhadap kalender rencana latihan (*workout correlation*).
     - **Tahap 2**: Memanggil `POST /api/athlete/checkin` menggunakan `activity_id` yang baru dibuat. Sistem otomatis mencatat log nyeri ke `athlete_pain_logs` bila nyeri/pembengkakan teramati, serta memicu rekalkulasi kesiapan latihan atlet (*readiness engine*).
     - **Tahap 3**: Jika `hasNewInjury === true`, memanggil `POST /api/athlete/injuries` untuk mendaftarkan histori cedera baru, status evaluasi klinis, dan batasan kapasitas latihan.

---

## 3. Hasil Pengujian & Verifikasi Kualitas

1. **Pemeriksaan Tipe Data TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - Hasil: **0 error (100% Type-Safe)**.

2. **Next.js Production Build**:
   - Perintah: `npm run build`
   - Hasil: **Exit Code 0 (Sukses Penuh)**. Seluruh **32/32 rute aplikasi** berhasil dikompilasi secara optimal tanpa warning fatal.

3. **Kepatuhan Terhadap Batas Ukuran Berkas (< 300 Baris)**:
   Semua berkas yang dibuat dan dimodifikasi memenuhi ketentuan Clean Architecture:

| Berkas | Jumlah Baris | Status Kepatuhan |
| :--- | :---: | :---: |
| `src/components/activity/modal/activitySubmissionHelpers.ts` | **141 baris** | ✅ Lolos (< 300) |
| `src/components/activity/modal/AddActivityRightPage.tsx` | **156 baris** | ✅ Lolos (< 300) |
| `src/components/activity/modal/useAddActivityForm.ts` | **171 baris** | ✅ Lolos (< 300) |
| `src/components/activity/modal/AddActivityCheckinLeftPage.tsx` | **194 baris** | ✅ Lolos (< 300) |
| `src/components/activity/modal/AddActivityInjuryRightPage.tsx` | **250 baris** | ✅ Lolos (< 300) |
| `src/components/activity/modal/AddActivityModal.tsx` | **257 baris** | ✅ Lolos (< 300) |
