# Changelog: Master Specification for 5+ Interchangeable Athletic Calendar Models (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-12 08:20:00 WIB
- **Tipe**: `docs(design)` / `feat(ui)` / `feat(architecture)`
- **Commit Message Rujukan**: `docs(design): document master specification for 5+ interchangeable athletic calendar models in docs/02-design` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui` / `main`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-12_08-20-00_docs-calendar-ui-design-variants-specification-and-multi-model-catalog.md`

---

## 1. Latar Belakang & Permintaan Pengguna

Menindaklanjuti audit antarmuka kalender latihan, pengguna meminta rancangan master sistem multi-model kalender:
> *"buatkan plan atau rencana tentang model dari semua kalender atau ui dari kalender yang bisa kau buat. semacam kummpulan ui untuk kalender yang bisa diubah-ubah untuk saya user sendiri dan bisa memilihnya, minimal 5 ui kalender yang berbeda"*
> *"taruh diantara folder ini C:\Users\MyBook Hype AMD\OneDrive\Documents\kerja\_code\project_strava\docs"*
> *"pencatatan agar rapi dan bisa diingat"*

Pengguna menginginkan agar **seluruh variasi model kalender didokumentasikan secara rapi dan permanen** di dalam repositori dokumentasi agar menjadi acuan arsitektur yang persisten dan mudah diingat.

---

## 2. Rincian Dokumen Spesifikasi yang Dibuat

### Berkas Baru: [`docs/02-design/CALENDAR_UI_DESIGN_VARIANTS_SPECIFICATION.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/02-design/CALENDAR_UI_DESIGN_VARIANTS_SPECIFICATION.md)

Dokumen ini memuat spesifikasi teknis lengkap setebal 230 baris yang mencakup:

1. **Filosofi & Kebutuhan Kognitif Atlet**:
   - Memetakan 5 momen psikologis atlet (perencanaan bulanan, eksekusi harian, pencarian momentum kinetik, refleksi jurnal lari klasik, dan strategi periodisasi makro).
2. **Diagram Alur Sistem Modular (*Interchangeable Calendar Engine*)**:
   - Diagram alir Mermaid yang mendefinisikan hubungan antara `ScheduleTrainingHub.tsx`, bilah kontrol `CalendarCommandBar.tsx`, penyimpanan lokal `localStorage ("athlete_calendar_view_preference")`, dan masing-masing modul tampilan.
3. **Katalog 6 Model UI Kalender Lengkap**:
   - **Model 1: The WKO / TrainingPeaks 8-Column Month Grid** (Grid bulanan kontigu dengan kolom rekap beban mingguan di sisi paling kanan).
   - **Model 2: The Garmin Avionics 7-Column Weekly Planner** (7 kolom vertikal lebar dengan komparasi mendalam target rencana vs realisasi Strava).
   - **Model 3: The Strava Kinetic Bubble & Heat-Ring Matrix** (Visualisasi momentum berbasis gelembung kinetik berdiameter proporsional dengan durasi dan cincin zona HR).
   - **Model 4: The Vintage Dual-Page Open Book Field Journal** (Bentangan jurnal fisik 2 halaman terbuka dengan kertas bergaris, catatan tepi pelatih, dan pita pembatas).
   - **Model 5: The Meso-Periodization Gantt Horizon & PMC** (Garis waktu horizontal 12 minggu dengan balok durasi latihan dan kurva kelelahan Banister CTL/ATL/TSB).
   - **Model 6 (Bonus Power-User): Minimalist Keyboard-Navigable Micro-HUD** (Baris ultra-padat dengan navigasi kilat keyboard `[`/`]`, `J`/`K`, `Enter`, `C`).
4. **Matriks Komparasi Antar-Model**:
   - Membandingkan cakupan waktu, kepadatan informasi, integrasi PMC, gaya visual, dan responsivitas seluler.
5. **Kontrak Tipe Data TypeScript**:
   - Mendefinisikan canonical union `CalendarViewModel`.
6. **Pedoman Clean Architecture**:
   - Menegakkan batas `< 300 baris` untuk setiap berkas komponen yang dibangun.

---

## 3. Sinkronisasi Indeks Dokumentasi Induk

Untuk menjaga integritas ekosistem dokumentasi, dua berkas indeks induk telah diperbarui:
1. [`docs/02-design/README.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/02-design/README.md):
   - Mendaftarkan `CALENDAR_UI_DESIGN_VARIANTS_SPECIFICATION.md` ke dalam tabel sitemap desain arsitektur.
2. [`docs/README.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/README.md):
   - Mendaftarkan spesifikasi kalender ke dalam direktori master sistem dokumentasi.

---

## 4. Status Kepatuhan Git

Sesuai instruksi mutlak pengguna (*"jangan langsung di commit, paham?!"*):
- **TIDAK ADA git commit** yang dijalankan.
- Seluruh berkas dokumentasi tersimpan rapi di dalam *unstaged working tree* untuk ditinjau langsung oleh pengguna.
