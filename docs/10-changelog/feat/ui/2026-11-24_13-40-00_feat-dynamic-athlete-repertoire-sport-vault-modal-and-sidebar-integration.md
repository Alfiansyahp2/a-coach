# Changelog: Dynamic Athlete Repertoire, Sport Vault Modal 33 Cabor, & Integrasi Sidebar Navigation (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-24 13:40:00 WIB
- **Tipe**: `feat(ui)` / `ux-architecture` / `design-system` / `telemetry`
- **Commit Message Rujukan**: `feat(ui): implement dynamic athlete repertoire, sport vault 33 cabor modal, and adaptive sidebar navigation` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Dokumen Terkait**:
  - [`docs/11-ai/10-SPESIFIKASI_UX_SELEKSI_CABOR_DINAMIS_DAN_TELEMETRI_INSTAN.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/10-SPESIFIKASI_UX_SELEKSI_CABOR_DINAMIS_DAN_TELEMETRI_INSTAN.md)
  - [`docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md)
  - [`docs/02-design/ANTI_AI_SLOP.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/02-design/ANTI_AI_SLOP.md)

---

## 1. Latar Belakang & Rasional Perubahan

Dalam penggunaan faktual, atlet saat ini aktif dalam **2 cabang olahraga**: **Lari (Running)** dan **Sepeda (Cycling / Ride)**. Di sisi lain, backend Python FastAPI dan domain TypeScript telah selesai mengimplementasikan rumus matematika deterministik untuk **33 cabang olahraga dunia** lintas 6 klaster fisiologis dengan 94 unit test lolos.

### Masalah UX Sebelumnya:
1. **Hardcoded Filter pada Feed**: [`ActivityFeed.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/ActivityFeed.tsx) memiliki filter tab kaku yang terkunci pada `"All" | "Run" | "Ride"`. Jika atlet mencatat aktivitas Angkat Beban, Tinju, BJJ, atau Bulutangkis, aktivitas tersebut tidak memiliki tab filter tersendiri.
2. **Potensi AI-Slop jika Menampilkan 33 Tab**: Menampilkan seluruh 33 cabor sekaligus pada layar feed akan menghasilkan 31 tab kosong yang mengacaukan hierarki visual dan membebani kognisi atlet (*cognitive clutter*).
3. **Ketidaktahuan Atlet akan Kesiapan Formula**: Atlet tidak mengetahui bahwa ketika mereka ingin memulai cabor baru, sistem sudah memiliki formula sains olahraga otomatis siap pakai (seperti Brzycki 1RM, Sheiko INOL, Catapult PlayerLoad, dan SWOLF).
4. **Sidebar Statis**: Sidebar navigasi hanya memiliki menu `Running Coach` dan `Cycling Coach`, tanpa pintu masuk (*vault door*) untuk mengeksplorasi cabor lainnya.

---

## 2. Rincian Modul & Arsitektur yang Dibuat / Diperbarui

### A. Modul Domain Service Repertoire Cabor
1. **[`src/lib/domain/sports/sportRepertoireService.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/sports/sportRepertoireService.ts) (251 baris)**:
   - Dibuat fungsi `extractActiveSports(activities: Activity[])` yang secara dinamis mengekstrak cabor unik yang memiliki data riil dan menghitung frekuensi aktivitasnya.
   - Dibuat registri formula `SPORT_FORMULA_REGISTRY` untuk seluruh 33 cabor dunia yang memetakan rumus kunci (*key formulas*), ringkasan metrik, dan *safety alert* (seperti peringatan ACWR spikes, Sheiko INOL > 2.0, atau SCAT6 Concussion).

### B. Komponen Antarmuka Sport Vault Modal & Card
1. **[`src/components/sports/SportVaultCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/sports/SportVaultCard.tsx) (93 baris)**:
   - Kartu cabor presisi obsidian dengan icon cabor spesifik dari `<SportIcon />`.
   - Lencana status visual: `🟢 Formula Siap` dengan titik berkedip (*pulsing dot*).
   - Pratinjau formula matematis otomatis yang akan dihitung backend.
   - Status Repertoire (`Aktif di Feed` vs `Siap diaktifkan`) dan tombol aksi 1-klik `[+ Pilih & Catat]`.
