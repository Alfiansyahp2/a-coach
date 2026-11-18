import React from "react";
import { Check, PlusCircle, ShieldCheck } from "lucide-react";
import { ProgressionTemplate } from "../data/cyclingProgressionData";

interface ProgressionGoalCardProps {
  template: ProgressionTemplate;
  isAlreadyActive: boolean;
  onActivate: (template: ProgressionTemplate) => void;
}

export function ProgressionGoalCard({
  template,
  isAlreadyActive,
  onActivate,
}: ProgressionGoalCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
        isAlreadyActive
          ? "bg-[var(--color-surface-muted)]/40 border-[var(--color-cycling)]/60 shadow-xs"
          : "bg-[var(--color-surface-muted)]/20 border-[var(--color-border)] hover:border-[var(--color-cycling)]/80 hover:bg-[var(--color-surface-muted)]/50"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-cycling)] border border-[var(--color-border)]">
            {template.tag} • TIER {template.tier}
          </span>
          <span className="font-mono text-[11px] font-black text-[var(--color-text-primary)]">
            {template.targetValue} {template.unit}
          </span>
        </div>

        <h3 className="font-sans font-bold text-sm text-[var(--color-text-primary)] leading-snug">
          {template.title}
        </h3>

        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {template.description}
        </p>

        <div className="pt-1 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text-secondary)]">Fokus Latihan:</span>
            <span>{template.focusArea}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-cycling)]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{template.safetyProtocol}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
          Estimasi Siklus: {template.durationWeeks} Minggu
        </span>

        {isAlreadyActive ? (
          <span className="px-2.5 py-1 rounded-lg bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Sedang Aktif</span>
          </span>
        ) : (
          <button
            onClick={() => onActivate(template)}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-cycling)] hover:opacity-90 text-[var(--color-canvas)] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Aktifkan Target Ini</span>
          </button>
        )}
      </div>
    </div>
  );
}

