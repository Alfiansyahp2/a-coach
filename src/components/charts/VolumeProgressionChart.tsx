"use client";

import React, { useState, useMemo } from "react";
import { Activity } from "@/types";

export type VolumeTimeframe = "7d" | "14d" | "30d" | "all";

interface VolumeProgressionChartProps {
  activities: Activity[];
  days?: number;
  initialTimeframe?: VolumeTimeframe;
}

interface VolumeBucket {
  id: string;
  label: string;
  subLabel: string;
  fullDateStr: string;
  runKm: number;
  rideKm: number;
  totalKm: number;
  elevation: number;
  sessionCount: number;
}

export function VolumeProgressionChart({
  activities,
  days,
  initialTimeframe = "7d",
}: VolumeProgressionChartProps) {
  const [timeframe, setTimeframe] = useState<VolumeTimeframe>(
    days === 7 ? "7d" : days === 14 ? "14d" : days === 30 ? "30d" : initialTimeframe
  );
  const [hoveredBucket, setHoveredBucket] = useState<VolumeBucket | null>(null);

  // Generate volume buckets based on timeframe
  const buckets = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    const now = new Date();
    const dates = activities.map((a) => new Date(a.start_date).getTime());
    const minTime = Math.min(...dates);
    const latestActivityTime = Math.max(...dates);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // MODE 1: ALL-TIME (Weekly Aggregated Progression across entire dataset)
    if (timeframe === "all") {
      const startD = new Date(minTime);
      const startDay = startD.getUTCDay();
      const startDiff = startD.getUTCDate() - startDay + (startDay === 0 ? -6 : 1);
      const currentMonday = new Date(
        Date.UTC(startD.getUTCFullYear(), startD.getUTCMonth(), startDiff)
      );

      const weeklyBuckets: VolumeBucket[] = [];
      let weekIndex = 1;

      while (currentMonday.getTime() <= latestActivityTime + 86400000) {
        const sunday = new Date(currentMonday.getTime() + 6 * 86400000);
        const startIso = currentMonday.toISOString().split("T")[0];
        const endIso = sunday.toISOString().split("T")[0];

        let runKm = 0;
        let rideKm = 0;
        let elevation = 0;
        let count = 0;

        for (const act of activities) {
          const actDate = act.start_date.split("T")[0];
          if (actDate >= startIso && actDate <= endIso) {
            const distKm = Number(act.distance_meters || 0) / 1000;
            const elev = Number(act.elevation_gain_meters || 0);
            const sport = (act.sport_type || "").toLowerCase();

            if (sport.includes("run")) {
              runKm += distKm;
            } else if (sport.includes("ride") || sport.includes("cycl")) {
              rideKm += distKm;
            } else {
              runKm += distKm;
            }
            elevation += elev;
            count++;
          }
        }

        const monNum = String(currentMonday.getUTCDate()).padStart(2, "0");
        const monMonth = monthNames[currentMonday.getUTCMonth()];
        const sunNum = String(sunday.getUTCDate()).padStart(2, "0");
        const sunMonth = monthNames[sunday.getUTCMonth()];

        weeklyBuckets.push({
          id: startIso,
          label: `W${weekIndex}`,
          subLabel: `${monNum} ${monMonth}`,
          fullDateStr: `Week ${weekIndex} (${monNum} ${monMonth} - ${sunNum} ${sunMonth})`,
          runKm: Math.round(runKm * 10) / 10,
          rideKm: Math.round(rideKm * 10) / 10,
          totalKm: Math.round((runKm + rideKm) * 10) / 10,
          elevation: Math.round(elevation),
          sessionCount: count,
        });

        weekIndex++;
        currentMonday.setTime(currentMonday.getTime() + 7 * 86400000);
      }
      return weeklyBuckets;
    }

    // MODE 2: DAILY PROGRESSION (7D, 14D, 30D)
    const numDays = timeframe === "14d" ? 14 : timeframe === "30d" ? 30 : 7;
    const dailyBuckets: VolumeBucket[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const iso = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getUTCDay()];
      const dayNum = String(d.getUTCDate()).padStart(2, "0");
      const monthStr = monthNames[d.getUTCMonth()];

      let runKm = 0;
      let rideKm = 0;
      let elevation = 0;
      let count = 0;

      for (const act of activities) {
        if (act.start_date.split("T")[0] === iso) {
          const distKm = Number(act.distance_meters || 0) / 1000;
          const elev = Number(act.elevation_gain_meters || 0);
          const sport = (act.sport_type || "").toLowerCase();

          if (sport.includes("run")) {
            runKm += distKm;
          } else if (sport.includes("ride") || sport.includes("cycl")) {
            rideKm += distKm;
          } else {
            runKm += distKm;
          }
          elevation += elev;
          count++;
        }
      }

      dailyBuckets.push({
        id: iso,
        label: dayName,
        subLabel: `${dayNum} ${monthStr}`,
        fullDateStr: `${dayName}, ${dayNum} ${monthStr}`,
        runKm: Math.round(runKm * 10) / 10,
        rideKm: Math.round(rideKm * 10) / 10,
        totalKm: Math.round((runKm + rideKm) * 10) / 10,
        elevation: Math.round(elevation),
        sessionCount: count,
      });
    }

    return dailyBuckets;
  }, [activities, timeframe]);

  // Aggregate Period Metrics
  const totalPeriodKm = useMemo(
    () => buckets.reduce((acc, b) => acc + b.totalKm, 0),
    [buckets]
  );
  const totalPeriodRunKm = useMemo(
    () => buckets.reduce((acc, b) => acc + b.runKm, 0),
    [buckets]
  );
  const totalPeriodRideKm = useMemo(
    () => buckets.reduce((acc, b) => acc + b.rideKm, 0),
    [buckets]
  );

  const maxTotal = useMemo(() => {
    const rawMax = Math.max(...buckets.map((b) => b.totalKm), 5);
    return Math.ceil(rawMax / 5) * 5;
  }, [buckets]);

  const count = buckets.length;

  const barWidth = useMemo(() => {
    if (count <= 7) return 9.5;
    if (count <= 14) return 5.0;
    if (count <= 30) return 2.2;
    return Math.max(1.5, 80 / count);
  }, [count]);

  const gap = useMemo(() => {
    const remaining = 100 - barWidth * count;
    return Math.max(0.8, remaining / (count + 1));
  }, [count, barWidth]);

  return (
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
      {/* Chart Header with Timeframe Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-mono text-[var(--color-text-secondary)] block">
              {timeframe === "all"
                ? "Volume Progression (All History)"
                : `Volume Progression (${timeframe.toUpperCase()})`}
            </span>
            <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold">
              {timeframe === "all" ? "Weekly Aggregation" : "Daily Telemetry"}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold font-mono font-tabular text-[var(--color-text-primary)]">
              {totalPeriodKm.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">km combined</span>
          </div>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] self-start sm:self-auto text-[10px] font-mono">
          <button
            onClick={() => setTimeframe("7d")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              timeframe === "7d"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeframe("14d")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              timeframe === "14d"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            14D
          </button>
          <button
            onClick={() => setTimeframe("30d")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              timeframe === "30d"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeframe("all")}
            className={`px-3 py-1 rounded-md transition-all font-bold ${
              timeframe === "all"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            ALL / SEMUA
          </button>
        </div>
      </div>

      {/* Subheader Legend */}
      <div className="flex items-center justify-between text-[10px] font-mono mb-2 pb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-running)]" />
            <span className="text-[var(--color-text-secondary)]">Run ({totalPeriodRunKm.toFixed(1)}k)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-cycling)]" />
            <span className="text-[var(--color-text-secondary)]">Ride ({totalPeriodRideKm.toFixed(1)}k)</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
          {timeframe === "all"
            ? `${buckets.length} Weeks • ${activities.length} Recorded Sessions`
            : `${buckets.length} Days Window`}
        </span>
      </div>

      {/* SVG Stacked Bar Chart */}
      <div className="relative pt-1">
        <svg
          viewBox="0 0 100 70"
          className="w-full h-24 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Hairline Baseline & Midlines */}
          <line
            x1="0"
            y1="55"
            x2="100"
            y2="55"
            stroke="var(--color-border)"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1="28"
            x2="100"
            y2="28"
            stroke="var(--color-border)"
            strokeWidth="0.5"
            strokeDasharray="1 2"
          />

          {/* Bars */}
          {buckets.map((b, idx) => {
            const x = gap + idx * (barWidth + gap);

            const totalH = (b.totalKm / maxTotal) * 50;
            const rideH = (b.rideKm / maxTotal) * 50;
            const runH = (b.runKm / maxTotal) * 50;

            const rideY = 55 - rideH;
            const runY = rideY - runH;

            const isHovered = hoveredBucket?.id === b.id;

            return (
              <g
                key={b.id}
                className="cursor-pointer transition-opacity duration-150"
                onMouseEnter={() => setHoveredBucket(b)}
                onMouseLeave={() => setHoveredBucket(null)}
              >
                {/* Background column highlight on hover */}
                {isHovered && (
                  <rect
                    x={x - 1.2}
                    y={2}
                    width={barWidth + 2.4}
                    height={53}
                    fill="var(--color-surface-muted)"
                    opacity={0.8}
                    rx={1}
                  />
                )}

                {/* Ride Segment (Bottom) - Cycling Green */}
                {b.rideKm > 0 && (
                  <rect
                    x={x}
                    y={rideY}
                    width={barWidth}
                    height={rideH}
                    fill="var(--color-cycling)"
                    opacity={isHovered ? 1 : 0.85}
                    rx={0.5}
                  />
                )}

                {/* Run Segment (Top) - Running Orange */}
                {b.runKm > 0 && (
                  <rect
                    x={x}
                    y={runY}
                    width={barWidth}
                    height={runH}
                    fill="var(--color-running)"
                    opacity={isHovered ? 1 : 0.9}
                    rx={0.5}
                  />
                )}

                {/* Empty marker if zero */}
                {b.totalKm === 0 && (
                  <circle
                    cx={x + barWidth / 2}
                    cy={53}
                    r={0.8}
                    fill="var(--color-text-muted)"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between items-center px-1 pt-1 border-t border-[var(--color-border)]">
          {buckets.map((b, idx) => {
            const isHovered = hoveredBucket?.id === b.id;
            const showLabel =
              count <= 14 || idx === 0 || idx === count - 1 || idx % 5 === 0;

            return (
              <div
                key={b.id}
                className={`text-center font-mono text-[10px] transition-colors ${
                  isHovered
                    ? "text-[var(--color-text-primary)] font-bold"
                    : b.totalKm > 0
                    ? "text-[var(--color-text-secondary)]"
                    : "text-[var(--color-text-muted)]"
                }`}
                style={{ width: `${100 / count}%` }}
              >
                {showLabel ? (
                  <>
                    <span className="block truncate">{b.label}</span>
                    <span className="block text-[8px] text-[var(--color-text-muted)] truncate">
                      {b.subLabel}
                    </span>
                  </>
                ) : (
                  <span className="block w-1 h-1 mx-auto rounded-full bg-[var(--color-border)] my-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Hover Telemetry Readout */}
      <div className="mt-3 min-h-7 flex items-center justify-between text-[11px] font-mono px-3 py-1.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg">
        {hoveredBucket ? (
          <>
            <span className="text-[var(--color-text-primary)] font-semibold truncate mr-2">
              {hoveredBucket.fullDateStr}:
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {hoveredBucket.runKm > 0 && (
                <span className="text-[var(--color-running)] font-tabular font-bold">
                  {hoveredBucket.runKm} km run
                </span>
              )}
              {hoveredBucket.rideKm > 0 && (
                <span className="text-[var(--color-cycling)] font-tabular font-bold">
                  {hoveredBucket.rideKm} km ride
                </span>
              )}
              {hoveredBucket.elevation > 0 && (
                <span className="text-[var(--color-alert-amber)] font-tabular">
                  ▲ {hoveredBucket.elevation}m
                </span>
              )}
              {hoveredBucket.sessionCount > 0 && (
                <span className="text-[var(--color-text-muted)] text-[10px]">
                  ({hoveredBucket.sessionCount} sessions)
                </span>
              )}
              {hoveredBucket.totalKm === 0 && (
                <span className="text-[var(--color-text-muted)]">Rest Day / No Recorded Telemetry</span>
              )}
            </div>
          </>
        ) : (
          <span className="text-[var(--color-text-muted)] flex items-center justify-between w-full">
            <span>Hover bar for telemetry split</span>
            <span>
              {timeframe === "all" ? "Max weekly:" : "Max daily:"} {maxTotal.toFixed(1)} km
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
