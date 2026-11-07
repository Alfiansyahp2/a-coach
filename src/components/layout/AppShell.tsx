"use client";

import React, { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { User } from "@/types";

interface AppShellProps {
  children: ReactNode;
  user?: User | null;
  dbStatus?: { type: string; connected: boolean };
  healthContext?: any;
  streakWeeks?: number;
}

export function AppShell({
  children,
  user,
  dbStatus = { type: "PostgreSQL", connected: true },
  healthContext,
  streakWeeks,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex bg-[var(--color-canvas)] text-[var(--color-text-primary)] transition-colors duration-200">
      {/* 1. Left Athletic Rail Navigation */}
      <AppSidebar />

      {/* 2. Main Content & Header Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          user={user || null}
          dbStatus={dbStatus}
          healthContext={healthContext}
          streakWeeks={streakWeeks}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {children}
        </main>

        <footer className="border-t border-[var(--color-border)] py-4 px-6 text-center text-[11px] text-[var(--color-text-muted)] font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ENDURANCE PERFORMANCE LAB • Athletic Telemetry &amp; Coaching Engine</span>
          <span className="text-[10px]">Next.js 16 + PostgreSQL 16 • Strava API v3</span>
        </footer>
      </div>
    </div>
  );
}
