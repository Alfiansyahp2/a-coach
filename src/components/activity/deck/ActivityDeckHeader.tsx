"use client";

import React from "react";
import { FolderKanban, Bike, Footprints, Layers, TrendingUp } from "lucide-react";
import { AddActivityModal } from "@/components/AddActivityModal";
import { Activity } from "@/types";
import {
  formatDistance,
  formatDurationHuman,
  speedMpsToPace,
  speedMpsToKmh,
} from "@/lib/formatters";

interface ActivityDeckHeaderProps {
  activities: Activity[];
  sportFilter?: string;
  setSportFilter?: (v: string) => void;
}

export function ActivityDeckHeader({
  activities,
  sportFilter = "All",
  setSportFilter,
}: ActivityDeckHeaderProps) {
  // Aggregate telemetry by sport
  const rides = activities.filter(
    (a) =>
      a.sport_type.toLowerCase().includes("ride") ||
      a.sport_type.toLowerCase().includes("cycl")
  );
  const runs = activities.filter((a) =>
    a.sport_type.toLowerCase().includes("run")
  );

  const totalDistAll = activities.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0);
  const totalTimeAll = activities.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0);
  const totalElevAll = activities.reduce((acc, a) => acc + Number(a.elevation_gain_meters || 0), 0);

  const totalDistRide = rides.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0);
  const totalTimeRide = rides.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0);
  const totalElevRide = rides.reduce((acc, a) => acc + Number(a.elevation_gain_meters || 0), 0);
  const avgSpeedRide =
    totalTimeRide > 0
      ? speedMpsToKmh(totalDistRide / totalTimeRide)
      : "-- km/h";

  const totalDistRun = runs.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0);
  const totalTimeRun = runs.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0);
  const totalElevRun = runs.reduce((acc, a) => acc + Number(a.elevation_gain_meters || 0), 0);
  const avgPaceRun =
    totalDistRun > 0
      ? speedMpsToPace(totalDistRun / totalTimeRun)
      : "--:-- /km";

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Header Bar: Title, Purpose & Add Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-sm bg-gradient-to-r from-[#12151D] via-[#161B26] to-[#12151D] border border-[#1F2430] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#161922] border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-sm shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm uppercase tracking-wider font-bold text-[#F0F2F5]">
                Activity Registry &amp; Grouping Management
              </h1>
              <span className="text-[9px] px-2 py-0.5 rounded-xs bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold uppercase">
                Obsidian Telemetry
              </span>
            </div>
            <p className="text-[11px] text-[#9BA3AF] pt-0.5">
              Manajemen pengelompokan aktivitas, kategorisasi sesi latihan, dan kalibrasi telemetri massal.
            </p>
          </div>
        </div>

        {/* Primary Action */}
        <div className="flex items-center gap-3">
          <AddActivityModal variant="button" />
        </div>
      </div>

      {/* 2. Interactive Telemetry KPI Cards (Click to Instant Filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: All Activities */}
        <button
          type="button"
          onClick={() => setSportFilter && setSportFilter("All")}
          className={`p-3.5 rounded-sm border text-left transition-all cursor-pointer relative overflow-hidden ${
            sportFilter === "All"
              ? "bg-[#161922] border-[#F0F2F5]/60 ring-1 ring-[#F0F2F5]/30 shadow-sm"
              : "bg-[#12151D] border-[#1F2430] hover:border-[#2D3547] hover:bg-[#161922]/60"
          }`}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60">
            <span className="text-[10px] text-[#9BA3AF] uppercase font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F0F2F5]" />
              Semua Aktivitas
            </span>
            <span className="text-xs font-bold text-[#F0F2F5] px-1.5 py-0.5 rounded-xs bg-[#090A0F] border border-[#1F2430]">
              {activities.length} Sesi
            </span>
          </div>
          <div className="pt-2 flex items-baseline justify-between">
            <span className="text-base font-bold font-tabular text-[#F0F2F5]">
              {formatDistance(totalDistAll)}
            </span>
            <span className="text-xs text-[#9BA3AF] font-tabular">
              {formatDurationHuman(totalTimeAll)}
            </span>
          </div>
          <div className="text-[10px] text-[#5A6272] pt-1 flex items-center justify-between">
            <span>Total Elevasi:</span>
            <span className="text-[#FF9500] font-bold">▲ {Math.round(totalElevAll)}m</span>
          </div>
        </button>

        {/* Card 2: Cycling (Ride) */}
        <button
          type="button"
          onClick={() => setSportFilter && setSportFilter("Ride")}
          className={`p-3.5 rounded-sm border text-left transition-all cursor-pointer relative overflow-hidden ${
            sportFilter.toLowerCase().includes("ride")
              ? "bg-[#161922] border-[#00F0FF] ring-1 ring-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.1)]"
              : "bg-[#12151D] border-[#1F2430] hover:border-[#00F0FF]/40 hover:bg-[#161922]/60"
          }`}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60">
            <span className="text-[10px] text-[#00F0FF] uppercase font-bold flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-[#00F0FF]" />
              Sepeda MTB (Ride)
            </span>
            <span className="text-xs font-bold text-[#00F0FF] px-1.5 py-0.5 rounded-xs bg-[#00F0FF]/15 border border-[#00F0FF]/30">
              {rides.length} Sesi
            </span>
          </div>
          <div className="pt-2 flex items-baseline justify-between">
            <span className="text-base font-bold font-tabular text-[#00F0FF]">
              {formatDistance(totalDistRide)}
            </span>
            <span className="text-xs text-[#9BA3AF] font-tabular">
              {formatDurationHuman(totalTimeRide)}
            </span>
          </div>
          <div className="text-[10px] text-[#5A6272] pt-1 flex items-center justify-between">
            <span>Avg Kecepatan:</span>
            <span className="text-[#00F0FF] font-bold">{avgSpeedRide}</span>
          </div>
        </button>

        {/* Card 3: Running (Run) */}
        <button
          type="button"
          onClick={() => setSportFilter && setSportFilter("Run")}
          className={`p-3.5 rounded-sm border text-left transition-all cursor-pointer relative overflow-hidden ${
            sportFilter.toLowerCase().includes("run")
              ? "bg-[#161922] border-[#D4FF00] ring-1 ring-[#D4FF00]/40 shadow-[0_0_12px_rgba(212,255,0,0.1)]"
              : "bg-[#12151D] border-[#1F2430] hover:border-[#D4FF00]/40 hover:bg-[#161922]/60"
          }`}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60">
            <span className="text-[10px] text-[#D4FF00] uppercase font-bold flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-[#D4FF00]" />
              Lari Bertahap (Run)
            </span>
            <span className="text-xs font-bold text-[#D4FF00] px-1.5 py-0.5 rounded-xs bg-[#D4FF00]/15 border border-[#D4FF00]/30">
              {runs.length} Sesi
            </span>
          </div>
          <div className="pt-2 flex items-baseline justify-between">
            <span className="text-base font-bold font-tabular text-[#D4FF00]">
              {formatDistance(totalDistRun)}
            </span>
            <span className="text-xs text-[#9BA3AF] font-tabular">
              {formatDurationHuman(totalTimeRun)}
            </span>
          </div>
          <div className="text-[10px] text-[#5A6272] pt-1 flex items-center justify-between">
            <span>Avg Kecepatan / Pace:</span>
            <span className="text-[#D4FF00] font-bold">{avgPaceRun}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
