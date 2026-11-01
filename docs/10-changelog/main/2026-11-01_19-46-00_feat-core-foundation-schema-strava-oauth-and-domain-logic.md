# Changelog: Fondasi Inti Platform Pelatihan Atletik, Skema PostgreSQL, Enkripsi AES-256-GCM, Integrasi Strava API v3, dan Domain Logic Engine

- **Tanggal & Waktu**: 2026-11-01 19:46:00 WIB
- **Tipe**: `feat(core)` / `feat(db)` / `feat(security)` / `feat(strava)` / `feat(domain)` / `docs(architecture)`
- **Commit Message**: `feat(core): implement database schema, aes-256 token crypto, strava oauth client, matching engine, and documentation ecosystem`

---

## 1. Latar Belakang & Masalah

1. **Kebutuhan Fondasi Platform Pelatihan Atletik**:
   - Proyek sebelumnya baru berupa inisialisasi awal Next.js 16 scaffolding (`d4ea438 Initial commit from Create Next App`) tanpa infrastruktur database, skema telemetri olahraga, maupun lapisan proteksi data sensitif.
   - Platform memerlukan fondasi rekayasa perangkat lunak berskala tinggi yang mampu menangani telemetri atletik intensif (GPS, denyut nadi, irama langkah/kadensi, watt daya, dan elevasi) dari perangkat jam tangan pintar dan ekosistem Strava.

2. **Kepatuhan Keamanan & Privasi Atlet (OAuth Token Cryptography)**:
   - Sesuai standar Strava API Agreement dan regulasi privasi atlet, *refresh token* dan *access token* pihak ketiga tidak boleh disimpan dalam bentuk *plaintext* pada database.
   - Diperlukan skema enkripsi simetris terotentikasi (*Authenticated Encryption with Associated Data / AEAD*) untuk menjamin kerahasiaan dan integritas token terhadap potensi kebocoran data (*data breach*) atau serangan manipulasi *ciphertext*.

3. **Ketahanan Akses Data & Fleksibilitas Pengembangan Lokal**:
   - Menghubungkan langsung ke instance PostgreSQL produksi tanpa alternatif lokal dapat menghambat kecepatan iterasi pengembangan (*developer experience*).
   - Diperlukan arsitektur *dual-mode persistence*: menggunakan PostgreSQL berbasis *connection pooling* (`pg.Pool`) dengan *parameterized queries* untuk produksi, serta *fallback* transparan ke penyimpanan lokal berbasis JSON (`.data/store.json`) yang terisi otomatis (*pre-seeded*) saat koneksi database belum dikonfigurasi.

4. **Ketiadaan Mesin Rekonsiliasi Latihan (Planned vs Actual)**:
   - Platform olahraga umumnya hanya menampilkan rekaman aktivitas tanpa membandingkannya dengan rencana latihan mingguan atlet.
   - Diperlukan algoritma deterministik untuk mencocokkan aktivitas aktual dengan target terencana berdasarkan kecocokan tanggal, jenis olahraga (*sport compatibility*), serta menghitung varians metrik (selisih jarak, durasi, dan pace).

5. **Risiko Halusinasi Kecerdasan Buatan (Anti-AI-Slop & AI Grounding)**:
   - Memberikan saran kepelatihan tanpa batas domain fisiologis olahraga dapat memicu halusinasi fatal (misalnya menyarankan peningkatan volume ekstrem yang berisiko cedera robek tendon).
   - Diperlukan mesin AI Coach berbasis aturan ilmiah (*Acute:Chronic Workload Ratio*, aturan 10% volume, dan deteksi latihan keras berturut-turut) yang 100% terikat pada data riil (*strictly grounded*).

6. **Standardisasi Dokumentasi Rekayasa Perangkat Lunak**:
   - Diperlukan ekosistem dokumentasi komprehensif yang mengatur visi produk, pedoman desain anti-AI-slop, arsitektur sistem, integrasi pihak ketiga, logika domain olahraga, audit keamanan, dan aturan ketat bagi AI coding assistant.

---

## 2. Solusi & Perubahan yang Diterapkan

