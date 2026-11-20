"use client";

import React, { useState, useMemo } from "react";
import {
  SportCoachUiDefinition,
  createDynamicSportCoachSchema,
  CLUSTER_DEFAULTS,
} from "@/lib/domain/coach/schema/sportCoachUiSchema";
import { DynamicTelemetryForm } from "./DynamicTelemetryForm";
import { DynamicCoachDebriefCard } from "./DynamicCoachDebriefCard";
import { SportCluster } from "@/types/sportTelemetry";
import {
  Sparkles,
  PlusCircle,
  Search,
  Check,
  Dumbbell,
  Bike,
  Swords,
  Trophy,
  Target,
  Flame,
  ArrowRight,
} from "lucide-react";

interface DynamicSportCoachControlProps {
  onSessionSubmit?: (sportCode: string, telemetry: Record<string, any>) => void;
  className?: string;
}

const PRESET_COACHES: SportCoachUiDefinition[] = [
  createDynamicSportCoachSchema("SPORT_ROAD_CYCLING", "Sepeda Jalan Raya", "CYCLIC_ENDURANCE", "Coggan Power Profiling / UCI Standard"),
  createDynamicSportCoachSchema("SPORT_DISTANCE_RUNNING", "Lari Jarak Jauh", "CYCLIC_ENDURANCE", "Daniels VDOT / World Athletics Standard"),
  createDynamicSportCoachSchema("SPORT_POWERLIFTING", "Powerlifting (SBD)", "STRENGTH_POWER", "IPF Rulebook / Sheiko INOL Matrix"),
  createDynamicSportCoachSchema("SPORT_FOOTBALL", "Sepak Bola (Football)", "TEAM_FIELD_COURT", "FIFA 11+ / Catapult PlayerLoad Guidelines"),
  createDynamicSportCoachSchema("SPORT_BOXING", "Tinju (Boxing)", "COMBAT_MARTIAL_ARTS", "AIBA Standard / SCAT6 Concussion Safety"),
  createDynamicSportCoachSchema("SPORT_SWIMMING", "Renang (Aquatic)", "RACQUET_PRECISION", "FINA Standard / Costill SWOLF Efficiency"),
  createDynamicSportCoachSchema("SPORT_BADMINTON", "Bulu Tangkis (Badminton)", "RACQUET_PRECISION", "BWF High-Performance Jump-Smash Monitor"),
  createDynamicSportCoachSchema("SPORT_FUNCTIONAL_FITNESS", "Kebugaran Fungsional", "FUNCTIONAL_EXTREME", "CrossFit / ACSM Rhabdomyolysis Prevention"),
];

