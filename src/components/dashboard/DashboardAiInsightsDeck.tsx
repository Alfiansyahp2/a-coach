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
  Activity,
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

  const filteredInsights = useMemo(() => {
    if (filter === "all") return insights;
    if (filter === "warning") return insights.filter((i) => i.severity === "warning");
    if (filter === "positive") return insights.filter((i) => i.severity === "positive");
    return insights.filter((i) => i.severity !== "warning" && i.severity !== "positive");
  }, [insights, filter]);

  if (insights.length === 0) return null;

  // Identify primary priority hero insight (first warning or first item)
  const heroInsight = filteredInsights.find((i) => i.severity === "warning") || filteredInsights[0];
  const secondaryInsights = filteredInsights.filter((i) => i.id !== heroInsight?.id);

  return (
    <section className="relative rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 border-t-[var(--color-cycling)] shadow-xs overflow-hidden font-mono">
      {/* Dossier Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shrink-0 shadow-xs relative">
            <Activity className="w-5 h-5 text-[var(--color-cycling)]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--color-endurance)] ring-2 ring-[var(--color-surface-card)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-extrabold text-[var(--color-text-primary)]">
                Coach Analytical Dossier
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-bold tracking-wide">
                {insights.length} REKOMENDASI AKTIF
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--color-text-secondary)] block mt-0.5">
              Sistem Analisis Beban Adaptif, Pemulihan Aerobik &amp; Kesiapan Biomekanis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Severity Pill Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-mono">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md transition-all duration-200 ${
                filter === "all"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Semua ({insights.length})
            </button>
            {warningsCount > 0 && (
              <button
                onClick={() => setFilter("warning")}
                className={`px-3 py-1 rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                  filter === "warning"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-alert-red)] font-bold shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-alert-red)]"
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-[var(--color-alert-red)]" />
                <span>Peringatan ({warningsCount})</span>
              </button>
            )}
            {positivesCount > 0 && (
              <button
                onClick={() => setFilter("positive")}
                className={`px-3 py-1 rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                  filter === "positive"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-endurance)] font-bold shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-endurance)]"
                }`}
              >
                <CheckCircle className="w-3 h-3 text-[var(--color-endurance)]" />
                <span>Rekomendasi ({positivesCount})</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all shadow-xs"
            title={isCollapsed ? "Buka Dossier" : "Tutup Dossier"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content: Hero Insight + Secondary Pods */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Asymmetric Hero Card: Focus on the Highest Priority AI Insight */}
          {heroInsight && (
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 relative overflow-hidden shadow-xs ${
                heroInsight.severity === "warning"
                  ? "bg-[var(--color-surface-muted)] border-[var(--color-alert-red)]/40"
                  : heroInsight.severity === "positive"
                  ? "bg-[var(--color-surface-muted)] border-[var(--color-endurance)]/40"
                  : "bg-[var(--color-surface-muted)] border-[var(--color-border)]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                      heroInsight.severity === "warning"
                        ? "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30"
                        : heroInsight.severity === "positive"
                        ? "bg-[var(--color-endurance)]/10 text-[var(--color-endurance)] border border-[var(--color-endurance)]/30"
                        : "bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)]"
                    }`}
                  >
                    {heroInsight.severity === "warning" ? (
                      <AlertTriangle className="w-5 h-5 text-[var(--color-alert-red)]" />
                    ) : heroInsight.severity === "positive" ? (
                      <CheckCircle className="w-5 h-5 text-[var(--color-endurance)]" />
                    ) : (
                      <Info className="w-5 h-5 text-[var(--color-cycling)]" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-text-muted)] block font-bold">
                      Analisis Prioritas AI Pelatih
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] font-mono tracking-tight">
                      {heroInsight.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-mono px-3 py-1 rounded-full font-extrabold tracking-wider border shadow-xs ${
                      heroInsight.severity === "warning"
                        ? "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border-[var(--color-alert-red)]/30"
                        : heroInsight.severity === "positive"
                        ? "bg-[var(--color-endurance)]/10 text-[var(--color-endurance)] border-[var(--color-endurance)]/30"
                        : "bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                    }`}
                  >
                    {heroInsight.severity === "warning" ? "PERINGATAN KRITIS" : heroInsight.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">
                    {formatDate(heroInsight.created_at)}
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-mono leading-relaxed">
                  {heroInsight.description}
                </p>
              </div>
            </div>
          )}

          {/* Secondary AI Insight Cards in Dual Grid */}
          {secondaryInsights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {secondaryInsights.map((ins) => {
                const isWarning = ins.severity === "warning";
                const isPositive = ins.severity === "positive";

                return (
                  <div
                    key={ins.id}
                    className="p-4 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 hover:border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-all duration-200 flex flex-col justify-between shadow-xs group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isWarning
                                ? "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)]"
                                : isPositive
                                ? "bg-[var(--color-endurance)]/10 text-[var(--color-endurance)]"
                                : "bg-[var(--color-surface-card)] text-[var(--color-cycling)]"
                            }`}
                          >
                            {isWarning ? (
                              <AlertTriangle className="w-4 h-4 text-[var(--color-alert-red)]" />
                            ) : isPositive ? (
                              <CheckCircle className="w-4 h-4 text-[var(--color-endurance)]" />
                            ) : (
                              <Info className="w-4 h-4 text-[var(--color-cycling)]" />
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-[var(--color-text-primary)] font-mono leading-snug truncate group-hover:underline transition-colors">
                            {ins.title}
                          </h4>
                        </div>
                        <span
                          className={`text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full shrink-0 font-bold border ${
                            isWarning
                              ? "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border-[var(--color-alert-red)]/30"
                              : isPositive
                              ? "bg-[var(--color-endurance)]/10 text-[var(--color-endurance)] border-[var(--color-endurance)]/30"
                              : "bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                          }`}
                        >
                          {ins.severity}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] font-mono leading-relaxed">
                        {ins.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[var(--color-border)] text-[10.5px] font-mono text-[var(--color-text-muted)] flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                        <Activity className="w-3 h-3 text-[var(--color-cycling)]" />
                        <span>Preskripsi Telemetri Valid</span>
                      </span>
                      <span>{formatDate(ins.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
