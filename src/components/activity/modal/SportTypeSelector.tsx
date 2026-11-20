"use client";

import React, { useState, useMemo } from "react";
import {
  SYSTEM_SPORTS,
  SYSTEM_SPORT_CLUSTERS,
  SystemSportItem,
  findSystemSport,
} from "@/lib/domain/sports/systemSportsRegistry";
import { SportCluster } from "@/types/sportTelemetry";
import { SportIcon } from "@/components/sports/SportIcon";
import {
  Search,
  Check,
  Plus,
  X,
  Tag,
} from "lucide-react";

interface SportTypeSelectorProps {
  sportType: string;
  setSportType: (v: string) => void;
  onClusterChange?: (cluster: SportCluster) => void;
}

export function SportTypeSelector({
  sportType,
  setSportType,
  onClusterChange,
}: SportTypeSelectorProps) {
  const [selectedCluster, setSelectedCluster] = useState<SportCluster | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>("");

  // Determine active sport from system registry
  const matchedSport = useMemo(() => findSystemSport(sportType), [sportType]);

  const filteredSports = useMemo(() => {
    return SYSTEM_SPORTS.filter((s) => {
      const matchesCluster = selectedCluster === "ALL" || s.cluster === selectedCluster;
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCluster && matchesSearch;
    });
  }, [selectedCluster, searchQuery]);

  const handleSelectSport = (item: SystemSportItem) => {
    setIsCustomMode(false);
    setSportType(item.name);
    if (onClusterChange) {
      onClusterChange(item.cluster);
    }
  };

  const handleCustomSubmit = (val: string) => {
    setCustomInput(val);
    setSportType(val.trim() || "Workout");
  };

  return (
    <div className="space-y-2 font-mono">
      {/* 1. Header with Selected Active Cabor Badge & Custom Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 min-w-0">
          <label className="text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold shrink-0">
            PILIH CABOR RESMI SISTEM (33 CABOR DUNIA)
          </label>
          {matchedSport && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)] truncate">
              <SportIcon sportCode={matchedSport.code} cluster={matchedSport.cluster} className="w-3 h-3" />
              <span>{matchedSport.shortLabel}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsCustomMode((v) => !v)}
          className={`text-[10px] transition-colors flex items-center gap-1 cursor-pointer font-semibold ${
            isCustomMode
              ? "text-[var(--color-alert-amber)] font-bold"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-cycling)]"
          }`}
        >
          {isCustomMode ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          <span>{isCustomMode ? "Tutup Form Kustom" : "Cabor Kustom Baru"}</span>
        </button>
      </div>

      {/* 2. Cluster Filter Navigation Tabs (Smooth Scroll without Ugly Native Scrollbar) */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SYSTEM_SPORT_CLUSTERS.map((cl) => {
          const isActive = selectedCluster === cl.id;
          return (
            <button
              type="button"
              key={cl.id}
              onClick={() => setSelectedCluster(cl.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] shrink-0 font-bold border transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--color-surface-card)] border-[var(--color-cycling)] text-[var(--color-cycling)] shadow-xs"
                  : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]/80"
              }`}
            >
              {cl.shortLabel}
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar for 33 Sports */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari cabor (e.g. lari, tinju, bjj, beban, renang)..."
          className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-cycling)] focus:outline-hidden transition-colors"
        />
      </div>

      {/* 4. Active System Sports Grid (Compact, High-Legibility, Sleek 6px Scrollbar) */}
      <div
        className="max-h-48 overflow-y-auto space-y-1 pr-1 rounded-lg p-1.5 bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--color-border)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-text-muted)]"
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--color-border) transparent" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {filteredSports.map((item) => {
            const isSelected =
              matchedSport?.code === item.code ||
              sportType.toLowerCase() === item.name.toLowerCase() ||
              sportType.toLowerCase() === item.shortLabel.toLowerCase();

            return (
              <button
                type="button"
                key={item.code}
                onClick={() => handleSelectSport(item)}
                title={item.name}
                className={`px-2.5 py-2 rounded-lg text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-surface-card)] border-[var(--color-cycling)] text-[var(--color-cycling)] font-bold shadow-xs ring-1 ring-[var(--color-cycling)]/30"
                    : "bg-[var(--color-surface-card)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)]/60 hover:bg-[var(--color-surface-card)]/90"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-[var(--color-surface-muted)] flex items-center justify-center shrink-0">
                    <SportIcon sportCode={item.code} cluster={item.cluster} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold truncate">
                    {item.shortLabel}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 shrink-0 text-[var(--color-cycling)]" />
                )}
              </button>
            );
          })}
        </div>

        {filteredSports.length === 0 && (
          <div className="py-6 text-center text-xs text-[var(--color-text-muted)] space-y-1">
            <span>Tidak ditemukan cabor dengan kata kunci &quot;{searchQuery}&quot;.</span>
            <span className="block text-[10px]">
              Gunakan tombol &quot;+ Cabor Kustom Baru&quot; di atas untuk cabor di luar sistem.
            </span>
          </div>
        )}
      </div>

      {/* 5. Custom Mode for Extra Sports Outside System */}
      {isCustomMode && (
        <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-alert-amber)]/40 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[var(--color-alert-amber)] font-bold flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Daftarkan Cabor Tambahan di Luar 33 Cabor Sistem</span>
            </span>
            <span className="text-[var(--color-text-muted)]">Skema otomatis ter-generate</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => handleCustomSubmit(e.target.value)}
              placeholder="Ketikkan nama cabor baru (contoh: Padel, Kempo, Golf)..."
              className="flex-1 px-3 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] focus:border-[var(--color-cycling)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-hidden"
              autoFocus
            />
            <span className="px-2.5 py-1 rounded-md bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] font-bold text-[10px] shrink-0 border border-[var(--color-cycling)]/30">
              {customInput.trim() || "Kustom"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
