import React, { Suspense } from "react";
import { connection } from "next/server";
import {
  getUser,
  getActivities,
  getScheduledWorkouts,
  getActiveTrainingPlan,
  getFitnessGoals,
  getPersonalRecords,
  getDatabaseStatus,
  getAuthoritativeHealthContext,
  DEFAULT_USER_ID,
} from "@/lib/db";
import { computeDashboardSummary } from "@/lib/analytics";
import { generateTrainingInsights } from "@/lib/ai-coach";
import { computePersonalRecords } from "@/lib/personalRecords";
import { formatDuration, formatPaceSeconds } from "@/lib/formatters";
import { StravaConnectCard } from "@/components/StravaConnectCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MetricCard } from "@/components/MetricCard";
import { VolumeProgressionChart } from "@/components/VolumeProgressionChart";
import { AthleteHealthDeck } from "@/components/health/AthleteHealthDeck";
import { DashboardTopNavbar } from "@/components/dashboard/DashboardTopNavbar";
import { DashboardIntegrityStrip } from "@/components/dashboard/DashboardIntegrityStrip";
import { DashboardTacticalDeck } from "@/components/dashboard/DashboardTacticalDeck";
import { DashboardAiInsightsDeck } from "@/components/dashboard/DashboardAiInsightsDeck";
import { Gauge, RefreshCw, Zap } from "lucide-react";

async function DashboardTelemetry() {
  await connection();
  const [
    user,
    activities,
    workouts,
    goals,
    prs,
    dbStatus,
    healthContext,
    activePlan,
  ] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getActivities(DEFAULT_USER_ID),
    getScheduledWorkouts(DEFAULT_USER_ID),
    getFitnessGoals(DEFAULT_USER_ID),
    getPersonalRecords(DEFAULT_USER_ID),
    getDatabaseStatus(),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
    getActiveTrainingPlan(DEFAULT_USER_ID),
  ]);

  const computedPrs = computePersonalRecords(activities, DEFAULT_USER_ID);
  const displayPrs =
    prs.length > 0
      ? prs.map((p) => {
          const m = computedPrs.find((c) => c.category === p.category);
          return {
            ...p,
            subtext: p.subtext || m?.subtext,
            activity_name: p.activity_name || m?.activity_name,
          };
        })
      : computedPrs;

  const summary = computeDashboardSummary(activities, workouts);
  const insights = generateTrainingInsights(
    activities,
    workouts,
    goals,
    healthContext
  );

  const currentVolumeKm = summary.totalDistanceThisWeek / 1000;
  const targetWeek1Km = 18.0;

  return (
    <div className="space-y-6">
      {/* 1. Precision Navigation & Telemetry Integrity Strip */}
      <DashboardIntegrityStrip
        dbStatus={dbStatus}
        user={user}
        healthContext={healthContext}
      />

      {/* 2. Athlete Health Profile & Joint Safety Gate */}
      <section>
        <AthleteHealthDeck
          healthContext={healthContext}
          recentActivities={activities}
        />
      </section>

      {/* 3. Hero Telemetry & Volume Progression Deck */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] uppercase font-mono tracking-wider text-[#9BA3AF] flex items-center gap-1.5 font-bold">
            <Gauge className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Weekly Workload Telemetry &amp; Progression</span>
          </h2>
          <span className="text-[10px] font-mono text-[#5A6272]">
            Siklus Mingguan (Senin – Minggu)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left: 4 Precision Metric Blocks */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3">
            <MetricCard
              label="Total Volume Minggu Ini"
              value={currentVolumeKm.toFixed(1)}
              unit="km"
              delta={{
                value:
                  currentVolumeKm > 0
                    ? `${summary.weeklyDistanceDeltaPct >= 0 ? "+" : ""}${summary.weeklyDistanceDeltaPct}%`
                    : "Minggu 1",
                isPositive: currentVolumeKm > 0 ? summary.weeklyDistanceDeltaPct >= 0 : true,
                note: currentVolumeKm > 0 ? "vs minggu sebelumnya" : "Siklus baru aktif",
              }}
              subtext={
                currentVolumeKm === 0
                  ? "🎯 Target Minggu 1: 18.0 km (MTB Zone 2)"
                  : undefined
              }
              targetProgress={{
                current: currentVolumeKm,
                target: targetWeek1Km,
              }}
              accentColor="volt"
            />

            <MetricCard
              label="Durasi Gerak Aktif"
              value={formatDuration(summary.totalDurationThisWeek)}
              subtext={
                summary.completedActivitiesCount > 0
                  ? `${summary.completedActivitiesCount} sesi dicatat minggu ini`
                  : "Target: 45–60 mnt / sesi aerobik"
              }
              accentColor="default"
            />

            <MetricCard
              label="Laju Lari Rata-Rata"
              value={
                summary.averagePaceSecondsPerKm > 0
                  ? formatPaceSeconds(summary.averagePaceSecondsPerKm)
                  : "--:-- /km"
              }
              subtext="Status lari: Ditunda (On Hold sendi)"
              accentColor="amber"
            />

            <MetricCard
              label="Tingkat Kepatuhan Jadwal"
              value={`${summary.consistencyScore}%`}
              subtext="Kepatuhan preskripsi rencana latihan"
              accentColor="cyan"
            />
          </div>

          {/* Right: Bespoke Native SVG Volume Progression Chart */}
          <div className="lg:col-span-5">
            <VolumeProgressionChart
              activities={activities}
              initialTimeframe="all"
            />
          </div>
        </div>
      </section>

      {/* 4. Operations Deck: Ingested Stream (Left) + Tactical Command Deck (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Ingested Activity Feed */}
        <div className="lg:col-span-7">
          <ActivityFeed activities={activities} />
        </div>

        {/* Right Column (5 cols): Tactical Command Deck (Tabbed: Scheduled Workouts, Macro Goals, PRs) */}
        <div className="lg:col-span-5">
          <DashboardTacticalDeck
            workouts={workouts}
            activePlan={activePlan}
            goals={goals}
            prs={displayPrs}
            activities={activities}
          />
        </div>
      </section>

      {/* 5. Strava OAuth Handshake Gateway (Collapsible & Refined) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] uppercase font-mono tracking-wider text-[#9BA3AF] flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5 text-[#FC4C02]" />
            <span>OAuth 2.0 Integration Gateway</span>
          </h2>
          <span className="text-[10px] font-mono text-[#5A6272]">
            Telemetry Bridge • REST API v3
          </span>
        </div>
        <StravaConnectCard />
      </section>

      {/* 6. Grounded AI Coach Analytical Dossier (3-Column Filterable Grid) */}
      <DashboardAiInsightsDeck insights={insights} />
    </div>
  );
}

function TelemetryLoadingSkeleton() {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#9BA3AF]">
      <RefreshCw className="w-5 h-5 animate-spin text-[#00F0FF]" />
      <span className="text-xs font-mono uppercase tracking-wider text-[#5A6272]">
        Acquiring Precision Athletic Telemetry Streams...
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F0F2F5] flex flex-col font-sans selection:bg-[#D4FF00]/30 selection:text-white">
      <DashboardTopNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <Suspense fallback={<TelemetryLoadingSkeleton />}>
          <DashboardTelemetry />
        </Suspense>
      </main>

      <footer className="border-t border-[#1F2430] py-4 text-center text-[11px] text-[#5A6272] font-mono">
        a-coach • Athletic Performance Telemetry Platform • Next.js 16 + PostgreSQL 16
      </footer>
    </div>
  );
}
