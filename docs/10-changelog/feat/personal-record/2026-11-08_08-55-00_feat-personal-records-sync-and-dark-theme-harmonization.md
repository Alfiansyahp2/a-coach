# Changelog: Multi-Sport Personal Records Synchronization, Tactical Telemetry Integration, and Dark Theme Harmonization (`feat/personal-record`)

- **Tanggal & Waktu**: 2026-11-08 08:55:00 WIB
- **Tipe**: `feat(personal-records)` / `feat(theme)` / `merge(profile)` / `merge(ui)` / `fix(layout)`
- **Commit Message Rujukan**: `merge: feat/profile into feat/personal-record` & `feat(ui): overhaul personal records deck layout, eliminate text truncation and tab overflow, and refine tactical telemetry controls`
- **Branch**: `feat/personal-record`
- **Lokasi**: `docs/10-changelog/feat/personal-record/2026-11-08_08-55-00_feat-personal-records-sync-and-dark-theme-harmonization.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit antarmuka performa dan pengujian lintas branch pada platform *Endurance Performance Lab*:

1. **Divergensi Data & Celah Kekosongan Rekor Bersepeda (*Empty Void on Cycling Tab*)**:
   - Di branch `feat/personal-record`, tabel basis data PostgreSQL `personal_records` pada mulanya hanya menyimpan 3 rekor lari awal (*5K*, *10K*, *Half Marathon*).
   - Logika penarikan data di [src/app/page.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx) sebelumnya menggunakan evaluasi sepihak:
     ```tsx
     const displayPrs = prs.length > 0 ? prs.map(...) : computedPrs;
     ```
     Kondisi ini menyebabkan seluruh 4 rekor bersepeda (*Longest Ride*, *Fastest Speed*, *Max Elevation*, *40K+ Endurance*) yang dihasilkan secara otomatis oleh mesin analitik dari 26 sesi bersepeda diabaikan begitu `prs.length > 0`.
   - Akibatnya, tab `RIDE` bertuliskan `RIDE (0)` dan kolom kanan milestone sepeda di tampilan split matrix benar-benar kosong (*dark gaping void*), memboroskan 50% ruang kartu rekor.

2. **Pemotongan Teks (*Text Truncation*) & Overflow Batas Kartu**:
   - Pada komponen [PersonalRecordsDeck.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/records/PersonalRecordsDeck.tsx), kontrol tab filter terdahulu (`SPLIT MATRIX`, `RUN (3)`, `RIDE (0)`) memakan lebar horizontal berlebihan (>240px).
   - Pada kontainer sidebar dashboard (~450px lebar), judul `PERSONAL RECORDS & BENCHMARKS` dan badge terverifikasi terdesak menembus garis batas kanan kontainer (*overflowing beyond container boundary*), sementara judul tertekan patah menjadi 3 baris terpisah.
   - Penggunaan breakpoint berbasis viewport (`md:grid-cols-2`) menyebabkan kartu terbelah menjadi 2 kolom sempit (~200px) saat dibuka di layar laptop/desktop, memicu pemotongan teks parah:
     - `Half Marathon` terpotong menjadi `Half Marat...`.
     - Tanggal sesi terpotong menjadi `Fri, Sep 4, 20...`.
     - Tautan inspeksi trek terpotong menjadi `Verifie... Inspect Track →`.
     - Munculnya tanda baca yatim (`• Sun, Oct 4, 2026`) ketika nama sesi aktivitas bernilai `null`.

3. **Anomali Kontras Tema Saat Ganti Branch (*Wireframe Glow / High-Contrast Border Clash*)**:
   - Saat atlet berpindah branch (misal `git checkout feat/backend`) atau membuka sesi baru, antarmuka tiba-tiba menampilkan garis-garis kotak putih kapur terang di atas latar belakang gelap seperti wireframe kawat bersinar.
   - **Akar Masalah**:
     - `ThemeProvider.tsx` dan `layout.tsx` sebelumnya memiliki konfigurasi inisialisasi default `"light"`:
       ```ts
       const [theme, setThemeState] = useState<Theme>("light");
       ```
       Ketika `localStorage` belum menyimpan state atau cache ter-reset, aplikasi mengaktifkan *Light Mode (Chalk Lab)* dengan variabel:
       ```css
       :root {
         --color-border: #D8DBD0; /* Putih/abu-abu terang */
       }
       ```
     - Karena Windows / Chrome atlet mengaktifkan Dark Mode (atau auto dark mode), latar belakang kanvas dipaksa gelap, namun border tetap membaca `--color-border: #D8DBD0`. Hal ini menghasilkan tabrakan kontras ekstrem yang merusak estetika *Graphite Obsidian*.
     - Ikon Bulan (`Moon`) di pojok kanan atas navbar pada screenshot memvalidasi bahwa sistem keliru mendeteksi status aplikasi sebagai *Light Mode*.

