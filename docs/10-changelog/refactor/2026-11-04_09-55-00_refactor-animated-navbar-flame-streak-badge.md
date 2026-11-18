# Changelog: Animated Navbar Flame Streak Badge (`refactor`)

- **Tanggal & Waktu**: 2026-11-04 10:10:00 WIB
- **Tipe**: `feat(ui)` / `refactor(navbar)` / `animation` / `domain-integration`
- **Commit Message Rujukan**: `feat(ui): synchronize navbar flame badge with thermodynamic heat spectrum stages and dynamic physics animations`
- **Branch**: `refactor`
- **Lokasi**: [`docs/10-changelog/refactor/2026-11-04_09-55-00_refactor-animated-navbar-flame-streak-badge.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-04_09-55-00_refactor-animated-navbar-flame-streak-badge.md)

---

## 1. Latar Belakang & Kebutuhan Fitur

Untuk memperkuat *retensi latihan* dan visualisasi konsistensi atlet secara *omnipresent* di seluruh halaman, bilah navigasi atas (Navbar) dilengkapi dengan lencana streak api latihan. 

Berdasarkan tinjauan pengguna:
1. Huruf akhiran `w` dihapus agar lencana tampil lebih minimalis, tebal, dan fokus pada angka streak (`[ 🔥 9 ]`).
2. Animasi nyala api dipastikan aktif dan bergerak secara nyata (*realistic organic fire flicker & ember motion*) dengan menyematkan keyframes mandiri langsung pada komponen guna menghindari batasan purger/utility framework.
3. Posisi lencana dipindahkan ke **pojok kiri navbar**, berdampingan dengan penanda judul brand `ENDURANCE LAB / Overview Telemetri`.
4. **Sinkronisasi Penuh dengan Spektrum Panas Termodinamika**: Seluruh warna api, drop-shadow animasi, aura pendar, percikan partikel (*spark*), dan denyut border berevolusi secara dinamis mengikuti 6 tahap pembakaran fisik (*Thermodynamic Flame Heat Spectrum*).

---

## 2. Rincian Implementasi Teknis

### A. Sinkronisasi Spektrum Termodinamika 6-Tahap ([`src/components/layout/NavbarStreakBadge.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/NavbarStreakBadge.tsx))

Komponen disinkronkan secara matematis dengan modul domain [`src/lib/domain/streak/streakEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakEngine.ts):

| Tahap | Rentang Minggu | Nama Api | Warna Utama | Suhu Fisik | Karakteristik Animasi |
|---|---|---|---|---|---|
| **Stage 1** | 1–9 Minggu | `Api Merah` | `#EF4444` | ~800°C | Pendar bara merah awal, bayangan crimson `#DC2626`, percikan halus |
| **Stage 2** | 10–19 Minggu | `Api Oranye` | `#F97316` | ~1,100°C | Nyala api membara jingga `#EA580C`, pendar hangat berkelanjutan |
| **Stage 3** | 20–29 Minggu | `Api Kuning Emas` | `#EAB308` | ~1,300°C | Nyala konsistensi emas `#CA8A04`, partikel percikan terang |
| **Stage 4** | 30–39 Minggu | `Api Putih Terang` | `#F8FAFC` | ~1,500°C | Intensitas panas putih-perak `#E2E8F0`, pendar kontras tinggi |
| **Stage 5** | 40–49 Minggu | `Api Biru Cyan` | `#00F0FF` | ~1,800°C | Pembakaran gas murni terpanas `#0284C7`, aura listrik neon |
| **Stage 6** | 50+ Minggu | `Api Ungu Plasma` | `#C084FC` | >2,200°C | Puncak kosmik ungu plasma `#9333EA`, pendar aurora kosmik |
| *Stage 0* | 0 Minggu | `Api Padam` | `#5A6272` | 0°C | Abu padam statis tanpa pendar |

---

### B. Variabel CSS Dinamis pada Animasi Api
Sistem animasi membaca variabel CSS yang diinjeksikan secara reaktif:
```css
@keyframes dynamic-fire-flicker {
  0%, 100% {
    transform: scaleY(1) scaleX(1) translateY(0) rotate(0deg);
    filter: drop-shadow(0 0 4px var(--flame-p)) drop-shadow(0 -2px 6px var(--flame-s));
  }
  20% {
    transform: scaleY(1.18) scaleX(0.88) translateY(-2px) rotate(-3deg);
    filter: drop-shadow(0 0 9px var(--flame-p)) drop-shadow(0 -4px 10px var(--flame-s));
  }
  ...
}
```
Setiap pergantian tahap streak akan secara instan mengubah warna lidah api, percikan (*micro spark*), aura blur, dan denyut border lencana tanpa perlu merender ulang stylesheet.

---

### C. Reposisi ke Pojok Kiri Navbar ([`src/components/layout/AppHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppHeader.tsx))
- Struktur tata letak sisi kiri kini:
  ```text
  [Tombol Mobile] → [ 🔥 9 ] → | → [ENDURANCE LAB / Overview Telemetri]
  ```
- Lencana streak menjadi elemen pertama yang menyapa atlet di pojok kiri atas.

---

## 3. Hasil Verifikasi

- **Kompilasi TypeScript**: `npx tsc --noEmit` lulus **0 error**.
- **Kompilasi Turbopack Build**: `npm run build` sukses mengompilasi seluruh **24/24 route**.
- **Unit Test Streak**: `npm run test:streak` lulus **21/21 passed**.
- **Integritas Database**: 34 aktivitas Strava (24 Ride, 10 Run) di PostgreSQL 16 tetap aman dan utuh.
