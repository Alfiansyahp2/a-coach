"use client";

import React, { useState } from "react";
import { AthleteInjury } from "@/types";
import { Layers, Compass } from "lucide-react";
import {
  ANATOMICAL_ZONES,
  getAnatomicalRegion,
} from "@/lib/anatomyUtils";
import { InjuryDossierDetailPane } from "./InjuryDossierDetailPane";

interface InjuryDossierTabProps {
  injuries: AthleteInjury[];
  onOpenNewInjury?: (regionName: string) => void;
}

export function InjuryDossierTab({
  injuries,
  onOpenNewInjury,
}: InjuryDossierTabProps) {
  const defaultPart = injuries[0]?.body_region || "Right Ankle";
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>(defaultPart);

  const selectedInjury = injuries.find(
    (i) =>
      i.body_region.toLowerCase() === selectedBodyPart.toLowerCase() ||
      selectedBodyPart.toLowerCase().includes(i.body_region.toLowerCase()) ||
      i.body_region.toLowerCase().includes(selectedBodyPart.toLowerCase())
  );

  const selectedMeta = getAnatomicalRegion(
    selectedInjury?.body_region || selectedBodyPart
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
      {/* 1. Left Column: Full-Body Anatomical Map & Vulnerability Matrix (5 cols) */}
      <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)] text-xs">
          <span className="font-bold text-[var(--color-text-primary)] uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Peta Anatomis Keseluruhan Tubuh</span>
          </span>
          <span className="text-[9.5px] text-[var(--color-cycling)] bg-[var(--color-cycling)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-cycling)]/30 font-bold">
            {injuries.length} Dossier Terpantau
          </span>
        </div>

        {/* Dynamic Full-Body Anatomical Zone Matrix */}
        <div className="space-y-2.5 text-xs max-h-[640px] overflow-y-auto pr-1">
          {ANATOMICAL_ZONES.map((zone) => {
            const zoneInjuries = injuries.filter((inj) => {
              const meta = getAnatomicalRegion(inj.body_region);
              return meta.zoneKey === zone.key;
            });

            const hasActiveInjuries = zoneInjuries.length > 0;

            if (hasActiveInjuries) {
              return (
                <div key={zone.key} className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center justify-between px-1">
                    <span>{zone.label}</span>
                    <span className="text-[9px] text-[var(--color-alert-red)] font-bold">
                      {zoneInjuries.length} Titik Terpantau
                    </span>
                  </div>

                  {zoneInjuries.map((inj) => {
                    const isSelected =
                      selectedInjury?.id === inj.id ||
                      selectedBodyPart.toLowerCase() === inj.body_region.toLowerCase();

                    return (
                      <button
                        key={inj.id}
                        type="button"
                        onClick={() => setSelectedBodyPart(inj.body_region)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between shadow-xs cursor-pointer ${
                          isSelected
                            ? "bg-[var(--color-surface-muted)] border-[var(--color-alert-red)]"
                            : "bg-[var(--color-surface-muted)]/50 border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-text-secondary)]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-primary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-alert-red)] animate-pulse" />
                            <span>
                              {inj.body_region} ({inj.side})
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--color-text-muted)] block">
                            {inj.functional_limitations}
                          </span>
                        </div>

                        <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30 font-bold shrink-0 ml-2">
                          RESTRIKSI
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            }

            const isSelected = selectedBodyPart.toLowerCase() === zone.label.toLowerCase();
            return (
              <button
                key={zone.key}
                type="button"
                onClick={() => setSelectedBodyPart(zone.label)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-surface-muted)] border-[var(--color-cycling)]"
                    : "bg-[var(--color-surface-muted)]/30 border-[var(--color-border)]/60 hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                <span className="flex items-center gap-2 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)]" />
                  <span>{zone.label}</span>
                </span>
                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] font-bold">
                  BEBAS GEJALA
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-[10px] text-[var(--color-text-muted)] border-t border-[var(--color-border)] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Klik salah satu area anatomi untuk menginspeksi dossier atau mendaftarkan riwayat baru.</span>
        </div>
      </div>

      {/* 2. Right Column: High-Density Dossier & Clinical Guidance Cards (7 cols) */}
      <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 shadow-xs">
        <InjuryDossierDetailPane
          selectedInjury={selectedInjury}
          selectedMeta={selectedMeta}
          onOpenNewInjury={onOpenNewInjury}
        />
      </div>
    </div>
  );
}
