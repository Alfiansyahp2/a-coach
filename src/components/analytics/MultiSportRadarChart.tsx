"use client";

import React, { useMemo } from "react";
import { Activity } from "@/types";
import { ShieldCheck, Compass, Zap } from "lucide-react";

interface MultiSportRadarChartProps {
  activities?: Activity[];
  customScores?: Record<string, number>;
  athleteName?: string;
}

interface ClusterDimension {
  key: string;
  label: string;
  caborList: string;
  color: string;
}

const CLUSTER_DIMENSIONS: ClusterDimension[] = [
  { key: "ENDURANCE", label: "Cyclic Endurance", caborList: "Lari, Sepeda, Renang", color: "#00F0FF" },
  { key: "STRENGTH", label: "Strength & Power", caborList: "Powerlift, Weightlift, Gym", color: "#EF4444" },
  { key: "TEAM", label: "Team & Agility", caborList: "Sepak Bola, Basket, Futsal", color: "#F59E0B" },
  { key: "COMBAT", label: "Combat & Resilience", caborList: "Tinju, MMA, BJJ, Silat", color: "#EC4899" },
  { key: "RACQUET", label: "Precision & Speed", caborList: "Bulu Tangkis, Tenis, Panah", color: "#A855F7" },
  { key: "FUNCTIONAL", label: "Functional & Extreme", caborList: "CrossFit, Panjat, Skate", color: "#10B981" },
];

export function MultiSportRadarChart({
  activities = [],
  customScores,
  athleteName = "Athlete",
}: MultiSportRadarChartProps) {
  // Compute scores (0 - 100) per cluster from real activity stream or default calibration
  const scores = useMemo(() => {
    if (customScores) return customScores;

    const baseScores: Record<string, number> = {
      ENDURANCE: 75,
      STRENGTH: 60,
      TEAM: 40,
      COMBAT: 35,
      RACQUET: 50,
      FUNCTIONAL: 55,
    };

    // Modulate based on logged activities
    for (const act of activities) {
      const type = (act.sport_type || "").toUpperCase();
      if (type.includes("RIDE") || type.includes("RUN") || type.includes("SWIM")) {
        baseScores.ENDURANCE = Math.min(100, baseScores.ENDURANCE + 5);
      } else if (type.includes("WEIGHT") || type.includes("POWER") || type.includes("LIFT")) {
        baseScores.STRENGTH = Math.min(100, baseScores.STRENGTH + 8);
      } else if (type.includes("FOOTBALL") || type.includes("BASKET") || type.includes("FUTSAL")) {
        baseScores.TEAM = Math.min(100, baseScores.TEAM + 8);
      } else if (type.includes("BOXING") || type.includes("MMA") || type.includes("SILAT")) {
        baseScores.COMBAT = Math.min(100, baseScores.COMBAT + 8);
      } else if (type.includes("BADMINTON") || type.includes("TENNIS")) {
        baseScores.RACQUET = Math.min(100, baseScores.RACQUET + 8);
      } else if (type.includes("CROSSFIT") || type.includes("CLIMB") || type.includes("SURF")) {
        baseScores.FUNCTIONAL = Math.min(100, baseScores.FUNCTIONAL + 8);
      }
    }

    return baseScores;
  }, [activities, customScores]);

  // Geometry for Hexagon Radar (Center at 150, 150, Radius = 95)
  const cx = 150;
  const cy = 150;
  const radius = 95;
  const numAxes = CLUSTER_DIMENSIONS.length;

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Polygon path for athlete scores
  const athletePoints = CLUSTER_DIMENSIONS.map((dim, idx) => {
    const val = (scores[dim.key] || 50) / 100;
    const coords = getCoordinates(idx, val);
    return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
  }).join(" ");

  // Average balance index
  const avgScore = Math.round(
    CLUSTER_DIMENSIONS.reduce((sum, d) => sum + (scores[d.key] || 50), 0) / numAxes
  );

  return (
    <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 font-mono shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--color-cycling)]" />
          <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            RADAR KAPASITAS HYBRID ATHLETE (33 CABOR)
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 text-[10px] text-[var(--color-cycling)] font-bold">
          <Zap className="w-3 h-3" />
          <span>Skor Sinergi: {avgScore}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* SVG Radar Chart */}
        <div className="md:col-span-7 flex justify-center">
          <svg viewBox="0 0 300 300" className="w-full max-w-[280px] h-auto overflow-visible select-none">
            {/* Background Web Grid Rings */}
            {gridLevels.map((lvl) => {
              const pts = Array.from({ length: numAxes })
                .map((_, idx) => {
                  const c = getCoordinates(idx, lvl);
                  return `${c.x.toFixed(1)},${c.y.toFixed(1)}`;
                })
                .join(" ");
              return (
                <polygon
                  key={lvl}
                  points={pts}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="1"
                  strokeDasharray={lvl < 1.0 ? "2,2" : undefined}
                  opacity="0.6"
                />
              );
            })}

            {/* Radial Spokes from Center */}
            {CLUSTER_DIMENSIONS.map((_, idx) => {
              const end = getCoordinates(idx, 1.0);
              return (
                <line
                  key={idx}
                  x1={cx}
                  y1={cy}
                  x2={end.x}
                  y2={end.y}
                  stroke="var(--color-border)"
                  strokeWidth="1"
                  opacity="0.8"
                />
              );
            })}

            {/* Athlete Performance Polygon */}
            <polygon
              points={athletePoints}
              fill="var(--color-cycling)"
              fillOpacity="0.25"
              stroke="var(--color-cycling)"
              strokeWidth="2.5"
            />

            {/* Vertices Dots & Labels */}
            {CLUSTER_DIMENSIONS.map((dim, idx) => {
              const val = (scores[dim.key] || 50) / 100;
              const dot = getCoordinates(idx, val);
              const labelPos = getCoordinates(idx, 1.22);
              return (
                <g key={dim.key}>
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r="4"
                    fill={dim.color}
                    stroke="#000"
                    strokeWidth="1.5"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[9px] font-bold fill-[var(--color-text-secondary)]"
                  >
                    {dim.label.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend & Breakdown Strip */}
        <div className="md:col-span-5 space-y-2 text-xs">
          <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-[var(--color-text-muted)]" />
            <span>Kapasitas Lintas 6 Klaster Cabor</span>
          </div>
          {CLUSTER_DIMENSIONS.map((dim) => {
            const score = scores[dim.key] || 50;
            return (
              <div key={dim.key} className="p-1.5 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)]/50 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: dim.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dim.color }} />
                    <span>{dim.label}</span>
                  </div>
                  <div className="text-[9px] text-[var(--color-text-muted)] truncate max-w-[130px]">
                    {dim.caborList}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-tabular text-[var(--color-text-primary)]">
                    {score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