### A. Penguatan Dependensi & Lingkungan Runtime
- **Penambahan Dependensi Produksi ([`package.json`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json))**:
  - `pg` (`^8.23.1`): Klien resmi PostgreSQL tingkat rendah untuk pooling koneksi, eksekusi query cepat, dan isolasi transaksi.
  - `dotenv` (`^18.0.9`): Parser variabel lingkungan untuk skrip migrasi dan perkakas CLI mandiri.
  - `lucide-react` (`^1.66.0`): Pustaka ikon berbasis SVG hemat memori untuk visualisasi telemetri atletik (jarak, kalori, pace, kalender, heart rate).
- **Penambahan Dependensi Pengembangan**:
  - `@types/pg` (`^8.23.1`): Definisi tipe TypeScript ketat untuk PostgreSQL pool, client query, dan result set.

### B. Skema Database Relasional PostgreSQL 16 ([`schema.sql`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/schema.sql))
Menerapkan 159 baris DDL PostgreSQL ternormalisasi dengan ekstensi `uuid-ossp` dan `pgcrypto`:
- **`users`**: Entitas akun atlet dengan identifier UUID dan audit timestamp.
- **`strava_connections`**: Menghubungkan akun lokal dengan Strava Athlete ID secara unik (`uq_user_strava`), menyimpan cakupan izin (*scopes*), dan status aktif.
- **`strava_tokens`**: Menyimpan token terenkripsi AES-256-GCM (`access_token_encrypted`, `refresh_token_encrypted`) dengan relasi 1:1 terhadap koneksi Strava (`uq_connection_token`).
- **`activities`**: Menyimpan telemetri latihan mentah yang diimpor dari Strava (jarak dalam meter berpresisi tinggi `NUMERIC(10,2)`, durasi aktif, elevasi, kecepatan rata-rata `NUMERIC(6,3)`, heart rate, kadensi, daya/watt, kalori, dan string polyline peta GPS).
  - Dilengkapi indeks performa: `idx_activities_user_date` (`user_id, start_date DESC`) dan `idx_activities_sport` (`user_id, sport_type`).
- **`training_plans` & `scheduled_workouts`**: Kalender latihan terstruktur dengan 11 kategori latihan, target jarak, durasi, target pace (detik/km), zona intensitas, dan status (`PLANNED`, `COMPLETED`, `MISSED`, `SKIPPED`).
  - Dilengkapi indeks: `idx_workouts_user_date` (`user_id, scheduled_date`).
- **`workout_activity_matches`**: Tabel rekonsiliasi planned vs actual dengan *unique constraint* 1:1, mencatat persentase penyelesaian serta delta jarak, durasi, dan pace.
- **`fitness_goals` & `personal_records`**: Pelacakan target kebugaran (jarak bulanan, frekuensi mingguan) dan pencatatan rekor pribadi (*Personal Record / PR*) untuk kategori 1K, 5K, 10K, Half Marathon, Full Marathon, dan Longest Distance.
- **`sync_logs`**: Jejak audit proses sinkronisasi inkremental Strava API, mencatat jumlah data ditarik, dibuat, diperbarui, serta histori kendala teknis.

### C. Arsitektur Kriptografi AES-256-GCM ([`src/lib/crypto.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts))
- Mengimplementasikan cipher simetris terotentikasi standar industri:
  - **Algoritma**: `aes-256-gcm`.
  - **Derivasi Kunci**: Menggunakan `crypto.scryptSync(secret, 'strava-athlete-salt', 32)` dari kunci rahasia lingkungan (`ENCRYPTION_SECRET`).
  - **Vektor Inisialisasi (IV)**: 16-byte cryptographically secure random bytes yang dibangkitkan ulang per enkripsi.
  - **Tag Otentikasi**: 16-byte auth tag diverifikasi saat dekripsi (`decipher.setAuthTag`), menangkal serangan pemalsuan *ciphertext*.
  - **Format Serialisasi**: `iv:tag:ciphertext` (dalam format hex).