export function DynamicSportCoachControl({
  onSessionSubmit,
  className = "",
}: DynamicSportCoachControlProps) {
  const [coaches, setCoaches] = useState<SportCoachUiDefinition[]>(PRESET_COACHES);
  const [selectedSportCode, setSelectedSportCode] = useState<string>("SPORT_POWERLIFTING");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // New cabor creation state
  const [newSportName, setNewSportName] = useState("");
  const [newSportCluster, setNewSportCluster] = useState<SportCluster>("STRENGTH_POWER");
  const [newSportStandard, setNewSportStandard] = useState("");

  // Telemetry session state
  const [telemetryValues, setTelemetryValues] = useState<Record<string, any>>({});
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [sessionRpe, setSessionRpe] = useState<number>(7);

  const activeDefinition = useMemo(() => {
    return coaches.find((c) => c.sportCode === selectedSportCode) || coaches[0];
  }, [coaches, selectedSportCode]);

  const filteredCoaches = useMemo(() => {
    if (!searchQuery.trim()) return coaches;
    return coaches.filter(
      (c) =>
        c.sportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.cluster.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coaches, searchQuery]);

  const handleFieldChange = (key: string, val: any) => {
    setTelemetryValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleCreateNewCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSportName.trim()) return;

    const newDef = createDynamicSportCoachSchema(
      newSportName.trim(),
      newSportName.trim(),
      newSportCluster,
      newSportStandard.trim() || undefined
    );

    setCoaches((prev) => [newDef, ...prev]);
    setSelectedSportCode(newDef.sportCode);
    setTelemetryValues({});
    setIsCreatingNew(false);
    setNewSportName("");
    setNewSportStandard("");
  };

  const renderClusterIcon = (cluster: SportCluster) => {
    switch (cluster) {
      case "STRENGTH_POWER": return <Dumbbell className="w-3.5 h-3.5 text-[var(--color-endurance)]" />;
      case "CYCLIC_ENDURANCE": return <Bike className="w-3.5 h-3.5 text-[var(--color-cycling)]" />;
      case "COMBAT_MARTIAL_ARTS": return <Swords className="w-3.5 h-3.5 text-pink-400" />;
      case "TEAM_FIELD_COURT": return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case "RACQUET_PRECISION": return <Target className="w-3.5 h-3.5 text-purple-400" />;
      case "FUNCTIONAL_EXTREME": return <Flame className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-[var(--color-cycling)]" />;
    }
  };

  return (
    <div className={`space-y-4 font-mono ${className}`}>
      {/* Top Bar: Selector & Trigger to Add New Cabor */}
      <div className="p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-cycling)]" />
            <h3 className="text-xs font-bold uppercase text-[var(--color-text-primary)]">
              Kontrol Auto-Generate UI Cabor Coach
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingNew((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)] hover:bg-[var(--color-cycling)]/25 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isCreatingNew ? "Tutup Form Tambah" : "+ Daftarkan Cabor Coach Baru"}</span>
          </button>
        </div>

        {/* Inline Dialog: Add New Cabor Coach */}
        {isCreatingNew && (
          <form onSubmit={handleCreateNewCoach} className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2.5">
            <span className="text-[11px] font-bold text-[var(--color-text-primary)] block">
              Daftarkan Cabor Baru (UI Otomatis Dibuat Seketika):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nama Cabor (contoh: Padel, Kempo, Golf)"
                value={newSportName}
                onChange={(e) => setNewSportName(e.target.value)}
                required
                className="px-2.5 py-1.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              />
              <select
                value={newSportCluster}
                onChange={(e) => setNewSportCluster(e.target.value as SportCluster)}
                className="px-2.5 py-1.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              >
                {Object.keys(CLUSTER_DEFAULTS).map((k) => (
                  <option key={k} value={k}>
                    {CLUSTER_DEFAULTS[k as SportCluster].label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Standar Sains / Federasi (Opsional)"
                value={newSportStandard}
                onChange={(e) => setNewSportStandard(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded-md bg-[var(--color-cycling)] text-black text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Generate UI Coach Cabor Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Cabor Selector Carousel / Pill Grid */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari cabor coach terdaftar..."
                className="w-full pl-8 pr-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              />
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] font-tabular shrink-0">
              {filteredCoaches.length} Cabor
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {filteredCoaches.map((c) => {
              const isSelected = c.sportCode === selectedSportCode;
              return (
                <button
                  type="button"
                  key={c.sportCode}
                  onClick={() => {
                    setSelectedSportCode(c.sportCode);
                    setTelemetryValues({});
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-cycling)]/15 border-[var(--color-cycling)] text-[var(--color-cycling)] font-bold shadow-xs"
                      : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {renderClusterIcon(c.cluster)}
                  <span>{c.sportName}</span>
                  {isSelected && <Check className="w-3 h-3 text-[var(--color-cycling)]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Auto-Generated Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Auto-Generated Dynamic Telemetry Form */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-cycling)] block">
                Form Telemetri Ter-Generate Otomatis
              </span>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                Input Spesifik: {activeDefinition.sportName}
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
              {activeDefinition.fields.length} Field Skema
            </span>
          </div>

          {/* Core Duration & Session RPE controls */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-[var(--color-text-secondary)]">
                Durasi Latihan (Menit)
              </label>
              <input
                type="number"
                min={1}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value) || 1)}
                className="w-full px-2 py-1 rounded bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular font-bold mt-1"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-semibold text-[var(--color-text-secondary)]">
                Foster Session-RPE (1 - 10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                step={0.5}
                value={sessionRpe}
                onChange={(e) => setSessionRpe(Number(e.target.value) || 1)}
                className="w-full px-2 py-1 rounded bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular font-bold mt-1"
              />
            </div>
          </div>

          {/* Dynamic Generated Fields */}
          <DynamicTelemetryForm
            definition={activeDefinition}
            values={telemetryValues}
            onChange={handleFieldChange}
          />
        </div>

        {/* Right 1 Col: Live AI Coach Debrief & Safety Card */}
        <div>
          <DynamicCoachDebriefCard
            definition={activeDefinition}
            values={telemetryValues}
            durationMinutes={durationMinutes}
            sessionRpe={sessionRpe}
          />
        </div>
      </div>
    </div>
  );
}
