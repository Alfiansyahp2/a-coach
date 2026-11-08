"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Footprints, Bike, ArrowUpRight } from "lucide-react";
import { DailyActivityRecap } from "@/lib/domain/analytics/weeklyRecapTypes";

interface WeeklyRecapTimelineProps {
  dailyBreakdown: DailyActivityRecap[];
  totalElevationMeters: number;
}

export function WeeklyRecapTimeline({
  dailyBreakdown,
  totalElevationMeters,
}: WeeklyRecapTimelineProps) {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
        <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--color-cycling)]" />
          <span>Distribusi Sesi Harian (Senin – Minggu)</span>
        </h3>
        <span className="text-[10px] text-[var(--color-text-muted)] font-tabular">
          {totalElevationMeters}m Total Elevasi
        </span>
      </div>

      <div className="space-y-2">
        {dailyBreakdown.map((day) => (
          <div
            key={day.date}
            className={`p-3 rounded-lg border transition-all ${
              day.session_count > 0
                ? "bg-[var(--color-surface-muted)]/70 border-[var(--color-border)]"
                : "bg-transparent border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-60"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold text-[var(--color-text-primary)]">{day.day_name}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-tabular">{day.date}</span>
              </div>

              {day.session_count > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] font-tabular">
                    {day.total_distance_km} km
                  </span>
                  <span className="text-[11px] text-[var(--color-text-secondary)] font-tabular">
                    {day.formatted_duration}
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-cycling)] font-bold">
                    {day.session_count} sesi
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-[var(--color-text-muted)] italic">Hari Istirahat / Rest Day</span>
              )}
            </div>

            {day.activities.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[var(--color-border-subtle)] space-y-1">
                {day.activities.map((item) => (
                  <Link
                    key={item.id}
                    href={`/activities/${item.id}`}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-[var(--color-surface-card)] transition-colors text-[10.5px] group"
                  >
                    <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate">
                      {item.sport_type.toLowerCase().includes("run") ? (
                        <Footprints className="w-3 h-3 text-[var(--color-running)] shrink-0" />
                      ) : (
                        <Bike className="w-3 h-3 text-[var(--color-cycling)] shrink-0" />
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-[var(--color-text-muted)]">
                      <span className="font-bold text-[var(--color-text-primary)] font-tabular">
                        {item.distance_km} km
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-[var(--color-cycling)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

