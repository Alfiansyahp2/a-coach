# Changelog: Dashboard Telemetry Strip UI Refactor & Element Cleanup (`refactor`)

- **Tanggal & Waktu**: 2026-11-04 09:45:00 WIB
- **Tipe**: `refactor(ui)` / `refactor(dashboard)` / `cleanup`
- **Commit Message Rujukan**: `refactor(ui): eliminate duplicate header action bar, remove postgres status badge, and integrate primary goal chip into dashboard strip`
- **Branch**: `refactor`
- **Lokasi**: [`docs/10-changelog/refactor/2026-11-04_09-45-00_refactor-dashboard-integrity-strip-and-ui-cleanup.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-04_09-45-00_refactor-dashboard-integrity-strip-and-ui-cleanup.md)

---

## 1. Latar Belakang & Pernyataan Masalah

Setelah penerapan layout shell global ([`AppShell.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppShell.tsx) & [`AppHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppHeader.tsx)), ditemukan beberapa redundansi visual pada halaman utama dashboard (`/`):

1. **Duplikasi Elemen Aksi Cepat (Double Header Effect)**:
   - Header aplikasi ([`AppHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppHeader.tsx)) yang berada di bagian paling atas sudah menyediakan tombol `+ TAMBAH AKTIVITAS` dan lencana profil biometrik (`68 bpm RHR | 170 cm | 65 kg | BMI 22.5`).
   - Namun, kartu strip di bawahnya ([`DashboardIntegrityStrip.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardIntegrityStrip.tsx)) menduplikasi persis tombol `+ TAMBAH AKTIVITAS` dan lencana yang sama, menciptakan efek "header kembar" yang membingungkan dan memakan ruang vertikal.
2. **Redundansi Status Teknis Database**:
   - Lencana `(✓) PostgreSQL Connected` ditampilkan secara kaku di strip telemetri, menambah clutter visual tanpa nilai tambah langsung bagi atlet.
3. **Ketiadaan Konteks Target Utama di Dashboard Atas**:
   - Atlet tidak dapat langsung melihat status Target Utama (*Primary Goal*) yang aktif tanpa harus membuka halaman `/goals` atau beralih ke tab taktis di bawah fold.

Pembaruan refactoring ini membersihkan redundansi tersebut, menghapus lencana yang tidak diperlukan, dan memperkaya kartu strip telemetri dengan konteks Target Utama aktif.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Modifikasi Komponen [`src/components/dashboard/DashboardIntegrityStrip.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardIntegrityStrip.tsx)

1. **Penghapusan Badge Status Database**:
   - Menghapus blok elemen lencana `(✓) PostgreSQL Connected`:
     ```tsx
     // DIHAPUS:
     <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-mono">
       <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
       <span>{dbStatus.type} Connected</span>
     </div>
     ```
2. **Penghapusan Duplikasi Tombol dan Profil**:
   - Menghapus pemanggilan `<AddActivityModal variant="button" />` dan `<EditAthleteProfileModal variant="badge" />` yang sudah di-handle oleh [`AppHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppHeader.tsx).
3. **Penyempurnaan Indikator Telemetri Kiri**:
   - Menambahkan *live telemetry pulse indicator* pada lencana `Strava Bridge Active`.
4. **Integrasi Target Utama & Fast Navigation di Sisi Kanan**:
   - Menampilkan chip Target Utama aktif secara dinamis:
     - Judul: `First 100 km Century Ride (MTB Zone 2)`
     - Nilai target: `100 km`
   - Menyediakan 2 tombol akses cepat berbasis desain anti-boxy:
     - `Hub Sasaran →` mengarah ke `/goals`
     - `Kalender Latihan →` mengarah ke `/training`

---

### B. Modifikasi Pemanggilan pada [`src/app/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx)

- Mengalirkan properti `primaryGoal` (dari query `getFitnessGoals`) dan `activePlan` ke dalam `DashboardIntegrityStrip`:
  ```tsx
  <DashboardIntegrityStrip
    dbStatus={dbStatus}
    user={user}
    healthContext={healthContext}
    primaryGoal={goals.find((g) => g.is_primary) || goals[0]}
    activePlan={activePlan}
  />
  ```

---

## 3. Verifikasi Sistem & Kompatibilitas

- **TypeScript Compilation**: `npx tsc --noEmit` berhasil dengan **0 error**.
- **Next.js Production Build**: `npm run build` berhasil mengompilasi **23/23 route**.
- **Test Suite**: Seluruh pengujian unit dan integrasi (`test:streak`, `test_goal_driven_training_engine.js`, `test:coach`, `test:health`) lulus 100%.
- **Integritas Database**: 34 aktivitas autentik Strava di PostgreSQL 16 tetap aman dan utuh.

