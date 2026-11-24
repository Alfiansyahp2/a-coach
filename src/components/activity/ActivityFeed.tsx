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
} from "@/lib/shared/formatters";
import {
  extractActiveSports,
  ActiveSportSummary,
} from "@/lib/domain/sports/sportRepertoireService";
import { findSystemSport } from "@/lib/domain/sports/systemSportsRegistry";
import { SportIcon } from "@/components/sports/SportIcon";
import { SportVaultModal } from "@/components/sports/SportVaultModal";
import {
  Activity as ActivityIcon,
  ChevronRight,
  Heart,
  Search,
  Mountain,
  Plus,
} from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(8);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  const activeSports = useMemo(() => extractActiveSports(activities), [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      let matchesSport = true;
      if (selectedSport !== "All") {
        const matched = findSystemSport(act.sport_type);
        if (matched) {
          matchesSport =
            matched.code === selectedSport ||
            matched.aliases.some((a) => a.toLowerCase() === selectedSport.toLowerCase());
        } else {
          matchesSport = act.sport_type.toLowerCase().includes(selectedSport.toLowerCase());
        }
      }

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
            Dynamic Athlete Repertoire • {activities.length} Sesi Terdaftar
          </p>
        </div>

        {/* Dynamic Sport Segmented Controls */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setSelectedSport("All")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              selectedSport === "All"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Semua ({activities.length})
          </button>

          {activeSports.map((sport: ActiveSportSummary) => {
            const isSelected = selectedSport === sport.code;
            return (
              <button
                key={sport.code}
                onClick={() => setSelectedSport(sport.code)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] font-bold shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <SportIcon sportCode={sport.code} cluster={sport.cluster} className="w-3.5 h-3.5" />
                <span>{sport.shortLabel} ({sport.count})</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsVaultOpen(true)}
            className="px-2 py-1 rounded-md text-xs font-bold text-[var(--color-cycling)] hover:bg-[var(--color-cycling)]/15 border border-dashed border-[var(--color-cycling)]/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Buka Sport Vault (33 Cabor Dunia)"
          >
            <Plus className="w-3 h-3" />
            <span>Cabor (33)</span>
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
          placeholder="Cari aktivitas (misal: Zone 2, Recovery, Century, Tempo, Squat)..."
          className="w-full pl-10 pr-12 py-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-secondary)] transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] uppercase font-mono px-2 py-0.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Activity Cards List */}
      {visibleActivities.length === 0 ? (
        <div className="py-8 text-center text-xs text-[var(--color-text-muted)] font-mono border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-muted)]/30 space-y-1">
          <p>Tidak ada aktivitas yang sesuai dengan filter atau kata kunci.</p>
          {selectedSport !== "All" && (
            <button
              onClick={() => setSelectedSport("All")}
              className="text-[var(--color-cycling)] hover:underline cursor-pointer font-bold text-[11px]"
            >
              Reset filter ke Semua Sesi
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleActivities.map((act) => {
            const matched = findSystemSport(act.sport_type);
            const isRun = act.sport_type.toLowerCase().includes("run");
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
                      <img src={act.raw_summary_polyline} alt="GPS Track" className="w-full h-full object-contain filter brightness-110 group-hover:scale-105 transition-transform duration-200" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
                      <SportIcon sportCode={matched?.code || act.sport_type} cluster={matched?.cluster} className="w-5 h-5 text-[var(--color-cycling)]" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-md font-bold tracking-wider border bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30">
                        {matched?.shortLabel || act.sport_type}
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
                      {act.distance_meters > 0 ? formatDistance(act.distance_meters) : "Non-Distance"}
                    </div>
                    <div className="text-[11px] font-semibold font-tabular text-[var(--color-cycling)]">
                      {act.distance_meters > 0 ? velocity : `${Math.round(act.moving_time_seconds / 60)} mnt`}
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
              className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] transition-all text-xs font-mono shadow-xs cursor-pointer"
            >
              Lihat Semua ({filteredActivities.length})
            </button>
          ) : (
            <button
              onClick={() => setDisplayCount(8)}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] transition-all text-xs font-mono shadow-xs cursor-pointer"
            >
              Kecilkan ke 8 Sesi
            </button>
          )}
        </div>
      )}

      {/* Sport Vault Modal Component */}
      <SportVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        activeSportCodes={activeSports.map((s) => s.code)}
        onSelectSport={(item) => setSelectedSport(item.code)}
      />
    </div>
  );
}
