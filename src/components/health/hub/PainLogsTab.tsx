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
    if (num === 0) return "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30";
    if (num <= 3) return "text-[#FF9500] bg-[#FF9500]/15 border-[#FF9500]/30";
    return "text-[#FF2A6D] bg-[#FF2A6D]/15 border-[#FF2A6D]/30";
  };

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1F2430] text-xs">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#D4FF00]" />
          <h3 className="font-bold text-[#F0F2F5] uppercase tracking-wider">
            Rekam Jejak Pemantauan Nyeri Sendi Longitudinal (Skala 0–10)
          </h3>
        </div>
        <span className="text-[10px] text-[#9BA3AF] px-2 py-0.5 rounded-xs bg-[#161922] border border-[#1F2430] w-fit">
          {recentPainLogs.length} Catatan Terverifikasi
        </span>
      </div>

      {recentPainLogs.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#5A6272] border border-dashed border-[#1F2430] rounded-sm">
          Belum ada catatan nyeri yang terdaftar.
        </div>
      ) : (
        <div className="space-y-3">
          {recentPainLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-[#F0F2F5]">
                    {log.body_region} ({log.side})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#090A0F] text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                    {log.associated_activity}
                  </span>
                  <span className="text-[10.5px] text-[#5A6272]">
                    {formatDate(log.logged_at)}
                  </span>
                </div>

                <p className="text-[11px] text-[#9BA3AF] leading-relaxed">
                  {log.functional_limitations || "Pemantauan nyeri teratur pasca pembebanan sendi."}
                </p>
              </div>

              {/* 3 Pain Gauge Badges */}
              <div className="grid grid-cols-3 gap-2 text-center shrink-0 w-full md:w-auto">
                <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430] min-w-20">
                  <span className="text-[9.5px] text-[#5A6272] block uppercase font-bold">
                    Saat Sesi
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-xs text-xs font-bold border font-tabular ${getPainColor(
                      log.pain_during_activity
                    )}`}
                  >
                    {log.pain_during_activity ?? 0} / 10
                  </span>
                </div>

                <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430] min-w-20">
                  <span className="text-[9.5px] text-[#5A6272] block uppercase font-bold">
                    Segera Usai
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-xs text-xs font-bold border font-tabular ${getPainColor(
                      log.pain_immediately_after
                    )}`}
                  >
                    {log.pain_immediately_after ?? 0} / 10
                  </span>
                </div>

                <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430] min-w-20">
                  <span className="text-[9.5px] text-[#5A6272] block uppercase font-bold">
                    24 Jam Pasca
                  </span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-xs text-xs font-bold border font-tabular ${getPainColor(
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
