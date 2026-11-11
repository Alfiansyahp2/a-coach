"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Activity } from "@/types";
import {
  formatDistance,
  formatDuration,
  formatDate,
  speedMpsToPace,
  speedMpsToKmh,
} from "@/lib/formatters";
import {
  Activity as ActivityIcon,
  ChevronRight,
  Heart,
  Navigation,
  Search,
  Bike,
  Footprints,
  Mountain,
} from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [selectedSport, setSelectedSport] = useState<"All" | "Run" | "Ride">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(8);

  const runsCount = useMemo(
    () => activities.filter((a) => a.sport_type.toLowerCase().includes("run")).length,
    [activities]
  );
  const ridesCount = useMemo(
    () =>
      activities.filter(
        (a) =>
          a.sport_type.toLowerCase().includes("ride") ||
          a.sport_type.toLowerCase().includes("cycl")
      ).length,
    [activities]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSport =
        selectedSport === "All"
          ? true
          : selectedSport === "Run"
          ? act.sport_type.toLowerCase().includes("run")
          : act.sport_type.toLowerCase().includes("ride") ||
            act.sport_type.toLowerCase().includes("cycl");

      const matchesSearch =
        searchQuery.trim() === ""
          ? true
          : act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            act.sport_type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSport && matchesSearch;
    });
  }, [activities, selectedSport, searchQuery]);

  const visibleActivities = filteredActivities.slice(0, displayCount);

  return (
    <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-4 shadow-xs font-mono">
      {/* Feed Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-primary)]">
              <ActivityIcon className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)]">
              Ingested Telemetry Stream
            </h3>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-mono pt-1">
            Synchronized Strava Telemetry • {activities.length} Sesi Terdaftar
          </p>
        </div>

        {/* Sport Type Segmented Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setSelectedSport("All")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              selectedSport === "All"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Semua ({activities.length})
          </button>
          <button
            onClick={() => setSelectedSport("Run")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedSport === "Run"
                ? "bg-[var(--color-surface-card)] text-[var(--color-running)] font-bold shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-running)]"
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-[var(--color-running)]" />
            <span>Run ({runsCount})</span>
          </button>
          <button
            onClick={() => setSelectedSport("Ride")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedSport === "Ride"
                ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] font-bold shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Ride ({ridesCount})</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari aktivitas (misal: Zone 2, Recovery, Century, Tempo)..."
          className="w-full pl-10 pr-12 py-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-secondary)] transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] uppercase font-mono px-2 py-0.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Activity Cards List */}
      {visibleActivities.length === 0 ? (
        <div className="py-8 text-center text-xs text-[var(--color-text-muted)] font-mono border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-muted)]/30">
          Tidak ada aktivitas yang sesuai dengan kata kunci pencarian.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleActivities.map((act) => {
            const isRun = act.sport_type.toLowerCase().includes("run");
            const isRide =
              act.sport_type.toLowerCase().includes("ride") ||
              act.sport_type.toLowerCase().includes("cycl");
            const velocity = isRun
              ? speedMpsToPace(act.average_speed_mps)
              : speedMpsToKmh(act.average_speed_mps);

            return (
              <Link
                key={act.id}
                href={`/activities/${act.id}`}
                className="group p-3 sm:p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 hover:border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-all duration-200 flex items-center justify-between shadow-xs"
              >
                {/* Left: Track Visual & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {act.raw_summary_polyline ? (
                    <div className="w-11 h-11 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center p-1 shrink-0 overflow-hidden group-hover:border-[var(--color-text-secondary)] transition-colors">
                      <img
                        src={act.raw_summary_polyline}
                        alt="GPS Track Route"
                        className="w-full h-full object-contain filter brightness-110 group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
                      {isRide ? (
                        <Bike className="w-5 h-5 text-[var(--color-cycling)]" />
                      ) : isRun ? (
                        <Footprints className="w-5 h-5 text-[var(--color-running)]" />
                      ) : (
                        <Navigation className="w-5 h-5" />
                      )}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-md font-bold tracking-wider border ${
                          isRun
                            ? "bg-[var(--color-running)]/10 text-[var(--color-running)] border-[var(--color-running)]/30"
                            : "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                        }`}
                      >
                        {act.sport_type}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:underline truncate">
                        {act.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)] font-mono">
                      <span>{formatDate(act.start_date)}</span>
                      <span className="text-[var(--color-border)]">•</span>
                      <span>{formatDuration(act.moving_time_seconds)}</span>
                      {act.elevation_gain_meters > 0 && (
                        <>
                          <span className="text-[var(--color-border)]">•</span>
                          <span className="text-[var(--color-alert-amber)] flex items-center gap-0.5 font-tabular">
                            <Mountain className="w-3 h-3" />
                            {Math.round(act.elevation_gain_meters)}m
                          </span>
                        </>
                      )}
                      {act.average_heartrate && (
                        <>
                          <span className="text-[var(--color-border)]">•</span>
                          <span className="flex items-center gap-1 text-[var(--color-alert-red)]">
                            <Heart className="w-3 h-3 fill-current" />
                            <span className="font-tabular font-bold">
                              {Math.round(act.average_heartrate)} bpm
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Distance, Pace & Chevron */}
                <div className="flex items-center gap-3.5 shrink-0 font-mono">
                  <div className="text-right">
                    <div className="text-sm font-bold font-tabular text-[var(--color-text-primary)] tracking-tight">
                      {formatDistance(act.distance_meters)}
                    </div>
                    <div
                      className={`text-[11px] font-semibold font-tabular ${
                        isRun ? "text-[var(--color-running)]" : "text-[var(--color-cycling)]"
                      }`}
                    >
                      {velocity}
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-all shadow-xs">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer: Pagination / View Count Toggle */}
      {filteredActivities.length > 8 && (
        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)]">
          <span>
            Menampilkan{" "}
            <strong className="text-[var(--color-text-primary)] font-tabular">{visibleActivities.length}</strong>{" "}
            dari{" "}
            <strong className="text-[var(--color-text-primary)] font-tabular">
              {filteredActivities.length}
            </strong>{" "}
            sesi telemetri
          </span>

          {displayCount < filteredActivities.length ? (
            <button
              onClick={() => setDisplayCount(filteredActivities.length)}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] transition-all text-xs font-mono shadow-xs"
            >
              Lihat Semua ({filteredActivities.length})
            </button>
          ) : (
            <button
              onClick={() => setDisplayCount(8)}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] transition-all text-xs font-mono shadow-xs"
            >
              Kecilkan ke 8 Sesi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
