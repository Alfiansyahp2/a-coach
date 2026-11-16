"use client";

import React from "react";
import Link from "next/link";
import { Activity, ScheduledWorkout, FitnessGoal, AuthoritativeAthleteHealthContext, PersonalRecord } from "@/types";
import { Footprints, ShieldAlert, Calendar, Gauge, ChevronRight, Bike } from "lucide-react";
import { formatDistance, formatPaceSeconds } from "@/lib/formatters";
import { CoachClinicalBanner } from "./CoachClinicalBanner";
import { CoachRecentSessionsList } from "./CoachRecentSessionsList";

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

  return (
    <div className="space-y-6 font-mono">
      {/* 1. SAFETY CIRCUIT BREAKER & CLINICAL GATE BANNER */}
      <CoachClinicalBanner
        icon={<ShieldAlert className="w-6 h-6" />}
        badgeLabel="Running Coach Safety Gate"
        badgeStatus="STATUS: ON_HOLD (DITUNDA SEMENTARA)"
        badgeTone="amber"
        headline="Beban Impak Lari Dinonaktifkan Demi Proteksi Struktur Sendi"
        linkHref="/health"
        linkText="Dossier Medis Atlet"
        rationales={[
          {
            title: "1. Pemicu Fisiologis",
            description: (
              <>
                Riwayat keseleo inversi pergelangan kaki kanan (<em>right ankle sprain</em>) dan nyeri tempurung lutut bilateral (<em>anterior knee pain</em>) pasca lari.
              </>
            ),
          },
          {
            title: "2. Biomekanika Impak Lari",
            description: (
              <>
                Lari menghasilkan gaya impak vertikal <strong>2.5–3x bobot tubuh per langkah</strong>, mengompresi sendi talocrural dan patellofemoral secara berulang.
              </>
            ),
          },
          {
            title: "3. Aturan Keamanan Otomatis",
            description: (
              <>
                Sistem secara otomatis mengunci menu lari hingga dokter atau fisioterapis memberikan <em>Medical Clearance</em> resmi.
              </>
            ),
          },
        ]}
      />

      {/* Alternative Cross-Training Callout */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 flex items-center justify-center text-[var(--color-cycling)]">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[var(--color-text-primary)] block">
              Rekomendasi Utama Sport Scientist: Alihkan Beban ke Sepeda Zone 2
            </span>
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              Bersepeda mempertahankan VO2 max dan kapasitas mitokondria tanpa gaya tumbukan ke lutut/engkel.
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

      {/* 2. RUNNING GOAL PROGRESSION & SAFETY CIRCUIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Long-Term Marathon Goal Card */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-4">
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
              Target jarak lari saat ini ditahan pada 0 km sesuai SOP keselamatan sendi. Peningkatan volume lari hanya akan diaktifkan setelah melewati protokol uji toleransi impak (<em>Step 2 Walk/Jog</em>).
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
        <div className="lg:col-span-6 p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-3.5">
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
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                1
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-amber-500 block">
                  Tahap 1: Mobilitas &amp; Penguatan Beban Nol (AKTIF SEKARANG)
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Latihan pergelangan kaki (<em>ankle alphabet</em>, <em>isometric eversion</em>) dan peregangan paha tanpa benturan. Pertahankan kardiovaskular dengan bersepeda Zone 2.
                </p>
              </div>
            </div>

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

            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-start gap-2.5 opacity-70">
              <span className="w-5 h-5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-muted)] font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-[var(--color-border)]">
                3
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-[var(--color-text-primary)] block">
                  Tahap 3: Continuous Easy Jog (&lt;20 mnt, RPE 3)
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Lari berkelanjutan dengan kecepatan santai dan talk test lancar. Evaluasi respon sendi 24 jam setelah sesi (wajib 0 bengkak &amp; nyeri &le; 2/10).
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-start gap-2.5 opacity-60">
              <span className="w-5 h-5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-muted)] font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-[var(--color-border)]">
                4
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-[var(--color-text-primary)] block">
                  Tahap 4: Volume Fondasi Aerobik (Aturan 10%)
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  Peningkatan volume maksimal 10% per minggu menuju target lari 5K &rarr; 10K &rarr; Half &rarr; Marathon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RUNNING TELEMETRY ARCHIVE */}
      <CoachRecentSessionsList
        activities={runningActivities}
        sportTone="running"
        title="Arsip Telemetri Sesi Lari Terverifikasi"
        subtitle={`${runningActivities.length} Sesi Lari Strava Tersimpan di PostgreSQL 16`}
        speedMetricLabel="Pace"
        renderSpeedValue={(act) =>
          act.average_speed_mps > 0
            ? formatPaceSeconds(1000 / act.average_speed_mps)
            : "--:-- /km"
        }
        headerSummaryNodes={
          <>
            <span>
              Total Jarak: <strong className="text-[var(--color-text-primary)]">{formatDistance(totalRunningDistanceMeters)}</strong>
            </span>
            <span>•</span>
            <span>
              Laju Rata-rata: <strong className="text-[var(--color-running)]">{formatPaceSeconds(avgRunningPaceSec)}</strong>
            </span>
          </>
        }
        emptyText="Belum ada aktivitas lari yang tercatat."
      />
    </div>
  );
}
