import React from "react";
import { Heart } from "lucide-react";
import { Activity } from "@/types";

interface HeartRateZoneInfo {
  zone: string;
  range: string;
  pct: number;
  color: string;
}

interface ActivityHeartRateZonesProps {
  activity: Activity;
  hrZones: HeartRateZoneInfo[];
}

export function ActivityHeartRateZones({
  activity,
  hrZones,
}: ActivityHeartRateZonesProps) {
  if (!hrZones || hrZones.length === 0) return null;

  return (
    <section className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-4 font-mono shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[var(--color-alert-red)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            5-Zone Heart Rate Distribution &amp; Aerobic Impact
          </h3>
        </div>
        <span className="text-xs font-mono text-[var(--color-text-secondary)] font-tabular">
          Avg: <strong className="text-[var(--color-text-primary)]">{activity.average_heartrate} bpm</strong> •
          Peak: <strong className="text-[var(--color-alert-red)]">{activity.max_heartrate} bpm</strong>
        </span>
      </div>

      {/* Visual Zone Bar */}
      <div className="h-3 w-full rounded-full bg-[var(--color-surface-muted)] overflow-hidden flex border border-[var(--color-border)]">
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
          <div
            key={z.zone}
            className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold"
                style={{ color: z.color }}
              >
                {z.zone.split(" ")[0]}
              </span>
              <span className="text-xs font-bold font-mono font-tabular text-[var(--color-text-primary)]">
                {z.pct}%
              </span>
            </div>
            <div className="text-[10px] text-[var(--color-text-secondary)] font-medium truncate">
              {z.zone.substring(z.zone.indexOf(" ") + 1)}
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)] font-mono font-tabular">
              {z.range}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
