"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ScheduledWorkout,
  FitnessGoal,
  AuthoritativeAthleteHealthContext,
  PersonalRecord,
} from "@/types";
import {
  Footprints,
  ShieldAlert,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Calendar,
  Gauge,
  Heart,
  TrendingUp,
  Activity as ActivityIcon,
  ChevronRight,
  ExternalLink,
  Bike,
} from "lucide-react";
import {
  formatDistance,
  formatDuration,
  formatPaceSeconds,
  formatDate,
} from "@/lib/formatters";

interface RunningCoachViewProps {
  activities: Activity[];
  workouts: ScheduledWorkout[];
  goals: FitnessGoal[];
  healthContext: AuthoritativeAthleteHealthContext | null;
  prs: PersonalRecord[];
  onSwitchToCycling?: () => void;
}

export function RunningCoachView({
  activities,
  goals,
  healthContext,
  prs,
  onSwitchToCycling,
}: RunningCoachViewProps) {
  // Filter running activities
  const runningActivities = activities.filter((a) =>
    (a.sport_type || "").toLowerCase().includes("run")
  );

  const totalRunningDistanceMeters = runningActivities.reduce(
    (acc, a) => acc + (a.distance_meters || 0),
    0
  );

  const totalRunningTimeSeconds = runningActivities.reduce(
    (acc, a) => acc + (a.moving_time_seconds || 0),
    0
  );

  const avgRunningSpeedMps =
    totalRunningTimeSeconds > 0
      ? totalRunningDistanceMeters / totalRunningTimeSeconds
      : 0;

  const avgRunningPaceSec =
    avgRunningSpeedMps > 0 ? 1000 / avgRunningSpeedMps : 0;

  // Running goals
  const marathonGoal = goals.find(
    (g) =>
      g.title.toLowerCase().includes("marathon") ||
      (g.sport_type || "").toLowerCase().includes("run")
  ) || {
    id: "marathon-default",
    title: "Road to Marathon 42.2K",
    target_value: 42195,
    current_value: 0,
    is_primary: false,
    priority: 2,
    sport_type: "Run",
    target_date: "2027-11-01",
    user_id: "",
    goal_type: "DISTANCE_MONTHLY" as const,
    start_date: "2026-11-01",
  };

  // Best running PRs
  const runningPrs = prs.filter(
    (p) =>
      (p.sport_type || "").toLowerCase().includes("run") ||
      p.category === "Distance"
  );

  const readiness = healthContext?.latestReadiness;
  const isRunningOnHold =
    readiness?.running_readiness === "ON_HOLD" ||
    readiness?.running_readiness === "REQUIRES_CLINICAL_REVIEW" ||
    true; // Safety default

  return (
    <div className="space-y-6 font-mono">
      {/* 1. SAFETY CIRCUIT BREAKER & CLINICAL GATE BANNER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/[0.06] border-2 border-amber-500/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                  Running Coach Safety Gate
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 tracking-wider">
                  STATUS: ON_HOLD (DITUNDA SEMENTARA)
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-[var(--color-text-primary)]">
                Beban Impak Lari Dinonaktifkan Demi Proteksi Struktur Sendi
              </h2>
            </div>
          </div>

          <Link
            href="/health"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-card)] border border-amber-500/30 hover:border-amber-500 text-xs font-semibold text-amber-500 dark:text-amber-400 transition-all flex items-center gap-1.5 self-start shrink-0 shadow-xs"
          >
            <span>Dossier Medis Atlet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clinical Rationale Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--color-text-muted)] uppercase block">
              1. Pemicu Fisiologis
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Riwayat keseleo inversi pergelangan kaki kanan (*right ankle sprain*) dan nyeri tempurung lutut bilateral (*anterior knee pain*) pasca lari.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--color-text-muted)] uppercase block">
              2. Biomekanika Impak Lari
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Lari menghasilkan gaya impak vertikal <strong>2.5–3x bobot tubuh per langkah</strong>, mengompresi sendi talocrural dan patellofemoral secara berulang.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--color-text-muted)] uppercase block">
              3. Aturan Keamanan Otomatis
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Progresi beban lari dikunci otomatis (<Lock className="w-3 h-3 inline text-amber-500" /> Locked). Diperlukan persetujuan dokter / fisioterapis sebelum fase lari dibuka kembali.
            </p>
          </div>
        </div>

        {/* Positive Cross-Training Redirection */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-cycling)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 flex items-center justify-center text-[var(--color-cycling)] shrink-0">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[var(--color-text-primary)] block">
                Solusi Pemeliharaan Kapasitas Aerobik: AI Cycling Coach
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                Beban aerobik tertutup tanpa hentakan (*closed-chain zero-impact*) telah terbukti 100% bebas nyeri pada rute 56.10 km.
              </span>
            </div>
          </div>

          <button
            onClick={onSwitchToCycling}
            className="px-4 py-2 rounded-lg bg-[var(--color-cycling)] text-black font-bold text-xs hover:bg-[var(--color-cycling)]/90 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <span>Buka Cycling Coach</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. RUNNING GOAL PROGRESSION & SAFETY CIRCUIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Long-Term Marathon Goal Card */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-running)]/15 border border-[var(--color-running)]/30 flex items-center justify-center text-[var(--color-running)]">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                  {marathonGoal.title}
                </h3>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  Sasaran Jangka Panjang • Prioritas #{marathonGoal.priority || 2}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              Fase 1: Rehab
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)]">Progres Menuju Marathon:</span>
              <span className="font-bold text-[var(--color-text-primary)] font-tabular">
                0.0 km / 42.2 km (0%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] overflow-hidden">
              <div className="h-full bg-[var(--color-running)] w-0" />
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed pt-1">
              Target jarak lari saat ini ditahan pada 0 km sesuai SOP keselamatan sendi. Peningkatan volume lari hanya akan diaktifkan setelah melewati protokol uji toleransi impak (*Step 2 Walk/Jog*).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <span className="text-[9px] text-[var(--color-text-muted)] block">Volume Lari Minggu Ini</span>
              <span className="font-bold text-amber-500 font-tabular text-sm">0.0 km</span>
              <span className="text-[8px] text-[var(--color-text-muted)] block">(Terproteksi)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <span className="text-[9px] text-[var(--color-text-muted)] block">Toleransi Nyeri</span>
              <span className="font-bold text-[var(--color-cycling)] font-tabular text-sm">0/10 Nyeri</span>
              <span className="text-[8px] text-[var(--color-text-muted)] block">(Saat tidak lari)</span>
            </div>
          </div>
        </div>

        {/* Right: 4-Phase Return-to-Run (RTR) Protocol */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[var(--color-running)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Protokol Bertahap Kembali Berlari (RTR)
              </h3>
            </div>
            <span className="text-[9px] font-bold text-amber-500">Zero Pain Rule</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Stage 1: Active Now */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                1
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-amber-500 block">
                  Tahap 1: Mobilitas &amp; Penguatan Beban Nol (AKTIF SEKARANG)
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Latihan pergelangan kaki (*ankle alphabet*, *isometric eversion*) dan peregangan paha tanpa benturan. Pertahankan kardiovaskular dengan bersepeda Zone 2.
                </p>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-start gap-2.5 opacity-80">
              <span className="w-5 h-5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-muted)] font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-[var(--color-border)]">
                2
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-[var(--color-text-primary)] block">
                  Tahap 2: Walk/Jog Interval (15–20 Menit)
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Rasio 1 mnt jog lambat + 2 mnt jalan santai pada permukaan datar halus / treadmill. Dijalankan hanya jika persetujuan klinis telah diterbitkan.
                </p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-start gap-2.5 opacity-70">
              <span className="w-5 h-5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-muted)] font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-[var(--color-border)]">
                3
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-[var(--color-text-primary)] block">
                  Tahap 3: Continuous Easy Jog (<span className="font-tabular">&lt;20 mnt</span>, RPE 3)
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Lari berkelanjutan dengan kecepatan santai dan talk test lancar. Evaluasi respon sendi 24 jam setelah sesi (wajib 0 bengkak &amp; nyeri $\le 2/10$).
                </p>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-start gap-2.5 opacity-60">
              <span className="w-5 h-5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-muted)] font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-[var(--color-border)]">
                4
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-[var(--color-text-primary)] block">
                  Tahap 4: Volume Fondasi Aerobik (Aturan 10%)
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Peningkatan volume maksimal 10% per minggu menuju target lari 5K $\rightarrow$ 10K $\rightarrow$ Half $\rightarrow$ Marathon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RUNNING TELEMETRY ARCHIVE (10 Sesi Strava Tercatat) */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-running)]">
              <ActivityIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Arsip Telemetri Sesi Lari Terverifikasi
              </h3>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {runningActivities.length} Sesi Lari Strava Tersimpan di PostgreSQL 16
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-tabular">
            <span>
              Total Jarak: <strong className="text-[var(--color-text-primary)]">{formatDistance(totalRunningDistanceMeters)}</strong>
            </span>
            <span>•</span>
            <span>
              Laju Rata-rata: <strong className="text-[var(--color-running)]">{formatPaceSeconds(avgRunningPaceSec)}</strong>
            </span>
          </div>
        </div>

        {/* Running Sessions List */}
        {runningActivities.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
            Belum ada aktivitas lari yang tercatat.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {runningActivities.map((act) => (
              <Link
                key={act.id}
                href={`/activities/${act.id}`}
                className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] hover:border-[var(--color-running)] transition-all space-y-2 block group shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-running)] transition-colors truncate">
                    {act.name}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-tabular shrink-0">
                    {formatDate(act.start_date)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-tabular pt-1">
                  <div className="p-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                    <span className="text-[8.5px] text-[var(--color-text-muted)] block">Jarak</span>
                    <span className="font-bold text-[var(--color-text-primary)]">
                      {formatDistance(act.distance_meters)}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                    <span className="text-[8.5px] text-[var(--color-text-muted)] block">Pace</span>
                    <span className="font-bold text-[var(--color-running)]">
                      {act.average_speed_mps > 0
                        ? formatPaceSeconds(1000 / act.average_speed_mps)
                        : "--:-- /km"}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                    <span className="text-[8.5px] text-[var(--color-text-muted)] block">Durasi</span>
                    <span className="font-bold text-[var(--color-text-primary)]">
                      {formatDuration(act.moving_time_seconds)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

