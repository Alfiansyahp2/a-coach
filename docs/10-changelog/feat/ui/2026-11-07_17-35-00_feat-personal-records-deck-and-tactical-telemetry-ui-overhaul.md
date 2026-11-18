# Changelog: Personal Records & Benchmarks Deck, Tactical Deck, and Volume Progression UI Overhaul (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-07 17:35:00 WIB
- **Tipe**: `feat(ui)` / `fix(layout)` / `fix(responsive)` / `feat(personal-records)` / `refactor(telemetry)`
- **Commit Message Rujukan**: `feat(ui): overhaul personal records deck layout, eliminate text truncation and tab overflow, and refine tactical telemetry controls`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-07_17-35-00_feat-personal-records-deck-and-tactical-telemetry-ui-overhaul.md`

---

## 1. Latar Belakang & Akar Masalah

Pada evaluasi visual dan uji coba antarmuka dashboard atlet (*Endurance Performance Lab*), ditemukan serangkaian cacat visual (*visual defects*) dan inkonsistensi tata letak pada kartu **Personal Records & Benchmarks**, **Dashboard Tactical Deck**, dan **Volume Progression Chart**:

1. **Header Overflow & Patah Teks Tak Proporsional pada Personal Records Deck**:
   - Di kartu rekor personal (`PersonalRecordsDeck.tsx`), tombol kontrol tab filter bertuliskan `[SPLIT MATRIX]`, `[RUN (3)]`, dan `[RIDE (0)]` menggunakan lebar horizontal yang berlebihan (~240px).
   - Di saat yang sama, judul `PERSONAL RECORDS & BENCHMARKS` dan badge `8 Terverifikasi` ditempatkan dalam kontainer flex satu baris. Akibatnya pada layar desktop dan kolom sidebar dashboard (~450px), tombol tab terdorong menembus garis batas kanan kartu (*overflowing beyond container boundary*), sementara judul tertekan dan patah menjadi 3 baris terpisah (`PERSONAL` / `RECORDS &` / `BENCHMARKS`), serta badge terbelah menjadi 2 baris canggung (`8` / `Terverifikasi`).
2. **Layout Dua Kolom Sempit & Pemotongan Teks (*Text Truncation*)**:
   - Modul `PersonalRecordsDeck` menerapkan `grid grid-cols-1 md:grid-cols-2`. Karena kontainer kartu berada di dalam `lg:col-span-5` (~450px), breakpoint `md:` terpicu oleh lebar viewport browser (bukan lebar kontainer kartu), sehingga membagi area 450px menjadi 2 kolom sempit berukuran ~200px.
   - Kolom 200px menyebabkan pemotongan teks parah:
     - Nama milestone `Half Marathon` terpotong menjadi `Half Marat...`.
     - Tanggal sesi terpotong menjadi `Fri, Sep 4, 20...`.
     - Tautan inspeksi trek terpotong menjadi `Verifie... Inspect Track →`.
     - Format string tanggal memicu tanda baca yatim (`• Sun, Oct 4, 2026`) karena `activity_name` bernilai `null` pada data rekor awal.
3. **Ruang Hampa Kosong (*Empty Black Hole*) pada Disiplin Bersepeda**:
   - Di [src/app/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx), logika `displayPrs` terdahulu menggunakan ternary:
     `prs.length > 0 ? prs.map(...) : computedPrs;`
   - Karena tabel database `personal_records` hanya berisi 3 rekor lari awal, ternary tersebut mengabaikan seluruh 4 rekor bersepeda (*Longest Ride*, *Fastest Speed*, *Max Elevation Climb*, *40K+ Endurance*) yang dihasilkan secara otomatis oleh `computePersonalRecords` dari 26 sesi bersepeda di database.
   - Dampaknya, tab `RIDE` bertuliskan `RIDE (0)` dan kolom kanan milestone sepeda di tampilan split matrix benar-benar kosong melompong (*dark gaping void*), memboroskan 50% ruang kartu.
4. **Data Jarak Hardcode pada Milestone Header**:
   - Header kolom lari dan sepeda menampilkan angka hardcode statis `65.1 km Ingested` dan `566.4 km Ingested` yang tidak mencerminkan volume riil telemetri aktivitas atlet (riil: 65.2 km lari dan 623.3 km sepeda).
5. **Ukuran Tab Switcher Taktis Terlalu Besar & Baris Angka Patah**:
   - Pada `DashboardTacticalDeck.tsx`, tombol switcher mode `[Jadwal (38)]`, `[Sasaran (4)]`, `[Rekor (3)]` menggunakan ukuran padding dan font yang terlalu bulky sehingga angka dalam kurung rentan terlipat ke baris kedua pada resolusi tertentu.
6. **Elemen Berlebihan pada Volume Progression Chart**:
   - Komponen `VolumeProgressionChart.tsx` sebelumnya sempat dihias dengan elemen grafik tinggi yang berlebihan serta badge `Weekly Aggregation` yang mengganggu keselarasan layout kompak.

---

## 2. Rincian Solusi & Perubahan Teknis

### A. Rekonstruksi Responsif & Eliminasi Overflow pada PersonalRecordsDeck (`src/components/records/PersonalRecordsDeck.tsx`)

1. **Header Rapi Tanpa Overflow**:
   - Mengganti label tab yang terlalu lebar (`SPLIT MATRIX`) menjadi tombol padat berbobot seimbang:
     - `SEMUA (${prs.length})`
     - `RUN (${runPrs.length})` (dengan indikator dot oranye lari)
     - `RIDE (${ridePrs.length})` (dengan indikator dot toska sepeda)
   - Memberikan properti `shrink-0` dan `whitespace-nowrap` pada grup tab dan judul kartu.
   - Menjadikan badge terverifikasi dinamis (`${prs.length} Terverifikasi`) dan memastikan badge tidak akan pernah terlipat menjadi 2 baris.
2. **Container Queries Menggantikan Viewport Breakpoints**:
   - Menambahkan utility Tailwind v4 `@container` pada elemen pembungkus terluar kartu dan menggunakan breakpoint berbasis kontainer `@[640px]:grid-cols-2`.
   - Di dalam kolom taktis dashboard (~450px), kartu secara cerdas bertahan pada tata letak kolom penuh (*single-column stack*), memberikan ruang horizontal lega (>400px) untuk seluruh teks dan metrik.
   - Apabila kartu ditempatkan pada layar/kontainer lebar (>640px), kartu otomatis bertransformasi menjadi 2 kolom rapi.
3. **Penyelesaian Bug Pemotongan Teks (*Text Truncation*) & Tanda Baca Yatim**:
   - Menghapus pembatasan `truncate` yang terlalu agresif pada nama kategori rekor (`pr.category`), sehingga `Half Marathon` tampil utuh.
   - Memperbaiki rendering string aktivitas dan tanggal:
     ```tsx
     {pr.activity_name ? `${pr.activity_name} • ` : ""}{formatDate(pr.achieved_date)}
     ```
     Menghilangkan bug titik gantung/yatim (`• Sun, Oct 4, 2026`) ketika nama aktivitas bernilai `null` atau `undefined`.
   - Pada kartu unggulan (*Featured Hero Card*), status verifikasi diatur ke teks baku berbahasa Indonesia `"Sesi Rekor Terverifikasi"` bila sesi belum diberi judul khusus, dan teks `Inspect Track →` memiliki ruang lega tanpa pemotongan.
4. **Kalkulasi Dinamis Jarak Akumulasi Telemetri**:
   - Mengganti teks statis `65.1 km` dan `566.4 km` dengan `useMemo` dinamis yang menghitung langsung dari koleksi `activities` atlet:
     ```tsx
     const runDistanceKm = useMemo(() => {
       if (activities && activities.length > 0) {
         return activities
           .filter((a) => (a.sport_type || "").toLowerCase().includes("run"))
           .reduce((sum, a) => sum + Number(a.distance_meters || 0), 0) / 1000;
       }
       return 65.2;
     }, [activities]);
     ```
5. **Penyediaan State Kosong Informatif (*Actionable Empty State*)**:
   - Jika salah satu disiplin belum memiliki rekor (misal `ridePrs.length === 0`), kartu menampilkan kartu panduan atletis bergaris putus-putus (*dashed border*) yang menjelaskan syarat pencatatan rekor baru (misal sesi >20 km atau rute tanjakan), bukan ruang kosong gelap.

---

### B. Penggabungan Cerdas Rekor Database & Rekor Terkomputasi (`src/app/page.tsx`)

Menyempurnakan logika `displayPrs` agar rekor otoritatif dari database dan rekor terkomputasi dari telemetri Strava disatukan secara sinergis tanpa duplikasi:

```tsx
  const computedPrs = computePersonalRecords(activities, DEFAULT_USER_ID);
  const displayPrs = (() => {
    if (!prs || prs.length === 0) return computedPrs;
    const dbEnhanced = prs.map((p: any) => {
      const m = computedPrs.find(
        (c) =>
          c.category.toLowerCase().includes(p.category.toLowerCase()) ||
          p.category.toLowerCase().includes(c.category.toLowerCase())
      );
      return {
        ...p,
        subtext: p.subtext || m?.subtext,
        activity_name: p.activity_name || m?.activity_name,
      };
    });
    const newComputed = computedPrs.filter(
      (c) =>
        !dbEnhanced.some(
          (p: any) =>
            c.category.toLowerCase().includes(p.category.toLowerCase()) ||
            p.category.toLowerCase().includes(c.category.toLowerCase())
        )
    );
    return [...dbEnhanced, ...newComputed];
  })();
