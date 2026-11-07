"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PersonalRecord, Activity } from "@/types";
import { formatDate } from "@/lib/formatters";
import {
  Trophy,
  Calendar,
  ArrowUpRight,
  Flame,
  Gauge,
  TrendingUp,
  Mountain,
  Compass,
} from "lucide-react";

interface PersonalRecordsDeckProps {
  prs: PersonalRecord[];
  activities?: Activity[];
}

export function PersonalRecordsDeck({ prs, activities = [] }: PersonalRecordsDeckProps) {
  const [activeTab, setActiveTab] = useState<"split" | "run" | "ride">("split");

  const runPrs = useMemo(
    () => prs.filter((p) => (p.sport_type || "").toLowerCase().includes("run")),
    [prs]
  );
  const ridePrs = useMemo(
    () =>
      prs.filter(
        (p) =>
          (p.sport_type || "").toLowerCase().includes("ride") ||
          (p.sport_type || "").toLowerCase().includes("cycl")
      ),
    [prs]
  );

  const runDistanceKm = useMemo(() => {
    if (activities && activities.length > 0) {
      return (
        activities
          .filter((a) => (a.sport_type || "").toLowerCase().includes("run"))
          .reduce((sum, a) => sum + Number(a.distance_meters || 0), 0) / 1000
      );
    }
    return 65.2;
  }, [activities]);

  const rideDistanceKm = useMemo(() => {
    if (activities && activities.length > 0) {
      return (
        activities
          .filter(
            (a) =>
              (a.sport_type || "").toLowerCase().includes("ride") ||
              (a.sport_type || "").toLowerCase().includes("cycl")
          )
          .reduce((sum, a) => sum + Number(a.distance_meters || 0), 0) / 1000
      );
    }
    return 623.3;
  }, [activities]);

  if (!prs || prs.length === 0) return null;

  // Find Featured Hero PRs
  const heroRun = runPrs.find((p) => p.category.includes("5K")) || runPrs[0];
  const secondaryRuns = runPrs.filter((p) => p.id !== heroRun?.id);

  const heroRide =
    ridePrs.find((p) => p.category.includes("Longest")) || ridePrs[0];
  const secondaryRides = ridePrs.filter((p) => p.id !== heroRide?.id);

  const getMetricIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("pace")) return <Gauge className="w-3.5 h-3.5" />;
    if (c.includes("speed")) return <TrendingUp className="w-3.5 h-3.5" />;
    if (c.includes("elev") || c.includes("climb"))
      return <Mountain className="w-3.5 h-3.5" />;
    if (c.includes("longest") || c.includes("endurance"))
      return <Compass className="w-3.5 h-3.5" />;
    return <Flame className="w-3.5 h-3.5" />;
  };

  return (
    <div className="@container rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Deck Header & Sleek Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] shrink-0 shadow-xs">
            <Trophy className="w-4 h-4 text-[var(--color-running)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                Personal Records &amp; Benchmarks
              </h3>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-bold whitespace-nowrap">
                {prs.length} Terverifikasi
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] block truncate mt-0.5">
              Dual-Discipline Validated Athletic Telemetry
            </span>
          </div>
        </div>

        {/* Tab Controls - Sleek, Compact, Zero Overflow */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[10.5px] font-mono shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("split")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold whitespace-nowrap cursor-pointer ${
              activeTab === "split"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            SEMUA ({prs.length})
          </button>
          <button
            onClick={() => setActiveTab("run")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "run"
                ? "bg-[var(--color-surface-card)] text-[var(--color-running)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-running)]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-running)] shrink-0" />
            RUN ({runPrs.length})
          </button>
          <button
            onClick={() => setActiveTab("ride")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "ride"
                ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)] shrink-0" />
            RIDE ({ridePrs.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: DUAL-DISCIPLINE SPLIT MATRIX */}
      {activeTab === "split" && (
        <div className="grid grid-cols-1 @[640px]:grid-cols-2 gap-4">
          {/* LEFT: RUNNING COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)] text-xs font-mono">
              <span className="text-[var(--color-running)] font-bold flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-running)]" />
                Running Milestones ({runPrs.length})
              </span>
              <span className="text-[10.5px] font-mono text-[var(--color-text-muted)]">
                {runDistanceKm.toFixed(1)} km Ingested
              </span>
            </div>

            {/* Running Hero Spotlight */}
            {heroRun && (
              <Link
                href={heroRun.activity_id ? `/activities/${heroRun.activity_id}` : "#"}
                className="block p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-running)]/60 transition-all group relative shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[var(--color-text-secondary)] mb-1.5">
                  <span className="uppercase font-bold tracking-wider text-[var(--color-running)] flex items-center gap-1.5 text-[11px] truncate">
                    ★ Featured • {heroRun.category}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Calendar className="w-3 h-3" />
                    {formatDate(heroRun.achieved_date)}
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between gap-3">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono font-tabular text-[var(--color-running)] tracking-tight">
                      {heroRun.record_display}
                    </span>
                    {heroRun.subtext && (
                      <p className="text-[11px] font-mono text-[var(--color-text-secondary)] mt-1 font-medium line-clamp-1">
                        {heroRun.subtext}
                      </p>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-running)] group-hover:border-[var(--color-running)]/40 transition-colors shrink-0 shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-2 text-[10.5px] font-mono">
                  <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
                    {heroRun.activity_name || "Sesi Rekor Terverifikasi"}
                  </span>
                  <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-running)] transition-colors shrink-0 whitespace-nowrap flex items-center gap-0.5">
                    <span>Inspect Track</span>
                    <span>→</span>
                  </span>
                </div>
              </Link>
            )}

            {/* Secondary Running Benchmarks Rows */}
            {secondaryRuns.length > 0 && (
              <div className="space-y-1.5">
                {secondaryRuns.map((pr) => (
                  <Link
                    key={pr.id}
                    href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                    className="p-2.5 sm:p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70 hover:border-[var(--color-running)]/40 hover:bg-[var(--color-surface-muted)] transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-running)] shadow-2xs">
                        {getMetricIcon(pr.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-running)] transition-colors truncate">
                          {pr.category}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] truncate mt-0.5">
                          {pr.activity_name ? `${pr.activity_name} • ` : ""}{formatDate(pr.achieved_date)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono pl-2">
                      <div className="text-sm font-bold font-tabular text-[var(--color-running)]">
                        {pr.record_display}
                      </div>
                      {pr.subtext && (
                        <div className="text-[9.5px] text-[var(--color-text-secondary)] font-tabular">
                          {pr.subtext.split("•")[0].trim()}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: CYCLING COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)] text-xs font-mono">
              <span className="text-[var(--color-cycling)] font-bold flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-cycling)]" />
                Cycling Milestones ({ridePrs.length})
              </span>
              <span className="text-[10.5px] font-mono text-[var(--color-text-muted)]">
                {rideDistanceKm.toFixed(1)} km Ingested
              </span>
            </div>

            {/* Cycling Hero Spotlight */}
            {heroRide ? (
              <Link
                href={heroRide.activity_id ? `/activities/${heroRide.activity_id}` : "#"}
                className="block p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)]/60 transition-all group relative shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[var(--color-text-secondary)] mb-1.5">
                  <span className="uppercase font-bold tracking-wider text-[var(--color-cycling)] flex items-center gap-1.5 text-[11px] truncate">
                    ★ Featured • {heroRide.category}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Calendar className="w-3 h-3" />
                    {formatDate(heroRide.achieved_date)}
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between gap-3">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono font-tabular text-[var(--color-cycling)] tracking-tight">
                      {heroRide.record_display}
                    </span>
                    {heroRide.subtext && (
                      <p className="text-[11px] font-mono text-[var(--color-text-secondary)] mt-1 font-medium line-clamp-1">
                        {heroRide.subtext}
                      </p>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-cycling)] group-hover:border-[var(--color-cycling)]/40 transition-colors shrink-0 shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-2 text-[10.5px] font-mono">
                  <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
                    {heroRide.activity_name || "Sesi Rekor Terverifikasi"}
                  </span>
                  <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-cycling)] transition-colors shrink-0 whitespace-nowrap flex items-center gap-0.5">
                    <span>Inspect Track</span>
                    <span>→</span>
                  </span>
                </div>
              </Link>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 text-center space-y-1.5">
                <Compass className="w-5 h-5 mx-auto text-[var(--color-text-muted)]" />
                <div className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
                  Belum Ada Rekor Sepeda Terverifikasi
                </div>
                <p className="text-[10px] font-mono text-[var(--color-text-muted)] leading-relaxed">
                  Sesi ride &gt;20 km atau rute tanjakan akan otomatis dihitung sebagai benchmark baru.
                </p>
              </div>
            )}

            {/* Secondary Cycling Benchmarks Rows */}
            {secondaryRides.length > 0 && (
              <div className="space-y-1.5">
                {secondaryRides.map((pr) => (
                  <Link
                    key={pr.id}
                    href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                    className="p-2.5 sm:p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70 hover:border-[var(--color-cycling)]/40 hover:bg-[var(--color-surface-muted)] transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-cycling)] shadow-2xs">
                        {getMetricIcon(pr.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-cycling)] transition-colors truncate">
                          {pr.category}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] truncate mt-0.5">
                          {pr.activity_name ? `${pr.activity_name} • ` : ""}{formatDate(pr.achieved_date)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono pl-2">
                      <div className="text-sm font-bold font-tabular text-[var(--color-cycling)]">
                        {pr.record_display}
                      </div>
                      {pr.subtext && (
                        <div className="text-[9.5px] text-[var(--color-text-secondary)] font-tabular">
                          {pr.subtext.split("•")[0].trim()}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: RUNNING FOCUS VIEW */}
      {activeTab === "run" && (
        <div className="space-y-3">
          {heroRun && (
            <Link
              href={heroRun.activity_id ? `/activities/${heroRun.activity_id}` : "#"}
              className="block p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-running)]/60 transition-all group relative shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-[var(--color-text-secondary)] mb-1.5">
                <span className="uppercase font-bold tracking-wider text-[var(--color-running)] flex items-center gap-1.5 text-[11px] truncate">
                  ★ Featured • {heroRun.category}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <Calendar className="w-3 h-3" />
                  {formatDate(heroRun.achieved_date)}
                </span>
              </div>

              <div className="my-2 flex items-baseline justify-between gap-3">
                <div>
                  <span className="text-2xl sm:text-3xl font-black font-mono font-tabular text-[var(--color-running)] tracking-tight">
                    {heroRun.record_display}
                  </span>
                  {heroRun.subtext && (
                    <p className="text-[11px] font-mono text-[var(--color-text-secondary)] mt-1 font-medium">
                      {heroRun.subtext}
                    </p>
                  )}
                </div>
                <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-running)] group-hover:border-[var(--color-running)]/40 transition-colors shrink-0 shadow-xs">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-2 text-[10.5px] font-mono">
                <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
                  {heroRun.activity_name || "Sesi Rekor Terverifikasi"}
                </span>
                <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-running)] transition-colors shrink-0 whitespace-nowrap flex items-center gap-0.5">
                  <span>Inspect Track</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          )}

          {secondaryRuns.length > 0 && (
            <div className="space-y-1.5">
              {secondaryRuns.map((pr) => (
                <Link
                  key={pr.id}
                  href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                  className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70 hover:border-[var(--color-running)]/40 hover:bg-[var(--color-surface-muted)] transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-running)] shadow-2xs">
                      {getMetricIcon(pr.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-running)] transition-colors truncate">
                        {pr.category}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--color-text-muted)] truncate mt-0.5">
                        {pr.activity_name ? `${pr.activity_name} • ` : ""}{formatDate(pr.achieved_date)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono pl-2">
                    <div className="text-sm font-bold font-tabular text-[var(--color-running)]">
                      {pr.record_display}
                    </div>
                    {pr.subtext && (
                      <div className="text-[9.5px] text-[var(--color-text-secondary)] font-tabular">
                        {pr.subtext.split("•")[0].trim()}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CYCLING FOCUS VIEW */}
      {activeTab === "ride" && (
        <div className="space-y-3">
          {heroRide ? (
            <Link
              href={heroRide.activity_id ? `/activities/${heroRide.activity_id}` : "#"}
              className="block p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)]/60 transition-all group relative shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-[var(--color-text-secondary)] mb-1.5">
                <span className="uppercase font-bold tracking-wider text-[var(--color-cycling)] flex items-center gap-1.5 text-[11px] truncate">
                  ★ Featured • {heroRide.category}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <Calendar className="w-3 h-3" />
                  {formatDate(heroRide.achieved_date)}
                </span>
              </div>

              <div className="my-2 flex items-baseline justify-between gap-3">
                <div>
                  <span className="text-2xl sm:text-3xl font-black font-mono font-tabular text-[var(--color-cycling)] tracking-tight">
                    {heroRide.record_display}
                  </span>
                  {heroRide.subtext && (
                    <p className="text-[11px] font-mono text-[var(--color-text-secondary)] mt-1 font-medium">
                      {heroRide.subtext}
                    </p>
                  )}
                </div>
                <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-cycling)] group-hover:border-[var(--color-cycling)]/40 transition-colors shrink-0 shadow-xs">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-2 text-[10.5px] font-mono">
                <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
                  {heroRide.activity_name || "Sesi Rekor Terverifikasi"}
                </span>
                <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-cycling)] transition-colors shrink-0 whitespace-nowrap flex items-center gap-0.5">
                  <span>Inspect Track</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 text-center space-y-2">
              <Compass className="w-6 h-6 mx-auto text-[var(--color-cycling)]" />
              <div className="text-xs font-mono font-semibold text-[var(--color-text-primary)]">
                Belum Ada Rekor Sepeda Terverifikasi
              </div>
              <p className="text-[11px] font-mono text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
                Sesi ride &gt;20 km atau rute tanjakan akan otomatis dihitung sebagai benchmark milestone baru.
              </p>
            </div>
          )}

          {secondaryRides.length > 0 && (
            <div className="space-y-1.5">
              {secondaryRides.map((pr) => (
                <Link
                  key={pr.id}
                  href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                  className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70 hover:border-[var(--color-cycling)]/40 hover:bg-[var(--color-surface-muted)] transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-cycling)] shadow-2xs">
                      {getMetricIcon(pr.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-cycling)] transition-colors truncate">
                        {pr.category}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--color-text-muted)] truncate mt-0.5">
                        {pr.activity_name ? `${pr.activity_name} • ` : ""}{formatDate(pr.achieved_date)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono pl-2">
                    <div className="text-sm font-bold font-tabular text-[var(--color-cycling)]">
                      {pr.record_display}
                    </div>
                    {pr.subtext && (
                      <div className="text-[9.5px] text-[var(--color-text-secondary)] font-tabular">
                        {pr.subtext.split("•")[0].trim()}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
