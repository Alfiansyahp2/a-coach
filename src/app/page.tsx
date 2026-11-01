import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  getUser,
  getActivities,
  getScheduledWorkouts,
  getFitnessGoals,
  getDatabaseStatus,
  DEFAULT_USER_ID,
} from "@/lib/db";
import { computeDashboardSummary } from "@/lib/analytics";
import { generateTrainingInsights } from "@/lib/ai-coach";
import {
  formatDistance,
  formatDuration,
  formatPaceSeconds,
  speedMpsToPace,
  formatDate,
} from "@/lib/formatters";
import { StravaConnectCard } from "@/components/StravaConnectCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import {
  Activity as ActivityIcon,
  ChevronRight,
  Calendar,
  Database,
  Gauge,
  Heart,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

async function DashboardTelemetry() {
  await connection();
  const [user, activities, workouts, goals, dbStatus] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getActivities(DEFAULT_USER_ID, { limit: 50 }),
    getScheduledWorkouts(DEFAULT_USER_ID),
    getFitnessGoals(DEFAULT_USER_ID),
    getDatabaseStatus(),
  ]);

  const summary = computeDashboardSummary(activities, workouts);
  const insights = generateTrainingInsights(activities, workouts, goals);

  return (
    <div className="space-y-8">
      {/* Precision Navigation Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1E2330]">
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12151D] border border-[#232838] text-[#9BA3AF]">
            <Database className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Store: {dbStatus.type}</span>
            <span className={`font-semibold ${dbStatus.connected ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
              ({dbStatus.connected ? "Online" : "Offline"})
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12151D] border border-[#232838] text-[#9BA3AF]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Token Security: AES-256-GCM</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            {/* Athlete Biometric Baseline Telemetry Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#12151D] border border-[#232838] text-xs font-mono">
              <span className="flex items-center gap-1 text-[#f43f5e]">
                <Heart className="w-3.5 h-3.5 fill-[#f43f5e]/20" />
                <span className="font-tabular font-bold">{user.resting_heart_rate || 68}</span>
                <span className="text-[10px] text-[#9BA3AF]">bpm rest</span>
              </span>
              <span className="text-[#3A404D]">|</span>
              <span className="text-[#00F0FF] font-tabular">
                {user.height_cm || 170} <span className="text-[10px] text-[#9BA3AF]">cm</span>
              </span>
              <span className="text-[#3A404D]">|</span>
              <span className="text-[#D4FF00] font-tabular">
                {user.weight_kg || 65} <span className="text-[10px] text-[#9BA3AF]">kg</span>
              </span>
              <span className="text-[#3A404D]">|</span>
              <span className="text-[#10b981] font-semibold text-[11px]">
                BMI 22.5
              </span>
            </div>

            <div className="flex items-center gap-2">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-[#232838] object-cover"
                />
              )}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-none">
                  {user.name}
                </div>
                <div className="text-[10px] font-mono text-[#10b981] leading-tight pt-0.5">
                  Calibrated Athlete
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Strava OAuth 2.0 Handshake Hub */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase font-mono tracking-wider text-[#9BA3AF] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FC4C02]" />
            OAuth 2.0 Integration Gateway
          </h2>
          <span className="text-[11px] font-mono text-[#5A6272]">
            Branch: feat/strava-oauth-handshake
          </span>
        </div>

        <StravaConnectCard />
      </section>

      {/* Section 2: Weekly Telemetry At A Glance */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase font-mono tracking-wider text-[#9BA3AF] flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-[#00F0FF]" />
          Current Week Telemetry (Mon – Sun)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Distance */}
          <div className="bg-[#12151D] border border-[#232838] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#9BA3AF] font-medium block mb-1">
              Total Distance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-tabular text-white tracking-tight">
                {(summary.totalDistanceThisWeek / 1000).toFixed(1)}
              </span>
              <span className="text-xs text-[#9BA3AF] font-mono">km</span>
            </div>
            <span className="text-[11px] font-mono text-[#10b981] mt-1 inline-block">
              {summary.weeklyDistanceDeltaPct >= 0 ? `+${summary.weeklyDistanceDeltaPct}%` : `${summary.weeklyDistanceDeltaPct}%`} vs prev week
            </span>
          </div>

          {/* Active Duration */}
          <div className="bg-[#12151D] border border-[#232838] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#9BA3AF] font-medium block mb-1">
              Active Duration
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-tabular text-white tracking-tight">
                {formatDuration(summary.totalDurationThisWeek)}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#9BA3AF] mt-1 inline-block">
              {summary.completedActivitiesCount} sessions completed
            </span>
          </div>

          {/* Running Pace */}
          <div className="bg-[#12151D] border border-[#232838] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#9BA3AF] font-medium block mb-1">
              Avg Running Pace
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-tabular text-[#D4FF00] tracking-tight">
                {summary.averagePaceSecondsPerKm > 0 ? formatPaceSeconds(summary.averagePaceSecondsPerKm) : "--:-- /km"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#9BA3AF] mt-1 inline-block">
              Weighted aerobic pace
            </span>
          </div>

          {/* Plan Adherence */}
          <div className="bg-[#12151D] border border-[#232838] rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#9BA3AF] font-medium block mb-1">
              Plan Adherence
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-tabular text-[#00F0FF] tracking-tight">
                {summary.consistencyScore}%
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#9BA3AF] mt-1 inline-block">
              Prescribed compliance
            </span>
          </div>
        </div>
      </section>

      {/* Section 3: Activities & Workouts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed with Filter & Search */}
        <ActivityFeed activities={activities} />

        {/* Upcoming Scheduled Workouts */}
        <div className="bg-[#12151D] border border-[#232838] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232838]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00F0FF]" />
              Scheduled Training Calendar
            </h3>
            <span className="text-xs font-mono text-[#9BA3AF]">
              {workouts.length} Workouts
            </span>
          </div>

          {workouts.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-[#232838] rounded-lg space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#161922] border border-[#232838] flex items-center justify-center mx-auto text-[#00F0FF]">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-white">
                Tidak Ada Jadwal Latihan Aktif
              </div>
              <p className="text-[11px] text-[#9BA3AF] font-mono max-w-xs mx-auto leading-relaxed">
                Data jadwal dummy telah dihapus. Kalender siap untuk pembuatan sesi atau sinkronisasi rencana latihan baru.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {workouts.slice(0, 4).map((wo) => (
                <div
                  key={wo.id}
                  className="p-3 rounded-lg bg-[#161922] border border-[#232838] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1A1E28] text-[#9BA3AF] border border-[#2B3245]">
                        {wo.workout_category}
                      </span>
                      <span className={`text-[10px] font-mono uppercase font-semibold ${wo.status === 'COMPLETED' ? 'text-[#10b981]' : 'text-[#FF9500]'
                        }`}>
                        {wo.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9BA3AF] font-mono">
                      {formatDate(wo.scheduled_date)} • {wo.target_intensity || 'Standard'}
                    </p>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold font-tabular text-white">
                      {wo.target_distance_meters ? formatDistance(wo.target_distance_meters) : "-- km"}
                    </div>
                    <div className="text-[11px] text-[#9BA3AF] font-tabular">
                      {wo.target_pace_seconds_per_km ? formatPaceSeconds(wo.target_pace_seconds_per_km) : "--:-- /km"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Grounded AI Coach Insight */}
      {insights.length > 0 && (
        <section className="bg-[#12151D] border border-[#232838] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#9BA3AF]">
            <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
            Grounded AI Coach Engine
          </div>

          <div className="p-4 rounded-lg bg-[#161922] border border-[#232838]">
            <h4 className="text-sm font-semibold text-white mb-1">
              {insights[0].title}
            </h4>
            <p className="text-xs text-[#9BA3AF] leading-relaxed">
              {insights[0].description}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function TelemetryLoadingSkeleton() {
  return (
    <div className="py-20 flex flex-col items-center justify-center gap-4 text-[#9BA3AF]">
      <RefreshCw className="w-6 h-6 animate-spin text-[#FC4C02]" />
      <span className="text-xs font-mono uppercase tracking-wider">
        Loading Athletic Telemetry Streams...
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F0F2F5] flex flex-col font-sans selection:bg-[#FC4C02]/30 selection:text-white">
      {/* Precision Navigation Bar */}
      <header className="border-b border-[#1E2330] bg-[#0E1118]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#FC4C02] to-[#FF9500] flex items-center justify-center font-black text-black text-sm tracking-tighter">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">a-coach</span>
                <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#161B26] text-[#9BA3AF] border border-[#232A3B]">
                  PRECISION TELEMETRY
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <Suspense fallback={<TelemetryLoadingSkeleton />}>
          <DashboardTelemetry />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E2330] py-6 text-center text-xs text-[#5A6272] font-mono">
        a-coach • Personal Sports Training & Performance Platform • Next.js 16 + PostgreSQL 16
      </footer>
    </div>
  );
}
