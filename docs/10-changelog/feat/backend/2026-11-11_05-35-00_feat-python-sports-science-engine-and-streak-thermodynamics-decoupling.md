# Changelog: Python Sports Science Engine Architecture & Streak Thermodynamics Decoupling (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-11 05:35:00 WIB
- **Tipe**: `feat(backend)` / `arch(python-engine)` / `feat(streak)` / `test(pytest)`
- **Commit Message Rujukan**: `feat(backend): establish python sports science fastapi engine and decouple weekly streak thermodynamics logic`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-11_05-35-00_feat-python-sports-science-engine-and-streak-thermodynamics-decoupling.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit arsitektur menyeluruh pada [`docs/09-audit/PYTHON_CALCULATION_LOGIC_AUDIT.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/09-audit/PYTHON_CALCULATION_LOGIC_AUDIT.md):

1. **Keterikatan Monolitik Logika Domain di Runtime Node.js/TypeScript**:
   - Seluruh rumus sains olahraga (fisiologi kardiak Karvonen, skor kesiapan Borg CR10, rasio beban ACWR, periodisasi *progressive overload*, dan spektum termodinamika pembakaran api) sebelumnya dieksekusi di dalam layer TypeScript (`src/lib/domain/**`).
   - Keterikatan ini membatasi pemanfaatan pustaka sains data terkemuka (*NumPy, Pandas, SciPy*) dan mempersulit integrasi model *machine learning* masa depan.
2. **Evaluasi Opsi Eksekusi: Opsi A (FastAPI) vs Opsi B (Subprocess)**:
   - Pendekatan Opsi B (`child_process.execFile` per perhitungan) menimbulkan latensi *process spawn* 300–800 ms per pemanggilan di OS Windows. Jika dashboard mengeksekusi 6 kalkulasi paralel, pengguna mengalami *lag* 1–3 detik pada setiap *refresh*.
   - Opsi A (FastAPI Micro-Engine) menjaga runtime Python dan pustaka ilmiah tetap *warm* di memori, menghasilkan waktu respons komputasi sub-milidetik ($< 5\text{ ms}$).

Pembaruan ini menginisialisasi arsitektur **Opsi A (FastAPI Local Sports Science Engine)** di direktori `python_engine/`, mengimplementasikan modul logika pertama (**Streak & Thermodynamic Combustion Heat Spectrum**), serta menghubungkannya ke gateway Next.js via klien HTTP terpadu dengan mekanisme *graceful offline fallback*.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Server Komputasi FastAPI Mandiri (`python_engine/main.py`)

Menghadirkan entrypoint FastAPI port 8000 dengan CORS middleware dan *healthcheck*:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from python_engine.api.streak_router import router as streak_router

app = FastAPI(
    title="A-Coach Sports Science & Telemetry Engine",
    description="High-performance deterministic athletic calculation engine powering endurance telemetry, biomechanics & periodization.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(streak_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "a-coach-python-sports-science-engine",
        "version": "1.0.0",
        "runtime": "Python 3.14+ (FastAPI)",
    }
```
- **Karakteristik Endpoint**: Terbuka untuk *pre-flight checks*, melayani OpenAPI / Swagger UI interaktif di `http://127.0.0.1:8000/docs`.

---

### B. Implementasi Logika Domain Termodinamika & Streak (`python_engine/domain/streak/streak_engine.py`)

Mentranslasikan seluruh kalkulasi matematika rentetan latihan mingguan ke Python murni yang deterministik:
```python
def get_flame_heat_tier(streak_weeks: int, is_flame_burning: bool = True) -> FlameHeatTierModel:
    if streak_weeks <= 0 or not is_flame_burning:
        return FlameHeatTierModel(
            stage=0, name="Api Padam", minWeeks=0, maxWeeks=0,
            colorHex="#5A6272", glowRgba="rgba(90, 98, 114, 0.2)",
            temperatureText="0°C", description="Api padam — selesaikan 1 sesi minggu ini untuk menyalakan api",
            nextTierWeeks=1, weeksToNextTier=1
        )

    if streak_weeks < 10:
        return FlameHeatTierModel(stage=1, name="Api Merah", minWeeks=1, maxWeeks=9, colorHex="#EF4444", glowRgba="rgba(239, 68, 68, 0.5)", temperatureText="~800°C", description="Stage 1: Api Merah (~800°C) — Initial ember / least hot", nextTierWeeks=10, weeksToNextTier=10 - streak_weeks)

    if streak_weeks < 20:
        return FlameHeatTierModel(stage=2, name="Api Oranye", minWeeks=10, maxWeeks=19, colorHex="#F97316", glowRgba="rgba(249, 115, 22, 0.5)", temperatureText="~1,100°C", description="Stage 2: Api Oranye (~1,100°C) — Sustained flame / medium heat", nextTierWeeks=20, weeksToNextTier=20 - streak_weeks)

    if streak_weeks < 30:
        return FlameHeatTierModel(stage=3, name="Api Kuning Emas", minWeeks=20, maxWeeks=29, colorHex="#EAB308", glowRgba="rgba(234, 179, 8, 0.5)", temperatureText="~1,300°C", description="Stage 3: Api Kuning Emas (~1,300°C) — High heat consistency", nextTierWeeks=30, weeksToNextTier=30 - streak_weeks)

    if streak_weeks < 40:
        return FlameHeatTierModel(stage=4, name="Api Putih Terang", minWeeks=30, maxWeeks=39, colorHex="#F8FAFC", glowRgba="rgba(248, 250, 252, 0.65)", temperatureText="~1,500°C", description="Stage 4: Api Putih Terang (~1,500°C) — White-hot intensity", nextTierWeeks=40, weeksToNextTier=40 - streak_weeks)

    if streak_weeks < 50:
        return FlameHeatTierModel(stage=5, name="Api Biru Cyan", minWeeks=40, maxWeeks=49, colorHex="#00F0FF", glowRgba="rgba(0, 240, 255, 0.65)", temperatureText="~1,800°C", description="Stage 5: Api Biru Cyan (~1,800°C) — Pure gas combustion / hottest flame", nextTierWeeks=50, weeksToNextTier=50 - streak_weeks)

    return FlameHeatTierModel(stage=6, name="Api Ungu Plasma", minWeeks=50, maxWeeks=None, colorHex="#C084FC", glowRgba="rgba(192, 132, 252, 0.7)", temperatureText=">2,200°C", description="Stage 6: Api Ungu Plasma (>2,200°C) — Cosmic plasma peak", nextTierWeeks=None, weeksToNextTier=None)
```
- **Karakteristik Komputasi**: Menjalankan partisi kalender ISO (Senin 00:00:00 s.d. Minggu 23:59:59), deduplikasi aktivitas terhadap latihan terjadwal, serta penghitungan rentang rekor terpanjang dan sisa hari menuju akhir pekan.

---

### C. Router REST API & Skema Kontrak Pydantic (`python_engine/api/streak_router.py`)

Menangani payload komputasi streak melalui endpoint HTTP POST:
```python
@router.post("/streak", response_model=WeeklyStreakResponse)
def compute_weekly_streak(payload: StreakCalculationPayload) -> WeeklyStreakResponse:
    """
    Computes weekly training streak continuity and thermodynamic flame heat tiers.
    Pure mathematical and sports retention logic executed in Python.
    """
    return calculate_weekly_streak(
        activities=payload.activities,
        workouts=payload.workouts,
        reference_date=payload.reference_date,
    )
```
- **Skema Model**: Menggunakan Pydantic v2 untuk validasi tipe data yang ketat (`ActivityInput`, `ScheduledWorkoutInput`, `WeeklyStreakResponse`).

---

### D. Klien HTTP Gateway & Delegasi API Next.js (`src/lib/api/pythonClient.ts`)

Klien HTTP terpadu dengan *graceful offline fallback* untuk menjamin kompatibilitas *build* dan *prerender*:
```typescript
export async function computeStreakViaPython(
  activities: Activity[] = [],
  workouts: ScheduledWorkout[] = [],
  referenceDate?: Date | string
): Promise<WeeklyStreakResult> {
  try {
    const payload = {
      activities: activities.map((a) => ({ ... })),
      workouts: workouts.map((w) => ({ ... })),
      reference_date: refDateStr,
    };

    const res = await fetch(`${PYTHON_ENGINE_URL}/calculate/streak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as WeeklyStreakResult;
    }
  } catch (err: any) {
    console.warn(`[PythonEngine] Connection notice: ${err.message}. Using local fallback.`);
  }

  // Graceful deterministic fallback
  return fallbackCalculateWeeklyStreak(activities, workouts, refDateObj);
}
```
- **Pembaruan Rute API Next.js (`src/app/api/athlete/streak/route.ts`)**:
  Mengganti pemanggilan lokal langsung menjadi `await computeStreakViaPython(activities, workouts)`.

---

### E. Orkestrasi Paralel Developer Experience (`package.json`)

Menambahkan perintah paralel untuk menjalankan Next.js dan FastAPI secara terpadu:
```json
  "scripts": {
    "dev:python": ".\\python_engine\\.venv\\Scripts\\uvicorn main:app --app-dir python_engine --host 127.0.0.1 --port 8000 --reload",
    "dev:all": "concurrently -n next,python -c cyan,yellow \"next dev\" \".\\python_engine\\.venv\\Scripts\\uvicorn main:app --app-dir python_engine --host 127.0.0.1 --port 8000 --reload\"",
    "test:python": ".\\python_engine\\.venv\\Scripts\\python.exe -m pytest python_engine/tests"
  }
```

---

## 3. Matriks Perbandingan Git Diff

| Berkas Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `python_engine/requirements.txt` | Baru | +7 | 0 | Definisi dependensi Python (FastAPI, Uvicorn, Pydantic, NumPy, Pandas, Pytest) |
| `python_engine/main.py` | Baru | +37 | 0 | Server FastAPI, konfigurasi CORS Next.js, dan endpoint `/health` |
| `python_engine/domain/streak/models.py` | Baru | +47 | 0 | Model Pydantic untuk input aktivitas, output streak, dan tier termodinamika |
| `python_engine/domain/streak/streak_engine.py` | Baru | +259 | 0 | Mesin komputasi Python murni untuk streak dan 6 tahap spektrum termodinamika api |
| `python_engine/domain/streak/__init__.py` | Baru | +18 | 0 | Ekspor modul domain streak |
| `python_engine/api/streak_router.py` | Baru | +18 | 0 | Router FastAPI `POST /calculate/streak` |
| `python_engine/api/__init__.py` | Baru | +3 | 0 | Ekspor router API |
| `python_engine/tests/test_streak.py` | Baru | +98 | 0 | Suite Pytest untuk verifikasi logika streak, 6 tahap api, dan 10 minggu kontinu |
| `python_engine/tests/test_api.py` | Baru | +27 | 0 | Suite Pytest TestClient untuk verifikasi endpoint FastAPI `/health` dan `/calculate/streak` |
| `src/lib/api/pythonClient.ts` | Baru | +76 | 0 | Klien HTTP Next.js ke FastAPI dengan mekanisme *graceful offline fallback* |
| `src/app/api/athlete/streak/route.ts` | Modifikasi | +2 | -2 | Delegasi kalkulasi streak ke klien Python Engine |
| `package.json` | Modifikasi | +4 | -1 | Integrasi skrip `dev:python`, `dev:all`, `test:python` dan `concurrently` |
| `package-lock.json` | Modifikasi | +222 | 0 | Lockfile paket `concurrently` |
| `docs/09-audit/PYTHON_CALCULATION_LOGIC_AUDIT.md` | Baru | +189 | 0 | Laporan audit menyeluruh 14 modul domain logic untuk migrasi Python |

**Total Akumulasi**: 14 berkas termodifikasi/dibuat, **+1.007 baris ditambahkan**, **-3 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Suite Verifikasi Pytest Python Engine**:
   - Perintah: `npm run test:python` (`.\python_engine\.venv\Scripts\python.exe -m pytest python_engine/tests`)
   - **Hasil**: **6 PASSED in 0.95s (100% Lulus)**.
2. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - **Hasil**: **0 Errors, Exit Code 0 (100% Type-Safe)**.
3. **Suite Verifikasi Rentetan Latihan & Spektrum Api (Node.js)**:
   - Perintah: `node scripts/tests/test_weekly_streak_system.js`
   - **Hasil**: **21 PASSED, 0 FAILED (100% Paritas Hasil)**.
4. **Kompilasi Produksi Next.js**:
   - Perintah: `npm run build`
   - **Hasil**: **32/32 Routes Generated (Exit Code 0)**.

---

## 5. Dampak Sistem

- **Pemisahan Tanggung Jawab Nyata (*True Separation of Concerns*)**: Logika matematis sains olahraga kini terisolasi di dalam Python, sementara Next.js fokus pada UI performan tinggi dan presentasi data.
- **Paritas Hasil Sempurna**: Output perhitungan streak di Python menghasilkan data yang 100% identik dengan mesin TypeScript sebelumnya (10 minggu = Stage 2 Api Oranye `#F97316`).
- **Zero Build Regression**: Klien HTTP dilengkapi *offline fallback* sehingga proses *build* statis Next.js tidak bergantung pada keberadaan server Python yang sedang aktif.
- **Integritas Kontrol Versi**: Seluruh berkas dibiarkan dalam status *uncommitted working tree* sesuai instruksi pengguna untuk inspeksi langsung.