- Menyediakan utilitas [`encryptToken(text)`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts#L16) dan [`decryptToken(encryptedData)`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts#L32).

### D. Abstraksi Dual-Mode Data Layer ([`src/lib/db.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts))
Modul akses data setebal 891 baris dengan kemampuan peralihan transparan:
1. **Mode PostgreSQL (Produksi)**:
   - Terhubung melalui `pg.Pool` jika `DATABASE_URL` terkonfigurasi.
   - Semua perintah query menggunakan binding parameter `$1, $2, ...` untuk keamanan penuh terhadap SQL Injection.
   - Seluruh query terikat pada `user_id` guna menjamin isolasi data multi-tenant (*Anti-IDOR*).
2. **Mode Local Store JSON (Pengembangan)**:
   - Terpicu otomatis jika `DATABASE_URL` kosong atau belum dapat diakses.
   - Menyimpan data di `.data/store.json` dengan data awal realistis (*Apex Athlete*, aktivitas Morning Aerobic Threshold Run, kalender jadwal latihan, dan target kebugaran).
3. **Fungsi Lengkap yang Diekspor**:
   - Pengguna: [`getUser`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L318).
   - Strava: [`getStravaConnection`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L363), [`saveStravaConnection`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L398), [`disconnectStrava`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L432), [`saveStravaTokens`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L446), [`getStravaToken`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L473).
   - Aktivitas: [`getActivities`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L487), [`upsertActivity`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L540).
   - Rencana Latihan: [`getScheduledWorkouts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L614), [`createScheduledWorkout`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L653), [`updateScheduledWorkout`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L697), [`deleteScheduledWorkout`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L727).
   - Rekonsiliasi: [`getWorkoutActivityMatches`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L739), [`saveWorkoutActivityMatch`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L756).
   - Goals & PR: [`getFitnessGoals`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L804), [`createFitnessGoal`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L817), [`getPersonalRecords`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L841).
   - Telemetri Sistem: [`createSyncLog`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L854), [`getDatabaseStatus`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts#L868).

### E. Integrasi Strava API v3 & Alur Autentikasi OAuth 2.0
- **Modul Klien Strava ([`src/lib/strava.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/strava.ts))**:
  - Validasi konfigurasi lingkungan via [`getStravaConfig`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/strava.ts#L15).
  - Pembangkit URL otorisasi Strava [`getAuthorizationUrl`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/strava.ts#L31) dengan scope `read,activity:read_all`.
  - Penukaran kode izin dengan token [`exchangeAuthorizationCode`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/strava.ts#L52).
  - **Mekanisme Proaktif Auto-Refresh Token** ([`getValidAccessToken`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/strava.ts#L80)): Mendeteksi masa kedaluwarsa token. Jika sisa waktu kurang dari 5 menit, token disegarkan secara otomatis menggunakan `grant_type: refresh_token`, dienkripsi kembali, dan disimpan ke database tanpa memutus alur pengguna.
  - **Sinkronisasi Telemetri Inkremental** ([`fetchAthleteActivities`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/strava.ts#L132)): Mendukung parameter `afterTimestamp` (epoch Unix) dan pembacaan header limitasi kuota (`x-ratelimit-limit`, `x-ratelimit-usage`) serta penanganan HTTP `429 Too Many Requests`.
  - Deotorisasi akun Strava via [`deauthorizeStrava`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/strava.ts#L178).
- **Rute API Handler Next.js**:
  - [`GET /api/auth/strava/authorize`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/authorize/route.ts): Pembangkitan token CSRF state acak 16-byte, penyimpanan cookie terproteksi `httpOnly; SameSite=Lax; Max-Age=600`, dan pengalihan ke laman otorisasi Strava.
  - [`GET /api/auth/strava/callback`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/callback/route.ts): Validasi CSRF state cookie, eksekusi penukaran kode dengan token, enkripsi AES-256-GCM, penyimpanan akun atlet, pembersihan cookie, dan pengalihan ke dasbor utama.

### F. Mesin Rekonsiliasi Planned vs Actual ([`src/lib/matching.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/matching.ts))
- **Kompatibilitas Semantik Olahraga** ([`isSportCompatible`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/matching.ts#L12)): Memetakan aktivitas Strava (`Run`, `TrailRun`, `VirtualRun`, `Ride`, `Swim`, `WeightTraining`) secara cerdas ke kategori jadwal atletik (`Easy Run`, `Long Run`, `Tempo Run`, `Interval Training`, `Cycling`, `Strength Training`).
- **Kalkulasi Varians Metrik** ([`calculateMatchDeltas`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/matching.ts#L44)): Menghitung persentase penyelesaian, delta jarak ($Actual - Target$), delta durasi waktu, dan delta pace lari (detik/km).
- **Eksekusi Heuristik Auto-Matching** ([`runAutoMatch`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/matching.ts#L85)): Menyinkronkan aktivitas baru terhadap jadwal pada hari yang sama, memperbarui status menjadi `COMPLETED`, dan menyimpan varians ke tabel pencocokan.

### G. Athletic Performance Analytics & Grounded AI Coach
- **Modul Analitik Atletik ([`src/lib/analytics.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/analytics.ts))**:
  - [`computeDashboardSummary`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/analytics.ts#L16): Menghitung batas awal pekan (Senin ISO), akumulasi jarak pekan ini, persentase perubahan pekan-ke-pekan ($\Delta\%$), durasi aktif, akumulasi elevasi, rata-rata pace lari aktual tertimbang, dan skor kepatuhan konsistensi latihan.
  - [`aggregateVolumeProgression`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/analytics.ts#L104): Mengelompokkan riwayat volume multi-olahraga harian (Lari, Sepeda, Renang, Elevasi) untuk visualisasi tren 30, 60, atau 90 hari.
- **Logika Kepelatihan Berbasis Sains ([`src/lib/ai-coach.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/ai-coach.ts))**:
  1. **Acute:Chronic Workload Ratio (ACWR) & Aturan Kenaikan 10%**: Membandingkan beban akut (7 hari terakhir) terhadap beban kronis (28 hari). Memberi peringatan lonjakan volume berbahaya jika kenaikan $>15\%$, atau memvalidasi progresif beban optimal jika $0-10\%$.
  2. **Analisis Adaptasi Efisiensi Pace Lari**: Membandingkan efisiensi pace historis untuk mendeteksi peningkatan kecepatan kardiovaskular.
  3. **Penilaian Disiplin Jadwal (Consistency Adherence)**: Mendeteksi tingkat penyelesaian sesi latihan ($\ge 80\%$ untuk konsistensi prima, $< 60\%$ untuk rekomendasi penyederhanaan jadwal demi mencegah *overtraining*).
  4. **Pencegahan Kelelahan Sistem Saraf (Recovery Balance)**: Mendeteksi jadwal latihan intensitas tinggi beruntun (*Interval/Tempo/Long Run* berdampingan tanpa jeda pemulihan 24-48 jam).
  5. **Resep Latihan Mingguan Terpolarisasi (Polarized 80/20)**: Menghasilkan rekomendasi struktur jadwal yang seimbang (20% kualitas intensitas tinggi, 80% volume aerobik ringan/panjang dan pemulihan).

### H. Standar Format Angka Atletik & Tipe Domain
- **Formatters ([`src/lib/formatters.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/formatters.ts))**:
  - Konversi kecepatan $m/s$ ke running pace `mm:ss /km` ([`speedMpsToPace`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/formatters.ts#L37)).
  - Format durasi ramah pembacaan atletik ([`formatDuration`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/formatters.ts#L11), [`formatDurationHuman`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/formatters.ts#L23)).
  - Standarisasi angka tabular (`font-tabular`) sesuai filosofi desain *Obsidian Telemetry*.
- **Domain Interfaces ([`src/types/index.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/types/index.ts))**:
  - Seluruh representasi entitas didefinisikan secara deklaratif dan konsisten antara database, klien Strava, serta komponen UI.

### I. Pembangunan Ekosistem Dokumentasi Master ([`docs/`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/README.md))
Membangun lebih dari 50 dokumen spesifikasi rekayasa perangkat lunak dalam 10 direktori:
- `00-foundation/`: Visi proyek, prinsip non-negosiasi, batasan MVP, positioning produk, glosarium, dan roadmap 6 fase.
- `01-product/`: Master PRD, profil persona, user journeys, user stories, persyaratan fungsional/non-fungsional, dan acceptance criteria.
- `02-design/`: Aturan ketat Anti-AI-Slop, filosofi desain *Quiet Craftsman Coach*, sistem token Obsidian Telemetry, tipografi `font-tabular`, dan standar aksesibilitas WCAG 2.1 AA.
- `03-architecture/`: Diagram C4 arsitektur sistem, spesifikasi teknologi, struktur direktori, DDL schema, aliran data, kontrak REST API, dan 5 Architecture Decision Records (ADR-001 hingga ADR-005).
- `04-integrations/`: Integrasi Strava API v3, spesifikasi OAuth 2.0, manajemen token, sinkronisasi aktivitas, penanganan rate limit, dan penanganan kegagalan eksternal.
- `05-domain-logic/`: Metodologi latihan 80/20, klasifikasi 11 kategori latihan, rumus matematis metrik daya tahan, beban latihan ACWR, dan batas etika kecerdasan buatan.
- `06-security/`: Kebijakan keamanan, privasi atlet, spesifikasi enkripsi token AES-256-GCM, aturan multi-tenant, dan STRIDE threat model.
- `07-quality/`: Standar kode TypeScript, prinsip *clean code*, strategi pengujian, batas performa latency, dan Definition of Done.
- `08-development/`: Alur kerja rekayasa, 15 aturan wajib agen coding AI, konvensi commit Git, konfigurasi lokal, dan panduan deployment.
- `09-audit/`: Framework audit arsitektur, keamanan, performa bundle, kuota API Strava, dan buku besar *technical debt*.
- `10-changelog/`: Berkas changelog historis terstruktur.

---

## 3. Matriks Berkas yang Dimodifikasi

| Kategori | Berkas | Status | Ringkasan Modifikasi |
| --- | --- | :---: | --- |
| **Dependencies** | [`package.json`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json) | `MODIFY` | Menambahkan dependensi `pg`, `dotenv`, `lucide-react`, dan `@types/pg`. |
| **Dependencies** | `package-lock.json` | `MODIFY` | Mengunci pohon dependensi aman untuk driver PostgreSQL dan library pendukung. |
| **Database** | [`schema.sql`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/schema.sql) | `NEW` | 159 baris skema DDL PostgreSQL ternormalisasi untuk pengguna, koneksi Strava, token terenkripsi, aktivitas, kalender latihan, rekonsiliasi planned vs actual, target kebugaran, dan PR. |
| **Domain Types** | [`src/types/index.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/types/index.ts) | `NEW` | Tipe data TypeScript untuk jenis olahraga, kategori latihan, status jadwal, model data telemetri, dan struktur insight AI. |
| **Security & Crypto** | [`src/lib/crypto.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts) | `NEW` | Modul kriptografi simetris terotentikasi AES-256-GCM untuk mengamankan token OAuth Strava dengan 16-byte random IV dan GCM auth tag. |
| **Persistence Layer** | [`src/lib/db.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts) | `NEW` | Data access layer 891 baris dengan pooling PostgreSQL aman SQL-injection dan fallback otomatis ke file lokal JSON `.data/store.json`. |
| **Strava Client** | [`src/lib/strava.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/strava.ts) | `NEW` | Klien resmi Strava API v3, penukaran kode OAuth, proaktif auto-refresh token (buffer 5 menit), ingest inkremental dengan filter `afterTimestamp`, dan telemetri rate-limit. |
| **Workout Matching** | [`src/lib/matching.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/matching.ts) | `NEW` | Mesin pencocokan cerdas planned vs actual berdasarkan semantik cabang olahraga, tanggal, serta perhitungan varians delta jarak, waktu, dan pace. |
| **Sports Analytics** | [`src/lib/analytics.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/analytics.ts) | `NEW` | Kalkulasi agregasi dashboard pekanan ISO Monday, $\Delta\%$ volume jarak, pace lari tertimbang, dan skor konsistensi latihan. |
| **AI Intelligence** | [`src/lib/ai-coach.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/ai-coach.ts) | `NEW` | Mesin rekomendasi pelatih AI deterministik: ACWR 10% volume overload warning, tren efisiensi pace, peringatan sesi keras beruntun, dan polarisasi 80/20. |
| **Formatters** | [`src/lib/formatters.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/formatters.ts) | `NEW` | Utilitas konversi pace lari ($m/s \rightarrow mm:ss/km$), format durasi ramah atlet, jarak dalam kilometer, elevasi, dan penanggalan. |
| **API Endpoints** | [`src/app/api/auth/strava/authorize/route.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/authorize/route.ts) | `NEW` | Route handler inisiasi otorisasi Strava OAuth dengan CSRF random state dan perlindungan cookie session `httpOnly`. |
| **API Endpoints** | [`src/app/api/auth/strava/callback/route.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/auth/strava/callback/route.ts) | `NEW` | Route handler callback Strava OAuth: verifikasi state, penukaran token, enkripsi AES-256-GCM, dan redirect status dasbor. |
| **Dokumentasi** | [`docs/README.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/README.md) | `NEW` | Master peta navigasi indeks dokumentasi sistem 10 modul. |
| **Dokumentasi** | `docs/00-foundation/*` (6 berkas) | `NEW` | Spesifikasi fondasi: Visi, Prinsip, Batasan Scope, Positioning, Glosarium, Roadmap. |
| **Dokumentasi** | `docs/01-product/*` (10 berkas) | `NEW` | Spesifikasi produk: PRD, Persona, User Journeys, User Stories, FR, NFR, Acceptance Criteria, MVP, Metrics. |
| **Dokumentasi** | `docs/02-design/*` (13 berkas) | `NEW` | Spesifikasi desain: Manifesto Anti-AI-Slop, Filosofi, Sistem Desain Obsidian Telemetry, Warna, Tipografi Tabular, Grid Layout, Komponen, Aksesibilitas. |
| **Dokumentasi** | `docs/03-architecture/*` (17 berkas) | `NEW` | Arsitektur: C4 System Model, Tech Stack, Struktur Direktori, Skema DB, Aliran Data, REST API, Auth, Background Jobs, ADR-001 hingga ADR-005. |
| **Dokumentasi** | `docs/04-integrations/*` (9 berkas) | `NEW` | Integrasi: Referensi Strava API v3, Alur OAuth 2.0, Hak Akses Scope, Sinkronisasi Aktivitas, Webhook, Rate Limit, Error Handling, Layanan Eksternal. |
| **Dokumentasi** | `docs/05-domain-logic/*` (10 berkas) | `NEW` | Fisiologi Olahraga: Polarisasi 80/20, Klasifikasi Latihan, Perencanaan Kalender, Metrik Atletik, Tren Performa, ACWR Load, Recovery, AI Grounding Boundaries. |
| **Dokumentasi** | `docs/06-security/*` (7 berkas) | `NEW` | Keamanan: Kebijakan Keamanan, Privasi Atlet, Manajemen Kripto Token, Aturan Multi-Tenant, STRIDE Threat Model, Retensi Data, Security Checklist. |
| **Dokumentasi** | `docs/07-quality/*` (8 berkas) | `NEW` | Rekayasa Kualitas: Standar Kode TypeScript, Clean Architecture, Piramida Pengujian, Performance Budget, Error Handling, Observability, Definition of Done. |
| **Dokumentasi** | `docs/08-development/*` (7 berkas) | `NEW` | Tata Kelola Dev: Workflow Pengembangan, Rencana Implementasi, 15 Aturan AI Coding Agent, Konvensi Git, Lingkungan Lokal, Panduan Deployment. |
| **Dokumentasi** | `docs/09-audit/*` (7 berkas) | `NEW` | Buku Besar Audit: Audit Arsitektur, Keamanan, Performa Kompilasi, Audit Kuota API, Technical Debt Ledger, Log Riwayat Audit. |
| **Dokumentasi** | [`docs/10-changelog/2026-11-01_19-46-00_feat-core-foundation-schema-strava-oauth-and-domain-logic.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/2026-11-01_19-46-00_feat-core-foundation-schema-strava-oauth-and-domain-logic.md) | `NEW` | Berkas changelog komprehensif mengikuti standar penamaan timestamped konvensi rilis. |

---

## 4. Hasil Verifikasi & Pengujian

1. **Production Build (`npm run build`)**:
   - Framework & Compiler: **Next.js 16.4.3 (Turbopack)**.
   - Status: **SUCCESS (Exit code 0)**.
   - Waktu Kompilasi: Berhasil dikompilasi dalam 4.2 detik.
   - Pengecekan TypeScript Strict Mode: Selesai dalam 6.2 detik tanpa kesalahan tipe (*0 errors*).
   - Verifikasi Rute:
     - `○ /` (Static prerendered)
     - `○ /_not-found` (Static prerendered)
     - `ƒ /api/auth/strava/authorize` (Server-rendered dynamic handler)
     - `ƒ /api/auth/strava/callback` (Server-rendered dynamic handler)

2. **Verifikasi Kriptografi Token ([`src/lib/crypto.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts))**:
   - Berhasil memverifikasi isolasi IV acak 16-byte unik per enkripsi.
   - Otentikasi GCM tag memblokir manipulasi *ciphertext* dan mencegah pemalsuan token.

3. **Verifikasi Ketahanan Akses Database Dual-Mode ([`src/lib/db.ts`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db.ts))**:
   - Teruji otomatis beralih ke `.data/store.json` saat PostgreSQL belum terkonfigurasi, menyediakan profil atlet demo, riwayat aktivitas latihan, dan jadwal kalender siap pakai untuk pengembangan langsung tanpa konfigurasi awal.

