# Changelog: Rute Sasaran & Target Progresif (`/goals`), Mesin Berjenjang Tonggak 100km & Penghubung Dasbor (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-03 12:25:00 WIB
- **Tipe**: `feat(ui)` / `feat(route)` / `feat(goals)` / `refactor(ui)`
- **Commit Message Rujukan**: `feat(ui): implement dedicated /goals route, progressive cycling milestone engine, and dashboard card gateway`
- **Branch**: `feat/ui`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelumnya, sasaran dan target latihan atletik (seperti tonggak *100 km Century Ride*, *Marathon Pathway 42.2K*, dan *Konsistensi Mingguan*) hanya disajikan dalam komponen kartu ringkas di dalam tab taktis dasbor utama (`DashboardMacroGoalsCard`). Keterbatasan ini menimbulkan sejumlah masalah fundamental:

1. **Ketiadaan Rute Mandiri (*No Dedicated Route*)**:
   - Atlet tidak memiliki ruang kerja analitis khusus untuk merencanakan, memfilter, dan meninjau tonggak latihan jangka panjang di luar ikhtisar dasbor utama.
   - Menu navigasi pada bilah samping (*AppSidebar*) dan laci menu seluler (*AppHeader*) masih mengarah ke penanda jangkar halaman beranda (`/#goals`) yang tidak memiliki halaman sendiri.

2. **Ketiadaan Mesin Target Progresif Berjenjang (*Missing Progressive Milestone Chaining*)**:
   - Ketika atlet berhasil menuntaskan target utama (misalnya target 100 km sepeda MTB Zone 2 pertama telah mencapai 100%), sistem tidak menyediakan rekomendasi target lanjutan secara otomatis. Atlet dibiarkan tanpa arah progesi berikutnya, atau berisiko melakukan lonjakan volume secara sembarangan (*acute spikes*) tanpa pertimbangan protokol beban sendi.

3. **Keterputusan Kartu Dasbor dengan Alur Kerja Progesi (*Dashboard Disconnection*)**:
   - Kartu makro di dasbor tidak bertindak sebagai gerbang interaktif yang dapat mengarahkan atlet langsung ke halaman target terperinci saat suatu tonggak telah tercapai atau membutuhkan aktivasi tingkat lanjutan.

---

## 2. Rincian Perubahan Berdasarkan Git Diff

### A. Rute Baru & Komponen Antarmuka Sasaran

#### 1. [`src/app/goals/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/goals/page.tsx) (Baru)
- **Rute Server Component Penuh**: Membangun halaman `/goals` dengan dukungan Next.js 16 Partial Prerendering (`await connection()`).
- **Agregasi Data Multi-Entitas**: Menarik data terautentikasi pengguna (`getUser`), sasaran aktif (`getFitnessGoals`), 100 aktivitas riil (`getActivities`), rencana aktif (`getActiveTrainingPlan`), konteks kesehatan biomekanik (`getAuthoritativeHealthContext`), dan status database tanpa melakukan mutasi data sedikit pun.
- **Bungkus Shell & Suspense**: Menggunakan `<AppShell>` dan `GoalsSkeleton` bertema instrumen laboratorium endurance.

#### 2. [`src/components/goals/GoalsManagementHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/goals/GoalsManagementHub.tsx) (Baru)
- **Mesin Progresi Target Berjenjang (*Cycling Progression Engine*)**:
  - Menyediakan 4 template target tingkat lanjut terkalibrasi fisiologi olahraga ketika target 100 km pertama tercapai:
    1. **Siklus Kedua (+100 km / Total 200 km)**: Perluasan basis kapiler aerobik dengan batasan sesi ≤ 30-35 km rute datar.
    2. **Gran Fondo Metric (150 km)**: Tonggak ketahanan jarak menengah terstruktur di Zona 2 murni.
    3. **Target Elevasi (1.000m D+ Tanjakan)**: Penguatan ambang laktat melalui kayuhan duduk (*seated climb*) tanpa sprint berdiri agresif.
    4. **Double Century Brevet (200 km)**: Transisi ultra-endurance dengan protokol pemulihan 48 jam.
  - **Aksi Aktivasi Instan**: Tombol `[ + Aktifkan Target Ini ]` yang langsung menyisipkan sasaran baru ke daftar sasaran aktif di antarmuka disertai spanduk konfirmasi visual.
- **Mode Uji Simulasi Tonggak 100 km (*Simulation Tester*)**:
  - Menyediakan sakelar penguji interaktif *"Uji Simulasi 100 km Tercapai"* pada bilah atas agar atlet/evaluator dapat menguji secara langsung bagaimana sistem bereaksi dan membuka tingkat lanjutan secara instan.
- **Pita Telemetri & Tab Filter Olahraga**:
  - Menampilkan metrik kepadatan tinggi: Total Sasaran Aktif, Tonggak Tercapai, Jarak Sepeda Terverifikasi, dan Status Keamanan Sendi.
  - Tab pemfilteran: `Semua`, `Sepeda (Ride)`, `Lari (Run)`, `Konsistensi (Frequency)`, dan `Tercapai (Achieved)`.
- **Modal Pembuatan Sasaran Kustom**:
  - Dialog modal interaktif untuk menambahkan target manual (Nama sasaran, kategori olahraga, satuan km/m D+/sesi, target nilai, dan tenggat waktu).

---

### B. Penghubung Kartu Dasbor & Navigasi Terpadu

#### 1. [`src/components/dashboard/DashboardMacroGoalsCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardMacroGoalsCard.tsx) (+65, -6)
- **Gerbang Buka & Klaim Progresi**: Menambahkan spanduk interaktif ketika tonggak sasaran memenuhi target (`hasAchievedMilestone`):
  - Mengarahkan langsung ke rute `/goals` dengan tombol aksi `[ Buka & Klaim -> ]`.
- **Interaktivitas Baris Sasaran**: Setiap kartu target individual kini menjadi tautan terhubung (`Link`) ke `/goals`.
- **Tautan Kaki Kartu (*Footer Gateway*)**: Menyediakan pintasan `[ Buka Sasaran & Target -> ]` di bagian bawah kartu.

#### 2. [`src/components/layout/AppSidebar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppSidebar.tsx) (+1, -1)
- Memperbarui tautan navigasi item ke-7 (ikon Target):
  - Dari `href: "/#goals"` menjadi `href: "/goals"`.
  - Dilengkapi lencana status `badge: "TARGET"` dan indikator aktif pip hijau saat berada di rute `/goals`.

#### 3. [`src/components/layout/AppHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppHeader.tsx) (+10, -0)
- Mendaftarkan rute `/goals` ke dalam fungsi resolusi judul header: `if (pathname.startsWith("/goals")) return "Sasaran & Target Progresif"`.
- Menambahkan tautan `/goals` ke dalam laci menu navigasi seluler.

---

## 3. Hasil Pengujian & Integritas Basis Data

1. **TypeScript Typecheck**:
   - `npx tsc --noEmit` keluar dengan kode `0` (Zero errors).
2. **Next.js Production Build**:
   - `npm run build` berhasil mengompilasi seluruh 22 rute (termasuk `◐ /goals`) tanpa kegagalan prerender.
3. **Integritas Basis Data PostgreSQL (`sport_training`)**:
   - Aktivitas otentik tetap utuh 100%: **24 Ride** dan **10 Run** (Total = 34 aktivitas, 0 modifikasi/hapus/mutasi).

