import React from "react";
import { Target, Sparkles, PlusCircle, ShieldCheck } from "lucide-react";

interface GoalsTelemetrySummaryProps {
  totalGoalsCount: number;
  completedCount: number;
  verifiedDistanceKm: number;
  simulationMode100k: boolean;
  onToggleSimulation: () => void;
  onOpenCreateModal: () => void;
}

export function GoalsTelemetrySummary({
  totalGoalsCount,
  completedCount,
  verifiedDistanceKm,
  simulationMode100k,
  onToggleSimulation,
  onOpenCreateModal,
}: GoalsTelemetrySummaryProps) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 uppercase tracking-wider">
              Progressive Milestone Engine
            </span>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
              Modul Sasaran Jangka Panjang &amp; Adaptasi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
            <Target className="w-6 h-6 text-[var(--color-cycling)]" />
            <span>Sasaran &amp; Target Progresif Atlet</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">
            Sistem manajemen target berjenjang: saat tonggak utama tercapai, tingkat progesi berikutnya otomatis terbuka sesuai kapasitas kardiovaskular dan protokol sendi atlet.
          </p>
        </div>

        {/* Action buttons & Simulation Tester */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleSimulation}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all border flex items-center gap-2 ${
              simulationMode100k
                ? "bg-[var(--color-cycling)] text-[var(--color-canvas)] border-[var(--color-cycling)] shadow-xs"
                : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]/80"
            }`}
            title="Aktifkan simulasi target 100 km terpenuhi untuk melihat aktivasi target lanjutan"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {simulationMode100k
                ? "Simulasi 100 km: AKTIF (Tercapai)"
                : "Uji Simulasi 100 km Tercapai"}
            </span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-2 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-canvas)] text-xs font-mono font-bold hover:opacity-90 transition-all shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Sasaran Baru</span>
          </button>
        </div>
      </div>

      {/* Telemetry Numbers Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70">
          <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">
            Total Sasaran Aktif
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-mono font-black tabular-nums text-[var(--color-text-primary)]">
              {totalGoalsCount}
            </span>
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">target</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70">
          <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">
            Tonggak Tercapai (Completed)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-mono font-black tabular-nums text-[var(--color-cycling)]">
              {completedCount}
            </span>
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">selesai</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70">
          <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">
            Jarak Sepeda Terverifikasi
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-mono font-black tabular-nums text-[var(--color-text-primary)]">
              {verifiedDistanceKm.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">km</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70">
          <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">
            Status Sendi &amp; Keselamatan
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--color-cycling)]" />
            <span className="text-xs font-mono font-bold text-[var(--color-cycling)]">
              Beban Terkendali
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

