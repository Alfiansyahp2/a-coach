"use client";

import React from "react";
import { CheckSquare, RefreshCw, X, ShieldAlert, Sparkles } from "lucide-react";

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

  const isAllFilteredSelected =
    totalFilteredCount !== undefined &&
    totalFilteredCount > 0 &&
    selectedIds.length >= totalFilteredCount;

  return (
    <div className="p-3 sm:p-3.5 rounded-sm bg-gradient-to-r from-[#12151D] via-[#1A2234] to-[#12151D] border border-[#00F0FF]/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.1)] animate-in fade-in duration-150">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[#00F0FF]">
        <div className="flex items-center gap-1.5 font-bold">
          <CheckSquare className="w-4 h-4 text-[#00F0FF]" />
          <span>
            <strong className="text-sm font-tabular">{selectedIds.length}</strong> sesi terpilih
          </span>
        </div>

        {totalFilteredCount && totalFilteredCount > selectedIds.length && onSelectAllFiltered && (
          <button
            type="button"
            onClick={onSelectAllFiltered}
            className="text-[11px] underline text-[#9BA3AF] hover:text-[#00F0FF] transition-colors cursor-pointer"
          >
            Pilih semua {totalFilteredCount} sesi yang tampil
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[#9BA3AF] text-[11px]">Ubah Cabang Massal:</span>
        <select
          value={batchSport}
          onChange={(e) => setBatchSport(e.target.value)}
          disabled={batchLoading}
          className="px-2.5 py-1 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-white font-mono focus:outline-none focus:border-[#00F0FF] cursor-pointer"
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
          className="px-3.5 py-1 rounded-sm bg-[#00F0FF] hover:bg-[#00c8d6] text-black font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.98]"
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
          className="px-2.5 py-1 rounded-sm bg-[#090A0F] hover:bg-[#1C212E] text-[#9BA3AF] hover:text-white border border-[#1F2430] transition-colors cursor-pointer flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          <span>Batal</span>
        </button>
      </div>
    </div>
  );
}
