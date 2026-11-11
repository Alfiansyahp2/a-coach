"use client";

import React from "react";

interface EditProfilePhysiologyTabProps {
  ftpWatts: string;
  setFtpWatts: (v: string) => void;
  liveWkg: string | null;
  vo2Max: string;
  setVo2Max: (v: string) => void;
  thresholdPaceMin: string;
  setThresholdPaceMin: (v: string) => void;
  thresholdPaceSec: string;
  setThresholdPaceSec: (v: string) => void;
}

export function EditProfilePhysiologyTab({
  ftpWatts,
  setFtpWatts,
  liveWkg,
  vo2Max,
  setVo2Max,
  thresholdPaceMin,
  setThresholdPaceMin,
  thresholdPaceSec,
  setThresholdPaceSec,
}: EditProfilePhysiologyTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Functional Threshold Power (FTP Watts)
          </label>
          <input
            type="number"
            value={ftpWatts}
            onChange={(e) => setFtpWatts(e.target.value)}
            placeholder="165"
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
          {liveWkg && (
            <span className="text-[10px] font-mono text-[var(--color-cycling)] block mt-1">
              Kalkulasi: {liveWkg} W/kg rasio daya
            </span>
          )}
        </div>

        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Estimasi VO2 Max (ml/kg/min)
          </label>
          <input
            type="number"
            step="0.5"
            value={vo2Max}
            onChange={(e) => setVo2Max(e.target.value)}
            placeholder="48.5"
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] block mt-1">
            Standar aerobik multi-sport
          </span>
        </div>
      </div>

      <div>
        <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
          Ambang Laju Lari (Running Threshold Pace)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={thresholdPaceMin}
            onChange={(e) => setThresholdPaceMin(e.target.value)}
            className="w-20 px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
          <span className="text-sm font-bold">:</span>
          <input
            type="number"
            value={thresholdPaceSec}
            onChange={(e) => setThresholdPaceSec(e.target.value)}
            className="w-20 px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
          <span className="text-xs text-[var(--color-text-muted)]">/km</span>
        </div>
      </div>
    </div>
  );
}

