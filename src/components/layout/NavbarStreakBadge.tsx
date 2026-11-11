"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";

export interface NavbarStreakBadgeProps {
  initialWeeks?: number;
}

/**
 * Authoritative Thermodynamic Flame Heat Spectrum Stages
 * Strictly synchronized with src/lib/domain/streak/streakEngine.ts:
 * - Stage 1 (1–9 Weeks): Api Merah (#EF4444, ~800°C) — Initial ember / least hot.
 * - Stage 2 (10–19 Weeks): Api Oranye (#F97316, ~1,100°C) — Sustained flame / medium heat.
 * - Stage 3 (20–29 Weeks): Api Kuning Emas (#EAB308, ~1,300°C) — High heat consistency.
 * - Stage 4 (30–39 Weeks): Api Putih Terang (#F8FAFC, ~1,500°C) — White-hot intensity.
 * - Stage 5 (40–49 Weeks): Api Biru Cyan (#00F0FF, ~1,800°C) — Pure gas combustion / hottest flame.
 * - Stage 6 (50+ Weeks / 1 Year+): Api Ungu Plasma (#C084FC, >2,200°C) — Cosmic plasma peak.
 */
export function getThermodynamicStageConfig(streakWeeks: number) {
  if (streakWeeks <= 0) {
    return {
      stage: 0,
      name: "Api Padam",
      tempText: "0°C",
      primaryColor: "#5A6272",
      secondaryColor: "#3F4552",
      sparkColor: "#94A3B8",
      glowRgba: "rgba(90, 98, 114, 0.25)",
      isBurning: false,
    };
  }
  if (streakWeeks < 10) {
    return {
      stage: 1,
      name: "Api Merah",
      tempText: "~800°C",
      primaryColor: "#EF4444",
      secondaryColor: "#DC2626",
      sparkColor: "#FCA5A5",
      glowRgba: "rgba(239, 68, 68, 0.45)",
      isBurning: true,
    };
  }
  if (streakWeeks < 20) {
    return {
      stage: 2,
      name: "Api Oranye",
      tempText: "~1,100°C",
      primaryColor: "#F97316",
      secondaryColor: "#EA580C",
      sparkColor: "#FDBA74",
      glowRgba: "rgba(249, 115, 22, 0.45)",
      isBurning: true,
    };
  }
  if (streakWeeks < 30) {
    return {
      stage: 3,
      name: "Api Kuning Emas",
      tempText: "~1,300°C",
      primaryColor: "#EAB308",
      secondaryColor: "#CA8A04",
      sparkColor: "#FEF08A",
      glowRgba: "rgba(234, 179, 8, 0.5)",
      isBurning: true,
    };
  }
  if (streakWeeks < 40) {
    return {
      stage: 4,
      name: "Api Putih Terang",
      tempText: "~1,500°C",
      primaryColor: "#F8FAFC",
      secondaryColor: "#E2E8F0",
      sparkColor: "#7DD3FC",
      glowRgba: "rgba(248, 250, 252, 0.65)",
      isBurning: true,
    };
  }
  if (streakWeeks < 50) {
    return {
      stage: 5,
      name: "Api Biru Cyan",
      tempText: "~1,800°C",
      primaryColor: "#00F0FF",
      secondaryColor: "#0284C7",
      sparkColor: "#A5F3FC",
      glowRgba: "rgba(0, 240, 255, 0.65)",
      isBurning: true,
    };
  }
  return {
    stage: 6,
    name: "Api Ungu Plasma",
    tempText: ">2,200°C",
    primaryColor: "#C084FC",
    secondaryColor: "#9333EA",
    sparkColor: "#E9D5FF",
    glowRgba: "rgba(192, 132, 252, 0.7)",
    isBurning: true,
  };
}

