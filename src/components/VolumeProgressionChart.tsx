"use client";

import React, { useState } from "react";
import { Activity } from "@/types";

interface VolumeProgressionChartProps {
  activities: Activity[];
  days?: number;
}

interface DayBucket {
  dateStr: string;
  dayLabel: string;
  dayNumber: string;
  runKm: number;
  rideKm: number;
  totalKm: number;
  elevation: number;
}

export function VolumeProgressionChart({
  activities,
  days = 7,
}: VolumeProgressionChartProps) {
  const [hoveredDay, setHoveredDay] = useState<DayBucket | null>(null);

  // Calculate day buckets anchored to recent activities or current date
  const now = new Date();
  // Find the latest activity date to anchor a relevant 7-day window if current week has few
  const latestActivityTime = activities.length > 0 
    ? new Date(activities[0].start_date).getTime() 
    : now.getTime();
  
  // Use the anchor date (latest activity or today, whichever is more relevant)
  const anchorDate = new Date(Math.max(now.getTime(), latestActivityTime));
  
  const buckets: DayBucket[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchorDate.getTime() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = dayNames[d.getDay()];
    const dayNumber = String(d.getDate()).padStart(2, "0");

    let runKm = 0;
    let rideKm = 0;
    let elevation = 0;

    for (const act of activities) {
      if (act.start_date.startsWith(dateStr)) {
        const distKm = Number(act.distance_meters || 0) / 1000;
        const elev = Number(act.elevation_gain_meters || 0);
        const sport = (act.sport_type || "").toLowerCase();

        if (sport.includes("run")) {
          runKm += distKm;
        } else if (sport.includes("ride") || sport.includes("cycl")) {
          rideKm += distKm;
        } else {
          runKm += distKm; // default fallback
        }
        elevation += elev;
      }
    }

    buckets.push({
      dateStr,
      dayLabel,
      dayNumber,
      runKm: Math.round(runKm * 10) / 10,
      rideKm: Math.round(rideKm * 10) / 10,
      totalKm: Math.round((runKm + rideKm) * 10) / 10,
      elevation: Math.round(elevation),
    });
  }

  const maxTotal = Math.max(...buckets.map((b) => b.totalKm), 15);
  const chartHeight = 90;
  const chartWidth = 100; // viewBox percentage

  const totalPeriodRunKm = buckets.reduce((acc, b) => acc + b.runKm, 0);
  const totalPeriodRideKm = buckets.reduce((acc, b) => acc + b.rideKm, 0);
  const totalPeriodKm = Math.round((totalPeriodRunKm + totalPeriodRideKm) * 10) / 10;

  return (
    <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-mono text-[#9BA3AF] block">
            Volume Progression (7 Days)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold font-mono font-tabular text-[#F0F2F5]">
              {totalPeriodKm.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#9BA3AF]">km combined</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-none bg-[#D4FF00]" />
            <span className="text-[#9BA3AF]">Run ({totalPeriodRunKm.toFixed(1)}k)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-none bg-[#00F0FF]" />
            <span className="text-[#9BA3AF]">Ride ({totalPeriodRideKm.toFixed(1)}k)</span>
          </div>
        </div>
      </div>

      {/* SVG Stacked Bar Chart */}
      <div className="relative pt-2">
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
            stroke="#1F2430"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1="28"
            x2="100"
            y2="28"
            stroke="#1F2430"
            strokeWidth="0.5"
            strokeDasharray="1 2"
          />

          {/* Bars */}
          {buckets.map((b, idx) => {
            const barWidth = 7;
            const gap = (100 - barWidth * buckets.length) / (buckets.length + 1);
            const x = gap + idx * (barWidth + gap);

            const totalH = (b.totalKm / maxTotal) * 50;
            const rideH = (b.rideKm / maxTotal) * 50;
            const runH = (b.runKm / maxTotal) * 50;

            const rideY = 55 - rideH;
            const runY = rideY - runH;

            const isHovered = hoveredDay?.dateStr === b.dateStr;

            return (
              <g
                key={b.dateStr}
                className="cursor-pointer transition-opacity duration-150"
                onMouseEnter={() => setHoveredDay(b)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Background column highlight on hover */}
                {isHovered && (
                  <rect
                    x={x - 1.5}
                    y={2}
                    width={barWidth + 3}
                    height={53}
                    fill="#1C212E"
                    opacity={0.6}
                    rx={1}
                  />
                )}

                {/* Ride Segment (Bottom) */}
                {b.rideKm > 0 && (
                  <rect
                    x={x}
                    y={rideY}
                    width={barWidth}
                    height={rideH}
                    fill="#00F0FF"
                    opacity={isHovered ? 1 : 0.85}
                  />
                )}

                {/* Run Segment (Top) */}
                {b.runKm > 0 && (
                  <rect
                    x={x}
                    y={runY}
                    width={barWidth}
                    height={runH}
                    fill="#D4FF00"
                    opacity={isHovered ? 1 : 0.9}
                  />
                )}

                {/* Empty marker if zero */}
                {b.totalKm === 0 && (
                  <circle
                    cx={x + barWidth / 2}
                    cy={53}
                    r={0.8}
                    fill="#5A6272"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* X-Axis Day Labels */}
        <div className="flex justify-between items-center px-1 pt-1 border-t border-[#1F2430]/40">
          {buckets.map((b) => (
            <div
              key={b.dateStr}
              className={`text-center font-mono text-[10px] transition-colors ${
                hoveredDay?.dateStr === b.dateStr
                  ? "text-white font-bold"
                  : b.totalKm > 0
                  ? "text-[#9BA3AF]"
                  : "text-[#5A6272]"
              }`}
            >
              <span>{b.dayLabel[0]}</span>
              <span className="block text-[8px] text-[#5A6272]">{b.dayNumber}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Hover Telemetry Readout */}
      <div className="mt-2.5 h-6 flex items-center justify-between text-[11px] font-mono px-2 py-1 bg-[#090A0F] border border-[#1F2430] rounded-sm">
        {hoveredDay ? (
          <>
            <span className="text-[#F0F2F5] font-semibold">
              {hoveredDay.dayLabel}, {hoveredDay.dateStr}:
            </span>
            <div className="flex items-center gap-2">
              {hoveredDay.runKm > 0 && (
                <span className="text-[#D4FF00] font-tabular">
                  {hoveredDay.runKm} km run
                </span>
              )}
              {hoveredDay.rideKm > 0 && (
                <span className="text-[#00F0FF] font-tabular">
                  {hoveredDay.rideKm} km ride
                </span>
              )}
              {hoveredDay.elevation > 0 && (
                <span className="text-[#FF9500] font-tabular">
                  ▲ {hoveredDay.elevation}m
                </span>
              )}
              {hoveredDay.totalKm === 0 && (
                <span className="text-[#5A6272]">Rest Day / No Recorded Telemetry</span>
              )}
            </div>
          </>
        ) : (
          <span className="text-[#5A6272] flex items-center justify-between w-full">
            <span>Hover column for split telemetry</span>
            <span>Max daily: {maxTotal.toFixed(1)} km</span>
          </span>
        )}
      </div>
    </div>
  );
}

