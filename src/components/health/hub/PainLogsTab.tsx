"use client";

import React from "react";
import { AthletePainLog } from "@/types";
import { History } from "lucide-react";

interface PainLogsTabProps {
  recentPainLogs: AthletePainLog[];
}

export function PainLogsTab({ recentPainLogs }: PainLogsTabProps) {
  return (
    <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
        <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-[#D4FF00]" />
          Rekam Jejak Pemantauan Nyeri Longitudinal (Pain Scale 0–10)
        </span>
        <span className="text-[#5A6272]">{recentPainLogs.length} Entri Tercatat</span>
      </div>

      <div className="space-y-2">
        {recentPainLogs.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-sm bg-[#161922] border border-[#1F2430] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F0F2F5]">{log.body_region} ({log.side})</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#090A0F] text-[#00F0FF] border border-[#1F2430]">
                  {log.associated_activity}
                </span>
                <span className="text-[10px] text-[#5A6272]">
                  {new Date(log.logged_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-[11px] text-[#9BA3AF]">
                {log.functional_limitations || "Pemantauan nyeri teratur pasca pembebanan"}
              </p>
            </div>

            <div className="flex items-center gap-4 text-center shrink-0">
              <div className="p-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] min-w-16">
                <span className="text-[9px] text-[#5A6272] block">Saat Sesi</span>
                <span className="text-sm font-bold font-tabular text-[#FF2A6D]">{log.pain_during_activity ?? 0}/10</span>
              </div>
              <div className="p-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] min-w-16">
                <span className="text-[9px] text-[#5A6272] block">Segera Usai</span>
                <span className="text-sm font-bold font-tabular text-[#FF2A6D]">{log.pain_immediately_after ?? 0}/10</span>
              </div>
              <div className="p-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] min-w-16">
                <span className="text-[9px] text-[#5A6272] block">24 Jam Nanti</span>
                <span className="text-sm font-bold font-tabular text-[#10B981]">{log.pain_24h_after ?? 0}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

