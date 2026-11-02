"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { TrainingInsight } from "@/types";

interface DashboardAiInsightsDeckProps {
  insights: TrainingInsight[];
}

export function DashboardAiInsightsDeck({
  insights,
}: DashboardAiInsightsDeckProps) {
  const [filter, setFilter] = useState<"all" | "warning" | "positive" | "info">("all");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const warningsCount = useMemo(
    () => insights.filter((i) => i.severity === "warning").length,
    [insights]
  );
  const positivesCount = useMemo(
    () => insights.filter((i) => i.severity === "positive").length,
    [insights]
  );
  const infosCount = useMemo(
    () => insights.filter((i) => i.severity !== "warning" && i.severity !== "positive").length,
    [insights]
  );

  const filteredInsights = useMemo(() => {
    if (filter === "all") return insights;
    if (filter === "warning") return insights.filter((i) => i.severity === "warning");
    if (filter === "positive") return insights.filter((i) => i.severity === "positive");
    return insights.filter((i) => i.severity !== "warning" && i.severity !== "positive");
  }, [insights, filter]);

  if (insights.length === 0) return null;

  return (
    <section className="bg-[#12151D] border border-[#1F2430] hover:border-[#2D3547] rounded-sm transition-all duration-200 overflow-hidden shadow-sm">
      {/* Dossier Header */}
      <div className="p-3.5 bg-[#161922] border-b border-[#1F2430] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#090A0F] border border-[#2D3547] flex items-center justify-center text-[#D4FF00] shrink-0 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
                Grounded AI Coach Analytical Dossier
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-xs bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40 font-bold">
                {insights.length} ANALISIS AKTIF
              </span>
            </div>
            <span className="text-[10.5px] font-mono text-[#9BA3AF] block">
              Sistem Analisis Beban Adaptif, Pemulihan Aerobik &amp; Variansi Fisiologis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity Segmented Filter */}
          <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-mono">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-0.5 rounded-xs transition-colors ${
                filter === "all"
                  ? "bg-[#1C212E] text-white font-bold"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Semua ({insights.length})
            </button>
            {warningsCount > 0 && (
              <button
                onClick={() => setFilter("warning")}
                className={`px-2 py-0.5 rounded-xs transition-colors flex items-center gap-1 ${
                  filter === "warning"
                    ? "bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40 font-bold"
                    : "text-[#9BA3AF] hover:text-[#FF2A6D]"
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-[#FF2A6D]" />
                <span>Peringatan ({warningsCount})</span>
              </button>
            )}
            {positivesCount > 0 && (
              <button
                onClick={() => setFilter("positive")}
                className={`px-2 py-0.5 rounded-xs transition-colors flex items-center gap-1 ${
                  filter === "positive"
                    ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-bold"
                    : "text-[#9BA3AF] hover:text-[#10B981]"
                }`}
              >
                <CheckCircle className="w-3 h-3 text-[#10B981]" />
                <span>Rekomendasi ({positivesCount})</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[#9BA3AF] hover:text-white transition-colors"
            title={isCollapsed ? "Buka Dossier" : "Tutup Dossier"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Grid of Insight Cards */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredInsights.map((ins) => {
              const isWarning = ins.severity === "warning";
              const isPositive = ins.severity === "positive";

              return (
                <div
                  key={ins.id}
                  className={`p-3.5 rounded-sm bg-[#161922] border flex flex-col justify-between transition-all duration-150 hover:bg-[#1A1F2C] ${
                    isWarning
                      ? "border-l-4 border-l-[#FF2A6D] border-[#FF2A6D]/30"
                      : isPositive
                      ? "border-l-4 border-l-[#10B981] border-[#10B981]/30"
                      : "border-l-4 border-l-[#00F0FF] border-[#1F2430]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#F0F2F5] font-mono flex items-center gap-1.5 leading-snug">
                        {isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-[#FF2A6D] shrink-0" />
                        ) : isPositive ? (
                          <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-[#00F0FF] shrink-0" />
                        )}
                        <span>{ins.title}</span>
                      </h4>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-xs shrink-0 font-bold ${
                          isWarning
                            ? "bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/30"
                            : isPositive
                            ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                            : "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
                        }`}
                      >
                        {ins.severity}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-[#9BA3AF] font-mono leading-relaxed">
                      {ins.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1F2430]/80 text-[10px] font-mono text-[#5A6272] flex items-center justify-between">
                    <span>Telemetri Valid</span>
                    <span>{formatDate(ins.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
