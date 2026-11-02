"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PersonalRecord } from "@/types";
import { formatDate } from "@/lib/formatters";
import { Trophy, ChevronRight, Calendar, ArrowUpRight } from "lucide-react";

interface PersonalRecordsDeckProps {
  prs: PersonalRecord[];
}

export function PersonalRecordsDeck({ prs }: PersonalRecordsDeckProps) {
  const [selectedSport, setSelectedSport] = useState<"All" | "Run" | "Ride">("All");

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

  const filteredPrs = useMemo(() => {
    if (selectedSport === "Run") return runPrs;
    if (selectedSport === "Ride") return ridePrs;
    return prs;
  }, [selectedSport, prs, runPrs, ridePrs]);

  if (!prs || prs.length === 0) return null;

  return (
    <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3.5">
      {/* Deck Header & Sport Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#1F2430]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-center text-[#D4FF00]">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5] flex items-center gap-1.5">
              Personal Records (PR) Benchmarks
            </h3>
            <span className="text-[10px] font-mono text-[#5A6272] block">
              Validated Multi-Sport Best Performances
            </span>
          </div>
        </div>

        {/* Sport Segmented Controls */}
        <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[10px] font-mono self-start sm:self-auto">
          <button
            onClick={() => setSelectedSport("All")}
            className={`px-2 py-0.5 rounded-sm transition-colors font-medium ${
              selectedSport === "All"
                ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
                : "text-[#9BA3AF] hover:text-white"
            }`}
          >
            All ({prs.length})
          </button>
          <button
            onClick={() => setSelectedSport("Run")}
            className={`px-2 py-0.5 rounded-sm transition-colors font-medium flex items-center gap-1 ${
              selectedSport === "Run"
                ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40 shadow-sm"
                : "text-[#9BA3AF] hover:text-[#D4FF00]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-none bg-[#D4FF00]" />
            Run ({runPrs.length})
          </button>
          <button
            onClick={() => setSelectedSport("Ride")}
            className={`px-2 py-0.5 rounded-sm transition-colors font-medium flex items-center gap-1 ${
              selectedSport === "Ride"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-sm"
                : "text-[#9BA3AF] hover:text-[#00F0FF]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-none bg-[#00F0FF]" />
            Ride ({ridePrs.length})
          </button>
        </div>
      </div>

      {/* PR Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredPrs.map((pr) => {
          const isRun = (pr.sport_type || "").toLowerCase().includes("run");
          const accentColor = isRun ? "#D4FF00" : "#00F0FF";
          const borderHover = isRun ? "hover:border-[#D4FF00]/50" : "hover:border-[#00F0FF]/50";

          const cardContent = (
            <div
              className={`p-3 rounded-sm bg-[#161922] border border-[#1F2430] ${borderHover} transition-all flex flex-col justify-between h-full group relative`}
            >
              {/* Top row: Sport pill & category */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-mono text-[#9BA3AF] truncate uppercase font-semibold">
                  {pr.category}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-none uppercase shrink-0 ${
                    isRun
                      ? "bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/30"
                      : "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30"
                  }`}
                >
                  {isRun ? "RUN" : "RIDE"}
                </span>
              </div>

              {/* Main Metric Value */}
              <div className="my-1">
                <span
                  className="text-lg font-bold font-mono font-tabular tracking-tight block"
                  style={{ color: accentColor }}
                >
                  {pr.record_display}
                </span>
              </div>

              {/* Bottom Metadata: Activity Link & Achieved Date */}
              <div className="pt-2 border-t border-[#1F2430]/60 mt-1 flex flex-col gap-1 text-[10px] font-mono">
                {pr.activity_name && (
                  <div className="text-[#F0F2F5] font-medium truncate flex items-center justify-between group-hover:text-white">
                    <span className="truncate">{pr.activity_name}</span>
                    {pr.activity_id && (
                      <ArrowUpRight className="w-3 h-3 text-[#5A6272] group-hover:text-white shrink-0 ml-1 transition-colors" />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 text-[#5A6272]">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{formatDate(pr.achieved_date)}</span>
                </div>
              </div>
            </div>
          );

          if (pr.activity_id) {
            return (
              <Link
                key={pr.id}
                href={`/activities/${pr.activity_id}`}
                className="block focus:outline-none"
              >
                {cardContent}
              </Link>
            );
          }

          return <div key={pr.id}>{cardContent}</div>;
        })}
      </div>
    </div>
  );
}
