"use client";

import React from "react";
import { Dumbbell, Swords, Waves, Trophy, Target, Flame, Bike, Footprints } from "lucide-react";

interface MultiSportTelemetryBadgeProps {
  sportType: string;
  distanceKm?: number;
  durationMinutes?: number;
  telemetryData?: Record<string, any>;
}

export function MultiSportTelemetryBadge({
  sportType,
  distanceKm = 0,
  durationMinutes = 0,
  telemetryData = {},
}: MultiSportTelemetryBadgeProps) {
  const norm = (sportType || "").toUpperCase();

  if (norm.includes("RIDE") || norm.includes("CYCLING")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)]">
        <Bike className="w-3 h-3" />
        <span>Sepeda • Zone 2</span>
      </span>
    );
  }

  if (norm.includes("RUN") || norm.includes("LARI")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-running)]/15 border border-[var(--color-running)]/30 text-[var(--color-running)]">
        <Footprints className="w-3 h-3" />
        <span>Lari • RTR Guard</span>
      </span>
    );
  }

  if (norm.includes("SWIM") || norm.includes("RENANG")) {
    const swolf = telemetryData.swolfScore || (telemetryData.averageLapTimeSeconds && telemetryData.strokeRateSpm ? telemetryData.averageLapTimeSeconds + telemetryData.strokeRateSpm : null);
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)]">
        <Waves className="w-3 h-3" />
        <span>Renang {swolf ? `• SWOLF ${swolf}` : "• Hidrodinamika"}</span>
      </span>
    );
  }

  if (
    norm.includes("WEIGHT") ||
    norm.includes("POWERLIFT") ||
    norm.includes("STRENGTH") ||
    norm.includes("GYM") ||
    norm.includes("CALISTHENIC")
  ) {
    const tonnage = telemetryData.weightKg && telemetryData.setsCount && telemetryData.repsPerSet
      ? Math.round(telemetryData.weightKg * telemetryData.setsCount * telemetryData.repsPerSet)
      : null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-endurance)]/15 border border-[var(--color-endurance)]/30 text-[var(--color-endurance)]">
        <Dumbbell className="w-3 h-3" />
        <span>Kekuatan {tonnage ? `• ${tonnage} kg Tonase` : "• SBD 1RM"}</span>
      </span>
    );
  }

  if (norm.includes("BOXING") || norm.includes("MMA") || norm.includes("BJJ") || norm.includes("SILAT")) {
    const rounds = telemetryData.roundsCount ? `${telemetryData.roundsCount} Ronde` : "SCAT6 Guard";
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/15 border border-pink-500/30 text-pink-400">
        <Swords className="w-3 h-3" />
        <span>Bela Diri • {rounds}</span>
      </span>
    );
  }

  if (norm.includes("FOOTBALL") || norm.includes("BASKET") || norm.includes("FUTSAL") || norm.includes("VOLLEY")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
        <Trophy className="w-3 h-3" />
        <span>Beregu • HSR &amp; FIFA 11+</span>
      </span>
    );
  }

  if (norm.includes("BADMINTON") || norm.includes("TENNIS") || norm.includes("ARCHERY") || norm.includes("SHOOT")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 border border-purple-500/30 text-purple-400">
        <Target className="w-3 h-3" />
        <span>Presisi • Raket/Target</span>
      </span>
    );
  }

  if (norm.includes("CROSSFIT") || norm.includes("CLIMB") || norm.includes("SURF") || norm.includes("SKATE")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
        <Flame className="w-3 h-3" />
        <span>Fungsional &amp; Ekstrem</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
      <span>{sportType || "Multi-Sport"}</span>
    </span>
  );
}
