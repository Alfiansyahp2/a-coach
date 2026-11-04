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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shadow-xs shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm uppercase tracking-wider font-bold text-[var(--color-text-primary)]">
                Activity Registry &amp; Grouping Management
              </h1>
              <span className="text-[9.5px] px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold uppercase tracking-wider">
                Telemetry Log
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] pt-1">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {/* Card 1: All Activities (Always first) */}
        <button
          type="button"
          onClick={() => setSportFilter && setSportFilter("All")}
          className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden shadow-xs hover:-translate-y-0.5 ${
            sportFilter === "All"
              ? "bg-[var(--color-surface-muted)] border-[var(--color-cycling)] shadow-sm"
              : "bg-[var(--color-surface-card)] border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-cycling)]"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[var(--color-text-primary)]" />
              <span>Semua Aktivitas</span>
            </span>
            <span className="text-xs font-bold font-tabular text-[var(--color-text-primary)] px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              {activities.length} Sesi
            </span>
          </div>
          <div className="pt-2.5 flex items-baseline justify-between">
            <span className="text-lg font-bold font-tabular text-[var(--color-text-primary)]">
              {formatDistance(totalDistAll)}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)] font-tabular">
              {formatDurationHuman(totalTimeAll)}
            </span>
          </div>
          <div className="text-[10.5px] text-[var(--color-text-muted)] pt-1.5 flex items-center justify-between font-tabular">
            <span>Total Elevasi:</span>
            <span className="text-[var(--color-running)] font-bold">▲ {Math.round(totalElevAll)}m</span>
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
              className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden shadow-xs hover:-translate-y-0.5 ${
                isSelected
                  ? "bg-[var(--color-surface-muted)] shadow-sm"
                  : "bg-[var(--color-surface-card)] border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
              }`}
              style={{
                borderColor: isSelected ? meta.accentHex : undefined,
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <span
                  className="text-[10.5px] uppercase font-bold flex items-center gap-1.5"
                  style={{ color: meta.accentHex }}
                >
                  {renderSportIcon(meta.iconName, "w-4 h-4")}
                  <span>{meta.label}</span>
                </span>
                <span
                  className="text-xs font-bold font-tabular px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${meta.accentHex}15`,
                    color: meta.accentHex,
                    borderColor: `${meta.accentHex}40`,
                  }}
                >
                  {sportActs.length} Sesi
                </span>
              </div>
              <div className="pt-2.5 flex items-baseline justify-between">
                <span
                  className="text-lg font-bold font-tabular"
                  style={{ color: meta.accentHex }}
                >
                  {formatDistance(totalDist)}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] font-tabular">
                  {formatDurationHuman(totalTime)}
                </span>
              </div>
              <div className="text-[10.5px] text-[var(--color-text-muted)] pt-1.5 flex items-center justify-between font-tabular">
                <span>{meta.isPaceFormat ? "Avg Pace:" : "Avg Kecepatan:"}</span>
                <span className="font-bold font-tabular" style={{ color: meta.accentHex }}>
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