4. **Kebutuhan Konsolidasi Menyeluruh Antar-Branch**:
   - Fitur rekor personal memerlukan integrasi langsung dengan perombakan UI terbaru dari `feat/ui` (tata letak responsif, volume progression `ALL / SEMUA`, perampingan taktis) dan ekspansi backend dari `feat/profile` (pusat profil `/profile`, zona Karvonen HRR, dan telemetri gear).

Pembaruan ini menghadirkan perombakan responsif modul [PersonalRecordsDeck.tsx](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/records/PersonalRecordsDeck.tsx), rekonsiliasi dinamis rekor multi-disiplin lari dan bersepeda, harmonisasi tema default Dark Mode (*Graphite Obsidian*), serta integrasi penuh dengan pusat profil atlet.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Rekonstruksi Responsif & Container Queries (`src/components/records/PersonalRecordsDeck.tsx`)

Menerapkan container queries `@container` Tailwind CSS v4 untuk membebaskan kartu rekor dari ketergantungan lebar viewport browser:

```tsx
// Pembungkus terluar kini menggunakan container queries
<div className="@container rounded-xl border border-(--color-border-hairline) bg-(--color-surface-card) p-4">
  {/* Header dengan kontrol filter padat dan anti-overflow */}
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--color-border-subtle) pb-3">
    <div className="flex items-center gap-2">
      <Trophy className="h-4 w-4 text-(--color-running)" />
      <h3 className="text-xs font-bold tracking-wider text-(--color-text-primary) uppercase whitespace-nowrap">
        PERSONAL RECORDS
      </h3>
      <span className="rounded-full bg-(--color-surface-muted) px-2 py-0.5 text-[10px] font-mono text-(--color-text-muted) whitespace-nowrap">
        {prs.length} Terverifikasi
      </span>
    </div>

    {/* Tab filter padat */}
    <div className="flex items-center gap-1 rounded-lg border border-(--color-border-subtle) bg-(--color-surface-muted) p-0.5 text-[11px] font-mono">
      <button onClick={() => setFilter("ALL")} className={tabClass(filter === "ALL")}>
        SEMUA ({prs.length})
      </button>
      <button onClick={() => setFilter("RUN")} className={tabClass(filter === "RUN")}>
        <span className="h-1.5 w-1.5 rounded-full bg-(--color-running)" />
        RUN ({runPrs.length})
      </button>
      <button onClick={() => setFilter("RIDE")} className={tabClass(filter === "RIDE")}>
        <span className="h-1.5 w-1.5 rounded-full bg-(--color-cycling)" />
        RIDE ({ridePrs.length})
      </button>
    </div>
  </div>

  {/* Grid adaptif berbasis lebar kontainer kartu, bukan viewport layar */}
  <div className="mt-3 grid grid-cols-1 @[640px]:grid-cols-2 gap-3">
    {/* Kartu rekor bebas dari pemotongan teks */}
    ...
  </div>
</div>
```

- **Penyelesaian Bug Pemotongan Teks (*Text Truncation*)**: Menghapus kelas `truncate` agresif pada nama kategori rekor dan menyajikan rendering tanggal yang aman dari tanda baca yatim:
  ```tsx
  {pr.activity_name ? `${pr.activity_name} • ` : ""}{formatDate(pr.achieved_date)}
  ```

