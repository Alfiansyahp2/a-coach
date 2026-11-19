"use client";

import React from "react";
import { StrengthTelemetryFields, StrengthTelemetryData } from "./telemetry/StrengthTelemetryFields";
import { CombatAquaticFields, CombatAquaticData } from "./telemetry/CombatAquaticFields";
import { TeamRacquetFunctionalFields, TeamRacquetFunctionalData } from "./telemetry/TeamRacquetFunctionalFields";

export interface SportSpecificData
  extends StrengthTelemetryData,
    CombatAquaticData,
    TeamRacquetFunctionalData {}

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

  return null;
}
