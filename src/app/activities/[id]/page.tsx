import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  getActivityById,
  getUser,
  getAdjacentActivities,
  getWorkoutActivityMatches,
  DEFAULT_USER_ID,
} from "@/lib/db";
import {
  speedMpsToPace,
  speedMpsToKmh,
  estimateHeartRateZones,
} from "@/lib/formatters";
import { ActivityDetailHeader } from "@/components/activity/detail/ActivityDetailHeader";
import { ActivityDetailHero } from "@/components/activity/detail/ActivityDetailHero";
import { ActivityGpsTrackMap } from "@/components/activity/detail/ActivityGpsTrackMap";
import { ActivityKinematicsCards } from "@/components/activity/detail/ActivityKinematicsCards";
import { ActivityBiometricsCards } from "@/components/activity/detail/ActivityBiometricsCards";
import { ActivityHeartRateZones } from "@/components/activity/detail/ActivityHeartRateZones";
import { ActivityPlanMatchCard } from "@/components/activity/detail/ActivityPlanMatchCard";
import { ActivityDetailFooter } from "@/components/activity/detail/ActivityDetailFooter";

interface ActivityDetailPageProps {
  params: Promise<{ id: string }>;
}

function ActivityDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex flex-col font-sans p-6 sm:p-12 animate-pulse space-y-8">
      <div className="h-6 w-32 bg-[var(--color-surface-muted)] rounded-md" />
      <div className="h-10 w-96 bg-[var(--color-surface-muted)] rounded-md" />
      <div className="h-80 w-full bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

async function ActivityDetailContent({ params }: ActivityDetailPageProps) {
  await connection();

  const { id } = await params;
  const [activity, user] = await Promise.all([
    getActivityById(id, DEFAULT_USER_ID),
    getUser(DEFAULT_USER_ID),
  ]);

  if (!activity) {
    notFound();
  }

  // Check if matched with any planned workout and fetch adjacent activities
  const [matches, { prev, next }] = await Promise.all([
    getWorkoutActivityMatches(DEFAULT_USER_ID),
    getAdjacentActivities(activity.id, DEFAULT_USER_ID),
  ]);
  const match = matches.find((m) => m.activity_id === activity.id);

  const isRun = activity.sport_type.toLowerCase().includes("run");
  const paceStr = speedMpsToPace(activity.average_speed_mps);
  const speedKmhStr = speedMpsToKmh(activity.average_speed_mps);
  const maxSpeedStr = isRun
    ? speedMpsToPace(activity.max_speed_mps || activity.average_speed_mps * 1.3)
    : speedMpsToKmh(activity.max_speed_mps || activity.average_speed_mps * 1.3);

  const pauseSeconds = Math.max(
    0,
    activity.elapsed_time_seconds - activity.moving_time_seconds
  );
  const movingRatio =
    activity.elapsed_time_seconds > 0
      ? Math.round(
          (activity.moving_time_seconds / activity.elapsed_time_seconds) * 1000
        ) / 10
      : 100;

  const hrZones = activity.average_heartrate
    ? estimateHeartRateZones(
        activity.average_heartrate,
        activity.max_heartrate,
        user?.resting_heart_rate || 68
      )
    : [];

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex flex-col font-sans transition-colors duration-200 pb-16">
      {/* Top Header Navigation */}
      <ActivityDetailHeader
        activity={activity}
        prev={prev}
        next={next}
        isRun={isRun}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Activity Hero Title Block & Quick KPIs */}
        <ActivityDetailHero
          activity={activity}
          isRun={isRun}
          paceStr={paceStr}
          speedKmhStr={speedKmhStr}
        />

        {/* GPS Track Map Showcase (If track image exists) */}
        <ActivityGpsTrackMap activity={activity} />

        {/* Section 1: Primary Kinematic Telemetry */}
        <ActivityKinematicsCards
          activity={activity}
          isRun={isRun}
          paceStr={paceStr}
          speedKmhStr={speedKmhStr}
          maxSpeedStr={maxSpeedStr}
          pauseSeconds={pauseSeconds}
          movingRatio={movingRatio}
        />

        {/* Section 2: Biometric & Sensor Telemetry */}
        <ActivityBiometricsCards
          activity={activity}
          user={user}
          isRun={isRun}
        />

        {/* Section 3: Heart Rate Zone Breakdown */}
        <ActivityHeartRateZones activity={activity} hrZones={hrZones} />

        {/* Section 4: Training Plan Reconciliation Status */}
        <ActivityPlanMatchCard match={match} />

        {/* Navigation & Sequential Session Switcher Bottom Bar */}
        <ActivityDetailFooter activity={activity} prev={prev} next={next} />
      </main>
    </div>
  );
}

export default function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  return (
    <Suspense fallback={<ActivityDetailSkeleton />}>
      <ActivityDetailContent params={params} />
    </Suspense>
  );
}
