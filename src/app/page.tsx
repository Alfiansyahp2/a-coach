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
import { computeDashboardSummary } from "@/lib/shared/analytics";
import { generateTrainingInsights } from "@/lib/domain/coach/aiCoachEngine";
import { computePersonalRecords } from "@/lib/domain/records/personalRecordsEngine";
import { calculateWeeklyStreak } from "@/lib/domain/streak/streakEngine";
import { formatDuration, formatPaceSeconds } from "@/lib/formatters";
import { AppShell } from "@/components/layout/AppShell";
import { StravaConnectCard } from "@/components/strava/StravaConnectCard";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { MetricCard } from "@/components/ui/MetricCard";
import { VolumeProgressionChart } from "@/components/charts/VolumeProgressionChart";
import { AthleteHealthDeck } from "@/components/health/AthleteHealthDeck";
import { DashboardIntegrityStrip } from "@/components/dashboard/DashboardIntegrityStrip";
import { DashboardTacticalDeck } from "@/components/dashboard/DashboardTacticalDeck";
import { DashboardAiInsightsDeck } from "@/components/dashboard/DashboardAiInsightsDeck";
import { computeWeeklyActivityAndInjuryRecap } from "@/lib/domain/analytics/weeklyRecapEngine";
import { Gauge, RefreshCw, Zap } from "lucide-react";

export const metadata = {
  title: "ENDURANCE PERFORMANCE LAB | Athletic Telemetry Dashboard",
  description:
    "Precision endurance sports science instrument panel & athletic coaching telemetry platform",
};

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
  const displayPrs = (() => {
    if (!prs || prs.length === 0) return computedPrs;
    const dbEnhanced = prs.map((p: any) => {
      const m = computedPrs.find(
        (c) =>
          c.category.toLowerCase().includes(p.category.toLowerCase()) ||
          p.category.toLowerCase().includes(c.category.toLowerCase())
      );
      return {
        ...p,
        subtext: p.subtext || m?.subtext,
        activity_name: p.activity_name || m?.activity_name,
      };
    });
    const newComputed = computedPrs.filter(
      (c) =>
        !dbEnhanced.some(
          (p: any) =>
            c.category.toLowerCase().includes(p.category.toLowerCase()) ||
            p.category.toLowerCase().includes(c.category.toLowerCase())
        )
    );
    return [...dbEnhanced, ...newComputed];
  })();

  const streak = calculateWeeklyStreak(activities, workouts);
  const summary = computeDashboardSummary(activities, workouts);
  const insights = generateTrainingInsights(
    activities,
    workouts,
    goals,
    healthContext
  );

  const currentVolumeKm = summary.totalDistanceThisWeek / 1000;
  const targetWeek1Km = 18.0;

  const weeklyRecap = computeWeeklyActivityAndInjuryRecap({
    activities,
    injuries: healthContext?.injuries || [],
    painLogs: healthContext?.recentPainLogs || [],
    trainingResponses: healthContext?.recentResponses || [],
    scheduledWorkouts: workouts,
  });

  return (
    <AppShell user={user} dbStatus={dbStatus} healthContext={healthContext} streakWeeks={streak.currentStreakWeeks}>
      {/* 1. Precision Navigation & Telemetry Integrity Strip */}
      <DashboardIntegrityStrip
        dbStatus={dbStatus}
        user={user}
        healthContext={healthContext}
        primaryGoal={goals.find((g) => g.is_primary) || goals[0]}
        activePlan={activePlan}
      />

      {/* 2. Athlete Health Profile & Joint Safety Gate */}
      <section id="health-gate">
        <AthleteHealthDeck
          healthContext={healthContext}
          recentActivities={activities}
        />
      </section>

      {/* 3. Hero Telemetry & Volume Progression Deck */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] uppercase font-mono tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5 font-bold">
            <Gauge className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Weekly Workload Telemetry &amp; Progression</span>
          </h2>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
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
              accentColor="endurance"
            />

            <MetricCard
              label="Durasi Gerak Aktif"
              value={formatDuration(summary.totalDurationThisWeek)}
              subtext={
                summary.completedActivitiesCount > 0
                  ? `${summary.completedActivitiesCount} sesi dicatat minggu ini`
                  : "Target: 45–60 mnt / sesi aerobik"
              }
              accentColor="cycling"
            />

            <MetricCard
              label="Laju Lari Rata-Rata"
              value={
                summary.averagePaceSecondsPerKm > 0
                  ? formatPaceSeconds(summary.averagePaceSecondsPerKm)
                  : "--:-- /km"
              }
              subtext="Status lari: Ditunda (On Hold sendi)"
              accentColor="running"
            />

            <MetricCard
              label="Tingkat Kepatuhan Jadwal"
              value={`${summary.consistencyScore}%`}
              subtext="Kepatuhan preskripsi rencana latihan"
              accentColor="endurance"
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
        <div className="lg:col-span-7">
          <ActivityFeed activities={activities} />
        </div>

        <div className="lg:col-span-5">
          <DashboardTacticalDeck
            workouts={workouts}
            activePlan={activePlan}
            goals={goals}
            prs={displayPrs}
            activities={activities}
            initialRecap={weeklyRecap}
          />
        </div>
      </section>

      {/* 5. Strava OAuth Handshake Gateway */}
      <section id="strava-gateway">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] uppercase font-mono tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5 text-[var(--color-strava)]" />
            <span>OAuth 2.0 Integration Gateway</span>
          </h2>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
            Telemetry Bridge • REST API v3
          </span>
        </div>
        <StravaConnectCard />
      </section>

      {/* 6. Grounded Coach Analytical Dossier */}
      <section id="coach-insights">
        <DashboardAiInsightsDeck insights={insights} />
      </section>
    </AppShell>
  );
}

function TelemetryLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-muted)] py-24 flex flex-col items-center justify-center gap-3 font-mono">
      <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-cycling)]" />
      <span className="text-xs uppercase tracking-wider">
        Acquiring Precision Athletic Telemetry Streams...
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<TelemetryLoadingSkeleton />}>
      <DashboardTelemetry />
    </Suspense>
  );
}
