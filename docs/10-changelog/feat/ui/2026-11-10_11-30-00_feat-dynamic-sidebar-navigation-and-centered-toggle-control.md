# Changelog: Dynamic Sidebar Navigation & Centered Toggle Control (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-10 11:30:00 WIB
- **Tipe**: `feat(ui)` / `feat(navigation)` / `refactor(ux)` / `perf(rendering)`
- **Commit Message Rujukan**: `feat(ui): implement dynamic data-driven sidebar navigation, semantic grouping, and centered vertical toggle control`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-10_11-30-00_feat-dynamic-sidebar-navigation-and-centered-toggle-control.md`

---

## 1. Latar Belakang & Permintaan Pengguna

Berdasarkan permintaan evaluasi visual antarmuka navigasi samping (*sidebar*):

1. **Bilah Navigasi Statis & Kaku**:
   - Sebelumnya seluruh badge navigasi didefinisikan sebagai string konstan yang *hardcoded* (misal: jumlah aktivitas tertulis `34` padahal di basis data terdapat `37` sesi; status `Running Coach` dan `Profil Kesehatan` tidak membaca konteks medis riil atlet).
   - Menu disajikan dalam 1 daftar panjang datar (*flat list*) yang monoton tanpa hierarki visual atau pengelompokan tematik.
2. **Posisi Tombol Toggle Kurang Ergonomis (*Awkward Bottom Placement*)**:
   - Tombol ciutkan/perluas (`Ciutkan Menu` / `>`) sebelumnya terletak di pojok paling bawah bilah samping (`border-t` footer di bagian bawah layar).
   - Pengguna harus menggerakkan kursor mouse jauh ke sudut bawah layar hanya untuk memperluas atau menciutkan menu.
3. **Penyederhanaan Ruang Tampilan**:
   - Pengguna meminta agar tombol navigasi berada di tengah-tengah garis vertikal layar (*vertical center* / *eye-level*), bukan di pojok bawah, serta menjaga antarmuka tetap bersih tanpa widget tambahan yang membebani tampilan bilah samping.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Modularisasi Konfigurasi Navigasi & Badge Dinamis (`src/components/layout/sidebar/navConfig.ts`)

Mengekstrak konfigurasi menu ke berkas terpisah berukuran 119 baris dengan antarmuka dinamis:

```typescript
export interface SidebarDynamicContext {
  activitiesCount: number;
  streakWeeks: number;
  hasActiveRestrictions: boolean;
  stravaConnected: boolean;
  goalsCount: number;
}
```

Pengelompokan 3 seksi semantik:
1. **Telemetri & Analitik**:
   - `Overview` (`/`): Badge `LIVE` (hijau).
   - `Rekap Mingguan` (`/recap`): Badge `1M` (cyan).
   - `Riwayat Aktivitas` (`/activities`): Badge dinamis sesuai jumlah sesi riil (misal: `37`).
2. **Pelatihan & Coach**:
   - `Kalender Latihan` (`/training`): Badge `12W`.
   - `Running Coach` (`/coach/running`): Badge dinamis berbasis konteks cedera: `HOLD` (oranye/amber) saat restriksi aktif, atau `READY` (hijau) saat kapasitas sendi optimal.
   - `Cycling Coach` (`/coach/cycling`): Badge `ACTIVE` (hijau).
   - `Sasaran & Target` (`/goals`): Badge dinamis sesuai jumlah sasaran aktif (misal: `4`).
3. **Profil & Medis**:
   - `Profil Atlet` (`/profile`): Badge `PRO`.
   - `Profil Kesehatan` (`/health`): Badge `GATE` / `SAFE`.
   - `Integrasi Strava` (`/#strava-gateway`): Badge `SYNC` (hijau saat jembatan API aktif).

---

### B. Relokasi Tombol Toggle ke Tengah Vertikal (`src/components/layout/AppSidebar.tsx`)

1. **Floating Edge Toggle Button (`top-1/2 -translate-y-1/2`)**:
   - Tombol toggle dipindahkan ke tengah vertikal pada garis pembatas sisi kanan bilah samping:
```tsx
{/* Tombol Toggle Perluas/Ciutkan di Tengah (Vertical Center) */}
<button
  onClick={toggleExpand}
  className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)] shadow-md flex items-center justify-center transition-all cursor-pointer group hover:scale-110"
  title={isExpanded ? "Ciutkan Sidebar" : "Perluas Sidebar"}
  aria-label={isExpanded ? "Ciutkan Sidebar" : "Perluas Sidebar"}
>
  {isExpanded ? (
    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
  ) : (
    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
  )}
</button>
```
2. **Pembersihan Footer**:
   - Menghapus tombol toggle di bagian bawah dan menggantinya dengan label versi sistem yang minimalis (`ENDURANCE LAB v2.0`).
3. **Persistensi Preferensi Pengguna (`localStorage`)**:
   - Status perluas/ciutkan sidebar tersimpan secara otomatis di `localStorage.getItem("endurance_sidebar_expanded")`, menjaga kenyamanan atlet saat bernavigasi antarrute.

---

### C. Aliran Data Otoritatif Melalui Shell (`src/components/layout/AppShell.tsx`)

Meneruskan data `user`, `dbStatus`, `healthContext`, `streakWeeks`, dan `activitiesCount` dari Server Component ke bilah navigasi untuk menghindari pergeseran tata letak (*zero layout shift*):
```tsx
<AppSidebar
  user={user}
  dbStatus={dbStatus}
  healthContext={healthContext}
  streakWeeks={streakWeeks}
  activitiesCount={activitiesCount}
/>
```

---

## 3. Hasil Pengujian & Verifikasi Kualitas

1. **Pemeriksaan Tipe Data TypeScript**:
   - `npx tsc --noEmit` -> **0 error**.
2. **Next.js Production Build**:
   - `npm run build` -> Sukses mengompilasi **32/32 rute** secara utuh.
3. **Automated Test Suite**:
   - `npx tsx scripts/tests/test_weekly_recap_engine.js` -> **11/11 PASSED (100% lulus)**.
4. **Audit Batasan Baris Berkas**:
   - `src/components/layout/AppSidebar.tsx`: 211 baris (< 300)
   - `src/components/layout/sidebar/navConfig.ts`: 119 baris (< 300)
   - `src/components/layout/AppShell.tsx`: 56 baris (< 300)
