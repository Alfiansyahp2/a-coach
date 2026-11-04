"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PersonalRecord } from "@/types";
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
}

export function PersonalRecordsDeck({ prs }: PersonalRecordsDeckProps) {
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
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Deck Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] shadow-xs">
            <Trophy className="w-4 h-4 text-[var(--color-running)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)]">
                Personal Records &amp; Benchmarks
              </h3>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-bold">
                8 Terverifikasi
              </span>
            </div>
            <span className="text-[10.5px] font-mono text-[var(--color-text-muted)] block">
              Dual-Discipline Validated Athletic Telemetry
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("split")}
            className={`px-3 py-1 rounded-md transition-all font-semibold ${
              activeTab === "split"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            SPLIT MATRIX
          </button>
          <button
            onClick={() => setActiveTab("run")}
            className={`px-3 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              activeTab === "run"
                ? "bg-[var(--color-surface-card)] text-[var(--color-running)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-running)]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-running)]" />
            RUN ({runPrs.length})
          </button>
          <button
            onClick={() => setActiveTab("ride")}
            className={`px-3 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              activeTab === "ride"
                ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-cycling)]" />
            RIDE ({ridePrs.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: DUAL-DISCIPLINE SPLIT MATRIX */}
      {activeTab === "split" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: RUNNING COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)] text-xs font-mono">
              <span className="text-[var(--color-running)] font-bold flex items-center gap-2 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[var(--color-running)]" />
                Running Milestones
              </span>
              <span className="text-[var(--color-text-muted)]">65.1 km Ingested</span>
            </div>

            {/* Running Hero Spotlight */}
            {heroRun && (
              <Link
                href={heroRun.activity_id ? `/activities/${heroRun.activity_id}` : "#"}
                className="block p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-running)]/60 transition-all group relative shadow-xs"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)] mb-1.5">
                  <span className="uppercase font-bold tracking-wider text-[var(--color-running)] flex items-center gap-1">
                    ★ Featured • {heroRun.category}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(heroRun.achieved_date)}
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black font-mono font-tabular text-[var(--color-running)] tracking-tight">
                    {heroRun.record_display}
                  </span>
                  <div className="w-7 h-7 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-running)] group-hover:border-[var(--color-running)]/40 transition-colors shadow-xs">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {heroRun.subtext && (
                  <p className="text-xs font-mono text-[var(--color-text-secondary)] mb-2.5 font-medium">
                    {heroRun.subtext}
                  </p>
                )}

                <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
                    {heroRun.activity_name || "Verified Session"}
                  </span>
                  <span className="text-[var(--color-text-muted)] shrink-0">Inspect Track →</span>
                </div>
              </Link>
            )}

            {/* Secondary Running Benchmarks Rows */}
            <div className="space-y-2">
              {secondaryRuns.map((pr) => (
                <Link
                  key={pr.id}
                  href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                  className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 hover:border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5 truncate mr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-running)]">{getMetricIcon(pr.category)}</span>
                      <span className="text-xs font-mono font-semibold text-[var(--color-text-primary)] truncate">
                        {pr.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] block truncate">
                      {pr.activity_name} • {formatDate(pr.achieved_date)}
                    </span>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="text-sm font-bold font-tabular text-[var(--color-running)]">
                      {pr.record_display}
                    </div>
                    {pr.subtext && (
                      <div className="text-[10px] text-[var(--color-text-secondary)] font-tabular">
                        {pr.subtext.split("•")[0]}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: CYCLING COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)] text-xs font-mono">
              <span className="text-[var(--color-cycling)] font-bold flex items-center gap-2 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[var(--color-cycling)]" />
                Cycling Milestones
              </span>
              <span className="text-[var(--color-text-muted)]">566.4 km Ingested</span>
            </div>

            {/* Cycling Hero Spotlight */}
            {heroRide && (
              <Link
                href={heroRide.activity_id ? `/activities/${heroRide.activity_id}` : "#"}
                className="block p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)]/60 transition-all group relative shadow-xs"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)] mb-1.5">
                  <span className="uppercase font-bold tracking-wider text-[var(--color-cycling)] flex items-center gap-1">
                    ★ Featured • {heroRide.category}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(heroRide.achieved_date)}
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black font-mono font-tabular text-[var(--color-cycling)] tracking-tight">
                    {heroRide.record_display}
                  </span>
                  <div className="w-7 h-7 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-cycling)] group-hover:border-[var(--color-cycling)]/40 transition-colors shadow-xs">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {heroRide.subtext && (
                  <p className="text-xs font-mono text-[var(--color-text-secondary)] mb-2.5 font-medium">
                    {heroRide.subtext}
                  </p>
                )}

                <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
                    {heroRide.activity_name || "Verified Session"}
                  </span>
                  <span className="text-[var(--color-text-muted)] shrink-0">Inspect Track →</span>
                </div>
              </Link>
            )}

            {/* Secondary Cycling Benchmarks Rows */}
            <div className="space-y-2">
              {secondaryRides.map((pr) => (
                <Link
                  key={pr.id}
                  href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                  className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 hover:border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5 truncate mr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-cycling)]">{getMetricIcon(pr.category)}</span>
                      <span className="text-xs font-mono font-semibold text-[var(--color-text-primary)] truncate">
                        {pr.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] block truncate">
                      {pr.activity_name} • {formatDate(pr.achieved_date)}
                    </span>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="text-sm font-bold font-tabular text-[var(--color-cycling)]">
                      {pr.record_display}
                    </div>
                    {pr.subtext && (
                      <div className="text-[10px] text-[var(--color-text-secondary)] font-tabular">
                        {pr.subtext.split("•")[0]}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RUNNING FOCUS VIEW */}
      {activeTab === "run" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {runPrs.map((pr, idx) => (
              <Link
                key={pr.id}
                href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                className={`p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-running)]/50 transition-all flex flex-col justify-between group relative shadow-xs ${
                  idx === 0 ? "border-[var(--color-running)]/40" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)] mb-1.5">
                    <span className="uppercase font-bold tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
                      <span className="text-[var(--color-running)]">{getMetricIcon(pr.category)}</span>
                      {pr.category}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                      {formatDate(pr.achieved_date)}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className="text-2xl font-bold font-mono font-tabular text-[var(--color-running)] tracking-tight">
                      {pr.record_display}
                    </span>
                    {pr.subtext && (
                      <span className="block text-xs font-mono text-[var(--color-text-secondary)] mt-1">
                        {pr.subtext}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
                    {pr.activity_name || "Verified Run Session"}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-running)] group-hover:border-[var(--color-running)]/40 transition-colors shrink-0 ml-1 shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CYCLING FOCUS VIEW */}
      {activeTab === "ride" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ridePrs.map((pr, idx) => (
              <Link
                key={pr.id}
                href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                className={`p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)]/50 transition-all flex flex-col justify-between group relative shadow-xs ${
                  idx === 0 ? "border-[var(--color-cycling)]/40" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)] mb-1.5">
                    <span className="uppercase font-bold tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
                      <span className="text-[var(--color-cycling)]">{getMetricIcon(pr.category)}</span>
                      {pr.category}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                      {formatDate(pr.achieved_date)}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className="text-2xl font-bold font-mono font-tabular text-[var(--color-cycling)] tracking-tight">
                      {pr.record_display}
                    </span>
                    {pr.subtext && (
                      <span className="block text-xs font-mono text-[var(--color-text-secondary)] mt-1">
                        {pr.subtext}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
                    {pr.activity_name || "Verified Ride Session"}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-cycling)] group-hover:border-[var(--color-cycling)]/40 transition-colors shrink-0 ml-1 shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
