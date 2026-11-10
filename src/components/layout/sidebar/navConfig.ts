import React from "react";
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  ShieldCheck,
  Footprints,
  Bike,
  Target,
  Activity,
  UserCircle,
  ClipboardCheck,
} from "lucide-react";

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  getBadge?: (ctx: SidebarDynamicContext) => { text: string; color: "amber" | "green" | "muted" | "brand" } | null;
}

export interface SidebarDynamicContext {
  activitiesCount: number;
  streakWeeks: number;
  hasActiveRestrictions: boolean;
  stravaConnected: boolean;
  goalsCount: number;
}

export const navSections: NavSection[] = [
  {
    title: "Telemetri & Analitik",
    items: [
      {
        name: "Overview",
        href: "/",
        icon: LayoutDashboard,
        getBadge: () => ({ text: "LIVE", color: "green" }),
      },
      {
        name: "Rekap Mingguan",
        href: "/recap",
        icon: ClipboardCheck,
        getBadge: () => ({ text: "1M", color: "brand" }),
      },
      {
        name: "Riwayat Aktivitas",
        href: "/activities",
        icon: FolderKanban,
        getBadge: (ctx) => ({
          text: String(ctx.activitiesCount || 37),
          color: "muted",
        }),
      },
    ],
  },
  {
    title: "Pelatihan & Coach",
    items: [
      {
        name: "Kalender Latihan",
        href: "/training",
        icon: Calendar,
        getBadge: () => ({ text: "12W", color: "muted" }),
      },
      {
        name: "Running Coach",
        href: "/coach/running",
        icon: Footprints,
        getBadge: (ctx) =>
          ctx.hasActiveRestrictions
            ? { text: "HOLD", color: "amber" }
            : { text: "READY", color: "green" },
      },
      {
        name: "Cycling Coach",
        href: "/coach/cycling",
        icon: Bike,
        getBadge: () => ({ text: "ACTIVE", color: "green" }),
      },
      {
        name: "Sasaran & Target",
        href: "/goals",
        icon: Target,
        getBadge: (ctx) => ({ text: String(ctx.goalsCount || 4), color: "muted" }),
      },
    ],
  },
  {
    title: "Profil & Medis",
    items: [
      {
        name: "Profil Atlet",
        href: "/profile",
        icon: UserCircle,
        getBadge: () => ({ text: "PRO", color: "muted" }),
      },
      {
        name: "Profil Kesehatan",
        href: "/health",
        icon: ShieldCheck,
        getBadge: (ctx) =>
          ctx.hasActiveRestrictions
            ? { text: "GATE", color: "amber" }
            : { text: "SAFE", color: "green" },
      },
      {
        name: "Integrasi Strava",
        href: "/#strava-gateway",
        icon: Activity,
        getBadge: (ctx) =>
          ctx.stravaConnected
            ? { text: "SYNC", color: "green" }
            : { text: "DISC", color: "muted" },
      },
    ],
  },
];

