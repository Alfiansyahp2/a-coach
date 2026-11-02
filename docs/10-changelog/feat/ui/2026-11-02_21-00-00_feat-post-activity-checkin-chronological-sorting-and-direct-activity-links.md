# Changelog: Pengurutan Kronologis Aktivitas & Deep Link Sesi pada Post-Activity Check-in Modal (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-02 21:00:00 WIB
- **Tipe**: `feat(ui)` / `feat(ux)` / `feat(health)` / `feat(telemetry)`
- **Commit Message Rujukan**: `feat(ui): sort ingested activities chronologically descending with top badge and direct deep links in post-activity check-in`
- **Branch**: `refactor`

---

## 1. Latar Belakang & Pernyataan Masalah

Pada modal subjektif evaluasi pasca-latihan (*Post-Activity Subjective Check-in Modal*) di rute `/health`, atlet menghubungkan data subjektif gejala (skala nyeri saat/setelah latihan, pembengkakan sendi, sensasi goyang/ketidakstabilan) dengan rekaman aktivitas telemetri Strava. 

Berdasarkan audit visual dan masukan pengguna:
1. **Urutan Aktivitas Tidak Menjamin Kronologis Sesi Paling Baru di Posisi Teratas**:
   - Jika aktivitas dipassing dari server atau cache tanpa jaminan pengurutan waktu yang ketat, atlet harus mencari sesi latihan terbarunya di antara daftar aktivitas lama.
   - Tidak ada indikator visual eksplisit untuk membedakan sesi mutakhir (*latest session*) dengan sesi lampau, serta tidak ada tanggal sesi yang tercantum jelas di dalam opsi dropdown.
2. **Ketiadaan Tautan Langsung ke Detail Aktivitas (*No Direct Deep Link*)**:
   - Atlet yang ingin memverifikasi rincian performa sesi latihan tertentu (misalnya grafik detak jantung, profil elevasi, atau kecepatan per kilometer) sebelum mengisi evaluasi subjektif terpaksa harus keluar dari modal, membuka halaman `/activities`, mencari sesi tersebut, lalu membuka kembali modal check-in dari awal. Hal ini menyebabkan risiko hilangnya isian data (*data entry friction*).
3. **Keterbatasan Jumlah Aktivitas yang Tersedia (*Limited Fetch Limit*)**:
   - Pemanggilan data aktivitas di halaman `/health` sebelumnya dibatasi hanya 10 sesi terakhir (`limit: 10`), sehingga atlet yang terlambat mengisi evaluasi untuk latihan beberapa hari sebelumnya kehilangan opsi untuk menautkannya.

---

## 2. Rincian Perubahan Berdasarkan Git Diff

### A. Komponen Modal Check-in Pasca-Latihan

#### 1. [`src/components/health/PostActivityCheckinModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/PostActivityCheckinModal.tsx)
- **Pengurutan Waktu Kronologis (*Strict Descending Sorting*)**:
  - Mengimplementasikan memoized sorting menggunakan `useMemo`:
    ```tsx
    const sortedActivities = useMemo(() => {
      return [...(recentActivities || [])].sort((a, b) => {
        const timeA = new Date(a.start_date).getTime();
        const timeB = new Date(b.start_date).getTime();
        return timeB - timeA;
      });
    }, [recentActivities]);
    ```
  - Menjamin sesi latihan paling mutakhir selalu menempati indeks ke-0.
- **Sinkronisasi State Otomatis (*Reactive Selection State*)**:
  - Menambahkan `useEffect` untuk otomatis memilih sesi teratas (`sortedActivities[0]?.id`) atau `initialActivityId` ketika modal dibuka, sekaligus mengisi *sport_type*, *distance_km*, dan *duration_sec* secara instan.
- **Label Opsi Dropdown Beranotasi Tanggal & Badge Teratas**:
  - Menambahkan prefiks bintang `⭐ [TERBARU]` khusus untuk sesi paling atas.
  - Menampilkan tanggal sesi dalam format lokal terstandarisasi, contoh:
    `⭐ [TERBARU] [2 Nov 2026] Uji Coba Latihan Renang 1500m (Swim • 1.5 km)`
    `[27 Okt 2026] Zone 3 Aerobic Sustained (Ride • 23.4 km)`
- **Tautan Langsung (*Direct Deep Link*) ke Halaman Detail Aktivitas**:
  - **Tautan Cepat di Atas Dropdown**:
    Menambahkan tombol tautan `Buka Aktivitas Ini Langsung ↗` di samping label `LINK TO INGESTED ACTIVITY` menuju rute `/activities/${selectedActivity.id}` dengan atribut `target="_blank"` dan `rel="noopener noreferrer"`.
  - **Kartu Ringkasan Sesi Terpilih (*Selected Activity Summary Card*)**:
    Menampilkan kartu preview di bawah dropdown berisi:
    - Badge cabang olahraga bercahaya (`bg-[#00F0FF]/15 text-[#00F0FF]`)
    - Judul sesi aktivitas yang terpilih
    - Indikator tanggal (`Calendar`), jarak dalam km (`MapPin`), dan durasi gerak (`Clock`)
    - Tombol aksi `Detail Aktivitas ↗` yang membuka analitik penuh di tab baru tanpa menutup formulir check-in.
- **Penguatan Penanganan Respon JSON (*Resilient Response Parsing*)**:
  - Mengganti pemanggilan `res.json()` langsung menjadi pembacaan aman via `res.text()` yang dilanjutkan dengan blok `try / catch JSON.parse()` guna mencegah error runtime *"Unexpected end of JSON input"* saat respons server kosong atau mengalami interupsi jaringan.
- **Penyelarasan Bahasa Antarmuka (Indonesian Localization)**:
  - Melokalkan tombol aksi dan label ke Bahasa Indonesia yang ramah atlet: `"Batal"`, `"Simpan Check-in & Perbarui"`, `"Pembengkakan Sendi Teramati?"`, dan `"Ketidakstabilan / Sendi Goyang?"`.

---

### B. Peningkatan Limit Sesi pada Server Component

#### 2. [`src/app/health/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/health/page.tsx)
- Menaikkan kuota pengambilan aktivitas dari 10 sesi menjadi 50 sesi:
  ```typescript
  // Sebelumnya:
  getActivities(DEFAULT_USER_ID, { limit: 10 }),
  // Sesudahnya:
  getActivities(DEFAULT_USER_ID, { limit: 50 }),
  ```
  Hal ini memberikan fleksibilitas penuh bagi atlet untuk mencatat evaluasi subjektif bagi seluruh sesi latihan dari beberapa minggu terakhir.

---

## 3. Hasil Pengujian & Verifikasi

1. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah `npx tsc --noEmit` berhasil tanpa error (`exit code: 0`).
2. **Suite Pengujian Kesehatan & Kesiapan Latihan Atlet**:
   - `node scripts/test_athlete_health_system.js`: **32/32 PASSED** (100% lulus).
3. **Suite Pengujian Pelatih & Rencana Latihan**:
   - `node scripts/test_coach_training_system.js`: **5/5 PASSED** (100% lulus).
4. **Verifikasi Server & Endpoint**:
   - Halaman `/health` merespons dengan status `HTTP 200 OK`.