---

### B. Rekonsiliasi Dual-Discipline & Mesin Komputasi Rekor Personal (`src/app/page.tsx` & `src/lib/domain/records/personalRecordsEngine.ts`)

Menghubungkan rekor tersimpan di basis data dengan kalkulasi analitik aktivitas secara transparan:

```typescript
// Rekonsiliasi dual-discipline di src/app/page.tsx
const computedPrs = computePersonalRecords(allActivities, athlete.id);

// Gabungkan rekor tersimpan dengan rekor sepeda yang belum ada di tabel personal_records
const combinedPrsMap = new Map<string, PersonalRecord>();

// 1. Masukkan rekor kalkulasi runtime (memastikan 4 rekor sepeda selalu ada)
for (const cPr of computedPrs) {
  combinedPrsMap.set(`${cPr.sport_type}_${cPr.category}`, cPr);
}

// 2. Timpa dengan rekor tersimpan di database jika ada
for (const dbPr of prs) {
  combinedPrsMap.set(`${dbPr.sport_type || "Run"}_${dbPr.category}`, dbPr);
}

const displayPrs = Array.from(combinedPrsMap.values());
```

- **Standardisasi Format Telemetri Atletik Tanpa Simbol `@`**:
  - Rekor ketahanan bersepeda `40K+ Endurance Ride` diselaraskan:
    - Nilai utama: `56.10 km` (presisi 2 desimal tabular monospace).
    - Subteks: `Avg 21.4 km/h • century pace` (disajikan pada baris telemetri sekunder tanpa merusak grid).

---

### C. Penyetelan Permanen Dark Mode Graphite Obsidian (`src/components/theme/ThemeProvider.tsx` & `src/app/layout.tsx`)

Mengeliminasi *wireframe contrast clash* dengan menetapkan mode gelap (*Graphite Obsidian*) sebagai pondasi bawaan:

```typescript
// src/components/theme/ThemeProvider.tsx
const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Periksa preferensi localStorage; jika belum ada, default mutlak ke dark
    const saved = localStorage.getItem("endurance-lab-theme") as Theme | null;
    if (saved === "dark" || saved === "light") {
      setThemeState(saved);
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      setThemeState("dark");
      document.documentElement.classList.add("dark");
    }
    setMounted(true);
  }, []);
  ...
}
```

```tsx
// src/app/layout.tsx
<html
  lang="en"
  suppressHydrationWarning
  className={`dark ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
>
```

- **Pencegahan FOUC**: Injeksi kelas `dark` pada tag `<html>` sejak fase SSR mencegah browser menampilkan border abu-abu kapur `--color-border: #D8DBD0` saat pertama kali halaman dimuat.

---

### D. Integrasi Dashboard Tactical Deck & Hub Profil Atlet (`src/components/dashboard/DashboardTacticalDeck.tsx` & `src/app/profile/page.tsx`)

1. **Penyempurnaan Switcher Taktis**:
   - `DashboardTacticalDeck.tsx` menyajikan tombol ringkas `Jadwal (38)`, `Sasaran (4)`, dan `Rekor (3)` yang hemat ruang horizontal.
2. **Konektivitas Profil Atlet (`/profile`)**:
   - Menyinkronkan metrik biometrik, kapasitas Karvonen HRR Zone 1–5, dan inventaris peralatan sepeda/sepatu lari ([src/app/api/athlete/equipment/route.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/equipment/route.ts)) ke dalam navigasi platform.

---

## 3. Matriks Perbandingan Git Diff

