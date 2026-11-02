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
    <section className="bg-[#12151D] border border-[#1F2430] rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#f43f5e]" />
          <h3 className="text-sm font-semibold text-white">
            5-Zone Heart Rate Distribution & Aerobic Impact
          </h3>
        </div>
        <span className="text-xs font-mono text-[#9BA3AF]">
          Avg: <strong className="text-white">{activity.average_heartrate} bpm</strong> •
          Peak: <strong className="text-[#f43f5e]">{activity.max_heartrate} bpm</strong>
        </span>
      </div>

      {/* Visual Zone Bar */}
      <div className="h-3 w-full rounded-sm bg-[#1A1E28] overflow-hidden flex">
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
            className="p-3 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-semibold"
                style={{ color: z.color }}
              >
                {z.zone.split(" ")[0]}
              </span>
              <span className="text-xs font-bold font-mono font-tabular text-white">
                {z.pct}%
              </span>
            </div>
            <div className="text-[10px] text-white font-medium truncate">
              {z.zone.substring(z.zone.indexOf(" ") + 1)}
            </div>
            <div className="text-[10px] text-[#5A6272] font-mono">
              {z.range}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

