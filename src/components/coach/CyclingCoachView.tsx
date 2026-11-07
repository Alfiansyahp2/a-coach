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
  Gauge,
  Zap,
} from "lucide-react";
import {
  formatDistance,
} from "@/lib/formatters";
import { CoachClinicalBanner } from "./CoachClinicalBanner";
import { CoachRecentSessionsList } from "./CoachRecentSessionsList";

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
  goals,
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

  return (
    <div className="space-y-6 font-mono">
      {/* 1. AUTHORIZED ENDURANCE STATUS & EMPIRICAL VALIDATION BANNER */}
      <CoachClinicalBanner
        icon={<Bike className="w-6 h-6" />}
        badgeLabel="Cycling Coach Prescription"
        badgeStatus="STATUS: CONDITIONAL AUTHORIZED (BEBAN AEROBIK AKTIF)"
        badgeTone="cycling"
        headline="Beban Aerobik Putaran Tertutup (Closed-Chain) Aman &amp; Terbukti Bebas Nyeri"
        linkHref="/training"
        linkText="Buka Kalender 12-Minggu"
        rationales={[
          {
            title: "1. Bukti Empiris Toleransi Sendi",
            description: (
              <>
                Telah tuntas menempuh sesi <strong>56.10 km</strong> dengan evaluasi <strong>0 nyeri</strong> selama latihan, sesudah latihan, dan <strong>tanpa pembengkakan</strong>.
              </>
            ),
          },
          {
            title: "2. Fisiologi Beban Tertutup",
            description: (
              <>
                Gerakan kayuhan sepeda adalah <em>closed-chain</em> tanpa benturan tanah (<em>zero impact</em>), melatih kapasitas mitokondria jantung tanpa membebani ligamen pergelangan kaki.
              </>
            ),
          },
          {
            title: "3. Aturan Proteksi Tempurung Lutut",
            description: (
              <>
                Wajib mempertahankan kadens tinggi <strong>85+ RPM</strong> dengan rasio gigi ringan di jalur datar. Hindari tanjakan bertorsi berat (<em>out-of-saddle grinding</em>).
              </>
            ),
          },
        ]}
      />

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

      {/* 3. CYCLING TELEMETRY ARCHIVE */}
      <CoachRecentSessionsList
        activities={cyclingActivities}
        sportTone="cycling"
        title="Arsip Telemetri Sesi Sepeda Terverifikasi"
        subtitle={`${cyclingActivities.length} Sesi Sepeda Strava Tersimpan di PostgreSQL 16`}
        speedMetricLabel="Avg Speed"
        renderSpeedValue={(act) =>
          act.moving_time_seconds > 0
            ? `${((act.distance_meters / act.moving_time_seconds) * 3.6).toFixed(1)} km/h`
            : "0.0 km/h"
        }
        headerSummaryNodes={
          <>
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
          </>
        }
        emptyText="Belum ada aktivitas sepeda yang tercatat."
      />
    </div>
  );
}
