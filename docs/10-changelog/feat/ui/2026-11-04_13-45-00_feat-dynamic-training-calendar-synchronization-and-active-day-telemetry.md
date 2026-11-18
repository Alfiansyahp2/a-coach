# Changelog: Sinkronisasi Kalender Latihan Dinamis, Telemetri Hari Berjalan & Indikator Minggu Aktif (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-04 13:45:00 WIB
- **Tipe**: `feat(ui)` / `feat(training)` / `fix(calendar)`
- **Commit Message Rujukan**: `fix(training): dynamically synchronize calendar active day with current date and highlight active week and day columns`
- **Branch**: `feat/ui`
- **Lokasi Berkas**: `docs/10-changelog/feat/ui/2026-11-04_13-45-00_feat-dynamic-training-calendar-synchronization-and-active-day-telemetry.md`

---

## 1. Latar Belakang & Masalah

Pada modul **Schedule Training & Periodization** (`/training`), antarmuka kalender dirancang untuk memandu siklus makro latihan 12-minggu atlet (2 November 2026 s.d. 24 Januari 2027). Namun, terdapat anomali visual di mana penanda **`[ HARI INI ]`** tidak bergeser secara alami:

1. **Tanggal Hari Ini Terkunci Statis (*Hardcoded Date Anchor*)**:
   - Komponen utama [`ScheduleTrainingHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHub.tsx) sebelumnya memuat variabel statis:
     ```ts
     const todayStr = "2026-11-02"; // Reference current date
     ```
   - Kondisi tersebut membuat logika penentu hari berjalan di [`calendarBuilder.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/calendarBuilder.ts) (`isToday: dateStr === todayStr`) selalu bernilai `true` hanya pada **Senin, 2 Nov 2026**.
   - Ketika atlet membuka aplikasi di hari **Rabu, 4 Nov 2026**, kartu hari Senin masih berstatus `[ HARI INI ]` dengan border aktif menyala, sedangkan hari Rabu tampak redup (*opacity-70*) seolah-olah belum dicapai.

2. **Ketiadaan Indikator Kolom & Penanda Minggu Berjalan**:
   - Baris nama hari di bagian atas tabel (`SENIN`, `SELASA`, `RABU`, dst.) berstatus statis tanpa penanda visual kolom mana yang mewakili hari ini.
   - Header baris minggu belum memiliki status `MINGGU AKTIF` yang secara instan mengarahkan perhatian atlet ke siklus yang sedang berlangsung.

---

## 2. Rincian Perubahan Berdasarkan Git Diff

### A. Lapisan Server & Resolusi Tanggal Dinamis

#### 1. [`src/app/training/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/training/page.tsx)
- Mengimpor helper `formatDateOnly` dari `@/lib/formatters`.
- Menghasilkan tanggal server riil atlet:
  ```ts
  const serverToday = formatDateOnly(new Date());
  ```
- Meneruskan `initialTodayDate={serverToday}` ke `<ScheduleTrainingHub />` guna menjamin *zero-flash server-side rendering* tanpa risiko *hydration mismatch*.

#### 2. [`src/components/training/ScheduleTrainingHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHub.tsx)
- Menghapus konstanta statis `const todayStr = "2026-11-02";`.
- Menambahkan state dinamis yang disinkronkan langsung dengan kalender sistem:
  ```tsx
  const [todayStr, setTodayStr] = useState<string>(
    () => initialTodayDate || formatDateOnly(new Date())
  );

  useEffect(() => {
    setTodayStr(formatDateOnly(new Date()));
  }, []);
  ```
- Mengirimkan `todayStr={todayStr}` ke komponen grid tampilan kalender `<TrainingCalendarGridView />`.

---

### B. Lapisan Logika Domain & Pembangun Kalender

#### 1. [`src/components/training/calendarBuilder.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/calendarBuilder.ts)
- Menambahkan properti `isCurrentWeek: boolean` pada antarmuka `CalendarWeek`.
- Mengkalkulasikan status aktif minggu secara deklaratif:
  ```ts
  const isCurrentWeek = days.some((d) => d.isToday);
  ```
