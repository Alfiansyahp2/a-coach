"use client";

import React, { useState } from "react";
import { PMCResponse } from "@/types";
import { Activity, Zap, TrendingUp, AlertCircle, ShieldCheck } from "lucide-react";

interface PerformanceManagementChartProps {
  pmc: PMCResponse | null;
  isLoading?: boolean;
}

export function PerformanceManagementChart({
  pmc,
  isLoading = false,
}: PerformanceManagementChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading || !pmc) {
    return (
      <div className="p-6 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] animate-pulse space-y-4 font-mono">
        <div className="h-4 bg-[var(--color-surface-muted)] rounded w-1/3" />
        <div className="h-32 bg-[var(--color-surface-muted)] rounded" />
      </div>
    );
  }

  const { data_points, current_ctl, current_atl, current_tsb, current_zone, ewma_acwr } = pmc;

  // Max value calculation for SVG scaling
  const maxLoad = Math.max(
    50,
    ...data_points.map((p) => Math.max(p.ctl, p.atl, p.day_load))
  );
  const minTsb = Math.min(-30, ...data_points.map((p) => p.tsb));
  const maxTsb = Math.max(30, ...data_points.map((p) => p.tsb));

  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 20;
  const paddingY = 20;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const pointsCount = data_points.length;
  const getX = (idx: number) =>
    paddingX + (idx / Math.max(1, pointsCount - 1)) * chartW;
  const getYLoad = (val: number) =>
    paddingY + chartH - (Math.max(0, val) / maxLoad) * chartH;

  // SVG Path generation
  const ctlPath = data_points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYLoad(p.ctl).toFixed(1)}`)
    .join(" ");

  const atlPath = data_points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYLoad(p.atl).toFixed(1)}`)
    .join(" ");

  const hoveredPoint = hoveredIndex !== null ? data_points[hoveredIndex] : data_points[data_points.length - 1];

  return (
    <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs font-mono space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--color-cycling)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Performance Management Chart (Banister Impulse Model)
            </h3>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Model Fisiologi Banister: Fitness (CTL), Fatigue (ATL), dan Form/Freshness (TSB)
          </p>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border font-tabular uppercase self-start sm:self-auto bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30">
          Status: {current_zone.replace(/_/g, " ")}
        </span>
      </div>

      {/* 4 Metric Telemetry Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] block">Fitness (CTL 42d)</span>
          <span className="text-xl font-bold font-tabular text-[var(--color-cycling)]">
            {current_ctl}
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] block mt-0.5">Kebugaran Fondasi</span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] block">Fatigue (ATL 7d)</span>
          <span className="text-xl font-bold font-tabular text-[var(--color-running)]">
            {current_atl}
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] block mt-0.5">Kelelahan Akut</span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] block">Form (TSB)</span>
          <span
            className={`text-xl font-bold font-tabular ${
              current_tsb < -25
                ? "text-[var(--color-alert-amber)]"
                : current_tsb > 10
                ? "text-[var(--color-cycling)]"
                : "text-[var(--color-text-primary)]"
            }`}
          >
            {current_tsb > 0 ? `+${current_tsb}` : current_tsb}
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] block mt-0.5">Kesegaran Atlet</span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] block">EWMA ACWR</span>
          <span className="text-xl font-bold font-tabular text-[var(--color-text-primary)]">
            {ewma_acwr}x
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] block mt-0.5">Rasio Beban Akut:Kronis</span>
        </div>
      </div>

      {/* SVG Interactive Curve */}
      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-36 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="var(--color-border)"
            strokeDasharray="2 4"
            opacity={0.4}
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH}
            x2={svgWidth - paddingX}
            y2={paddingY + chartH}
            stroke="var(--color-border)"
            opacity={0.6}
          />

          {/* Daily Load Bars */}
          {data_points.map((p, i) => {
            if (p.day_load <= 0) return null;
            const barH = (p.day_load / maxLoad) * chartH * 0.7;
            return (
              <rect
                key={`bar-${i}`}
                x={getX(i) - 2}
                y={paddingY + chartH - barH}
                width={4}
                height={barH}
                fill="var(--color-text-muted)"
                opacity={0.25}
                rx={1}
              />
            );
          })}

          {/* CTL Curve (Fitness) */}
          <path d={ctlPath} fill="none" stroke="var(--color-cycling)" strokeWidth="2.5" />

          {/* ATL Curve (Fatigue) */}
          <path d={atlPath} fill="none" stroke="var(--color-running)" strokeWidth="1.8" strokeDasharray="4 2" />

          {/* Invisible hover trigger zones */}
          {data_points.map((p, i) => (
            <rect
              key={`trig-${i}`}
              x={getX(i) - chartW / (pointsCount * 2)}
              y={0}
              width={chartW / pointsCount}
              height={svgHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            />
          ))}

          {/* Hover indicator dot */}
          {hoveredIndex !== null && (
            <>
              <line
                x1={getX(hoveredIndex)}
                y1={paddingY}
                x2={getX(hoveredIndex)}
                y2={paddingY + chartH}
                stroke="var(--color-text-muted)"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoveredIndex)}
                cy={getYLoad(data_points[hoveredIndex].ctl)}
                r={4}
                fill="var(--color-cycling)"
              />
            </>
          )}
        </svg>

        {/* Legend & Hover tooltip */}
        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[var(--color-cycling)] inline-block" />
              <span>Fitness (CTL)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[var(--color-running)] inline-block" />
              <span>Fatigue (ATL)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[var(--color-text-muted)] opacity-30 inline-block rounded-xs" />
              <span>Beban Harian</span>
            </span>
          </div>

          {hoveredPoint && (
            <span className="font-tabular text-[var(--color-text-primary)] font-bold">
              {hoveredPoint.date}: CTL {hoveredPoint.ctl} • ATL {hoveredPoint.atl} • TSB {hoveredPoint.tsb}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

