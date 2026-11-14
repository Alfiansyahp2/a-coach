"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Grid,
  Columns,
  CircleDot,
  BookOpen,
  TrendingUp,
  Terminal,
  List,
  ChevronDown,
  Check,
} from "lucide-react";
import { CalendarViewModel } from "./CalendarCommandBar";

interface CalendarViewModelSelectorProps {
  viewMode: CalendarViewModel;
  onSelectViewMode: (mode: CalendarViewModel) => void;
}

interface ModelItem {
  id: CalendarViewModel;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const MODELS: ModelItem[] = [
  {
    id: "month_grid",
    label: "Grid Bulan",
    desc: "Kalender 8-kolom bulanan",
    icon: Grid,
    accentColor: "text-[var(--color-cycling)]",
  },
  {
    id: "week_agenda",
    label: "Agenda Minggu",
    desc: "Tampilan 7-kolom mingguan",
    icon: Columns,
    accentColor: "text-[var(--color-endurance)]",
  },
  {
    id: "kinetic_bubbles",
    label: "Gelembung Kinetik",
    desc: "Visualisasi volume dinamis",
    icon: CircleDot,
    accentColor: "text-[var(--color-running)]",
  },
  {
    id: "field_journal",
    label: "Jurnal Lapangan",
    desc: "Buku catatan latihan fisik",
    icon: BookOpen,
    accentColor: "text-amber-400",
  },
  {
    id: "periodization",
    label: "Garis Waktu",
    desc: "Gantt 12-minggu & kurva PMC",
    icon: TrendingUp,
    accentColor: "text-purple-400",
  },
  {
    id: "micro_hud",
    label: "Micro-HUD",
    desc: "Konsol navigasi keyboard",
    icon: Terminal,
    accentColor: "text-emerald-400",
  },
  {
    id: "list",
    label: "Daftar Sesi",
    desc: "Urutan kronologis sesi",
    icon: List,
    accentColor: "text-[var(--color-text-secondary)]",
  },
];

export function CalendarViewModelSelector({
  viewMode,
  onSelectViewMode,
}: CalendarViewModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentModel = MODELS.find((m) => m.id === viewMode) || MODELS[0];
  const CurrentIcon = currentModel.icon;

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer select-none"
        title="Ganti Tampilan Kalender"
      >
        <CurrentIcon className={`w-3.5 h-3.5 shrink-0 ${currentModel.accentColor}`} />
        <span className="font-bold text-xs truncate">
          {currentModel.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Clean Minimalist Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 sm:left-auto sm:right-0 z-[100] w-[210px] sm:w-[220px] rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-2xl p-1.5 space-y-0.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)]/50 pb-1 mb-1">
            TAMPILAN KALENDER
          </div>

          <div className="space-y-0.5">
            {MODELS.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === viewMode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelectViewMode(m.id);
                    setIsOpen(false);
                  }}
                  title={m.desc}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-bold border border-[var(--color-cycling)]/30 shadow-xs"
                      : "hover:bg-[var(--color-surface-muted)]/60 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${m.accentColor}`} />
                    <span className="text-xs truncate">{m.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
