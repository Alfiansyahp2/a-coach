"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  SYSTEM_SPORTS,
  SYSTEM_SPORT_CLUSTERS,
  SystemSportItem,
} from "@/lib/domain/sports/systemSportsRegistry";
import { SportCluster } from "@/types/sportTelemetry";
import { SportVaultCard } from "./SportVaultCard";
import { Search, X, Layers, Sparkles } from "lucide-react";

interface SportVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSport: (sport: SystemSportItem) => void;
  activeSportCodes?: string[];
}

export function SportVaultModal({
  isOpen,
  onClose,
  onSelectSport,
  activeSportCodes = [],
}: SportVaultModalProps) {
  const [selectedCluster, setSelectedCluster] = useState<SportCluster | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-2xl font-mono overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border)] flex items-center justify-between gap-4 shrink-0 bg-[var(--color-surface-card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 flex items-center justify-center text-[var(--color-cycling)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
                  SPORT VAULT • 33 CABOR DUNIA
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>33 Formula Aktif</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                Pilih cabor apa pun yang ingin Anda lakukan. Rumus sains olahraga siap dieksekusi seketika.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="p-4 border-b border-[var(--color-border)] space-y-3 shrink-0 bg-[var(--color-surface-muted)]/20">
          {/* Cluster Pills */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {SYSTEM_SPORT_CLUSTERS.map((cl) => {
              const isActive = selectedCluster === cl.id;
              return (
                <button
                  type="button"
                  key={cl.id}
                  onClick={() => setSelectedCluster(cl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[var(--color-surface-card)] border-[var(--color-cycling)] text-[var(--color-cycling)] shadow-xs"
                      : "bg-[var(--color-surface-card)]/60 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {cl.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari cabor (e.g. lari, tinju, bjj, powerlifting, renang, badminton)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-cycling)] focus:outline-hidden transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Card Grid Body */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[var(--color-border)] [&::-webkit-scrollbar-thumb]:rounded-full"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSports.map((sport) => {
              const isPinned = activeSportCodes.includes(sport.code);
              return (
                <SportVaultCard
                  key={sport.code}
                  sport={sport}
                  isActiveInRepertoire={isPinned}
                  onSelectSport={(item) => {
                    onSelectSport(item);
                    onClose();
                  }}
                />
              );
            })}
          </div>

          {filteredSports.length === 0 && (
            <div className="py-12 text-center text-xs text-[var(--color-text-muted)] space-y-2">
              <p>Tidak ditemukan cabor dengan kata kunci &quot;{searchQuery}&quot;.</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[var(--color-cycling)] hover:underline cursor-pointer font-bold"
              >
                Reset pencarian
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
