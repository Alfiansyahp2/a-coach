"use client";

import React from "react";
import { AthletePainLog } from "@/types";
import { History, ShieldCheck, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/formatters";

interface PainLogsTabProps {
  recentPainLogs: AthletePainLog[];
}

export function PainLogsTab({ recentPainLogs }: PainLogsTabProps) {
  const getPainColor = (val: number | null | undefined) => {
    const num = val ?? 0;
    if (num === 0) return "text-[var(--color-cycling)] bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30";
    if (num <= 3) return "text-[var(--color-alert-amber)] bg-[var(--color-alert-amber)]/10 border-[var(--color-alert-amber)]/30";
    return "text-[var(--color-alert-red)] bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/30";
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 font-mono shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)] text-xs">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--color-cycling)]" />
          <h3 className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            Rekam Jejak Pemantauan Nyeri Sendi Longitudinal (Skala 0–10)
          </h3>
        </div>
        <span className="text-[10px] text-[var(--color-text-secondary)] px-2.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] w-fit font-bold">
          {recentPainLogs.length} Catatan Terverifikasi
        </span>
      </div>

      {recentPainLogs.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-muted)]/30">
          Belum ada catatan nyeri yang terdaftar.
        </div>
      ) : (
        <div className="space-y-3">
          {recentPainLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">
                    {log.body_region} ({log.side})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] font-bold">
                    {log.associated_activity}
                  </span>
                  <span className="text-[10.5px] text-[var(--color-text-muted)]">
                    {formatDate(log.logged_at)}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  {log.functional_limitations || "Pemantauan nyeri teratur pasca pembebanan sendi."}
                </p>
              </div>

              {/* 3 Pain Gauge Badges */}
              <div className="grid grid-cols-3 gap-2 text-center shrink-0 w-full md:w-auto">
                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] min-w-20">
                  <span className="text-[9.5px] text-[var(--color-text-muted)] block uppercase font-bold">
                    Saat Sesi
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold border font-tabular ${getPainColor(
                      log.pain_during_activity
                    )}`}
                  >
                    {log.pain_during_activity ?? 0} / 10
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] min-w-20">
                  <span className="text-[9.5px] text-[var(--color-text-muted)] block uppercase font-bold">
                    Segera Usai
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold border font-tabular ${getPainColor(
                      log.pain_immediately_after
                    )}`}
                  >
                    {log.pain_immediately_after ?? 0} / 10
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] min-w-20">
                  <span className="text-[9.5px] text-[var(--color-text-muted)] block uppercase font-bold">
                    24 Jam Pasca
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold border font-tabular ${getPainColor(
                      log.pain_24h_after
                    )}`}
                  >
                    {log.pain_24h_after ?? 0} / 10
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
