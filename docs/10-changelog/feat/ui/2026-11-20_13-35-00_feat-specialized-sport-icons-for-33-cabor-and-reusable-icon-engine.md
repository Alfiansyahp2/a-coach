# Changelog: Mesin Icon Khusus 33 Cabang Olahraga Sistem & Penyelarasan Visual UI (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-20 13:35:00 WIB
- **Tipe**: `feat(ui)` / `refactor(icons)` / `design-system` / `test(unit)`
- **Commit Message Rujukan**: `feat(ui): implement specialized sport icons engine for all 33 system sports with custom svgs and strict cluster fallbacks` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-20_13-35-00_feat-specialized-sport-icons-for-33-cabor-and-reusable-icon-engine.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-20_13-35-00_feat-specialized-sport-icons-for-33-cabor-and-reusable-icon-engine.md)

---

## 1. Latar Belakang & Rasional Perubahan

Pada implementasi pemilih cabor sebelumnya, penentuan ikon masih bersifat generik per kluster fisiologis (`renderClusterIcon(item.cluster)`). Hal ini mengakibatkan anomali visual yang membingungkan atlet:
- Seluruh 6 cabor ketahanan siklik (*Lari, Renang, Dayung, Triathlon, Sepeda, MTB XC*) menampilkan ikon sepeda (`Bike`).
- Seluruh 5 cabor kekuatan (*Powerlifting, Angkat Besi, Kalistenik, Strongman, Binaraga*) menampilkan ikon barbel dumbbell (`Dumbbell`).
- Seluruh cabor bela diri menampilkan pedang silang (`Swords`), cabor beregu menampilkan piala (`Trophy`), cabor raket menampilkan target (`Target`), dan cabor ekstrem menampilkan api (`Flame`).

Pengguna memberikan instruksi langsung: *"buat icon yang pas untuk masing-masing cabor"*. 

Untuk memenuhi kebutuhan ergonomi visual tingkat tinggi tanpa mengurangi performa atau melanggar aturan arsitektur, dibangun modul terdedikasi [`SportIcon.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/sports/SportIcon.tsx) yang memetakan icon unik, otentik, dan presisi untuk masing-masing dari **33 cabang olahraga dunia** yang terdaftar di sistem.

---

## 2. Rincian Perubahan Modul & Komponen

### A. Modul Reusable Sport Icon Engine (`src/components/sports/`)
1. **[`SportIcon.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/sports/SportIcon.tsx) (233 baris)**:
   - Dibuat komponen terpadu `<SportIcon sportCode={...} sportName={...} cluster={...} />`.
   - Mengintegrasikan icon resmi pustaka Lucide yang presisi (`Footprints`, `Bike`, `Mountain`, `Waves`, `Sailboat`, `Timer`, `Weight`, `Dumbbell`, `BicepsFlexed`, `Anvil`, `HandFist`, `Swords`, `ShieldAlert`, `Sword`, `Users`, `Zap`, `Volleyball`, `Goal`, `Trophy`, `RugbyBall`, `HockeyStick`, `BowArrow`, `Crosshair`, `Flame`, `Pickaxe`, `Sparkles`).
   - Menyertakan **8 ikon vektor 24x24 SVG kustom buatan tangan (*handcrafted*)** dengan standar ketebalan garis 2px konsisten untuk cabor yang tidak memiliki representasi langsung di Lucide:
     - `SoccerBallIcon`: Bola sepak bola geometris pentagon klasik.
     - `BasketballIcon`: Bola basket dengan garis lingkar kurva dinamis.
     - `ShuttlecockIcon`: Kok bulu tangkis dengan kepala gabus & helai bulu.
     - `TennisBallIcon`: Bola tenis dengan jahitan lengkung.
     - `TableTennisIcon`: Bet tenis meja beserta bola pingpong.
     - `CalisthenicsRingsIcon`: Cincin senam artistik / palang kalistenik.
     - `SurfboardIcon`: Papan selancar melintasi gelombang air laut.
     - `SkateboardIcon`: Papan luncur skateboard dengan roda ganda.
   - Menyediakan resolusi fallback otomatis berbasis kluster (`CLUSTER_DEFAULT_ICONS`) dan skema warna aksen kluster (`CLUSTER_COLOR_MAP`).