export function NavbarStreakBadge({ initialWeeks }: NavbarStreakBadgeProps) {
  const [weeks, setWeeks] = useState<number>(initialWeeks ?? 10);

  useEffect(() => {
    if (typeof initialWeeks === "number") {
      setWeeks(initialWeeks);
    }
  }, [initialWeeks]);

  useEffect(() => {
    let isMounted = true;
    async function loadStreak() {
      try {
        const res = await fetch("/api/athlete/streak");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && typeof data.currentStreakWeeks === "number") {
            setWeeks(data.currentStreakWeeks);
          }
        }
      } catch {
        // Fallback gracefully to initialWeeks
      }
    }
    loadStreak();
    return () => {
      isMounted = false;
    };
  }, []);

  const themeConfig = getThermodynamicStageConfig(weeks);

  const tooltipText = themeConfig.isBurning
    ? `Streak Latihan: ${weeks} Minggu Beruntun • Tahap ${themeConfig.stage} (${themeConfig.name} ${themeConfig.tempText})`
    : `Streak Latihan: 0 Minggu (Selesaikan 1 sesi untuk menyalakan api)`;

  return (
    <>
      <style>{`
        @keyframes dynamic-fire-flicker {
          0%, 100% {
            transform: scaleY(1) scaleX(1) translateY(0) rotate(0deg);
            filter: drop-shadow(0 0 4px var(--flame-p)) drop-shadow(0 -2px 6px var(--flame-s));
          }
          20% {
            transform: scaleY(1.18) scaleX(0.88) translateY(-2px) rotate(-3deg);
            filter: drop-shadow(0 0 9px var(--flame-p)) drop-shadow(0 -4px 10px var(--flame-s));
          }
          40% {
            transform: scaleY(0.92) scaleX(1.06) translateY(0.5px) rotate(2deg);
            filter: drop-shadow(0 0 5px var(--flame-k)) drop-shadow(0 -2px 6px var(--flame-p));
          }
          60% {
            transform: scaleY(1.14) scaleX(0.92) translateY(-1.5px) rotate(-2deg);
            filter: drop-shadow(0 0 10px var(--flame-s)) drop-shadow(0 -3px 8px var(--flame-k));
          }
          80% {
            transform: scaleY(0.96) scaleX(1.04) translateY(0) rotate(2.5deg);
            filter: drop-shadow(0 0 6px var(--flame-p)) drop-shadow(0 -2px 7px var(--flame-s));
          }
        }

        @keyframes dynamic-ember-pulse {
          0%, 100% {
            opacity: 0.55;
            transform: scale(0.9);
            box-shadow: 0 0 8px var(--flame-g);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.25);
            box-shadow: 0 0 16px var(--flame-g);
          }
        }

        @keyframes dynamic-spark-float {
          0% {
            transform: translate(0, 0) scale(0.6);
            opacity: 0.95;
          }
          50% {
            transform: translate(2px, -6px) scale(1.1);
            opacity: 0.75;
          }
          100% {
            transform: translate(-3px, -12px) scale(0.2);
            opacity: 0;
          }
        }

        @keyframes dynamic-border-pulse {
          0%, 100% {
            border-color: var(--flame-p);
            box-shadow: 0 0 6px var(--flame-g);
          }
          50% {
            border-color: var(--flame-s);
            box-shadow: 0 0 14px var(--flame-g);
          }
        }

        .streak-fire-motion {
          transform-origin: 50% 90%;
          animation: dynamic-fire-flicker 1.5s infinite ease-in-out;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .streak-fire-aura {
          animation: dynamic-ember-pulse 1.5s infinite ease-in-out;
        }

        .streak-fire-spark {
          animation: dynamic-spark-float 1.3s infinite ease-out;
        }

        .streak-badge-glow {
          animation: dynamic-border-pulse 2s infinite ease-in-out;
        }
      `}</style>

      <Link
        href="/training"
        title={tooltipText}
        style={{
          "--flame-p": themeConfig.primaryColor,
          "--flame-s": themeConfig.secondaryColor,
          "--flame-k": themeConfig.sparkColor,
          "--flame-g": themeConfig.glowRgba,
        } as React.CSSProperties}
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] border transition-all duration-300 shadow-xs cursor-pointer select-none streak-badge-glow"
      >
        {/* Animated Fire Icon Container */}
        <div className="relative flex items-center justify-center w-4 h-4">
          {/* Ambient Fire Aura Glow */}
          <span
            className="absolute inset-0 w-4 h-4 rounded-full blur-[5px] pointer-events-none streak-fire-aura"
            style={{ backgroundColor: themeConfig.primaryColor }}
          />

          {/* Micro Spark Floating from Flame */}
          {themeConfig.isBurning && (
            <span
              className="absolute -top-1 right-0 w-1 h-1 rounded-full pointer-events-none streak-fire-spark"
              style={{ backgroundColor: themeConfig.sparkColor }}
            />
          )}

          {/* Dancing Organic Flame */}
          <div className="streak-fire-motion relative z-10">
            <Flame
              className="w-4 h-4"
              style={{
                color: themeConfig.primaryColor,
                fill: themeConfig.primaryColor,
              }}
            />
          </div>
        </div>

        {/* Numerical Streak Counter (Strictly without 'w') */}
        <span className="text-xs sm:text-sm font-black font-mono font-tabular tracking-tight text-[var(--color-text-primary)]">
          {weeks}
        </span>
      </Link>
    </>
  );
}

export default NavbarStreakBadge;
