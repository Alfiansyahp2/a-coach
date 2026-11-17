"use client";

import React from "react";
import Link from "next/link";
import { FitnessGoal } from "@/types";

interface DashboardSecondaryGoalItemProps {
  goal: FitnessGoal;
  formatGoalMetric: (val: number | string, unit?: string, isTarget?: boolean) => string;
  getGoalColor: (title: string) => string;
}

export function DashboardSecondaryGoalItem({
  goal,
  formatGoalMetric,
  getGoalColor,
}: DashboardSecondaryGoalItemProps) {
  const cur = Number(goal.current_value);
  const tgt = Number(goal.target_value);
  const pct = Math.min(100, Math.round((cur / Math.max(1, tgt)) * 100));
  const isAchieved = goal.is_achieved || pct >= 100;
  const colorToken = getGoalColor(goal.title);

  return (
    <Link
      href="/goals"
      className="block p-3 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)]/60 hover:border-[var(--color-cycling)]/60 transition-all duration-200 space-y-1.5 hover:bg-[var(--color-surface-muted)] group font-mono"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-primary)] font-semibold flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorToken }} />
          <span className="group-hover:text-[var(--color-cycling)] transition-colors truncate">
            {goal.title}
          </span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isAchieved && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] font-bold">
              TERCAPAI
            </span>
          )}
          <span
            className="font-tabular font-extrabold text-[11px]"
            style={{ color: isAchieved ? "var(--color-cycling)" : colorToken }}
          >
            {pct}%
          </span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-[var(--color-surface-card)] rounded-full overflow-hidden border border-[var(--color-border)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            backgroundColor: isAchieved ? "var(--color-cycling)" : colorToken,
            width: `${pct}%`,
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
        <span>
          Tercapai:{" "}
          <strong className="text-[var(--color-text-secondary)] font-tabular">
            {formatGoalMetric(cur, goal.unit, false)}
          </strong>
        </span>
        <span>
          Target:{" "}
          <strong className="text-[var(--color-text-primary)] font-tabular">
            {formatGoalMetric(tgt, goal.unit, true)}
          </strong>
        </span>
      </div>
    </Link>
  );
}
