"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ScheduledWorkout,
  TrainingPlan,
  FitnessGoal,
  AuthoritativeAthleteHealthContext,
  PersonalRecord,
} from "@/types";
import {
  Bike,
  CheckCircle2,
  Gauge,
  Zap,
  TrendingUp,
  Activity as ActivityIcon,
  Calendar,
  ShieldCheck,
  Heart,
  ChevronRight,
  ExternalLink,
  Footprints,
} from "lucide-react";
import {
  formatDistance,
  formatDuration,
  formatDate,
} from "@/lib/formatters";

interface CyclingCoachViewProps {
  activities: Activity[];
  workouts: ScheduledWorkout[];
  goals: FitnessGoal[];
  activePlan: TrainingPlan | null;
  healthContext: AuthoritativeAthleteHealthContext | null;
  prs: PersonalRecord[];
  onSwitchToRunning?: () => void;
}

export function CyclingCoachView({
  activities,
  workouts,
  goals,
  activePlan,
  healthContext,
  prs,
  onSwitchToRunning,
}: CyclingCoachViewProps) {
  // Filter cycling activities
  const cyclingActivities = activities.filter((a) => {
    const s = (a.sport_type || "").toLowerCase();
    return s.includes("ride") || s.includes("cycl");
  });

  const totalCyclingDistanceMeters = cyclingActivities.reduce(
    (acc, a) => acc + (a.distance_meters || 0),
    0
  );

  const totalCyclingTimeSeconds = cyclingActivities.reduce(
    (acc, a) => acc + (a.moving_time_seconds || 0),
    0
  );

  const avgCyclingSpeedKmh =
    totalCyclingTimeSeconds > 0
      ? ((totalCyclingDistanceMeters / totalCyclingTimeSeconds) * 3.6).toFixed(1)
      : "0.0";

  // Longest ride
  const maxRideMeters = cyclingActivities.reduce(
    (max, a) => Math.max(max, a.distance_meters || 0),
    0
  );

  // Cycling goal: 100km Century Ride
  const centuryGoal = goals.find(
    (g) =>
      g.is_primary ||
      g.title.toLowerCase().includes("100") ||
      g.title.toLowerCase().includes("century")
  ) || {
    id: "century-default",
    title: "First 100 km Century Ride (MTB)",
    target_value: 100000,
    current_value: maxRideMeters,
    is_primary: true,
    priority: 1,
    sport_type: "Ride",
    target_date: "2027-01-24",
    user_id: "",
    goal_type: "DISTANCE_MONTHLY" as const,
    start_date: "2026-11-01",
  };

  const centuryProgressPct = Math.min(
    100,
    Math.round((maxRideMeters / centuryGoal.target_value) * 100)
  );

  // Cycling PRs
  const cyclingPrs = prs.filter(
    (p) =>
      (p.sport_type || "").toLowerCase().includes("ride") ||
      p.category === "Distance"
  );

  return (
    <div className="space-y-6 font-mono">
      {/* 1. AUTHORIZED ENDURANCE STATUS & EMPIRICAL VALIDATION BANNER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-cycling)]/[0.06] border-2 border-[var(--color-cycling)]/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-cycling)]/20 border border-[var(--color-cycling)]/40 flex items-center justify-center text-[var(--color-cycling)] shrink-0 shadow-xs">
              <Bike className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cycling)]">
                  Cycling Coach Prescription
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40 tracking-wider">
                  STATUS: CONDITIONAL AUTHORIZED (BEBAN AEROBIK AKTIF)
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-[var(--color-text-primary)]">
                Beban Aerobik Putaran Tertutup (Closed-Chain) Aman &amp; Terbukti Bebas Nyeri
              </h2>
            </div>
          </div>

          <Link
            href="/training"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-cycling)]/30 hover:border-[var(--color-cycling)] text-xs font-semibold text-[var(--color-cycling)] transition-all flex items-center gap-1.5 self-start shrink-0 shadow-xs"
          >
            <span>Buka Kalender 12-Minggu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clinical Rationale & Empirical Proof */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--color-text-muted)] uppercase block">
              1. Bukti Empiris Toleransi Sendi
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Telah tuntas menempuh sesi <strong>56.10 km</strong> dengan evaluasi <strong>0 nyeri</strong> selama latihan, sesudah latihan, dan <strong>tanpa pembengkakan</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--color-text-muted)] uppercase block">
              2. Fisiologi Beban Tertutup
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Gerakan kayuhan sepeda adalah *closed-chain* tanpa benturan tanah (*zero impact*), melatih kapasitas mitokondria jantung tanpa membebani ligamen pergelangan kaki.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-1">
            <span className="text-[9.5px] font-bold text-[var(--color-text-muted)] uppercase block">
              3. Aturan Proteksi Tempurung Lutut
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Wajib mempertahankan kadens tinggi <strong>85+ RPM</strong> dengan rasio gigi ringan di jalur datar. Hindari tanjakan bertorsi berat (*out-of-saddle grinding*).
            </p>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY OBJECTIVE: ROAD TO 100 KM CENTURY RIDE & ZONE 2 GUIDELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 100km Century Ride Progress Card */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 flex items-center justify-center text-[var(--color-cycling)]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                  {centuryGoal.title}
                </h3>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  Target Utama Makrosiklus • Prioritas #{centuryGoal.priority || 1}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30">
              {centuryProgressPct}% TERCAPAI
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)]">Sesi Terjauh Saat Ini:</span>
              <span className="font-bold text-[var(--color-text-primary)] font-tabular">
                {(maxRideMeters / 1000).toFixed(1)} km / {(centuryGoal.target_value / 1000).toFixed(0)} km
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-cycling)] transition-all duration-500 rounded-full"
                style={{ width: `${centuryProgressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-1">
              <span>Sisa Gap Jarak: {((centuryGoal.target_value - maxRideMeters) / 1000).toFixed(1)} km</span>
              <span>Target Event: {centuryGoal.target_date}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <span className="text-[9px] text-[var(--color-text-muted)] block">Siklus Program</span>
              <span className="font-bold text-[var(--color-cycling)] font-tabular text-xs">Minggu 1</span>
              <span className="text-[8px] text-[var(--color-text-muted)] block">(Fase Fondasi)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <span className="text-[9px] text-[var(--color-text-muted)] block">Target Minggu 1</span>
              <span className="font-bold text-[var(--color-text-primary)] font-tabular text-xs">18.0 km</span>
              <span className="text-[8px] text-[var(--color-cycling)] block font-semibold">Tuntas (26.9 km)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <span className="text-[9px] text-[var(--color-text-muted)] block">Puasa Proteksi</span>
              <span className="font-bold text-purple-400 font-tabular text-xs">Sen &amp; Kam</span>
              <span className="text-[8px] text-[var(--color-text-muted)] block">Istirahat Penuh</span>
            </div>
          </div>
        </div>

        {/* Right: Zone 2 Pacing & Biomechanics Guideline */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[var(--color-cycling)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Parameter Latihan Zone 2 Tanpa HRM (MTB)
              </h3>
            </div>
            <span className="text-[9px] font-bold text-[var(--color-cycling)]">SOP Resmi Coach</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1">
              <span className="font-bold text-[var(--color-cycling)] flex items-center gap-1.5">
                <span>1. Patokan Intensitas (RPE 3–4 dari 10)</span>
              </span>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Beban kayuhan terasa relatif ringan dan pernapasan stabil terkendali. Jangan mengejar angka kecepatan di speedometer — fokus pada ketenangan napas dan pembakaran lemak efisien.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1">
              <span className="font-bold text-[var(--color-cycling)] flex items-center gap-1.5">
                <span>2. Talk Test Kunci</span>
              </span>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Anda harus dapat mengobrol dalam kalimat lengkap tanpa terputus. Jika napas mulai berat atau terengah-engah, segera pindahkan gigi ke rasio yang lebih ringan.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1">
              <span className="font-bold text-[var(--color-cycling)] flex items-center gap-1.5">
                <span>3. Teknis Sepeda MTB &amp; Kadens 85+ RPM</span>
              </span>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Pilih jalur datar dan pertahankan putaran kaki yang cepat dan ringan (85+ RPM). Hindari tanjakan bertorsi tinggi untuk mencegah kompresi berlebih pada tulang rawan sendi lutut.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CYCLING TELEMETRY ARCHIVE (25 Sesi Strava Tercatat) */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)]">
              <ActivityIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Arsip Telemetri Sesi Sepeda Terverifikasi
              </h3>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {cyclingActivities.length} Sesi Sepeda Strava Tersimpan di PostgreSQL 16
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-tabular">
            <span>
              Total Jarak: <strong className="text-[var(--color-text-primary)]">{formatDistance(totalCyclingDistanceMeters)}</strong>
            </span>
            <span>•</span>
            <span>
              Sesi Terjauh: <strong className="text-[var(--color-cycling)]">{(maxRideMeters / 1000).toFixed(1)} km</strong>
            </span>
            <span>•</span>
            <span>
              Kecepatan Avg: <strong className="text-[var(--color-cycling)]">{avgCyclingSpeedKmh} km/h</strong>
            </span>
          </div>
        </div>

        {/* Cycling Sessions List */}
        {cyclingActivities.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
            Belum ada aktivitas sepeda yang tercatat.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cyclingActivities.slice(0, 10).map((act) => (
              <Link
                key={act.id}
                href={`/activities/${act.id}`}
                className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all space-y-2 block group shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-cycling)] transition-colors truncate">
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
                    <span className="text-[8.5px] text-[var(--color-text-muted)] block">Avg Speed</span>
                    <span className="font-bold text-[var(--color-cycling)]">
                      {act.moving_time_seconds > 0
                        ? ((act.distance_meters / act.moving_time_seconds) * 3.6).toFixed(1)
                        : "0.0"}{" "}
                      km/h
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                    <span className="text-[8.5px] text-[var(--color-text-muted)] block">Waktu</span>
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