### B. Integrasi Antarmuka Pemilih Cabor Modal (`src/components/activity/modal/`)
1. **[`SportTypeSelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/SportTypeSelector.tsx) (208 baris)**:
   - Menggantikan fungsi lama `renderClusterIcon` dengan pemanggilan langsung komponen `<SportIcon sportCode={item.code} cluster={item.cluster} className="w-3.5 h-3.5" />`.
   - Memperbarui lencana cabor aktif pada bilah tajuk dengan ikon spesifik cabor terpilih.

### C. Integrasi Antarmuka AI Coach Generator (`src/components/coach/dynamic/`)
1. **[`DynamicSportCoachControl.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/dynamic/DynamicSportCoachControl.tsx) (272 baris)**:
   - Menerapkan `<SportIcon />` pada carousel tombol pemilihan pelatih cabor di panel Dynamic Coach Generator.
2. **[`DynamicCoachDebriefCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/dynamic/DynamicCoachDebriefCard.tsx) (121 baris)**:
   - Menambahkan lencana visual `<SportIcon />` berukuran 16px di samping judul identitas AI Coach pada kartu HUD debrief.

---

## 3. Matriks Pemetaan Icon Khusus (33 Cabor Sistem)

| # | Kode Cabor | Nama Cabor | Kluster | Komponen Icon | Filosofi Visual & Sumber |
|---|---|---|---|---|---|
| 1 | `SPORT_DISTANCE_RUNNING` | Lari Jarak Jauh & Maraton | CYCLIC_ENDURANCE | `Footprints` | Jejak telapak kaki pelari (Lucide) |
| 2 | `SPORT_ROAD_CYCLING` | Balap Sepeda Jalan Raya | CYCLIC_ENDURANCE | `Bike` | Sepeda jalan raya balap (Lucide) |
| 3 | `SPORT_MTB_XC` | Sepeda Gunung Cross-Country | CYCLIC_ENDURANCE | `Mountain` | Medan gunung elevasi berbatu (Lucide) |
| 4 | `SPORT_SWIMMING` | Renang (Aquatics) | CYCLIC_ENDURANCE | `Waves` | Gelombang air dinamis perenang (Lucide) |
| 5 | `SPORT_ROWING` | Dayung & Ergometer | CYCLIC_ENDURANCE | `Sailboat` | Perahu dayung perairan (Lucide) |
| 6 | `SPORT_TRIATHLON` | Triathlon & Multi-Sport | CYCLIC_ENDURANCE | `Timer` | Stopwatch multi-disiplin race (Lucide) |
| 7 | `SPORT_POWERLIFTING` | Powerlifting (SBD) | STRENGTH_POWER | `Weight` | Pelat besi kalibrasi angkat berat (Lucide) |
| 8 | `SPORT_WEIGHTLIFTING` | Angkat Besi Olimpiade | STRENGTH_POWER | `Dumbbell` | Barbel angkatan overhead snatch/C&J (Lucide) |
| 9 | `SPORT_CALISTHENICS` | Kalistenik & Street Workout | STRENGTH_POWER | `CalisthenicsRingsIcon` | Cincin senam & palang tubuh (Custom SVG) |
| 10 | `SPORT_STRONGMAN` | Strongman & Heavy Carries | STRENGTH_POWER | `Anvil` | Landasan besi kokoh brute force (Lucide) |
| 11 | `SPORT_BODYBUILDING` | Binaraga & Hipertrofi | STRENGTH_POWER | `BicepsFlexed` | Puncak fleksi otot bisep (Lucide) |
| 12 | `SPORT_BOXING` | Tinju (Boxing) | COMBAT_MARTIAL_ARTS | `HandFist` | Kepalan tinju pukulan telak (Lucide) |
| 13 | `SPORT_MMA` | Seni Bela Diri Campuran | COMBAT_MARTIAL_ARTS | `Swords` | Pedang silang benturan multi-seni (Lucide) |
| 14 | `SPORT_BJJ` | Brazilian Jiu-Jitsu | COMBAT_MARTIAL_ARTS | `ShieldAlert` | Pertahanan kuncian ground guard (Lucide) |
| 15 | `SPORT_PENCAK_SILAT` | Pencak Silat | COMBAT_MARTIAL_ARTS | `Sword` | Bilah senjata silat tradisional (Lucide) |
| 16 | `SPORT_JUDO` | Judo & Sambo | COMBAT_MARTIAL_ARTS | `Users` | Bantingan atlet berpasangan (Lucide) |
| 17 | `SPORT_MUAY_THAI` | Muay Thai & Kickboxing | COMBAT_MARTIAL_ARTS | `Zap` | Kilat ledakan serangan 8 tungkai (Lucide) |
| 18 | `SPORT_FOOTBALL` | Sepak Bola | TEAM_FIELD_COURT | `SoccerBallIcon` | Bola pentagon sepak bola (Custom SVG) |
| 19 | `SPORT_BASKETBALL` | Bola Basket | TEAM_FIELD_COURT | `BasketballIcon` | Bola basket kurva dinamis (Custom SVG) |
| 20 | `SPORT_VOLLEYBALL` | Bola Voli | TEAM_FIELD_COURT | `Volleyball` | Bola voli garis spiral (Lucide) |
| 21 | `SPORT_FUTSAL` | Futsal Lapangan Keras | TEAM_FIELD_COURT | `Goal` | Gawang gawang presisi indoor (Lucide) |
| 22 | `SPORT_RUGBY` | Rugbi | TEAM_FIELD_COURT | `RugbyBall` | Bola lonjong rugbi (Lucide) |
| 23 | `SPORT_FIELD_HOCKEY` | Hoki Lapangan | TEAM_FIELD_COURT | `HockeyStick` | Tongkat hoki lapangan (Lucide) |
| 24 | `SPORT_BADMINTON` | Bulu Tangkis | RACQUET_PRECISION | `ShuttlecockIcon` | Kok bulu tangkis aerodinamis (Custom SVG) |
| 25 | `SPORT_TENNIS` | Tenis Lapangan | RACQUET_PRECISION | `TennisBallIcon` | Bola tenis jahitan lengkung (Custom SVG) |
| 26 | `SPORT_TABLE_TENNIS` | Tenis Meja | RACQUET_PRECISION | `TableTennisIcon` | Bet pegangan & bola pingpong (Custom SVG) |
| 27 | `SPORT_ARCHERY` | Panahan | RACQUET_PRECISION | `BowArrow` | Busur dan anak panah sasaran (Lucide) |
| 28 | `SPORT_SHOOTING` | Menembak Presisi | RACQUET_PRECISION | `Crosshair` | Lingkaran bidik silang akurasi (Lucide) |
| 29 | `SPORT_FUNCTIONAL_FITNESS` | Kebugaran Fungsional | FUNCTIONAL_EXTREME | `Flame` | Kobaran api metcon CrossFit/Hyrox (Lucide) |
| 30 | `SPORT_CLIMBING` | Panjat Tebing & Bouldering | FUNCTIONAL_EXTREME | `Pickaxe` | Kapak es / alat pemanjat tebing (Lucide) |
| 31 | `SPORT_GYMNASTICS` | Senam Artistik | FUNCTIONAL_EXTREME | `Sparkles` | Kilau estetika gerakan akrobatik (Lucide) |
| 32 | `SPORT_SURFING` | Selancar Ombak | FUNCTIONAL_EXTREME | `SurfboardIcon` | Papan selancar membelah ombak (Custom SVG) |
| 33 | `SPORT_SKATEBOARDING` | Skateboard | FUNCTIONAL_EXTREME | `SkateboardIcon` | Papan skateboard dek & roda ganda (Custom SVG) |

---

## 4. Rangkaian Pengujian Otomatis & Verifikasi

- **Suite Pengujian Baru**: [`scripts/tests/test_sports_icons_mapping.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_sports_icons_mapping.js) (114 baris).
  - Memvalidasi 33 cabor sistem memiliki pemetaan komponen icon yang valid dan dapat di-render tanpa throwing error.
  - Memvalidasi diferensiasi antar cabor (Lari $\neq$ Sepeda, Renang $\neq$ Sepeda, Tinju $\neq$ MMA, Panahan $\neq$ Menembak, Bulu Tangkis $\neq$ Voli, Sepak Bola $\neq$ Basket, Tenis $\neq$ Tenis Meja).
  - Memvalidasi *fallback resolution* untuk cabor kustom baru di luar 33 cabor sistem.
  - **Hasil**: **42 Passed, 0 Failed**.
- **Hasil Pengujian Terpadu (`npm run test:all`)**:
  - Lulus **17 dari 17 test suite** (**437+ pengujian lulus, 0 gagal**).
- **Next.js Turbopack Build**: `npm run build` sukses mengompilasi **35/35 rute** aplikasi dalam 4.5 detik (TypeScript 7.4s) dengan **0 kesalahan**.
- **Disiplin Batas Baris Kode (`< 300 lines`)**:
  - `SportIcon.tsx`: 233 baris
  - `SportTypeSelector.tsx`: 208 baris
  - `DynamicSportCoachControl.tsx`: 272 baris
  - `DynamicCoachDebriefCard.tsx`: 121 baris
  - **100% berkas berada di bawah batas 300 baris**.
