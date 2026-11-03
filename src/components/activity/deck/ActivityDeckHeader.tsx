"use client";

import React from "react";
import {
  FolderKanban,
  Bike,
  Footprints,
  Waves,
  Dumbbell,
  Compass,
  Activity as ActivityIcon,
  Layers,
  TrendingUp,
} from "lucide-react";
import { AddActivityModal } from "@/components/AddActivityModal";
import { Activity } from "@/types";
import {
  formatDistance,
  formatDurationHuman,
  speedMpsToPace,
  speedMpsToKmh,
} from "@/lib/formatters";
import { getSportMeta, getDistinctSports } from "@/lib/sportUtils";

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
  // Aggregate total telemetry
  const totalDistAll = activities.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0);
  const totalTimeAll = activities.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0);
  const totalElevAll = activities.reduce((acc, a) => acc + Number(a.elevation_gain_meters || 0), 0);

  // Discover all distinct sport types dynamically
  const distinctSports = getDistinctSports(activities);

  // Helper to render icon component dynamically
  const renderSportIcon = (iconName: string, className = "w-3.5 h-3.5") => {
    switch (iconName) {
      case "bike":
        return <Bike className={className} />;
      case "footprints":
        return <Footprints className={className} />;
      case "waves":
        return <Waves className={className} />;
      case "dumbbell":
        return <Dumbbell className={className} />;
      case "compass":
        return <Compass className={className} />;
      default:
        return <ActivityIcon className={className} />;
    }
  };

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
              Manajemen pengelompokan aktivitas, kategorisasi cabang olahraga dinamis, dan kalibrasi telemetri massal.
            </p>
          </div>
        </div>

        {/* Primary Action */}
        <div className="flex items-center gap-3">
          <AddActivityModal variant="button" />
        </div>
      </div>

      {/* 2. Interactive Telemetry KPI Cards (Dynamic for all sports) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Card 1: All Activities (Always first) */}
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

        {/* Cards for each dynamically registered sport */}
        {distinctSports.map((sportKey) => {
          const meta = getSportMeta(sportKey);
          const sportActs = activities.filter(
            (a) => a.sport_type.toLowerCase() === sportKey.toLowerCase()
          );
          const totalDist = sportActs.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0);
          const totalTime = sportActs.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0);
          const totalElev = sportActs.reduce((acc, a) => acc + Number(a.elevation_gain_meters || 0), 0);

          const avgMetric =
            totalTime > 0
              ? meta.isPaceFormat
                ? speedMpsToPace(totalDist / totalTime)
                : speedMpsToKmh(totalDist / totalTime)
              : meta.isPaceFormat
              ? "--:-- /km"
              : "-- km/h";

          const isSelected = sportFilter.toLowerCase() === sportKey.toLowerCase();

          return (
            <button
              type="button"
              key={sportKey}
              onClick={() => setSportFilter && setSportFilter(sportKey)}
              className={`p-3.5 rounded-sm border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? `bg-[#161922] border-[${meta.accentHex}] ring-1 ring-[${meta.accentHex}]/40 shadow-sm`
                  : `bg-[#12151D] border-[#1F2430] hover:border-[#2D3547] hover:bg-[#161922]/60`
              }`}
              style={{
                borderColor: isSelected ? meta.accentHex : undefined,
                boxShadow: isSelected ? `0 0 12px ${meta.accentHex}20` : undefined,
              }}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60">
                <span
                  className="text-[10px] uppercase font-bold flex items-center gap-1.5"
                  style={{ color: meta.accentHex }}
                >
                  {renderSportIcon(meta.iconName, "w-3.5 h-3.5")}
                  <span>{meta.label}</span>
                </span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-xs border"
                  style={{
                    backgroundColor: `${meta.accentHex}15`,
                    color: meta.accentHex,
                    borderColor: `${meta.accentHex}30`,
                  }}
                >
                  {sportActs.length} Sesi
                </span>
              </div>
              <div className="pt-2 flex items-baseline justify-between">
                <span
                  className="text-base font-bold font-tabular"
                  style={{ color: meta.accentHex }}
                >
                  {formatDistance(totalDist)}
                </span>
                <span className="text-xs text-[#9BA3AF] font-tabular">
                  {formatDurationHuman(totalTime)}
                </span>
              </div>
              <div className="text-[10px] text-[#5A6272] pt-1 flex items-center justify-between">
                <span>{meta.isPaceFormat ? "Avg Pace:" : "Avg Kecepatan:"}</span>
                <span className="font-bold" style={{ color: meta.accentHex }}>
                  {avgMetric}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
