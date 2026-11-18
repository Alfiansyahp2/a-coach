# Changelog: Add Activity Modal React Portal & Z-Index Stacking Resolution (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-06 07:20:00 WIB
- **Tipe**: `fix(ui)` / `feat(ui)` / `fix(modal)` / `fix(stacking-context)`
- **Commit Message Rujukan**: `fix(ui): mount add activity modal to document body via react portal to resolve sidebar z-index overlap`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-06_07-20-00_fix-add-activity-modal-portal-stacking-and-sidebar-z-index.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Setelah implementasi antarmuka buku terbuka (*open book*) pada `AddActivityModal`, ditemukan anomali visual pada tata letak antarmuka saat pengguna membuka modal dari halaman kalender latihan (`/training`) maupun bilah navigasi atas:

1. **Sidebar Navigasi Menimpa Lembaran Buku (*Z-Index Stacking Bleed*)**:
   - Komponen navigasi samping kiri platform (`AppSidebar.tsx`) yang berstatus `sticky top-0 h-screen z-40` ter-render di atas lembaran modal. Ikon-ikon rel navigasi (Overview, Kalender, Riwayat Aktivitas, Profil Kesehatan, Running Coach, Cycling Coach, dll.) memotong dan menutupi halaman kiri buku catatan atlet.
2. **Terperangkap dalam Stacking Context Lokal (*Local Stacking Trap*)**:
   - Meskipun modal diberi class `z-50`, pemanggilan `<AddActivityModal />` berada di dalam hierarki DOM anak (`ScheduleTrainingHub` di dalam `<main>` pada `AppShell`).
   - Karena kontainer konten utama (`<div className="flex-1 flex flex-col min-w-0">`) berada berdampingan sebagai saudara (*sibling*) dari `<aside className="... z-40">`, batas nilai z-index modal terkunci di dalam stacking context kontainer anak tersebut dan kalah bersaing dengan elemen luar yang memiliki `z-40`.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Implementasi React Portal ke Root Dokumen (`src/components/activity/modal/AddActivityModal.tsx`)

Untuk melepaskan kontainer modal dari stacking context lokal komponen induk, modal dialihkan menggunakan **React Portal (`createPortal`)**:

1. **Mounting Dinamis ke `document.body`**:
   - Mengimpor `createPortal` dari `react-dom`.
   - Menggunakan hook `useEffect` untuk mendeteksi status mount di sisi klien (*hydration-safe*) guna menghindari ketidakcocokan hidrasi SSR pada Next.js:
     ```tsx
     import React, { useState, useEffect } from "react";
     import { createPortal } from "react-dom";

     export function AddActivityModal(...) {
       const [isOpen, setIsOpen] = useState(false);
       const [mounted, setMounted] = useState(false);

       useEffect(() => {
         setMounted(true);
       }, []);
     ```

2. **Peningkatan Skala Layer Tertinggi (`z-[99999]` & `z-[100000]`)**:
   - Backdrop modal dinaikkan menjadi `z-[99999]`:
     ```tsx
     const modalDialog = isOpen ? (
       <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
         {/* Top Bar Floating Controls */}
         <div className="absolute top-3 right-4 sm:right-6 z-[100000] flex items-center gap-2">
           <button
             onClick={handleClose}
             disabled={isSubmitting || isParsingImage}
             className="px-3.5 py-1.5 rounded-lg bg-[#19221c]/95 text-stone-300 hover:text-white border border-[#304235] hover:border-emerald-500 font-mono text-xs flex items-center gap-1.5 transition-all shadow-xl cursor-pointer"
           >
             <X className="w-4 h-4" />
             <span>Tutup Buku</span>
           </button>
         </div>
         ...
       </div>
     ) : null;
     ```

3. **Kondisional Render Portal**:
   - Memastikan portal hanya diaktifkan ketika komponen sudah ter-mount di lingkungan browser (`typeof document !== "undefined"`):
     ```tsx
     return (
       <>
         {/* Trigger Buttons (Button / Outline / Compact) */}
         ...
         {/* Render via Portal to document.body for top-level stacking */}
         {mounted && typeof document !== "undefined" && modalDialog
           ? createPortal(modalDialog, document.body)
           : modalDialog}
       </>
     );
     ```

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/components/activity/modal/AddActivityModal.tsx` | Modifikasi | +30 | -6 | Integrasi `createPortal` ke `document.body`, state `mounted`, dan peningkatan z-index ke `z-[99999]` |

**Total Perubahan**: 1 file termodifikasi, **+30 baris ditambahkan**, **-6 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - **Hasil**: Exit code `0` (0 Error, 100% Type-Safe).
2. **Verifikasi Produksi Build Next.js (Turbopack)**:
   - Perintah: `npm run build`
   - **Hasil**: Kompilasi selesai dalam 6.0s, seluruh 27 rute aplikasi berhasil teroptimasi tanpa kendala.
3. **Pemeriksaan Hirarki DOM Visual (Browser Inspection)**:
   - Node modal `<div class="fixed inset-0 z-[99999] ...">` kini terpasang langsung di bawah `<body>`.
   - Sidebar navigasi `AppSidebar` (`z-40`) kini berada di bawah lapisan backdrop modal.
   - Tidak ada lagi pemotongan atau tumpang tindih visual pada lembaran buku sebelah kiri.
4. **Verifikasi HTTP Endpoint Terkait**:
   - `http://localhost:3000/training` $\to$ **HTTP 200 OK**.

