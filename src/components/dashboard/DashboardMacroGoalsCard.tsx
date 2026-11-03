import React from "react";
import Link from "next/link";
import { Target, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { FitnessGoal } from "@/types";

interface DashboardMacroGoalsCardProps {
  goals: FitnessGoal[];
}

export function DashboardMacroGoalsCard({
  goals,
}: DashboardMacroGoalsCardProps) {
  if (goals.length === 0) return null;

  const hasAchievedMilestone = goals.some(
    (g) => g.is_achieved || Number(g.current_value) >= Number(g.target_value)
  );

  return (
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--color-cycling)]" />
          <span>Active Target Objectives (Macro Milestones)</span>
        </h3>
        <Link
          href="/goals"
          className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-semibold hover:text-[var(--color-text-primary)] hover:border-[var(--color-cycling)]/60 transition-colors flex items-center gap-1"
        >
          <span>{goals.length} Sasaran</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* Progressive Unlock Gateway Banner when milestone meets criteria */}
      {hasAchievedMilestone && (
        <Link
          href="/goals"
          className="p-3 rounded-xl bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)] transition-all flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[var(--color-cycling)] shrink-0" />
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold text-[var(--color-cycling)] block truncate">
                🎯 Tonggak Sasaran Memenuhi Target!
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)] block truncate">
                Target lanjutan sepeda (Gran Fondo / 200 km) telah terbuka di halaman /goals
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--color-cycling)] text-[var(--color-canvas)] text-[10px] font-mono font-bold shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Buka &amp; Klaim</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      )}

      {/* Goal Items */}
      <div className="space-y-3">
        {goals.map((g) => {
          const currentNum = Number(g.current_value);
          const targetNum = Number(g.target_value);
          const pct = Math.min(100, Math.round((currentNum / targetNum) * 100));
          const isAchieved = g.is_achieved || pct >= 100;
          const isMeters = g.goal_type === "DISTANCE_MONTHLY";
          const isKm = g.unit === "km" || isMeters;

          const currentDisplay = isMeters
            ? `${(currentNum / 1000).toFixed(1)} km`
            : isKm
            ? `${currentNum.toFixed(1)} km`
            : `${currentNum} ${g.unit || "sessions"}`;

          const targetDisplay = isMeters
            ? `${(targetNum / 1000).toFixed(0)} km`
            : isKm
            ? `${targetNum.toFixed(1)} km`
            : `${targetNum} ${g.unit || "sessions"}`;

          const is100k = g.title.toLowerCase().includes("100");
          const isMarathon = g.title.toLowerCase().includes("marathon");

          const colorToken = is100k
            ? "var(--color-cycling)"
            : isMarathon
            ? "var(--color-running)"
            : "var(--color-endurance)";

          return (
            <Link
              key={g.id}
              href="/goals"
              className="block p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 hover:border-[var(--color-cycling)]/60 transition-all duration-200 space-y-2 hover:bg-[var(--color-surface-muted)] group"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--color-text-primary)] font-semibold flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colorToken }}
                  />
                  <span className="group-hover:text-[var(--color-cycling)] transition-colors">
                    {g.title}
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  {isAchieved && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] font-bold">
                      TERCAPAI
                    </span>
                  )}
                  <span
                    className="font-tabular font-extrabold"
                    style={{ color: isAchieved ? "var(--color-cycling)" : colorToken }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[var(--color-surface-card)] rounded-full overflow-hidden border border-[var(--color-border)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: isAchieved ? "var(--color-cycling)" : colorToken,
                    width: `${pct}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] pt-0.5">
                <span>
                  Tercapai:{" "}
                  <strong className="text-[var(--color-text-secondary)] font-tabular">{currentDisplay}</strong>
                </span>
                <span>
                  Target:{" "}
                  <strong className="text-[var(--color-text-primary)] font-tabular">{targetDisplay}</strong>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Link to /goals */}
      <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
          Manajemen Sasaran Berjenjang
        </span>
        <Link
          href="/goals"
          className="text-xs font-mono font-bold text-[var(--color-cycling)] hover:underline flex items-center gap-1"
        >
          <span>Buka Sasaran &amp; Target</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