2. **[`src/components/sports/SportVaultModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/sports/SportVaultModal.tsx) (168 baris)**:
   - Modal katalog interaktif dengan filter 6 klaster fisiologis (`Semua (33)`, `Endurance (6)`, `Strength (5)`, `Combat (6)`, `Team (6)`, `Racquet (5)`, `Extreme (5)`).
   - Bilah pencarian instan untuk mencari cabor berdasarkan nama, label, atau alias.
   - Grid kartu responsif dengan dukungan tombol `Escape` dan animasi *fade-in*.

### C. Refaktor Activity Feed Dinamis
1. **[`src/components/activity/ActivityFeed.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/ActivityFeed.tsx) (286 baris)**:
   - Menggantikan filter hardcoded dengan array dinamis `activeSports` yang diekstrak dari aktivitas atlet.
   - Secara default hanya merender tab cabor aktif riil (`Semua`, `Lari`, `Sepeda`), menjaga UI 100% bebas dari polusi tab kosong.
   - Menambahkan tombol pemicu katalog cabor: `[ + Cabor (33) ]` dengan garis tepi putus-putus neon volt.
   - Mengganti ikon manual dengan `<SportIcon sportCode={...} cluster={...} />`.
   - Menghubungkan klik kartu aktivitas non-jarak (seperti Gym atau Beladiri) agar menampilkan durasi menit alih-alih pace `0:00`.

### D. Integrasi Sidebar Navigation (Vault Door)
1. **[`src/components/layout/sidebar/navConfig.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/sidebar/navConfig.ts) (141 baris)**:
   - Menambahkan menu `Direktori 33 Cabor` di section *Telemetri & Analitik* dengan badge `[33]` dan ikon `Layers`.
   - Menambahkan menu `+ Aktifkan Coach` di section *Pelatihan & Coach* dengan badge `[VAULT]`.
   - Menambahkan flag `isVaultTrigger: true` untuk menangani pembukaan modal secara langsung.
2. **[`src/components/layout/AppSidebar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppSidebar.tsx) (247 baris)**:
   - Mengintegrasikan state modal `isVaultOpen` yang dicegat (*intercepted*) dari klik navigasi tanpa memicu reload halaman penuh.
   - Me-mount `<SportVaultModal />` pada kontainer sidebar.

### E. Dokumentasi Desain Sistem & Spesifikasi UX
1. **[`docs/11-ai/10-SPESIFIKASI_UX_SELEKSI_CABOR_DINAMIS_DAN_TELEMETRI_INSTAN.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/10-SPESIFIKASI_UX_SELEKSI_CABOR_DINAMIS_DAN_TELEMETRI_INSTAN.md)**:
   - Membakukan filosofi *Dynamic Athlete Repertoire*, aturan HCI 3-detik, matriks input mentah vs output formula, dan spesifikasi adaptasi halaman detail aktivitas polimorfik.
2. **[`docs/11-ai/README.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/README.md)**:
   - Memperbarui direktori pohon dokumen dan rangkuman master indeks dokumen ke-10.

---

## 3. Matriks Alur Pengguna (User Journey Matrix)

```
[Atlet Membuka Dashboard]
       │
       ▼
[Activity Feed Tampil Bersih: Tab Hanya "Semua", "Lari", "Sepeda"]
       │
       ├──► Atlet klik [+ Cabor (33)] di Feed  ─┐
       │                                         ├──► [Sport Vault Modal Terbuka]
       └──► Atlet klik "Direktori 33 Cabor"      │    - Menampilkan 33 cabor dalam 6 klaster
            di Sidebar Navigasi                 ─┘    - Setiap cabor memuat badge "🟢 Formula Siap"
                                                      - Pratinjau kalkulasi otomatis tampil
                                                             │
                                                             ▼
                                                [Atlet Memilih Cabor Baru]
                                                (Contoh: Powerlifting / Gym)
                                                             │
                                                             ▼
                                                [Aktivitas Gym Disimpan]
                                                             │
                                                             ▼
                                                [Feed Filter Otomatis Beradaptasi]
                                                Menjadi: [Semua] [Lari] [Sepeda] [Kekuatan (1)]
```

---

## 4. Jaminan Kualitas & Pengujian (Quality Assurance)

| Komponen Pengujian | Perintah Eksekusi | Hasil Pengujian | Catatan |
| :--- | :--- | :---: | :--- |
| **Kompilasi TypeScript** | `npx tsc --noEmit` | **0 Errors** | Validasi tipe data ketat pada seluruh antarmuka dan modul |
| **Registri 33 Cabor** | `npm run test:sports-registry` | **44 Passed, 0 Failed** | Verifikasi kuota cabor dan 6 klaster fisiologis |
| **Mesin Ikon Cabor** | `npm run test:icons` | **42 Passed, 0 Failed** | Verifikasi render ikon SVG unik tanpa ikon placeholder generik |
| **FastAPI Python Engine**| `npm run test:python` | **94 Passed, 0 Failed** | Seluruh kalkulasi deterministik sains olahraga teruji |
| **Batas Baris File** | Audit internal | **$< 300 Baris** | Seluruh file di `src/` berada di bawah ambang batas ketat 300 baris |
| **Status Git** | `git status --short` | **Unstaged Working Tree** | Mematuhi instruksi tegas *NO GIT COMMITS* |
