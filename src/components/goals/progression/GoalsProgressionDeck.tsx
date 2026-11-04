import React from "react";
import { Bike, CheckCircle2, TrendingUp } from "lucide-react";
import { FitnessGoal } from "@/types";
import { ProgressionTemplate } from "../data/cyclingProgressionData";
import { ProgressionGoalCard } from "./ProgressionGoalCard";

interface GoalsProgressionDeckProps {
  templates: ProgressionTemplate[];
  goals: FitnessGoal[];
  is100kAchieved: boolean;
  onActivateProgression: (template: ProgressionTemplate) => void;
}

export function GoalsProgressionDeck({
  templates,
  goals,
  is100kAchieved,
  onActivateProgression,
}: GoalsProgressionDeckProps) {
  return (
    <section className="rounded-2xl bg-[var(--color-surface-card)] border-2 border-[var(--color-cycling)]/40 p-5 sm:p-6 space-y-5 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                is100kAchieved
                  ? "bg-[var(--color-cycling)] text-[var(--color-canvas)]"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
              }`}
            >
              {is100kAchieved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>TONGGAK 100 KM TERCAPAI • TINGKAT LANJUTAN TERBUKA</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                  <span>PROGRESI BERIKUTNYA SIAP DIAKTIFKAN</span>
                </>
              )}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-sans text-[var(--color-text-primary)] flex items-center gap-2">
            <Bike className="w-5 h-5 text-[var(--color-cycling)]" />
            <span>Target Lanjutan Sepeda (Cycling Progression Engine)</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {is100kAchieved
              ? "Selamat! Target 100 km Century Ride pertama Anda telah terpenuhi. Pilih target sepeda lanjutan di bawah untuk melanjutkan progres tanpa risiko overtraining."
              : "Saat Anda menuntaskan target 100 km sepeda, sistem menyediakan pilihan target berjenjang berikut (dapat juga diaktifkan sekarang sebagai target jangka panjang):"}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] font-semibold">
            {templates.length} Target Tersedia
          </span>
        </div>
      </div>

      {/* Progression Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tmpl) => {
          const isAlreadyActive = goals.some((g) => g.title === tmpl.title);
          return (
            <ProgressionGoalCard
              key={tmpl.id}
              template={tmpl}
              isAlreadyActive={isAlreadyActive}
              onActivate={onActivateProgression}
            />
          );
        })}
      </div>
    </section>
  );
}

