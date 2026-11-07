"use client";

import React from "react";
import Link from "next/link";
import { Footprints, Bike, ShieldCheck, Sparkles } from "lucide-react";

interface CoachHeaderStripProps {
  currentMode: "running" | "cycling";
  onSelectMode?: (mode: "running" | "cycling") => void;
}

export function CoachHeaderStrip({ currentMode, onSelectMode }: CoachHeaderStripProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-4 font-mono">
      {/* Top Meta Line: Identity & Safety Boundary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)] text-xs">
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <Sparkles className="w-4 h-4 text-[var(--color-cycling)]" />
          <span className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            ENDURANCE LAB
          </span>
          <span>/</span>
          <span className="text-[var(--color-text-muted)]">AI Coach Intelligence &amp; Multi-Sport Guidance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[var(--color-cycling)]" />
            <span>Sports Science Decision-Support Engine</span>
          </span>
        </div>
      </div>

      {/* Main Coach Selector Tabs (Matching Image) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            {currentMode === "running" ? "AI Running Coach — Return-to-Run & Safety Gate" : "AI Cycling Coach — Zone 2 Base & 100K Century Ride"}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {currentMode === "running"
              ? "Protokol rehabilitasi benturan sendi (ankle & knee), evaluasi klinis, dan adaptasi lari bertahap."
              : "Preskripsi beban tertutup (closed-chain), fondasi mitokondria Zone 2, dan roadmap 12-minggu Century Ride MTB."}
          </p>
        </div>

        {/* Coach Tabs Group */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs shrink-0">
          {/* Running Coach Tab */}
          <Link
            href="/coach/running"
            onClick={(e) => {
              if (onSelectMode) {
                e.preventDefault();
                onSelectMode("running");
              }
            }}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
              currentMode === "running"
                ? "bg-[var(--color-surface-card)] text-[var(--color-running)] font-bold shadow-xs border border-[var(--color-border)] ring-1 ring-[var(--color-running)]/20"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)]/40"
            }`}
          >
            <Footprints
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentMode === "running" ? "text-[var(--color-running)]" : "text-[var(--color-text-muted)]"
              }`}
            />
            <span className="font-sans">Running Coach</span>
            <span className="text-[8.5px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              HOLD
            </span>
          </Link>

          {/* Cycling Coach Tab */}
          <Link
            href="/coach/cycling"
            onClick={(e) => {
              if (onSelectMode) {
                e.preventDefault();
                onSelectMode("cycling");
              }
            }}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg font-medium transition-all ${
              currentMode === "cycling"
                ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] font-bold shadow-xs border border-[var(--color-border)] ring-1 ring-[var(--color-cycling)]/20"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)]/40"
            }`}
          >
            <Bike
              className={`w-4 h-4 shrink-0 transition-colors ${
                currentMode === "cycling" ? "text-[var(--color-cycling)]" : "text-[var(--color-text-muted)]"
              }`}
            />
            <span className="font-sans">Cycling Coach</span>
            <span className="text-[8.5px] px-1.5 py-0.2 rounded-full font-bold bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30">
              ACTIVE
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

