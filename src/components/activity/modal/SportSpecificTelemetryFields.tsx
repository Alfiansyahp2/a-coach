"use client";

import React, { useMemo } from "react";
import { StrengthTelemetryFields, StrengthTelemetryData } from "./telemetry/StrengthTelemetryFields";
import { CombatAquaticFields, CombatAquaticData } from "./telemetry/CombatAquaticFields";
import { TeamRacquetFunctionalFields, TeamRacquetFunctionalData } from "./telemetry/TeamRacquetFunctionalFields";
import { createDynamicSportCoachSchema } from "@/lib/domain/coach/schema/sportCoachUiSchema";
import { DynamicTelemetryForm } from "@/components/coach/dynamic/DynamicTelemetryForm";
import { SportCluster } from "@/types/sportTelemetry";

export interface SportSpecificData
  extends StrengthTelemetryData,
    CombatAquaticData,
    TeamRacquetFunctionalData,
    Record<string, any> {}

interface SportSpecificTelemetryFieldsProps {
  sportType: string;
  data: SportSpecificData;
  onChange: (data: SportSpecificData) => void;
}

export function SportSpecificTelemetryFields({
  sportType,
  data,
  onChange,
}: SportSpecificTelemetryFieldsProps) {
  const norm = (sportType || "").toUpperCase();

  const isStrength =
    norm.includes("WEIGHT") ||
    norm.includes("POWERLIFT") ||
    norm.includes("STRENGTH") ||
    norm.includes("GYM") ||
    norm.includes("CALISTHENIC") ||
    norm.includes("STRONGMAN") ||
    norm.includes("BODYBUILDING");

  const isCombat =
    norm.includes("BOXING") ||
    norm.includes("MMA") ||
    norm.includes("BJJ") ||
    norm.includes("SILAT") ||
    norm.includes("JUDO") ||
    norm.includes("MUAY") ||
    norm.includes("MARTIAL");

  const isAquatic =
    norm.includes("SWIM") ||
    norm.includes("RENANG") ||
    norm.includes("ROW") ||
    norm.includes("DAYUNG");

  const isTeam =
    norm.includes("FOOTBALL") ||
    norm.includes("SOCCER") ||
    norm.includes("BASKET") ||
    norm.includes("VOLLEY") ||
    norm.includes("FUTSAL") ||
    norm.includes("RUGBY") ||
    norm.includes("HOCKEY");

  const isRacquetOrPrecision =
    norm.includes("BADMINTON") ||
    norm.includes("TENNIS") ||
    norm.includes("PING") ||
    norm.includes("ARCHERY") ||
    norm.includes("SHOOT");

  const isFunctionalExtreme =
    norm.includes("CROSSFIT") ||
    norm.includes("HYROX") ||
    norm.includes("FUNCTIONAL") ||
    norm.includes("CLIMB") ||
    norm.includes("BOULDER") ||
    norm.includes("GYMNASTIC") ||
    norm.includes("SURF") ||
    norm.includes("SKATE");

  const dynamicFallbackCluster: SportCluster = useMemo(() => {
    if (norm.includes("TRAIL") || norm.includes("RUN") || norm.includes("RIDE") || norm.includes("WALK") || norm.includes("CYCL")) {
      return "CYCLIC_ENDURANCE";
    }
    if (norm.includes("PADEL") || norm.includes("SQUASH") || norm.includes("GOLF") || norm.includes("DARTS")) {
      return "RACQUET_PRECISION";
    }
    if (norm.includes("LIFT") || norm.includes("PRESS") || norm.includes("SQUAT") || norm.includes("PULLUP")) {
      return "STRENGTH_POWER";
    }
    if (norm.includes("KEMPO") || norm.includes("KARATE") || norm.includes("TAEKWONDO") || norm.includes("WRESTL")) {
      return "COMBAT_MARTIAL_ARTS";
    }
    if (norm.includes("POLO") || norm.includes("CRICKET") || norm.includes("BASEBALL") || norm.includes("HANDBALL")) {
      return "TEAM_FIELD_COURT";
    }
    return "FUNCTIONAL_EXTREME";
  }, [norm]);

  const dynamicFallbackDefinition = useMemo(() => {
    return createDynamicSportCoachSchema(sportType || "Custom", sportType || "Cabang Kustom", dynamicFallbackCluster);
  }, [sportType, dynamicFallbackCluster]);

  if (isStrength) {
    return <StrengthTelemetryFields data={data} onChange={(d) => onChange({ ...data, ...d })} />;
  }

  if (isCombat || isAquatic) {
    return (
      <CombatAquaticFields
        isCombat={isCombat}
        isAquatic={isAquatic}
        data={data}
        onChange={(d) => onChange({ ...data, ...d })}
      />
    );
  }

  if (isTeam || isRacquetOrPrecision || isFunctionalExtreme) {
    return (
      <TeamRacquetFunctionalFields
        isTeam={isTeam}
        isRacquetOrPrecision={isRacquetOrPrecision}
        isFunctionalExtreme={isFunctionalExtreme}
        data={data}
        onChange={(d) => onChange({ ...data, ...d })}
      />
    );
  }

  // If none of the static clusters match, immediately auto-generate telemetry UI!
  if (sportType && sportType !== "Workout") {
    return (
      <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
          <span className="text-[10px] uppercase font-bold text-[var(--color-cycling)]">
            Auto-Generated Telemetry ({sportType})
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] font-semibold">
            {dynamicFallbackCluster}
          </span>
        </div>
        <DynamicTelemetryForm
          definition={dynamicFallbackDefinition}
          values={data}
          onChange={(key, val) => onChange({ ...data, [key]: val })}
        />
      </div>
    );
  }

  return null;
}
