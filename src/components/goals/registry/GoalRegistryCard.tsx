import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, ArrowRight, RotateCcw, Target } from "lucide-react";
import { FitnessGoal } from "@/types";

interface GoalRegistryCardProps {
  goal: FitnessGoal;
  isPrimaryGoal: boolean;
  is100kAchieved: boolean;
  simulationMode100k: boolean;
  isActivating: boolean;
  onSetPrimary: (goalId: string, title: string) => void;
}

export function GoalRegistryCard({
  goal,
  isPrimaryGoal,
  simulationMode100k,
  isActivating,
  onSetPrimary,
}: GoalRegistryCardProps) {
  const is100k =
    goal.title.toLowerCase().includes("100") ||
    (Number(goal.target_value) === 100 && goal.unit === "km");
  const isRide =
    goal.title.toLowerCase().includes("ride") ||
    goal.title.toLowerCase().includes("sepeda") ||
    is100k;
  const isRun =
    goal.title.toLowerCase().includes("run") ||
    goal.title.toLowerCase().includes("marathon") ||
    goal.title.toLowerCase().includes("lari");

  const effectiveCurrent =
    is100k && simulationMode100k
      ? Number(goal.target_value)
      : Number(goal.current_value);
  const targetNum = Number(goal.target_value);
  const pct = Math.min(100, Math.round((effectiveCurrent / targetNum) * 100));
  const isAchieved = goal.is_achieved || pct >= 100;
  const deficit = Math.max(0, targetNum - effectiveCurrent);

  const colorToken = isRide
    ? "var(--color-cycling)"
    : isRun
    ? "var(--color-running)"
    : "var(--color-endurance)";

  return (
    <div
      className={`rounded-2xl bg-[var(--color-surface-card)] border p-5 space-y-4 shadow-xs transition-all duration-200 ${
        isPrimaryGoal
          ? "border-2 border-[var(--color-cycling)]/80 shadow-sm"
          : isAchieved
          ? "border-[var(--color-cycling)]/60 bg-[var(--color-surface-card)]"
          : "border-[var(--color-border)] hover:border-[var(--color-border)]/90"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: colorToken }}
            />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              {isRide ? "SEPEDA (CYCLING)" : isRun ? "LARI (RUNNING)" : "KONSISTENSI MINGGUAN"}
            </span>
            {isPrimaryGoal && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-cycling)] text-[var(--color-canvas)] font-mono text-[9px] font-black flex items-center gap-1 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                <span>TARGET UTAMA</span>
              </span>
            )}
            {isAchieved && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 text-[var(--color-cycling)] font-mono text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>TERCAPAI</span>
              </span>
            )}
          </div>
          <h3 className="font-sans font-bold text-base text-[var(--color-text-primary)]">
            {goal.title}
          </h3>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">
            {goal.goal_type === "FREQUENCY_WEEKLY"
              ? "Frekuensi Rutin Mingguan"
              : "Target Puncak Sekali Aktivitas (Single Effort)"}
          </span>
        </div>

        <div className="text-right shrink-0">
          <span
            className="font-mono text-2xl font-black tabular-nums block leading-none"
            style={{ color: isAchieved ? "var(--color-cycling)" : colorToken }}
          >
            {pct}%
          </span>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
            progres
          </span>
        </div>
      </div>

      {/* Progress Bar with markers */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: isAchieved ? "var(--color-cycling)" : colorToken,
              width: `${pct}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-secondary)]">
          <span>
            Tercapai:{" "}
            <strong className="text-[var(--color-text-primary)] tabular-nums font-bold">
              {effectiveCurrent.toFixed(1)} {goal.unit}
            </strong>
          </span>
          <span>
            Target:{" "}
            <strong className="text-[var(--color-text-primary)] tabular-nums font-bold">
              {targetNum.toFixed(1)} {goal.unit}
            </strong>
          </span>
        </div>
      </div>

      {/* Telemetry Breakdown Details */}
      <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 grid grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">
            Defisit Jarak / Sisa
          </span>
          <span className="font-bold text-[var(--color-text-primary)] tabular-nums">
            {deficit === 0 ? "0.0 (Tuntas)" : `${deficit.toFixed(1)} ${goal.unit}`}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">
            Batas Waktu (Deadline)
          </span>
          <span className="font-bold text-[var(--color-text-primary)]">
            {goal.target_date || "Fleksibel"}
          </span>
        </div>
      </div>

      {/* Contextual Link to next tier if achieved */}
      {isAchieved && isRide && (
        <div className="p-2.5 rounded-lg bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-[var(--color-cycling)] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Lanjutan Siap Diaktifkan di Bagian Atas</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-[var(--color-cycling)] underline">
            Lihat Pilihan ↑
          </span>
        </div>
      )}

      {/* Target Controller Action Bar */}
      <div className="pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between gap-2">
        {isPrimaryGoal ? (
          <div className="flex items-center justify-between w-full">
            <span className="px-2.5 py-1 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 text-[var(--color-cycling)] font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>★ TARGET UTAMA AKTIF</span>
            </span>
            <Link
              href="/training"
              className="px-3 py-1.5 rounded-lg bg-[var(--color-cycling)] hover:opacity-90 text-[var(--color-canvas)] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>Lihat Kalender</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
              Sasaran Sekunder
            </span>
            <button
              onClick={() => onSetPrimary(goal.id, goal.title)}
              disabled={isActivating}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isActivating ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-[var(--color-cycling)]" />
                  <span>Mengalibrasi...</span>
                </>
              ) : (
                <>
                  <Target className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                  <span>🎯 Jadikan Target Utama</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

