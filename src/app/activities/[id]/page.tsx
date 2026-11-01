import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import {
  getActivityById,
  getAdjacentActivities,
  getWorkoutActivityMatches,
  DEFAULT_USER_ID,
} from '@/lib/db';
import {
  formatDistance,
  formatDuration,
  formatDurationHuman,
  formatElevation,
  formatDate,
  speedMpsToPace,
  speedMpsToKmh,
  formatHeartRate,
  formatCadence,
  formatPower,
  formatCalories,
  estimateHeartRateZones,
} from '@/lib/formatters';
import {
  Activity as ActivityIcon,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Gauge,
  Heart,
  Layers,
  MapPin,
  Mountain,
  Navigation,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ActivityDetailPageProps {
  params: Promise<{ id: string }>;
}

function ActivityDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F0F2F5] flex flex-col font-sans p-6 sm:p-12 animate-pulse space-y-8">
      <div className="h-6 w-32 bg-[#1A1E28] rounded-lg" />
      <div className="h-10 w-96 bg-[#1A1E28] rounded-lg" />
      <div className="h-80 w-full bg-[#12151D] border border-[#232838] rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-[#12151D] border border-[#232838] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function ActivityDetailContent({ params }: ActivityDetailPageProps) {
  await connection();

  const { id } = await params;
  const activity = await getActivityById(id, DEFAULT_USER_ID);

  if (!activity) {
    notFound();
  }

  // Check if matched with any planned workout and fetch adjacent activities
  const [matches, { prev, next }] = await Promise.all([
    getWorkoutActivityMatches(DEFAULT_USER_ID),
    getAdjacentActivities(activity.id, DEFAULT_USER_ID),
  ]);
  const match = matches.find((m) => m.activity_id === activity.id);

  const isRun = activity.sport_type.toLowerCase().includes('run');
  const paceStr = speedMpsToPace(activity.average_speed_mps);
  const speedKmhStr = speedMpsToKmh(activity.average_speed_mps);
  const maxSpeedStr = isRun
    ? speedMpsToPace(activity.max_speed_mps || activity.average_speed_mps * 1.3)
    : speedMpsToKmh(activity.max_speed_mps || activity.average_speed_mps * 1.3);

  const pauseSeconds = Math.max(0, activity.elapsed_time_seconds - activity.moving_time_seconds);
  const movingRatio = activity.elapsed_time_seconds > 0
    ? Math.round((activity.moving_time_seconds / activity.elapsed_time_seconds) * 1000) / 10
    : 100;

  const hrZones = activity.average_heartrate
    ? estimateHeartRateZones(activity.average_heartrate, activity.max_heartrate)
    : [];

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F0F2F5] flex flex-col font-sans selection:bg-[#FC4C02]/30 selection:text-white pb-16">
      {/* Top Header Navigation */}
      <header className="border-b border-[#1E2330] bg-[#0E1118]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#9BA3AF] hover:text-white px-3 py-1.5 rounded-lg bg-[#161922] border border-[#232838] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-[#232838]" />

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                  isRun
                    ? 'bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30'
                    : 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                }`}
              >
                {activity.sport_type}
              </span>
              <span className="text-xs font-mono text-[#9BA3AF]">
                #{activity.strava_activity_id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Session Switcher Controls */}
            <div className="flex items-center gap-1 font-mono text-xs">
              {prev ? (
                <Link
                  href={`/activities/${prev.id}`}
                  title={`Newer Session: ${prev.name}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161922] border border-[#232838] text-[#9BA3AF] hover:text-white hover:border-[#FC4C02] transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#12151D] border border-[#1E2330] text-[#3A404D] cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </span>
              )}

              {next ? (
                <Link
                  href={`/activities/${next.id}`}
                  title={`Older Session: ${next.name}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161922] border border-[#232838] text-[#9BA3AF] hover:text-white hover:border-[#FC4C02] transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#12151D] border border-[#1E2330] text-[#3A404D] cursor-not-allowed">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="h-4 w-px bg-[#232838] hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#5A6272]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Telemetry Validated</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Activity Hero Title Block */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {activity.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#9BA3AF] font-mono">
                <span className="flex items-center gap-1.5 text-[#F0F2F5]">
                  <Calendar className="w-3.5 h-3.5 text-[#FC4C02]" />
                  {formatDate(activity.start_date)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5A6272]" />
                  {new Date(activity.start_date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {activity.description && (
                  <>
                    <span>•</span>
                    <span className="text-[#9BA3AF] italic">
                      {activity.description}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick KPI Pill Group */}
            <div className="flex items-center gap-3 bg-[#12151D] border border-[#232838] px-4 py-2.5 rounded-xl">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-[#9BA3AF]">
                  Distance
                </div>
                <div className="text-lg font-black font-mono font-tabular text-white">
                  {formatDistance(activity.distance_meters)}
                </div>
              </div>
              <div className="h-8 w-px bg-[#232838]" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-[#9BA3AF]">
                  {isRun ? 'Avg Pace' : 'Avg Speed'}
                </div>
                <div className="text-lg font-black font-mono font-tabular text-[#FC4C02]">
                  {isRun ? paceStr : speedKmhStr}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Track Map Showcase (If track image exists) */}
        {activity.raw_summary_polyline && (
          <section className="bg-[#12151D] border border-[#232838] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#232838] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                <Navigation className="w-4 h-4 text-[#FC4C02]" />
                <span>GPS Telemetry Route Track</span>
              </div>
              <span className="text-[11px] font-mono text-[#9BA3AF] px-2.5 py-0.5 rounded bg-[#161922] border border-[#232838]">
                Real Strava Track Visual
              </span>
            </div>

            <div className="relative bg-[#090A0F] h-80 sm:h-96 w-full flex items-center justify-center overflow-hidden p-6">
              {/* Subtle grid pattern background */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, #2B3245 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Glowing Route Visual */}
              <img
                src={activity.raw_summary_polyline}
                alt="GPS Route Track"
                className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_0_16px_rgba(252,76,2,0.65)] hover:scale-105 transition-transform duration-300"
              />

              {/* Bottom Telemetry Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#12151D]/90 backdrop-blur-md border border-[#232838] text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-white">
                    <MapPin className="w-3.5 h-3.5 text-[#FC4C02]" />
                    <span>Polyline Path Vector</span>
                  </div>
                  <span className="text-[#5A6272]">•</span>
                  <span className="text-[#9BA3AF]">
                    Sensor Track: <strong className="text-white">{activity.sport_type}</strong>
                  </span>
                </div>

                <div className="text-[11px] text-[#9BA3AF]">
                  Source: <code className="text-[#00F0FF]">{activity.raw_summary_polyline}</code>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 1: Primary Kinematic Telemetry */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9BA3AF]">
            <Gauge className="w-4 h-4 text-[#00F0FF]" />
            <span>Kinematic Performance & Velocity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Pace & Velocity */}
            <div className="p-5 rounded-xl bg-[#12151D] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
                <span className="font-mono uppercase">{isRun ? 'Average Pace' : 'Average Velocity'}</span>
                <Gauge className="w-4 h-4 text-[#D4FF00]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
                  {isRun ? paceStr : speedKmhStr}
                </div>
                <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#232838]/80">
                  <span>Max Speed:</span>
                  <span className="text-white font-tabular">{maxSpeedStr}</span>
                </div>
                <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
                  <span>Speed in m/s:</span>
                  <span className="font-tabular">{activity.average_speed_mps.toFixed(2)} m/s</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Distance */}
            <div className="p-5 rounded-xl bg-[#12151D] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
                <span className="font-mono uppercase">Total Distance</span>
                <Compass className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
                  {formatDistance(activity.distance_meters)}
                </div>
                <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#232838]/80">
                  <span>Exact Meters:</span>
                  <span className="text-white font-tabular">
                    {Math.round(activity.distance_meters).toLocaleString()} m
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
                  <span>Miles:</span>
                  <span className="font-tabular">
                    {(activity.distance_meters * 0.000621371).toFixed(2)} mi
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Duration & Time Efficiency */}
            <div className="p-5 rounded-xl bg-[#12151D] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
                <span className="font-mono uppercase">Moving Time</span>
                <Clock className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
                  {formatDuration(activity.moving_time_seconds)}
                </div>
                <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#232838]/80">
                  <span>Elapsed Time:</span>
                  <span className="text-white font-tabular">
                    {formatDuration(activity.elapsed_time_seconds)}
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
                  <span>Pause / Rest:</span>
                  <span className="font-tabular">{formatDuration(pauseSeconds)} ({movingRatio}%)</span>
                </div>
              </div>
            </div>

            {/* Card 4: Elevation & Ascent */}
            <div className="p-5 rounded-xl bg-[#12151D] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
                <span className="font-mono uppercase">Elevation Gain</span>
                <Mountain className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
                  {formatElevation(activity.elevation_gain_meters)}
                </div>
                <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#232838]/80">
                  <span>Climb Grade:</span>
                  <span className="text-white font-tabular">
                    {activity.distance_meters > 0
                      ? ((activity.elevation_gain_meters / activity.distance_meters) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
                  <span>Feet Gained:</span>
                  <span className="font-tabular">
                    {Math.round(activity.elevation_gain_meters * 3.28084)} ft
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Biometric & Sensor Telemetry */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9BA3AF]">
            <Heart className="w-4 h-4 text-[#f43f5e]" />
            <span>Biometrics, Cadence & Energy Expenditure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 5: Heart Rate */}
            <div className="p-5 rounded-xl bg-[#12151D] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
                <span className="font-mono uppercase">Average Heart Rate</span>
                <Heart className="w-4 h-4 text-[#f43f5e]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
                  {formatHeartRate(activity.average_heartrate)}
                </div>
                <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#232838]/80">
                  <span>Max Heart Rate:</span>
                  <span className="text-[#f43f5e] font-tabular">
                    {formatHeartRate(activity.max_heartrate)}
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
                  <span>Intensity Zone:</span>
                  <span className="text-white font-semibold">
                    {activity.average_heartrate && activity.average_heartrate > 165
                      ? 'Zone 4 (Threshold)'
                      : activity.average_heartrate && activity.average_heartrate > 145
                      ? 'Zone 3 (Aerobic Tempo)'
                      : 'Zone 2 (Aerobic Base)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 6: Cadence */}
            <div className="p-5 rounded-xl bg-[#12151D] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
                <span className="font-mono uppercase">Cadence</span>
                <RotateCcw className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
                  {formatCadence(activity.average_cadence, activity.sport_type)}
                </div>
                <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#232838]/80">
                  <span>Metric Type:</span>
                  <span className="text-white">
                    {isRun ? 'Strides Per Min (spm)' : 'Pedal Revs / Min (rpm)'}
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
                  <span>Rhythm Quality:</span>
                  <span className="text-[#10b981]">Optimal Cadence</span>
                </div>
              </div>
            </div>

            {/* Card 7: Power / Watts */}
            <div className="p-5 rounded-xl bg-[#12151D] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
                <span className="font-mono uppercase">Mechanical Power</span>
                <Zap className="w-4 h-4 text-[#D4FF00]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
                  {formatPower(activity.average_watts)}
                </div>
                <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#232838]/80">
                  <span>Energy Workload:</span>
                  <span className="text-white font-tabular">
                    {activity.average_watts
                      ? `${Math.round((activity.average_watts * activity.moving_time_seconds) / 1000)} kJ`
                      : 'Estimated'}
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
                  <span>Power Metric:</span>
                  <span className="text-white">
                    {activity.average_watts ? 'Direct Sensor Output' : 'Aerobic Estimation'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 8: Calories */}
            <div className="p-5 rounded-xl bg-[#12151D] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
                <span className="font-mono uppercase">Energy Burned</span>
                <Flame className="w-4 h-4 text-[#FC4C02]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
                  {formatCalories(activity.calories)}
                </div>
                <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#232838]/80">
                  <span>Hourly Burn Rate:</span>
                  <span className="text-white font-tabular">
                    {activity.moving_time_seconds > 0 && activity.calories
                      ? `${Math.round((activity.calories / activity.moving_time_seconds) * 3600)} kcal/h`
                      : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
                  <span>Metabolic Fuel:</span>
                  <span className="text-white">Carbohydrate / Fat Glycogen</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Heart Rate Zone Breakdown */}
        {hrZones.length > 0 && (
          <section className="bg-[#12151D] border border-[#232838] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232838]">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#f43f5e]" />
                <h3 className="text-sm font-semibold text-white">
                  5-Zone Heart Rate Distribution & Aerobic Impact
                </h3>
              </div>
              <span className="text-xs font-mono text-[#9BA3AF]">
                Avg: <strong className="text-white">{activity.average_heartrate} bpm</strong> • Peak:{' '}
                <strong className="text-[#f43f5e]">{activity.max_heartrate} bpm</strong>
              </span>
            </div>

            {/* Visual Zone Bar */}
            <div className="h-3 w-full rounded-full bg-[#1A1E28] overflow-hidden flex">
              {hrZones.map((z) => (
                <div
                  key={z.zone}
                  style={{ width: `${z.pct}%`, backgroundColor: z.color }}
                  className="h-full transition-all"
                  title={`${z.zone}: ${z.pct}%`}
                />
              ))}
            </div>

            {/* Detailed Zone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              {hrZones.map((z) => (
                <div key={z.zone} className="p-3 rounded-lg bg-[#161922] border border-[#232838] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: z.color }}>
                      {z.zone.split(' ')[0]}
                    </span>
                    <span className="text-xs font-bold font-mono font-tabular text-white">
                      {z.pct}%
                    </span>
                  </div>
                  <div className="text-[10px] text-white font-medium truncate">
                    {z.zone.substring(z.zone.indexOf(' ') + 1)}
                  </div>
                  <div className="text-[10px] text-[#5A6272] font-mono">
                    {z.range}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Training Plan Reconciliation Status */}
        <section className="bg-[#12151D] border border-[#232838] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232838]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00F0FF]" />
              <h3 className="text-sm font-semibold text-white">
                Calendar Training Reconciliation (Planned vs Actual)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#9BA3AF]">
              Status: {match ? (
                <span className="text-[#10b981] font-semibold">Matched with Workout</span>
              ) : (
                <span className="text-[#9BA3AF]">Unscheduled / Free Training</span>
              )}
            </span>
          </div>

          {match ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-lg bg-[#161922] border border-[#232838] space-y-1.5">
                <div className="text-[#9BA3AF]">Completion Adherence</div>
                <div className="text-xl font-bold font-tabular text-[#10b981]">
                  {match.completion_percentage}%
                </div>
                <div className="text-[11px] text-[#5A6272]">
                  Target planned vs actual distance executed
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#161922] border border-[#232838] space-y-1.5">
                <div className="text-[#9BA3AF]">Distance Delta</div>
                <div className={`text-xl font-bold font-tabular ${
                  match.distance_delta_meters >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                }`}>
                  {match.distance_delta_meters >= 0 ? '+' : ''}
                  {(match.distance_delta_meters / 1000).toFixed(2)} km
                </div>
                <div className="text-[11px] text-[#5A6272]">
                  Variance against target workout mileage
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#161922] border border-[#232838] space-y-1.5">
                <div className="text-[#9BA3AF]">Pace Delta</div>
                <div className={`text-xl font-bold font-tabular ${
                  match.pace_delta_seconds_per_km <= 0 ? 'text-[#10b981]' : 'text-[#f59e0b]'
                }`}>
                  {match.pace_delta_seconds_per_km > 0 ? '+' : ''}
                  {match.pace_delta_seconds_per_km}s /km
                </div>
                <div className="text-[11px] text-[#5A6272]">
                  {match.pace_delta_seconds_per_km <= 0
                    ? 'Ahead of planned threshold pace'
                    : 'Slightly conservative vs planned pace'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#161922] border border-[#232838] text-xs text-[#9BA3AF] flex items-center justify-between">
              <span>
                This endurance session was recorded as an independent workout. It contributes fully to weekly volume and ACWR workload metrics.
              </span>
              <span className="px-2 py-1 rounded bg-[#1A1E28] text-white font-mono text-[10px]">
                Valid Workout
              </span>
            </div>
          )}
        </section>

        {/* Navigation & Sequential Session Switcher Bottom Bar */}
        <div className="pt-6 border-t border-[#1E2330] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#FC4C02] hover:text-[#ff6b2b] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Athletic Telemetry Dashboard</span>
            </Link>

            <span className="text-[11px] font-mono text-[#5A6272]">
              Activity UUID: {activity.id}
            </span>
          </div>

          {(prev || next) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {prev ? (
                <Link
                  href={`/activities/${prev.id}`}
                  className="p-3.5 rounded-xl bg-[#12151D] border border-[#232838] hover:border-[#FC4C02] transition-all flex items-center gap-3 group"
                >
                  <ChevronLeft className="w-5 h-5 text-[#5A6272] group-hover:text-white group-hover:-translate-x-0.5 transition-all shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-mono text-[#9BA3AF] block">
                      ← Newer Activity
                    </span>
                    <span className="text-xs font-semibold text-white truncate block group-hover:text-[#FC4C02] transition-colors">
                      {prev.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#5A6272]">
                      {formatDate(prev.start_date)} • {formatDistance(prev.distance_meters)}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  href={`/activities/${next.id}`}
                  className="p-3.5 rounded-xl bg-[#12151D] border border-[#232838] hover:border-[#FC4C02] transition-all flex items-center justify-between gap-3 group text-right"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-mono text-[#9BA3AF] block">
                      Older Activity →
                    </span>
                    <span className="text-xs font-semibold text-white truncate block group-hover:text-[#FC4C02] transition-colors">
                      {next.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#5A6272]">
                      {formatDate(next.start_date)} • {formatDistance(next.distance_meters)}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#5A6272] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  return (
    <Suspense fallback={<ActivityDetailSkeleton />}>
      <ActivityDetailContent params={params} />
    </Suspense>
  );
}