| Berkas Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/components/records/PersonalRecordsDeck.tsx` | Modifikasi | +529 | -260 | Container queries `@container`, eliminasi truncate, layout responsif single/two-column |
| `src/app/page.tsx` | Modifikasi | +35 | -22 | Rekonsiliasi dual-discipline PRs lari & sepeda, integrasi tactical deck |
| `src/components/theme/ThemeProvider.tsx` | Modifikasi | +7 | -7 | Default state `"dark"`, eliminasi fallback light mode tidak disengaja |
| `src/app/layout.tsx` | Modifikasi | +1 | -1 | Pemasangan class `dark` secara permanen pada root `<html>` |
| `src/components/dashboard/DashboardTacticalDeck.tsx` | Modifikasi | +59 | -25 | Tombol taktis padat `Jadwal (38)`, `Sasaran (4)`, `Rekor (3)` |
| `src/components/charts/VolumeProgressionChart.tsx` | Modifikasi | +106 | -45 | Tombol rentang `ALL / SEMUA`, perampingan badge weekly aggregation |
| `src/lib/domain/records/personalRecordsEngine.ts` | Baru / Ekstraksi | +247 | 0 | Engine komputasi 8 rekor atletik terverifikasi multi-sport |
| `src/app/api/athlete/equipment/route.ts` | Baru | +71 | 0 | Endpoint REST API perlengkapan sepeda dan sepatu lari |
| `src/app/profile/page.tsx` | Baru | +83 | 0 | Halaman pusat profil atlet komprehensif |
| `src/lib/domain/physiology/heartRateZones.ts` | Baru | +203 | 0 | Formula Karvonen HRR, Tanaka HRmax, W/kg ratio, klasifikasi metabolik |

**Total Akumulasi**: 10 berkas utama termodifikasi/dibuat, **+1,341 baris ditambahkan**, **-360 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - **Hasil**: **0 Errors, Exit Code 0 (100% Type-Safe)**.
2. **Kompilasi Produksi Next.js**:
   - Perintah: `npm run build`
   - **Hasil**: **Compiled successfully, 30 routes generated without error (Exit Code 0)**.
3. **Suite Verifikasi Kesehatan & Kesiapan Cedera Atlet**:
   - Perintah: `node scripts/tests/test_athlete_health_system.js`
   - **Hasil**: **31 PASSED, 0 FAILED**.
4. **Suite Verifikasi Rentetan Latihan & Spektrum Api**:
   - Perintah: `node scripts/tests/test_weekly_streak_system.js`
   - **Hasil**: **21 PASSED, 0 FAILED**.
5. **Suite Integrasi Sasaran Pelatihan & Periodisasi**:
   - Perintah: `node scripts/tests/test_goal_driven_training_engine.js`
   - **Hasil**: **13 PASSED, 0 FAILED**.
6. **Suite Verifikasi Sistem Rekomendasi Pelatihan Coach**:
   - Perintah: `node scripts/tests/test_coach_training_system.js`
   - **Hasil**: **5 PASSED, 0 FAILED**.
7. **Suite Verifikasi Parser Gambar OCR & Input Manual**:
   - Perintah: `node scripts/tests/test_add_activity_flow.js`
   - **Hasil**: **PASSED (Detected 10.14 km, 41m 6s, 14.8 km/h)**.
8. **Total Assertions Lulus**: **70 / 70 Assertions (100% Lulus)**.

---

## 5. Dampak Sistem

- **Eliminasi Total Anomali Visual Saat Pindah Branch**: Masalah garis putih menyala (*wireframe glow*) yang terjadi akibat tabrakan tema default `light` dengan mode gelap browser/OS kini tuntas teratasi dengan penetapan mutlak tema `dark` (*Graphite Obsidian*).
- **Kelengkapan Telemetri Multi-Disiplin Tanpa Celah**: Tab bersepeda tidak lagi kosong (`RIDE (0)` $\to$ `RIDE (4)`). Seluruh 8 milestone rekor atletik (lari & sepeda) kini terdata secara transparan dan terhubung dengan rute GPS aktivitas.
- **Pengalaman Pengguna (UX) Ergonomis & Bebas Truncation**: Penerapan `@container` queries menjamin seluruh nama kategori dan tanggal rekor tampil utuh tanpa pemotongan titik-titik (`truncate`), menyempurnakan keterbacaan data pada dashboard performa.
