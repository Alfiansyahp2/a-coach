"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  ShieldCheck,
  Footprints,
  Bike,
  Target,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCircle,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Profil Atlet", href: "/profile", icon: UserCircle, badge: "PRO" },
  { name: "Kalender Latihan", href: "/training", icon: Calendar, badge: "12W" },
  { name: "Riwayat Aktivitas", href: "/activities", icon: FolderKanban, badge: "34" },
  { name: "Profil Kesehatan", href: "/health", icon: ShieldCheck, badge: "GATE" },
  { name: "Running Coach", href: "/coach/running", icon: Footprints, badge: "HOLD" },
  { name: "Cycling Coach", href: "/coach/cycling", icon: Bike, badge: "ACTIVE" },
  { name: "Sasaran & Target", href: "/goals", icon: Target, badge: "TARGET" },
  { name: "Integrasi Strava", href: "/#strava-gateway", icon: Activity },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen border-r border-[var(--color-border)] bg-[var(--color-surface-card)] transition-all duration-200 z-40 select-none shadow-xs ${
        isExpanded ? "w-60" : "w-16"
      }`}
    >
      {/* Top: Logo & Platform Identity */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-14 border-b border-[var(--color-border)] flex items-center justify-between px-3.5 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden group"
            title="Endurance Performance Lab"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-text-primary)] text-[var(--color-canvas)] flex items-center justify-center font-mono font-black text-xs shrink-0 tracking-tighter">
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

        {/* Navigation Items with independent scroll if viewport is short */}
        <nav className="p-2 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-semibold shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]/60"
                }`}
                title={!isExpanded ? item.name : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-[var(--color-cycling)]"
                      : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]"
                  }`}
                />
                {isExpanded && (
                  <span className="truncate flex-1 font-sans">{item.name}</span>
                )}
                {isExpanded && item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                      item.badge === "HOLD"
                        ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                        : item.badge === "ACTIVE"
                        ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Left Active Pip for Collapsed State */}
                {isActive && !isExpanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[var(--color-cycling)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Collapse Toggle & System Label */}
      <div className="p-2 border-t border-[var(--color-border)] shrink-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors text-xs font-mono cursor-pointer"
          title={isExpanded ? "Ciutkan Sidebar" : "Perluas Sidebar"}
        >
          {isExpanded ? (
            <div className="flex items-center gap-2 w-full px-1">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] truncate">Ciutkan Menu</span>
            </div>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
