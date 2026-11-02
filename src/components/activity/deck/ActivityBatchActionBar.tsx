import React from "react";
import { CheckSquare, RefreshCw } from "lucide-react";

interface ActivityBatchActionBarProps {
  selectedIds: string[];
  batchSport: string;
  setBatchSport: (v: string) => void;
  batchLoading: boolean;
  onApplyBatch: () => void;
  onCancel: () => void;
}

export function ActivityBatchActionBar({
  selectedIds,
  batchSport,
  setBatchSport,
  batchLoading,
  onApplyBatch,
  onCancel,
}: ActivityBatchActionBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="p-3 rounded-sm bg-[#161922] border border-[#00F0FF]/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-in fade-in duration-150">
      <div className="flex items-center gap-2 text-[#00F0FF]">
        <CheckSquare className="w-4 h-4" />
        <span>
          <strong>{selectedIds.length}</strong> sesi terpilih untuk aksi massal
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[#9BA3AF]">Ubah Cabang:</span>
        <select
          value={batchSport}
          onChange={(e) => setBatchSport(e.target.value)}
          disabled={batchLoading}
          className="px-2 py-1 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-white"
        >
          <option value="Run">Run (Lari)</option>
          <option value="Ride">Ride (Sepeda)</option>
          <option value="Walk">Walk (Jalan)</option>
          <option value="Hike">Hike (Hiking)</option>
          <option value="Workout">Workout (Umum)</option>
        </select>

        <button
          onClick={onApplyBatch}
          disabled={batchLoading}
          className="px-3 py-1 rounded-sm bg-[#00F0FF] hover:bg-[#00c8d6] text-black font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {batchLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memperbarui...</span>
            </>
          ) : (
            <span>Terapkan Massal</span>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={batchLoading}
          className="px-2.5 py-1 rounded-sm bg-[#090A0F] hover:bg-[#1C212E] text-[#9BA3AF] hover:text-white border border-[#1F2430]"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

