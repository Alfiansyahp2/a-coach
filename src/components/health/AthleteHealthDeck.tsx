"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AuthoritativeAthleteHealthContext,
  Activity,
} from "@/types";
import {
  ShieldAlert,
  Gauge,
  Zap,
  ArrowRight,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { PostActivityCheckinModal } from "./PostActivityCheckinModal";
import { AthleteHealthDirectives } from "./AthleteHealthDirectives";

interface AthleteHealthDeckProps {
  healthContext: AuthoritativeAthleteHealthContext | null;
  recentActivities?: Activity[];
}

export function AthleteHealthDeck({
  healthContext,
  recentActivities = [],
}: AthleteHealthDeckProps) {
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "directives" | "risks">("overview");
  const [isExpanded, setIsExpanded] = useState(false);

  if (!healthContext || !healthContext.profile) {
    return null;
  }

  return (
    <div className="relative rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 border-t-[var(--color-alert-red)] shadow-xs transition-all duration-200 overflow-hidden font-mono">
      {/* 1. Header Bar: System Mode & Quick Actions with Persistent Clinical Warning Tone */}
      <div
        className={`p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 ${
          isExpanded ? "border-b border-[var(--color-border)]" : ""
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-alert-red)]/15 border border-[var(--color-alert-red)]/40 flex items-center justify-center text-[var(--color-alert-red)] shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-[var(--color-alert-red)] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Biomechanical Load &amp; Joint Safety Gate</span>
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--color-alert-red)] text-white font-black uppercase tracking-wider shadow-xs">
                [GATE: ACTIVE]
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-[var(--color-text-secondary)] mt-1">
              <span>Protokol Proteksi Sendi:</span>
              <span className="px-1.5 py-0.2 rounded bg-[var(--color-alert-red)]/10 border border-[var(--color-alert-red)]/30 text-[var(--color-alert-red)] font-bold text-[10px]">
                Engkel Kanan (ATFL)
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[var(--color-alert-amber)]/10 border border-[var(--color-alert-amber)]/30 text-[var(--color-alert-amber)] font-bold text-[10px]">
                Patella Bilateral
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <Link
            href="/health"
            className="px-2.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-text-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-semibold transition-all flex items-center gap-1.5 shadow-xs text-[11px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span className="hidden sm:inline">DETAIL PROFIL</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setIsCheckinOpen(true)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-alert-red)] hover:text-[var(--color-alert-red)] font-bold transition-all flex items-center gap-1.5 shadow-xs text-[11px] cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[var(--color-alert-red)]" />
            <span>CHECK-IN NYERI</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
              isExpanded
                ? "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                : "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/40 text-[var(--color-alert-red)] hover:bg-[var(--color-alert-red)]/20"
            }`}
            title={isExpanded ? "Tutup Rincian Pembatasan Beban" : "Buka Rincian Pembatasan Beban"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Sub-Tabs Pill Selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs w-fit">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-semibold cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              <span>Kapasitas Lari vs Sepeda</span>
            </button>
            <button
              onClick={() => setActiveTab("directives")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-semibold cursor-pointer ${
                activeTab === "directives"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[var(--color-alert-amber)]" />
              <span>Panduan Taktis Latihan</span>
            </button>
            <button
              onClick={() => setActiveTab("risks")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-semibold cursor-pointer ${
                activeTab === "risks"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-alert-red)]" />
              <span>Matriks Risiko Sendi</span>
            </button>
          </div>

          <AthleteHealthDirectives activeTab={activeTab} />
        </div>
      )}

      {/* Checkin Modal */}
      <PostActivityCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        recentActivities={recentActivities}
      />
    </div>
  );
}
