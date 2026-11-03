import React from "react";
import { Target } from "lucide-react";
import { FitnessGoal } from "@/types";

interface DashboardMacroGoalsCardProps {
  goals: FitnessGoal[];
}

export function DashboardMacroGoalsCard({
  goals,
}: DashboardMacroGoalsCardProps) {
  if (goals.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--color-cycling)]" />
          <span>Active Target Objectives (Macro Milestones)</span>
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-semibold">
          {goals.length} Sasaran
        </span>
      </div>

      <div className="space-y-3">
        {goals.map((g) => {
          const currentNum = Number(g.current_value);
          const targetNum = Number(g.target_value);
          const pct = Math.min(100, Math.round((currentNum / targetNum) * 100));
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
            <div
              key={g.id}
              className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 hover:border-[var(--color-border)] transition-all duration-200 space-y-2 hover:bg-[var(--color-surface-muted)]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--color-text-primary)] font-semibold flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colorToken }}
                  />
                  <span>{g.title}</span>
                </span>
                <span
                  className="font-tabular font-extrabold"
                  style={{ color: colorToken }}
                >
                  {pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[var(--color-surface-card)] rounded-full overflow-hidden border border-[var(--color-border)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: colorToken,
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
