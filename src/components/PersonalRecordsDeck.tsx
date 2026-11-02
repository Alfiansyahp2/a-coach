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
    <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-4">
      {/* Deck Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2430]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#161922] border border-[#2D3547] flex items-center justify-center text-[#D4FF00] shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
                Personal Records & Benchmarks
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-none bg-[#090A0F] text-[#00F0FF] border border-[#1F2430]">
                8 Verified
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#5A6272] block">
              Dual-Discipline Validated Athletic Telemetry
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[10px] font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("split")}
            className={`px-2.5 py-1 rounded-sm transition-colors font-semibold ${
              activeTab === "split"
                ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
                : "text-[#9BA3AF] hover:text-white"
            }`}
          >
            SPLIT MATRIX
          </button>
          <button
            onClick={() => setActiveTab("run")}
            className={`px-2.5 py-1 rounded-sm transition-colors font-semibold flex items-center gap-1.5 ${
              activeTab === "run"
                ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40 shadow-sm"
                : "text-[#9BA3AF] hover:text-[#D4FF00]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-none bg-[#D4FF00]" />
            RUN ({runPrs.length})
          </button>
          <button
            onClick={() => setActiveTab("ride")}
            className={`px-2.5 py-1 rounded-sm transition-colors font-semibold flex items-center gap-1.5 ${
              activeTab === "ride"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-sm"
                : "text-[#9BA3AF] hover:text-[#00F0FF]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-none bg-[#00F0FF]" />
            RIDE ({ridePrs.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: DUAL-DISCIPLINE SPLIT MATRIX (Default)             */}
      {/* ========================================================= */}
      {activeTab === "split" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: RUNNING COLUMN (Volt #D4FF00) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60 text-[10px] font-mono">
              <span className="text-[#D4FF00] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-none bg-[#D4FF00]" />
                Running Milestones
              </span>
              <span className="text-[#5A6272]">65.1 km Ingested</span>
            </div>

            {/* Running Hero Spotlight */}
            {heroRun && (
              <Link
                href={heroRun.activity_id ? `/activities/${heroRun.activity_id}` : "#"}
                className="block p-3 rounded-sm bg-[#161922] border border-[#1F2430] border-t-2 border-t-[#D4FF00] hover:border-[#D4FF00]/60 transition-all group relative"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9BA3AF] mb-1">
                  <span className="uppercase font-semibold tracking-wider text-[#D4FF00]">
                    ★ Featured • {heroRun.category}
                  </span>
                  <span className="text-[9px] font-mono text-[#5A6272] flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatDate(heroRun.achieved_date)}
                  </span>
                </div>

                <div className="my-1.5 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono font-tabular text-[#D4FF00] tracking-tight">
                    {heroRun.record_display}
                  </span>
                  <div className="w-6 h-6 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center text-[#5A6272] group-hover:text-[#D4FF00] group-hover:border-[#D4FF00]/40 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {heroRun.subtext && (
                  <p className="text-[11px] font-mono text-[#9BA3AF] mb-2 font-medium">
                    {heroRun.subtext}
                  </p>
                )}

                <div className="pt-2 border-t border-[#1F2430]/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#F0F2F5] font-semibold truncate group-hover:text-white">
                    {heroRun.activity_name || "Verified Session"}
                  </span>
                  <span className="text-[#5A6272] shrink-0">Inspect Track →</span>
                </div>
              </Link>
            )}

            {/* Secondary Running Benchmarks Rows */}
            <div className="space-y-1.5">
              {secondaryRuns.map((pr) => (
                <Link
                  key={pr.id}
                  href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                  className="p-2.5 rounded-sm bg-[#0E1118] border border-[#1F2430] hover:border-[#2D3547] hover:bg-[#141822] transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5 truncate mr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#D4FF00]">{getMetricIcon(pr.category)}</span>
                      <span className="text-[11px] font-mono font-medium text-[#F0F2F5] truncate">
                        {pr.category}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#5A6272] block truncate">
                      {pr.activity_name} • {formatDate(pr.achieved_date)}
                    </span>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="text-sm font-bold font-tabular text-[#D4FF00]">
                      {pr.record_display}
                    </div>
                    {pr.subtext && (
                      <div className="text-[9px] text-[#9BA3AF] font-tabular">
                        {pr.subtext.split("•")[0]}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: CYCLING COLUMN (Cyan #00F0FF) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60 text-[10px] font-mono">
              <span className="text-[#00F0FF] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-none bg-[#00F0FF]" />
                Cycling Milestones
              </span>
              <span className="text-[#5A6272]">566.4 km Ingested</span>
            </div>

            {/* Cycling Hero Spotlight */}
            {heroRide && (
              <Link
                href={heroRide.activity_id ? `/activities/${heroRide.activity_id}` : "#"}
                className="block p-3 rounded-sm bg-[#161922] border border-[#1F2430] border-t-2 border-t-[#00F0FF] hover:border-[#00F0FF]/60 transition-all group relative"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9BA3AF] mb-1">
                  <span className="uppercase font-semibold tracking-wider text-[#00F0FF]">
                    ★ Featured • {heroRide.category}
                  </span>
                  <span className="text-[9px] font-mono text-[#5A6272] flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatDate(heroRide.achieved_date)}
                  </span>
                </div>

                <div className="my-1.5 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono font-tabular text-[#00F0FF] tracking-tight">
                    {heroRide.record_display}
                  </span>
                  <div className="w-6 h-6 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center text-[#5A6272] group-hover:text-[#00F0FF] group-hover:border-[#00F0FF]/40 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {heroRide.subtext && (
                  <p className="text-[11px] font-mono text-[#9BA3AF] mb-2 font-medium">
                    {heroRide.subtext}
                  </p>
                )}

                <div className="pt-2 border-t border-[#1F2430]/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#F0F2F5] font-semibold truncate group-hover:text-white">
                    {heroRide.activity_name || "Verified Session"}
                  </span>
                  <span className="text-[#5A6272] shrink-0">Inspect Track →</span>
                </div>
              </Link>
            )}

            {/* Secondary Cycling Benchmarks Rows */}
            <div className="space-y-1.5">
              {secondaryRides.map((pr) => (
                <Link
                  key={pr.id}
                  href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                  className="p-2.5 rounded-sm bg-[#0E1118] border border-[#1F2430] hover:border-[#2D3547] hover:bg-[#141822] transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5 truncate mr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#00F0FF]">{getMetricIcon(pr.category)}</span>
                      <span className="text-[11px] font-mono font-medium text-[#F0F2F5] truncate">
                        {pr.category}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#5A6272] block truncate">
                      {pr.activity_name} • {formatDate(pr.achieved_date)}
                    </span>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="text-sm font-bold font-tabular text-[#00F0FF]">
                      {pr.record_display}
                    </div>
                    {pr.subtext && (
                      <div className="text-[9px] text-[#9BA3AF] font-tabular">
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

      {/* ========================================================= */}
      {/* VIEW 2: RUNNING FOCUS VIEW                                 */}
      {/* ========================================================= */}
      {activeTab === "run" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {runPrs.map((pr, idx) => (
              <Link
                key={pr.id}
                href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                className={`p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#D4FF00]/60 transition-all flex flex-col justify-between group relative ${
                  idx === 0 ? "border-t-2 border-t-[#D4FF00]" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#9BA3AF] mb-1">
                    <span className="uppercase font-semibold tracking-wider text-[#F0F2F5] flex items-center gap-1.5">
                      <span className="text-[#D4FF00]">{getMetricIcon(pr.category)}</span>
                      {pr.category}
                    </span>
                    <span className="text-[9px] font-mono text-[#5A6272]">
                      {formatDate(pr.achieved_date)}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className="text-xl font-bold font-mono font-tabular text-[#D4FF00] tracking-tight">
                      {pr.record_display}
                    </span>
                    {pr.subtext && (
                      <span className="block text-[11px] font-mono text-[#9BA3AF] mt-0.5">
                        {pr.subtext}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1F2430]/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#F0F2F5] font-semibold truncate group-hover:text-white">
                    {pr.activity_name || "Verified Run Session"}
                  </span>
                  <div className="w-5 h-5 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center text-[#5A6272] group-hover:text-[#D4FF00] group-hover:border-[#D4FF00]/40 transition-colors shrink-0 ml-1">
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: CYCLING FOCUS VIEW                                 */}
      {/* ========================================================= */}
      {activeTab === "ride" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ridePrs.map((pr, idx) => (
              <Link
                key={pr.id}
                href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
                className={`p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#00F0FF]/60 transition-all flex flex-col justify-between group relative ${
                  idx === 0 ? "border-t-2 border-t-[#00F0FF]" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#9BA3AF] mb-1">
                    <span className="uppercase font-semibold tracking-wider text-[#F0F2F5] flex items-center gap-1.5">
                      <span className="text-[#00F0FF]">{getMetricIcon(pr.category)}</span>
                      {pr.category}
                    </span>
                    <span className="text-[9px] font-mono text-[#5A6272]">
                      {formatDate(pr.achieved_date)}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className="text-xl font-bold font-mono font-tabular text-[#00F0FF] tracking-tight">
                      {pr.record_display}
                    </span>
                    {pr.subtext && (
                      <span className="block text-[11px] font-mono text-[#9BA3AF] mt-0.5">
                        {pr.subtext}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1F2430]/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#F0F2F5] font-semibold truncate group-hover:text-white">
                    {pr.activity_name || "Verified Ride Session"}
                  </span>
                  <div className="w-5 h-5 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center text-[#5A6272] group-hover:text-[#00F0FF] group-hover:border-[#00F0FF]/40 transition-colors shrink-0 ml-1">
                    <ArrowUpRight className="w-3 h-3" />
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
