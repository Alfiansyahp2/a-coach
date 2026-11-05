"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  PlusCircle,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  FolderKanban,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { AddActivityModal } from "@/components/AddActivityModal";
import { EditAthleteProfileModal } from "@/components/health/EditAthleteProfileModal";
import { NavbarStreakBadge } from "./NavbarStreakBadge";
import { User } from "@/types";

interface AppHeaderProps {
  user: User | null;
  dbStatus?: { type: string; connected: boolean };
  healthContext?: any;
  streakWeeks?: number;
}

export function AppHeader({ user, healthContext, streakWeeks }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getSectionTitle = () => {
    if (pathname === "/") return "Overview Telemetri";
    if (pathname.startsWith("/goals")) return "Sasaran & Target Progresif";
    if (pathname.startsWith("/training")) return "Kalender & Periodisasi 12-Minggu";
    if (pathname.startsWith("/health")) return "Dossier Kesehatan & Beban Sendi";
    if (pathname.startsWith("/activities")) return "Registry Aktivitas & Telemetri";
    return "Endurance Performance Lab";
  };

  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface-card)] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
      {/* Left: Mobile Toggle, Streak Flame Badge, & Section Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Animated Fire Streak Badge - Positioned at Left Corner */}
        <NavbarStreakBadge initialWeeks={streakWeeks} />

        <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-2.5 sm:pl-3">
          <span className="font-mono text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider hidden sm:inline">
            ENDURANCE LAB
          </span>
          <span className="text-[var(--color-border)] hidden sm:inline">/</span>
          <h1 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] truncate font-sans">
            {getSectionTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Add Activity, Athlete Profile, & Theme Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Activity Action */}
        <AddActivityModal variant="button" />

        {/* Athlete Profile Badge */}
        {user && (
          <div className="flex items-center gap-2">
            <EditAthleteProfileModal
              user={user}
              profile={healthContext?.profile}
              healthContext={healthContext}
              variant="badge"
            />

            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-[var(--color-border)] object-cover shadow-xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-xs font-mono font-bold text-[var(--color-cycling)]">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-[var(--color-text-primary)] leading-none">
                  {user.name}
                </div>
                <div className="text-[9px] text-[var(--color-cycling)] font-semibold leading-tight pt-0.5">
                  Calibrated
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Theme Toggle Button: Chalk (Light) ↔ Graphite (Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)]/70 hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all shadow-xs"
          title={`Beralih ke ${theme === "light" ? "Mode Gelap (Graphite)" : "Mode Terang (Chalk)"}`}
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <Moon className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[var(--color-surface-card)] border-b border-[var(--color-border)] p-4 shadow-xl space-y-2 z-50 animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]"
          >
            <LayoutDashboard className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Overview Dashboard</span>
          </Link>
          <Link
            href="/goals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]"
          >
            <Target className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Sasaran &amp; Target Progresif</span>
          </Link>
          <Link
            href="/training"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]"
          >
            <Calendar className="w-4 h-4 text-[var(--color-endurance)]" />
            <span>Kalender Latihan 12-Minggu</span>
          </Link>
          <Link
            href="/health"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--color-alert-red)]" />
            <span>Profil Kesehatan &amp; Sendi</span>
          </Link>
          <Link
            href="/activities"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]"
          >
            <FolderKanban className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Registry Aktivitas Strava</span>
          </Link>
        </div>
      )}
    </header>
  );
}
