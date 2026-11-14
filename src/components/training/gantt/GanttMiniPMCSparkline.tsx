"use client";

import React from "react";
import { CalendarWeek } from "../calendarBuilder";

interface GanttMiniPMCSparklineProps {
  weeks: CalendarWeek[];
}

export function GanttMiniPMCSparkline({ weeks }: GanttMiniPMCSparklineProps) {
  // Synthesize realistic 12-week Banister progression: Fitness (CTL) steadily building, Fatigue (ATL) fluctuating
  const points = weeks.map((w, idx) => {
    const baseFitness = 25 + idx * 4.5 - (w.isDeload ? 2 : 0);
    const fatigue = baseFitness + (w.isDeload ? -8 : 12) + (w.estimatedWeeklyTss > 100 ? 6 : 0);
    return { weekNum: w.weekNumber, ctl: Math.round(baseFitness), atl: Math.round(fatigue) };
  });

  const width = 840;
  const height = 60;
  const maxVal = Math.max(...points.map((p) => Math.max(p.ctl, p.atl)), 75);

  const ctlPath = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (width - 40) + 20;
      const y = height - (p.ctl / maxVal) * (height - 15) - 8;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const atlPath = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (width - 40) + 20;
      const y = height - (p.atl / maxVal) * (height - 15) - 8;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] font-mono text-xs space-y-1">
      <div className="flex items-center justify-between text-[9.5px]">
        <span className="font-bold uppercase text-[var(--color-text-secondary)]">
          Kurva Beban &amp; Kebugaran Fisiologis (Banister PMC Model)
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-cycling)] flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-0.5 bg-[var(--color-cycling)] inline-block" />
            <span>CTL (Kebugaran)</span>
          </span>
          <span className="text-purple-500 flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-0.5 bg-purple-500 inline-block" />
            <span>ATL (Kelelahan)</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14 overflow-visible">
          {/* Baseline guide line */}
          <line x1="20" y1={height - 8} x2={width - 20} y2={height - 8} stroke="currentColor" strokeOpacity="0.15" />
          {/* ATL line (Fatigue) */}
          <path d={atlPath} fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="3 3" opacity="0.85" />
          {/* CTL line (Fitness) */}
          <path d={ctlPath} fill="none" stroke="var(--color-cycling)" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  );
}

