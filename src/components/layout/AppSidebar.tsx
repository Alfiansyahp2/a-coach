"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "@/types";
import { navSections, SidebarDynamicContext } from "./sidebar/navConfig";

export interface AppSidebarProps {
  user?: User | null;
  dbStatus?: { type: string; connected: boolean };
  healthContext?: any;
  streakWeeks?: number;
  activitiesCount?: number;
}

export function AppSidebar({
  healthContext,
  streakWeeks = 10,
  activitiesCount: initialActivitiesCount,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activitiesCount, setActivitiesCount] = useState<number>(initialActivitiesCount || 37);
  const [stravaConnected, setStravaConnected] = useState<boolean>(true);
  const [goalsCount, setGoalsCount] = useState<number>(4);

  // Periksa apakah terdapat batasan cedera aktif
  const hasActiveRestrictions = Boolean(
    healthContext?.clinicianRestrictions?.length > 0 ||
    healthContext?.injuries?.some((inj: any) => inj.current_status !== "RESOLVED")
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("endurance_sidebar_expanded");
      if (saved !== null) {
        setIsExpanded(saved === "true");
      }
    } catch (e) {
      // ignore
    }

    let isMounted = true;
    if (!initialActivitiesCount) {
      fetch("/api/activities?limit=100")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.success && Array.isArray(data.activities)) {
            setActivitiesCount(data.activities.length);
          }
        })
        .catch(() => {});
    }

    fetch("/api/auth/strava/status")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.isConnected !== undefined) {
          setStravaConnected(Boolean(data.isConnected));
        }
      })
      .catch(() => {});

    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setGoalsCount(data.length);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [initialActivitiesCount]);

  const toggleExpand = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    try {
      localStorage.setItem("endurance_sidebar_expanded", String(nextState));
    } catch (e) {
      // ignore
    }
  };

  const dynamicContext: SidebarDynamicContext = {
    activitiesCount,
    streakWeeks,
    hasActiveRestrictions,
    stravaConnected,
    goalsCount,
  };

  return (
    <aside
      className={`hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen border-r border-[var(--color-border)] bg-[var(--color-surface-card)] transition-all duration-200 z-40 select-none shadow-xs relative ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      {/* Tombol Toggle Perluas/Ciutkan di Tengah (Vertical Center) */}
      <button
        onClick={toggleExpand}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)] shadow-md flex items-center justify-center transition-all cursor-pointer group hover:scale-110"
        title={isExpanded ? "Ciutkan Sidebar" : "Perluas Sidebar"}
        aria-label={isExpanded ? "Ciutkan Sidebar" : "Perluas Sidebar"}
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        ) : (
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        )}
      </button>

      {/* 1. Header: Logo & Identitas Platform */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-14 border-b border-[var(--color-border)] flex items-center justify-between px-3.5 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden group"
            title="Endurance Performance Lab"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-text-primary)] text-[var(--color-canvas)] flex items-center justify-center font-mono font-black text-xs shrink-0 tracking-tighter shadow-xs">
              EP
            </div>
            {isExpanded && (
              <div className="truncate">
                <span className="font-extrabold text-xs tracking-tight text-[var(--color-text-primary)] block font-mono">
                  ENDURANCE LAB
                </span>
                <span className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-widest block uppercase">
                  Telemetry v2.0
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* 2. Navigasi Dikelompokkan (Kategori Menu Terstruktur) */}
        <nav className="p-2 space-y-4 overflow-y-auto flex-1 font-mono">
          {navSections.map((section, idx) => (
            <div key={section.title} className="space-y-1">
              {isExpanded && (
                <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
                  <span>{section.title}</span>
                  {idx === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)] animate-pulse" />
                  )}
                </div>
              )}

              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                const badge = item.getBadge ? item.getBadge(dynamicContext) : null;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                      isActive
                        ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-semibold shadow-xs"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]/60"
                    }`}
                    title={!isExpanded ? `${item.name}${badge ? ` [${badge.text}]` : ""}` : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-[var(--color-cycling)]"
                          : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]"
                      }`}
                    />
                    {isExpanded && (
                      <span className="truncate flex-1 font-sans text-xs">{item.name}</span>
                    )}
                    {isExpanded && badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                          badge.color === "amber"
                            ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                            : badge.color === "green"
                            ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                            : badge.color === "brand"
                            ? "bg-[var(--color-endurance)]/15 text-[var(--color-endurance)] border-[var(--color-endurance)]/30"
                            : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                        }`}
                      >
                        {badge.text}
                      </span>
                    )}

                    {/* Active Pip Indicator untuk mode ciut */}
                    {isActive && !isExpanded && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[var(--color-cycling)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* 4. Footer: Status Sistem & Versi */}
      <div className="p-2.5 border-t border-[var(--color-border)] shrink-0 font-mono text-[10px] text-[var(--color-text-muted)]">
        {isExpanded ? (
          <div className="flex items-center justify-between px-1">
            <span className="truncate">ENDURANCE LAB</span>
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] font-bold text-[9px]">
              v2.0
            </span>
          </div>
        ) : (
          <div className="flex justify-center font-bold text-[9px] text-[var(--color-text-muted)]">
            v2.0
          </div>
        )}
      </div>
    </aside>
  );
}
