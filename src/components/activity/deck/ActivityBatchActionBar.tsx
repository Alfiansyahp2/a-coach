"use client";

import React from "react";
import { CheckSquare, RefreshCw, X } from "lucide-react";

interface ActivityBatchActionBarProps {
  selectedIds: string[];
  totalFilteredCount?: number;
  onSelectAllFiltered?: () => void;
  batchSport: string;
  setBatchSport: (v: string) => void;
  batchLoading: boolean;
  onApplyBatch: () => void;
  onCancel: () => void;
}

export function ActivityBatchActionBar({
  selectedIds,
  totalFilteredCount,
  onSelectAllFiltered,
  batchSport,
  setBatchSport,
  batchLoading,
  onApplyBatch,
  onCancel,
}: ActivityBatchActionBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-cycling)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[var(--color-cycling)]">
        <div className="flex items-center gap-2 font-bold">
          <div className="w-6 h-6 rounded-md bg-[var(--color-cycling)]/15 flex items-center justify-center text-[var(--color-cycling)]">
            <CheckSquare className="w-4 h-4" />
          </div>
          <span>
            <strong className="text-sm font-tabular">{selectedIds.length}</strong> sesi terpilih
          </span>
        </div>

        {totalFilteredCount && totalFilteredCount > selectedIds.length && onSelectAllFiltered && (
          <button
            type="button"
            onClick={onSelectAllFiltered}
            className="text-[11px] underline text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)] transition-colors cursor-pointer"
          >
            Pilih semua {totalFilteredCount} sesi yang tampil
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[var(--color-text-secondary)] text-[11px] font-medium">Ubah Cabang Massal:</span>
        <select
          value={batchSport}
          onChange={(e) => setBatchSport(e.target.value)}
          disabled={batchLoading}
          className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-cycling)] cursor-pointer shadow-xs"
        >
          <option value="Run">Run (Lari)</option>
          <option value="Ride">Ride (Sepeda)</option>
          <option value="Swim">Swim (Renang)</option>
          <option value="Walk">Walk (Jalan)</option>
          <option value="Hike">Hike (Hiking)</option>
          <option value="WeightTraining">Weight Training (Gym)</option>
          <option value="Workout">Workout (Umum)</option>
          <option value="CrossTraining">Cross Training</option>
        </select>

        <button
          type="button"
          onClick={onApplyBatch}
          disabled={batchLoading}
          className="px-4 py-1.5 rounded-lg bg-[var(--color-cycling)] hover:opacity-90 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {batchLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memperbarui...</span>
            </>
          ) : (
            <span>Terapkan Perubahan</span>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={batchLoading}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
        >
          <X className="w-3.5 h-3.5" />
          <span>Batal</span>
        </button>
      </div>
    </div>
  );
}
