"use client";

import React, { useState, useMemo } from "react";
import { PersonalRecord, Activity } from "@/types";
import { Trophy, Compass } from "lucide-react";
import { PersonalRecordsHeroCard } from "./PersonalRecordsHeroCard";
import { PersonalRecordsListItem } from "./PersonalRecordsListItem";

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

  const heroRun = runPrs.find((p) => p.category.includes("5K")) || runPrs[0];
  const secondaryRuns = runPrs.filter((p) => p.id !== heroRun?.id);

  const heroRide = ridePrs.find((p) => p.category.includes("Longest")) || ridePrs[0];
  const secondaryRides = ridePrs.filter((p) => p.id !== heroRide?.id);

  return (
    <div className="@container rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-4 shadow-xs font-mono">
      {/* Deck Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] shrink-0 shadow-xs">
            <Trophy className="w-4 h-4 text-[var(--color-running)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                Personal Records &amp; Benchmarks
              </h3>
              <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-bold whitespace-nowrap">
                {prs.length} Terverifikasi
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] block truncate mt-0.5">
              Dual-Discipline Validated Athletic Telemetry
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[10.5px] shrink-0 self-start sm:self-auto">
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
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)] text-xs">
              <span className="text-[var(--color-running)] font-bold flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-running)]" />
                Running Milestones ({runPrs.length})
              </span>
              <span className="text-[10.5px] text-[var(--color-text-muted)] font-tabular">
                {runDistanceKm.toFixed(1)} km Ingested
              </span>
            </div>
            {heroRun && <PersonalRecordsHeroCard pr={heroRun} isRun={true} />}
            {secondaryRuns.length > 0 && (
              <div className="space-y-1.5">
                {secondaryRuns.map((pr) => (
                  <PersonalRecordsListItem key={pr.id} pr={pr} isRun={true} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: CYCLING COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)] text-xs">
              <span className="text-[var(--color-cycling)] font-bold flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-cycling)]" />
                Cycling Milestones ({ridePrs.length})
              </span>
              <span className="text-[10.5px] text-[var(--color-text-muted)] font-tabular">
                {rideDistanceKm.toFixed(1)} km Ingested
              </span>
            </div>
            {heroRide ? (
              <PersonalRecordsHeroCard pr={heroRide} isRun={false} />
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 text-center space-y-1.5">
                <Compass className="w-5 h-5 mx-auto text-[var(--color-text-muted)]" />
                <div className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Belum Ada Rekor Sepeda Terverifikasi
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                  Sesi ride &gt;20 km akan otomatis dihitung sebagai benchmark baru.
                </p>
              </div>
            )}
            {secondaryRides.length > 0 && (
              <div className="space-y-1.5">
                {secondaryRides.map((pr) => (
                  <PersonalRecordsListItem key={pr.id} pr={pr} isRun={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: RUNNING FOCUS VIEW */}
      {activeTab === "run" && (
        <div className="space-y-3">
          {heroRun && <PersonalRecordsHeroCard pr={heroRun} isRun={true} />}
          {secondaryRuns.length > 0 && (
            <div className="space-y-1.5">
              {secondaryRuns.map((pr) => (
                <PersonalRecordsListItem key={pr.id} pr={pr} isRun={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CYCLING FOCUS VIEW */}
      {activeTab === "ride" && (
        <div className="space-y-3">
          {heroRide && <PersonalRecordsHeroCard pr={heroRide} isRun={false} />}
          {secondaryRides.length > 0 && (
            <div className="space-y-1.5">
              {secondaryRides.map((pr) => (
                <PersonalRecordsListItem key={pr.id} pr={pr} isRun={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
