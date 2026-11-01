# Changelog: Implementasi Alur Otorisasi & Jabat Tangan Strava OAuth 2.0 PKCE (`feat/strava-oauth-handshake`)

- **Tanggal & Waktu**: 2026-11-01 20:44:00 WIB
- **Tipe**: `feat(strava)` / `feat(api)` / `feat(ui)` / `feat(security)`
- **Commit Message**: `feat(strava): implement oauth 2.0 status, disconnect endpoints, and interactive telemetry handshake ui`
- **Branch**: `feat/strava-oauth-handshake`

---

## 1. Latar Belakang & Masalah

1. **Kelengkapan Siklus Hidup OAuth Strava API v3**:
   - Cabang sebelumnya telah menyiapkan logika dasar otorisasi dan callback, namun belum menyediakan endpoint terpadu untuk memeriksa status koneksi atlet (`/api/auth/strava/status`) maupun mekanisme pemutusan sambungan aman (*deauthorization & token revocation*) via `/api/auth/strava/disconnect`.
   - Tanpa endpoint status dan disconnect, antarmuka pengguna tidak dapat mengetahui secara *real-time* apakah atlet sudah terhubung, izin apa saja yang disetujui, atau bagaimana cara mencabut akses secara mandiri.

2. **Antarmuka Pengguna Default yang Belum Fungsional**:
   - Laman utama [`src/app/page.tsx`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx) sebelumnya masih berupa template bawaan Create Next App, sehingga atlet belum memiliki tombol aksi langsung untuk memulai jabat tangan (*handshake*) OAuth ke server Strava.
   - Diperlukan komponen interaktif yang elegan, mematuhi standar desain *Obsidian Telemetry* (bebas dari *AI slop*), serta menangani berbagai status otorisasi (belum terkonfigurasi, siap menghubungkan, aktif terhubung, serta penanganan error/banner hasil pengalihan URL).

3. **Kompatibilitas Next.js 16 Partial Prerendering (PPR)**:
   - Pengambilan data telemetri database pada server-side component harus mematuhi arsitektur streaming `<Suspense>` Next.js 16 (`cacheComponents: true` dan `partialPrefetching: true`) agar halaman dapat dipra-render sebagian (*Partial Prerender*) tanpa *blocking error*.

---

## 2. Solusi & Perubahan yang Diterapkan

### A. Endpoint Pemeriksaan Status Koneksi ([`src/app/api/auth/strava/status/route.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/status/route.ts))
- Menyediakan endpoint `GET /api/auth/strava/status`:
  - Memeriksa kelengkapan konfigurasi kredensial lingkungan (`isConfigured`).
  - Mengambil data koneksi atlet dari database (`getStravaConnection`).
  - Mengembalikan objek respons informatif: ID Strava atlet, nama lengkap, username, foto profil avatar, daftar scope otorisasi (`scopes`), dan timestamp waktu penautan.

### B. Endpoint Pemutusan & Pencabutan Token ([`src/app/api/auth/strava/disconnect/route.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/disconnect/route.ts))
- Menyediakan endpoint `POST /api/auth/strava/disconnect`:
  - Memverifikasi keberadaan koneksi aktif di database.
  - Mengambil dan mendekripsi token akses aktif via cipher AES-256-GCM.
  - Memanggil endpoint resmi Strava `POST https://www.strava.com/oauth/deauthorize` untuk membatalkan izin di sisi server Strava.
  - Menghapus record koneksi dan token dari database PostgreSQL (`disconnectStrava`).

