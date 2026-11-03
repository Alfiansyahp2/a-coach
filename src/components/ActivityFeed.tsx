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
    <div className="bg-[#12151D] border border-[#1F2430] hover:border-[#2D3547] rounded-sm p-4 space-y-3.5 transition-all duration-200 shadow-sm">
      {/* Feed Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2430]">
        <div>
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-3.5 h-3.5 text-[#00F0FF]" />
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
              Ingested Telemetry Stream
            </h3>
          </div>
          <p className="text-[11px] text-[#9BA3AF] font-mono pt-0.5">
            Synchronized Strava Telemetry • {activities.length} Sesi Terdaftar
          </p>
        </div>

        {/* Sport Type Segmented Controls */}
        <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430] self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setSelectedSport("All")}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
              selectedSport === "All"
                ? "bg-[#1C212E] text-white border border-[#2D3547] font-bold"
                : "text-[#9BA3AF] hover:text-white"
            }`}
          >
            All ({activities.length})
          </button>
          <button
            onClick={() => setSelectedSport("Run")}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedSport === "Run"
                ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40 font-bold"
                : "text-[#9BA3AF] hover:text-[#D4FF00]"
            }`}
          >
            <Footprints className="w-3 h-3 text-[#D4FF00]" />
            <span>Run ({runsCount})</span>
          </button>
          <button
            onClick={() => setSelectedSport("Ride")}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedSport === "Ride"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 font-bold"
                : "text-[#9BA3AF] hover:text-[#00F0FF]"
            }`}
          >
            <Bike className="w-3 h-3 text-[#00F0FF]" />
            <span>Ride ({ridesCount})</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6272]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari aktivitas (misal: Zone 2, Recovery, Century, Tempo)..."
          className="w-full pl-8 pr-12 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] placeholder-[#5A6272] focus:outline-none focus:border-[#00F0FF] transition-colors font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9BA3AF] hover:text-white uppercase font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* Activity Cards List */}
      {visibleActivities.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#5A6272] font-mono border border-dashed border-[#1F2430] rounded-sm">
          Tidak ada aktivitas yang sesuai dengan kata kunci pencarian.
        </div>
      ) : (
        <div className="space-y-1.5">
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
                className="group p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] hover:bg-[#1C212E] transition-all flex items-center justify-between"
              >
                {/* Left: Track Visual & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {act.raw_summary_polyline ? (
                    <div className="w-11 h-11 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center p-1 shrink-0 overflow-hidden group-hover:border-[#00F0FF]/40 transition-colors">
                      <img
                        src={act.raw_summary_polyline}
                        alt="GPS Track Route"
                        className="w-full h-full object-contain filter brightness-110 group-hover:scale-105 transition-transform duration-150"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center shrink-0 text-[#5A6272] group-hover:text-[#00F0FF] group-hover:border-[#00F0FF]/40 transition-colors">
                      {isRide ? (
                        <Bike className="w-4 h-4" />
                      ) : isRun ? (
                        <Footprints className="w-4 h-4" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                    </div>
                  )}

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-xs font-bold tracking-wider ${
                          isRun
                            ? "bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/30"
                            : "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30"
                        }`}
                      >
                        {act.sport_type}
                      </span>
                      <h4 className="text-xs font-semibold text-[#F0F2F5] group-hover:text-[#00F0FF] transition-colors truncate">
                        {act.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#9BA3AF] font-mono">
                      <span>{formatDate(act.start_date)}</span>
                      <span className="text-[#3A404D]">•</span>
                      <span>{formatDuration(act.moving_time_seconds)}</span>
                      {act.elevation_gain_meters > 0 && (
                        <>
                          <span className="text-[#3A404D]">•</span>
                          <span className="text-[#f59e0b] flex items-center gap-0.5 font-tabular">
                            <Mountain className="w-3 h-3" />
                            {Math.round(act.elevation_gain_meters)}m
                          </span>
                        </>
                      )}
                      {act.average_heartrate && (
                        <>
                          <span className="text-[#3A404D]">•</span>
                          <span className="flex items-center gap-1 text-[#FF2A6D]">
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
                    <div className="text-sm font-bold font-tabular text-[#F0F2F5] tracking-tight">
                      {formatDistance(act.distance_meters)}
                    </div>
                    <div
                      className={`text-[11px] font-semibold font-tabular ${
                        isRun ? "text-[#D4FF00]" : "text-[#00F0FF]"
                      }`}
                    >
                      {velocity}
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center text-[#5A6272] group-hover:text-[#F0F2F5] group-hover:border-[#00F0FF]/50 group-hover:translate-x-0.5 transition-all">
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
        <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between text-xs font-mono text-[#9BA3AF]">
          <span>
            Menampilkan{" "}
            <strong className="text-white font-tabular">{visibleActivities.length}</strong>{" "}
            dari{" "}
            <strong className="text-white font-tabular">
              {filteredActivities.length}
            </strong>{" "}
            sesi telemetri
          </span>

          {displayCount < filteredActivities.length ? (
            <button
              onClick={() => setDisplayCount(filteredActivities.length)}
              className="px-2.5 py-1 rounded-sm bg-[#161922] hover:bg-[#1C212E] text-white border border-[#1F2430] hover:border-[#00F0FF]/40 transition-colors text-xs font-mono"
            >
              Lihat Semua ({filteredActivities.length})
            </button>
          ) : (
            <button
              onClick={() => setDisplayCount(8)}
              className="px-2.5 py-1 rounded-sm bg-[#161922] hover:bg-[#1C212E] text-[#9BA3AF] hover:text-white border border-[#1F2430] transition-colors text-xs font-mono"
            >
              Kecilkan ke 8 Sesi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
