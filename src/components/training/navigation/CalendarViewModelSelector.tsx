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
  num: string;
  label: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const MODELS: ModelItem[] = [
  {
    id: "month_grid",
    num: "01",
    label: "Grid Bulan Sejati",
    badge: "WKO / Peaks",
    desc: "Grid 8-kolom standar industri dengan ringkasan beban",
    icon: Grid,
    accentColor: "text-[var(--color-cycling)]",
  },
  {
    id: "week_agenda",
    num: "02",
    label: "Agenda Minggu",
    badge: "Garmin Cockpit",
    desc: "7 kolom vertikal luas komparasi target vs eksekusi",
    icon: Columns,
    accentColor: "text-[var(--color-endurance)]",
  },
  {
    id: "kinetic_bubbles",
    num: "03",
    label: "Gelembung Kinetik",
    badge: "Strava Flow",
    desc: "Visualisasi volume sirkular dinamis & ritme beban",
    icon: CircleDot,
    accentColor: "text-[var(--color-running)]",
  },
  {
    id: "field_journal",
    num: "04",
    label: "Jurnal Lapangan",
    badge: "Field Journal",
    desc: "Buku catatan fisik klasik & observasi pelatih",
    icon: BookOpen,
    accentColor: "text-amber-400",
  },
  {
    id: "periodization",
    num: "05",
    label: "Garis Waktu Makro",
    badge: "Gantt & PMC",
    desc: "Blok mesosiklus 12-minggu & kurva impuls Banister",
    icon: TrendingUp,
    accentColor: "text-purple-400",
  },
  {
    id: "micro_hud",
    num: "06",
    label: "Micro-HUD Keyboard",
    badge: "Avionics HUD",
    desc: "Konsol telemetri ringkas navigasi tombol panah",
    icon: Terminal,
    accentColor: "text-emerald-400",
  },
  {
    id: "list",
    num: "07",
    label: "Daftar Kronologis",
    badge: "Agenda",
    desc: "Daftar linier runut waktu sederhana",
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
        className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer select-none"
        title="Ganti Model Antarmuka Kalender"
      >
        <div className={`w-4 h-4 flex items-center justify-center shrink-0 ${currentModel.accentColor}`}>
          <CurrentIcon className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-xs truncate max-w-[130px] sm:max-w-[160px]">
          {currentModel.num}. {currentModel.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 sm:left-auto sm:right-0 z-[100] w-[310px] rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-2xl p-1.5 space-y-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)]/50 pb-1.5 flex items-center justify-between">
            <span>MODEL KALENDER</span>
            <span className="text-[9px] text-[var(--color-cycling)] font-normal">Tersimpan Otomatis</span>
          </div>

          <div className="space-y-0.5 max-h-[360px] overflow-y-auto">
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
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-cycling)]/40 shadow-xs"
                      : "hover:bg-[var(--color-surface-muted)]/60 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-transparent"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-[var(--color-surface-card)] border border-[var(--color-border)] ${m.accentColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[var(--color-text-primary)] truncate">
                        {m.num}. {m.label}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--color-surface-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] shrink-0">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                      {m.desc}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[var(--color-cycling)] shrink-0" />
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