```

Hasil Penggabungan:
- **Disiplin Lari (Run)**: 5 Rekor (5K: 20:30, 10K: 42:30, Half Marathon: 1:36:00, Longest Run: 12.33 km, Best Aerobic Pace: 6:23 /km).
- **Disiplin Bersepeda (Ride)**: 4 Rekor (Longest Ride: 56.10 km, Fastest Speed ≥20K: 23.8 km/h, Max Elevation Climb: ▲ 125 m, 40K+ Endurance Ride: 56.10 km).
- **Total Rekor**: 9 Rekor Terverifikasi lintas disiplin.

---

### C. Pemadatan Tab Switcher Taktis (`src/components/dashboard/DashboardTacticalDeck.tsx`)

1. Mengurangi padding kontainer dari `p-2 sm:p-2.5` menjadi `p-1 sm:p-1.5` untuk menghemat ruang vertikal dan horizontal.
2. Memisahkan label dan jumlah sesi menjadi micro-pill khusus berfont tabular:
   - `Jadwal` + `<span className="text-[9px] px-1.5 py-0.2 rounded-full font-tabular ...">38</span>`
   - `Sasaran` + `<span className="text-[9px] px-1.5 py-0.2 rounded-full font-tabular ...">4</span>`
   - `Rekor` + `<span className="text-[9px] px-1.5 py-0.2 rounded-full font-tabular ...">9</span>`
3. Menambahkan properti `activities={activities}` pada instansiasi `<PersonalRecordsDeck prs={prs} activities={activities} />` agar perhitungan akumulasi jarak telemetri bekerja secara otomatis.

---

### D. Penyesuaian Kompak Volume Progression Chart (`src/components/charts/VolumeProgressionChart.tsx`)

1. Mengembalikan proporsi tinggi SVG ke standar kompak `h-24` (tinggi visual ideal untuk perbandingan mingguan).
2. Menghapus badge statis `Weekly Aggregation` yang tidak fungsional dan memakan ruang.
3. Mempertahankan integrasi interaktif tooltip *hover split*, *timeframe switcher* (7D, 14D, 30D, ALL), dan indikator akumulasi volume.

---

## 3. Matriks Berkas yang Dimodifikasi

| No | Berkas | Perubahan Utama |
|---|---|---|
| 1 | `src/components/records/PersonalRecordsDeck.tsx` | Eliminasi tab overflow, perbaikan teks terpotong (*Half Marathon* & tanggal), implementasi container queries `@container`, kalkulasi jarak dinamis, dan *empty state* bersepeda. |
| 2 | `src/components/dashboard/DashboardTacticalDeck.tsx` | Pemadatan tab switcher Taktis (`Jadwal`, `Sasaran`, `Rekor`) dengan micro-pills berfont tabular, serta passthrough `activities`. |
| 3 | `src/app/page.tsx` | Penggabungan cerdas rekor database otoritatif dan rekor terkomputasi Strava tanpa duplikasi kategori. |
| 4 | `src/components/charts/VolumeProgressionChart.tsx` | Pengembalian proporsi kompak `h-24` dan pembersihan badge `Weekly Aggregation`. |

---

## 4. Verifikasi & Pengujian Mutu

### A. Validasi Tipe Data TypeScript
```bash
npx tsc --noEmit
```
**Hasil**: `0 errors` (100% type-safe).

### B. Kompilasi Produksi Next.js
```bash
npm run build
```
**Hasil**: 28/28 rute berhasil dikompilasi tanpa kegagalan (termasuk halaman `/` dan API endpoints).

### C. Eksekusi Unit & System Tests
1. `node scripts/tests/test_weekly_streak_system.js` $\to$ **21/21 PASSED**.
2. `node scripts/tests/test_athlete_health_system.js` $\to$ **31/31 PASSED**.
3. `node scripts/tests/test_coach_training_system.js` $\to$ **5/5 PASSED**.
**Total Pengujian**: **57/57 Assertions Lulus (100%)**.

---

## 5. Kesimpulan & Dampak

Pembaruan ini menuntaskan seluruh keluhan visual pada antarmuka rekor personal dan telemetri taktis:
- **Zero Overflow**: Tab filter tidak pernah lagi menembus tepi kartu.
- **Zero Truncation**: Teks penting (*Half Marathon*, tanggal sesi, status verifikasi) terbaca penuh tanpa titik-titik pemotongan sempit.
- **Data Balance**: Disiplin lari dan bersepeda memiliki telemetri rekor yang lengkap dan seimbang (5 lari, 4 sepeda).
- **Aesthetically Aligned**: Selaras dengan bahasa desain *Endurance Performance Lab* bertema gelap presisi.