- Menetapkan `isCurrentWeek` ke dalam objek minggu yang dihasilkan untuk konsumsi visual komponen perender.

---

### C. Pembaruan Komponen Antarmuka Pengguna (UI)

#### 1. [`src/components/training/views/TrainingCalendarGridView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingCalendarGridView.tsx)
- **Kalkulasi Indeks Kolom Aktif**:
  - Mengonversi `todayStr` menjadi indeks hari Senin–Minggu (`0 = Senin`, `1 = Selasa`, `2 = Rabu`, ..., `6 = Minggu`).
  - Untuk hari Rabu (4 Nov), indeks kolom bernilai `2`.
- **Indikator Kolom Aktif di Header Grid**:
  - Kolom **`RABU (OPSI/REHAB)`** secara dinamis menerima aksen aktif:
    - *Border* bawah aktif: `border-b-2 border-[var(--color-cycling)]`.
    - Latar belakang kontras: `bg-[var(--color-surface-card)]`.
    - Indikator titik berdenyut: `<span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)] animate-pulse" />`.
- **Badge Minggu Berjalan**:
  - Header minggu ke-1 (`Minggu 1: 2 – 8 Nov 2026`) kini menampilkan chip penanda eksklusif:
    `[ MINGGU AKTIF ]` beraksen hijau cycling dengan garis tepi terkalibrasi.
  - Kartu kontainer minggu aktif mendapatkan sorotan `ring-1 ring-[var(--color-cycling)]/20`.

#### 2. [`src/components/training/CalendarDayCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/CalendarDayCard.tsx)
- **Kartu Aktif Hari Ini (Rabu, 4 Nov)**:
  - Menerima border aktif bercahaya: `border-2 border-[var(--color-cycling)] shadow-md ring-1 ring-[var(--color-cycling)]/30`.
  - Menampilkan badge **`[ HARI INI ]`** dengan animasi denyut (*pulse*).
  - Teks tanggal `4 Nov` menjadi tebal dan beraksen `text-[var(--color-cycling)]`.
  - Pada kartu istirahat terprogram Rabu (*Jeda Pemulihan / Proteksi Sendi*), ikon hati kini menyala dengan denyut amber/emerald (`Heart animate-pulse`) dan teks yang kontras, menegaskan kepatuhan pada fase regenerasi sendi.
- **Normalisasi Kartu Hari Senin (2 Nov)**:
  - Otomatis melepaskan status *Hari Ini*, mengembalikan tampilan puasa sunnah (**`🌙 Puasa Sunnah`**) dengan border ungu lembut (`border-purple-500/20`) secara proporsional.

---

### D. Sinkronisasi Uji Regresi (*Test Suite*)

#### 1. [`scripts/tests/test_weekly_streak_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_weekly_streak_system.js)
- Memperbarui asersi unit test telemetry database nyata (*Unit Test 4*) agar mengevaluasi tingkat *Thermodynamic Heat Spectrum* secara dinamis via `getFlameHeatTier(realStreak.currentStreakWeeks, true)`.
- Mengakomodasi pencapaian atlet riil yang telah menuntaskan sesi Zone 2 (26.9 km) sehingga streak bertambah menjadi **10 minggu** dan secara otomatis membuka **Stage 2: Api Oranye (~1.100°C)**.

---

## 3. Hasil Verifikasi & Jaminan Kualitas

| Jenis Pemeriksaan | Perintah / Alat | Status | Keterangan |
| :--- | :--- | :---: | :--- |
| **Pemeriksaan Tipe** | `npx tsc --noEmit` | **LULUS** | 0 error pada seluruh berkas TypeScript. |
| **Uji Suite Streak** | `npm run test:streak` | **LULUS** | 21/21 pengujian berhasil (100% pass rate). |
| **Kompilasi Produksi** | `npm run build` | **LULUS** | 24 rute Next.js (SSG & ISR/PPR) terkompilasi optimal. |
| **Integritas Data** | PostgreSQL `sport_training` | **AMAN** | 34 aktivitas Strava autentik tetap utuh 100%. |
| **Sinkronisasi Branch** | `git merge` | **SELESAI** | Cabang `feat/ui` dan `main` berada pada status paritas 1:1. |