### C. Komponen Visual Jabat Tangan Strava ([`src/components/StravaConnectCard.tsx`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/StravaConnectCard.tsx))
- Komponen interaktif *client-side* (`"use client"`) dengan 3 status:
  1. **Config Required**: Memandu atlet mengisi `STRAVA_CLIENT_ID` dan `STRAVA_CLIENT_SECRET` di `.env.local` jika belum tersetel.
  2. **Ready to Connect**: Tombol "Connect with Strava" berlatar oranye khas Strava (`#FC4C02`) yang mengarahkan pengguna ke `/api/auth/strava/authorize`.
  3. **Active Connection**: Menampilkan kartu profil atlet terverifikasi, badge indikator online hijau berdenyut, ringkasan enkripsi AES-256-GCM, daftar scope, dan tombol "Disconnect" dengan dialog konfirmasi.
  4. **Feedback Banners**: Otomatis menangkap parameter URL `?connected=true` atau `?error=...` dan menampilkannya sebagai banner notifikasi elegan.

### D. Modernisasi Dasbor Telemetri Atletik ([`src/app/page.tsx`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx))
- Mengubah beranda menjadi konsol instrumen presisi *a-coach*:
  - Header: Identitas brand, indikator status konektivitas database PostgreSQL (`sport_training`), dan status proteksi kriptografi AES-256.
  - Integrasi Gateway OAuth Strava: Tempat kartu jabat tangan `<StravaConnectCard />`.
  - Agregasi Telemetri Mingguan: Jarak total mingguan, durasi bergerak aktif, rata-rata pace aerobik lari berformat angka tabular (`font-tabular`), dan skor kepatuhan jadwal latihan.
  - Pratinjau Aktivitas Terkini & Kalender Latihan Terjadwal.
  - Arsitektur streaming `<Suspense>` yang sepenuhnya kompatibel dengan Next.js 16 Partial Prerendering (`◐ Partial Prerender`).

### E. Standarisasi Tipografi Tabular ([`src/app/globals.css`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/globals.css))
- Menerapkan utilitas CSS `.font-tabular` (`font-variant-numeric: tabular-nums`) untuk memastikan angka telemetri tidak bergeser secara visual.

---

## 3. Matriks Berkas yang Dimodifikasi

| Kategori | Berkas | Status | Ringkasan Modifikasi |
| --- | --- | :---: | --- |
| **API Endpoints** | [`src/app/api/auth/strava/status/route.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/status/route.ts) | `NEW` | Endpoint pemeriksaan status koneksi, kelengkapan konfigurasi, dan profil atlet terhubung. |
| **API Endpoints** | [`src/app/api/auth/strava/disconnect/route.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/disconnect/route.ts) | `NEW` | Endpoint pemutusan hubungan, pencabutan token Strava deauthorize, dan pembersihan database. |
| **UI Components** | [`src/components/StravaConnectCard.tsx`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/StravaConnectCard.tsx) | `NEW` | Komponen interaktif jabat tangan OAuth Strava dengan feedback banner, profil atlet, dan aksi disconnect. |
| **Pages & Views** | [`src/app/page.tsx`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx) | `MODIFY` | Dasbor telemetri atletik a-coach lengkap dengan integrasi Suspense PPR Next.js 16. |
| **Styles** | [`src/app/globals.css`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/globals.css) | `MODIFY` | Penambahan variabel surface Obsidian dan kelas `.font-tabular`. |
| **Documentation** | [`docs/10-changelog/2026-11-01_20-44-00_feat-strava-oauth-handshake.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/2026-11-01_20-44-00_feat-strava-oauth-handshake.md) | `NEW` | Dokumentasi changelog implementasi cabang `feat/strava-oauth-handshake`. |

---

## 4. Hasil Verifikasi & Pengujian

1. **Production Build (`npm run build`)**:
   - Compiler: **Next.js 16.4.3 (Turbopack)**.
   - Status: **SUCCESS (Exit code 0)**.
   - Rute Terverifikasi:
     - `◐ /` (Partial Prerender)
     - `○ /_not-found` (Static)
     - `ƒ /api/auth/strava/authorize` (Dynamic)
     - `ƒ /api/auth/strava/callback` (Dynamic)
     - `ƒ /api/auth/strava/disconnect` (Dynamic)
     - `○ /api/auth/strava/status` (Prerendered/Static cache)
2. **TypeScript Strict Typecheck**: Lulus tanpa diagnostik error dalam 4.6 detik.

