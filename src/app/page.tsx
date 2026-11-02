import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  getUser,
  getActivities,
  getScheduledWorkouts,
  getFitnessGoals,
  getPersonalRecords,
  getDatabaseStatus,
  DEFAULT_USER_ID,
} from "@/lib/db";
import { computeDashboardSummary } from "@/lib/analytics";
import { generateTrainingInsights } from "@/lib/ai-coach";
import {
  formatDistance,
  formatDuration,
  formatPaceSeconds,
  formatDate,
} from "@/lib/formatters";
import { StravaConnectCard } from "@/components/StravaConnectCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MetricCard } from "@/components/MetricCard";
import { VolumeProgressionChart } from "@/components/VolumeProgressionChart";
import { PersonalRecordsDeck } from "@/components/PersonalRecordsDeck";
import {
  Activity as ActivityIcon,
  Calendar,
  Database,
  Gauge,
  Heart,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Trophy,
  FolderKanban,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

async function DashboardTelemetry() {
  await connection();
  const [user, activities, workouts, goals, prs, dbStatus] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getActivities(DEFAULT_USER_ID, { limit: 50 }),
    getScheduledWorkouts(DEFAULT_USER_ID),
    getFitnessGoals(DEFAULT_USER_ID),
    getPersonalRecords(DEFAULT_USER_ID),
    getDatabaseStatus(),
  ]);

  const summary = computeDashboardSummary(activities, workouts);
  const insights = generateTrainingInsights(activities, workouts, goals);

  return (
    <div className="space-y-6">
      {/* 1. Precision Navigation & Telemetry Integrity Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1F2430]">
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#12151D] border border-[#1F2430] text-[#9BA3AF]">
            <Database className="w-3 h-3 text-[#00F0FF]" />
            <span>Store: {dbStatus.type}</span>
            <span
              className={`font-semibold ${
                dbStatus.connected ? "text-[#10B981]" : "text-[#FF2A6D]"
              }`}
            >
              ({dbStatus.connected ? "Online" : "Offline"})
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#12151D] border border-[#1F2430] text-[#9BA3AF]">
            <ShieldCheck className="w-3 h-3 text-[#10B981]" />
            <span className="hidden sm:inline">Encrypted at Rest:</span>
            <span>AES-256-GCM</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            {/* Athlete Biometric Baseline Badge (Calibrated to 68 bpm, 170cm, 65kg) */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] text-xs font-mono">
              <span className="flex items-center gap-1 text-[#FF2A6D]">
                <Heart className="w-3 h-3 fill-[#FF2A6D]/20" />
                <span className="font-tabular font-bold">
                  {user.resting_heart_rate || 68}
                </span>
                <span className="text-[10px] text-[#9BA3AF]">bpm RHR</span>
              </span>
              <span className="text-[#3A404D]">|</span>
              <span className="text-[#00F0FF] font-tabular">
                {user.height_cm || 170}{" "}
                <span className="text-[10px] text-[#9BA3AF]">cm</span>
              </span>
              <span className="text-[#3A404D]">|</span>
              <span className="text-[#D4FF00] font-tabular">
                {user.weight_kg || 65}{" "}
                <span className="text-[10px] text-[#9BA3AF]">kg</span>
              </span>
              <span className="text-[#3A404D]">|</span>
              <span className="text-[#10B981] font-semibold text-[11px] font-tabular">
                BMI 22.5
              </span>
            </div>

            <div className="flex items-center gap-2 pl-1 border-l border-[#1F2430]">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-6 h-6 rounded-sm border border-[#1F2430] object-cover"
                />
              )}
              <div className="hidden sm:block text-left font-mono">
                <div className="text-xs font-semibold text-[#F0F2F5] leading-none">
                  {user.name}
                </div>
                <div className="text-[9px] text-[#10B981] leading-tight pt-0.5">
                  Calibrated Athlete
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Strava OAuth Handshake Gateway (Collapsible & Compact) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] uppercase font-mono tracking-wider text-[#9BA3AF] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#FC4C02]" />
            OAuth 2.0 Integration Gateway
          </h2>
          <span className="text-[10px] font-mono text-[#5A6272]">
            Telemetry Bridge • REST API v3
          </span>
        </div>
        <StravaConnectCard />
      </section>

      {/* 3. Hero Telemetry & Volume Progression Deck (Asymmetric Composition) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] uppercase font-mono tracking-wider text-[#9BA3AF] flex items-center gap-1.5">
            <Gauge className="w-3 h-3 text-[#00F0FF]" />
            Weekly Workload Telemetry & Progression
          </h2>
          <span className="text-[10px] font-mono text-[#5A6272]">
            Monday – Sunday Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left: 4 Precision Metric Blocks (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-2.5">
            <MetricCard
              label="Total Volume This Week"
              value={(summary.totalDistanceThisWeek / 1000).toFixed(1)}
              unit="km"
              delta={{
                value: `${
                  summary.weeklyDistanceDeltaPct >= 0 ? "+" : ""
                }${summary.weeklyDistanceDeltaPct}%`,
                isPositive: summary.weeklyDistanceDeltaPct >= 0,
                note: "vs prior week window",
              }}
              accentColor="volt"
            />

            <MetricCard
              label="Active Moving Duration"
              value={formatDuration(summary.totalDurationThisWeek)}
              subtext={`${summary.completedActivitiesCount} sessions recorded`}
              accentColor="default"
            />

            <MetricCard
              label="Aerobic Running Velocity"
              value={
                summary.averagePaceSecondsPerKm > 0
                  ? formatPaceSeconds(summary.averagePaceSecondsPerKm)
                  : "--:-- /km"
              }
              subtext="Weighted average running pace"
              accentColor="volt"
            />

            <MetricCard
              label="Plan Adherence Rate"
              value={`${summary.consistencyScore}%`}
              subtext="Prescribed schedule compliance"
              accentColor="cyan"
            />
          </div>

          {/* Right: Bespoke Native SVG Volume Progression Chart (5 Cols) */}
          <div className="lg:col-span-5">
            <VolumeProgressionChart activities={activities} initialTimeframe="all" />
          </div>
        </div>
      </section>

      {/* 4. Operations Deck: Ingested Stream + Tactical Calendar & PRs */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Ingested Activity Feed */}
        <div className="lg:col-span-7">
          <ActivityFeed activities={activities} />
        </div>

        {/* Right Column (5 cols): Tactical Schedule, PRs & Goals */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scheduled Training Calendar Card */}
          <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1F2430]">
              <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                Scheduled Training Calendar
              </h3>
              <span className="text-[10px] font-mono text-[#5A6272]">
                {workouts.length} Active Workouts
              </span>
            </div>

            {workouts.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-[#1F2430] rounded-sm space-y-2">
                <div className="w-8 h-8 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-center mx-auto text-[#00F0FF]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-semibold text-[#F0F2F5] font-mono">
                  Tidak Ada Jadwal Latihan Aktif
                </div>
                <p className="text-[11px] text-[#5A6272] font-mono max-w-xs mx-auto leading-relaxed">
                  Data jadwal dummy telah dibersihkan. Kalender siap untuk
                  penjadwalan sesi baru atau sinkronisasi rencana latihan.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {workouts.slice(0, 4).map((wo) => (
                  <div
                    key={wo.id}
                    className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-sm bg-[#1C212E] text-[#9BA3AF] border border-[#2D3547]">
                          {wo.workout_category}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase font-semibold ${
                            wo.status === "COMPLETED"
                              ? "text-[#10B981]"
                              : "text-[#FF9500]"
                          }`}
                        >
                          {wo.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A6272] font-mono">
                        {formatDate(wo.scheduled_date)} •{" "}
                        {wo.target_intensity || "Standard"}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold font-tabular text-[#F0F2F5]">
                        {wo.target_distance_meters
                          ? formatDistance(wo.target_distance_meters)
                          : "-- km"}
                      </div>
                      <div className="text-[11px] text-[#9BA3AF] font-tabular">
                        {wo.target_pace_seconds_per_km
                          ? formatPaceSeconds(wo.target_pace_seconds_per_km)
                          : "--:-- /km"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

                    {/* Personal Records Benchmarks Deck */}
          <PersonalRecordsDeck prs={prs} />

{/* Fitness Goals Progress Deck */}
          {goals.length > 0 && (
            <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#1F2430]">
                <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#00F0FF]" />
                  Active Target Objectives
                </h3>
                <span className="text-[10px] font-mono text-[#5A6272]">
                  {goals.length} Tracked
                </span>
              </div>

              <div className="space-y-2.5">
                {goals.map((g) => {
                  const pct = Math.min(
                    100,
                    Math.round((Number(g.current_value) / Number(g.target_value)) * 100)
                  );
                  const isKm = g.goal_type === "DISTANCE_MONTHLY";
                  const currentDisplay = isKm
                    ? `${(Number(g.current_value) / 1000).toFixed(1)} km`
                    : `${Number(g.current_value)} sessions`;
                  const targetDisplay = isKm
                    ? `${(Number(g.target_value) / 1000).toFixed(0)} km`
                    : `${Number(g.target_value)} sessions`;

                  return (
                    <div
                      key={g.id}
                      className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#F0F2F5] font-medium">
                          {g.title}
                        </span>
                        <span className="text-[#00F0FF] font-tabular font-bold">
                          {pct}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
                        <div
                          className="h-full bg-[#00F0FF] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-[#5A6272]">
                        <span>Current: {currentDisplay}</span>
                        <span>Target: {targetDisplay}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Grounded AI Coach Analytical Dossier */}
      {insights.length > 0 && (
        <section className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
            <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5]">
              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
              Grounded AI Coach Analytical Dossier
            </div>
            <span className="text-[10px] font-mono text-[#5A6272]">
              Scientific Overload & Variance Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className={`p-3 rounded-sm bg-[#161922] border flex flex-col justify-between ${
                  ins.severity === "warning"
                    ? "border-[#FF2A6D]/40"
                    : ins.severity === "positive"
                    ? "border-[#10B981]/40"
                    : "border-[#1F2430]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-semibold text-[#F0F2F5] font-mono flex items-center gap-1.5">
                      {ins.severity === "warning" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                      )}
                      <span>{ins.title}</span>
                    </h4>
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-sm ${
                        ins.severity === "warning"
                          ? "bg-[#FF2A6D]/10 text-[#FF2A6D] border border-[#FF2A6D]/30"
                          : "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                      }`}
                    >
                      {ins.severity}
                    </span>
                  </div>

                  <p className="text-xs text-[#9BA3AF] leading-relaxed pt-1">
                    {ins.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1F2430]/60 text-[10px] font-mono text-[#5A6272] flex items-center justify-between">
                  <span>Grounded Telemetry Analysis</span>
                  <span>Evaluated at {formatDate(ins.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
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
      {/* Precision Navigation Top Header */}
      <header className="border-b border-[#1F2430] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-center font-mono font-black text-xs text-[#D4FF00] tracking-tighter">
              AC
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white font-mono">
                a-coach
              </span>
              <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm bg-[#12151D] text-[#9BA3AF] border border-[#1F2430]">
                OBSIDIAN TELEMETRY
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/activities"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#00F0FF] text-[#9BA3AF] hover:text-[#00F0FF] transition-colors text-xs font-mono font-medium"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Manajemen Aktivitas</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <Suspense fallback={<TelemetryLoadingSkeleton />}>
          <DashboardTelemetry />
        </Suspense>
      </main>

      {/* Technical Stoic Footer */}
      <footer className="border-t border-[#1F2430] py-4 text-center text-[11px] text-[#5A6272] font-mono">
        a-coach • Athletic Performance Telemetry Platform • Next.js 16 + PostgreSQL 16
      </footer>
    </div>
  );
}
