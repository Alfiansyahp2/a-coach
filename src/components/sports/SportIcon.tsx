"use client";

import React from "react";
import { SportCluster } from "@/types/sportTelemetry";
import { findSystemSport } from "@/lib/domain/sports/systemSportsRegistry";
import {
  Footprints,
  Bike,
  Mountain,
  Waves,
  Sailboat,
  Timer,
  Weight,
  Dumbbell,
  BicepsFlexed,
  Anvil,
  HandFist,
  Swords,
  ShieldAlert,
  Sword,
  Users,
  Zap,
  Volleyball,
  Goal,
  Trophy,
  RugbyBall,
  HockeyStick,
  BowArrow,
  Crosshair,
  Flame,
  Pickaxe,
  Sparkles,
  Activity,
  Tag,
  LucideProps,
} from "lucide-react";

// --- Custom Handcrafted 24x24 SVG Sports Icons ---

export function SoccerBallIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 8, 15.8 10.8, 14.3 15.5, 9.7 15.5, 8.2 10.8" />
      <line x1="12" y1="8" x2="12" y2="2" />
      <line x1="15.8" y1="10.8" x2="21.5" y2="8.9" />
      <line x1="14.3" y1="15.5" x2="17.9" y2="20.1" />
      <line x1="9.7" y1="15.5" x2="6.1" y2="20.1" />
      <line x1="8.2" y1="10.8" x2="2.5" y2="8.9" />
    </svg>
  );
}

export function BasketballIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2v20" />
      <path d="M4.93 4.93a10 10 0 0 1 0 14.14" />
      <path d="M19.07 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  );
}

export function ShuttlecockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18a3 3 0 0 0 6 0" />
      <path d="m6 7 3 11" />
      <path d="m18 7-3 11" />
      <path d="M6 7c2-1 4-1 6-1s4 0 6 1" />
      <path d="M7.5 12c1.5-.7 3-.7 4.5-.7s3 0 4.5.7" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </svg>
  );
}

export function TennisBallIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M5.5 5.5a9.5 9.5 0 0 1 0 13" />
      <path d="M18.5 5.5a9.5 9.5 0 0 0 0 13" />
    </svg>
  );
}

export function TableTennisIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="14" cy="9" r="6" />
      <path d="m9.5 13.5-5 5a2 2 0 0 0 2.8 2.8l5-5" />
      <circle cx="5" cy="6" r="1.5" />
    </svg>
  );
}

export function CalisthenicsRingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="4" x2="21" y2="4" />
      <line x1="8" y1="4" x2="8" y2="12" />
      <line x1="16" y1="4" x2="16" y2="12" />
      <circle cx="8" cy="15" r="3" />
      <circle cx="16" cy="15" r="3" />
    </svg>
  );
}

export function SurfboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3c-3 1-8 7-9 13 2 1 5 1 7-1 3-3 4-8 2-12z" />
      <path d="M3 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
    </svg>
  );
}

export function SkateboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 9c2-2 18-2 20 0" />
      <path d="M3 13.5h18" />
      <circle cx="7" cy="17" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </svg>
  );
}

// --- Specific Sport Code to Icon Component Mapping (33 Sports) ---

type IconComponent = React.ComponentType<any>;

export const SPORT_ICON_COMPONENT_MAP: Record<string, IconComponent> = {
  // 1. CYCLIC ENDURANCE
  SPORT_DISTANCE_RUNNING: Footprints,
  SPORT_ROAD_CYCLING: Bike,
  SPORT_MTB_XC: Mountain,
  SPORT_SWIMMING: Waves,
  SPORT_ROWING: Sailboat,
  SPORT_TRIATHLON: Timer,

  // 2. STRENGTH & POWER
  SPORT_POWERLIFTING: Weight,
  SPORT_WEIGHTLIFTING: Dumbbell,
  SPORT_CALISTHENICS: CalisthenicsRingsIcon,
  SPORT_STRONGMAN: Anvil,
  SPORT_BODYBUILDING: BicepsFlexed,

  // 3. COMBAT & MARTIAL ARTS
  SPORT_BOXING: HandFist,
  SPORT_MMA: Swords,
  SPORT_BJJ: ShieldAlert,
  SPORT_PENCAK_SILAT: Sword,
  SPORT_JUDO: Users,
  SPORT_MUAY_THAI: Zap,

  // 4. TEAM FIELD & COURT
  SPORT_FOOTBALL: SoccerBallIcon,
  SPORT_BASKETBALL: BasketballIcon,
  SPORT_VOLLEYBALL: Volleyball,
  SPORT_FUTSAL: Goal,
  SPORT_RUGBY: RugbyBall,
  SPORT_FIELD_HOCKEY: HockeyStick,

  // 5. RACQUET & PRECISION
  SPORT_BADMINTON: ShuttlecockIcon,
  SPORT_TENNIS: TennisBallIcon,
  SPORT_TABLE_TENNIS: TableTennisIcon,
  SPORT_ARCHERY: BowArrow,
  SPORT_SHOOTING: Crosshair,

  // 6. FUNCTIONAL & EXTREME
  SPORT_FUNCTIONAL_FITNESS: Flame,
  SPORT_CLIMBING: Pickaxe,
  SPORT_GYMNASTICS: Sparkles,
  SPORT_SURFING: SurfboardIcon,
  SPORT_SKATEBOARDING: SkateboardIcon,
};

// Cluster default icons fallback
export const CLUSTER_DEFAULT_ICONS: Record<SportCluster, IconComponent> = {
  CYCLIC_ENDURANCE: Bike,
  STRENGTH_POWER: Dumbbell,
  COMBAT_MARTIAL_ARTS: Swords,
  TEAM_FIELD_COURT: Trophy,
  RACQUET_PRECISION: Crosshair,
  FUNCTIONAL_EXTREME: Flame,
};

// Cluster default color schemes
export const CLUSTER_COLOR_MAP: Record<SportCluster, string> = {
  CYCLIC_ENDURANCE: "text-[var(--color-cycling)]",
  STRENGTH_POWER: "text-[var(--color-endurance)]",
  COMBAT_MARTIAL_ARTS: "text-rose-400",
  TEAM_FIELD_COURT: "text-amber-400",
  RACQUET_PRECISION: "text-purple-400",
  FUNCTIONAL_EXTREME: "text-emerald-400",
};

export interface SportIconProps extends React.SVGProps<SVGSVGElement> {
  sportCode?: string;
  sportName?: string;
  cluster?: SportCluster;
  className?: string;
  applyColor?: boolean;
}

export function SportIcon({
  sportCode,
  sportName,
  cluster,
  className = "w-4 h-4",
  applyColor = true,
  ...rest
}: SportIconProps) {
  // Resolve system sport item
  const resolved = sportCode
    ? SPORT_ICON_COMPONENT_MAP[sportCode]
      ? { code: sportCode, cluster: cluster || "CYCLIC_ENDURANCE" }
      : findSystemSport(sportCode)
    : sportName
    ? findSystemSport(sportName)
    : undefined;

  const activeCluster: SportCluster = cluster || resolved?.cluster || "CYCLIC_ENDURANCE";
  const IconComp = (resolved && SPORT_ICON_COMPONENT_MAP[resolved.code]) || CLUSTER_DEFAULT_ICONS[activeCluster] || Activity;
  const colorClass = applyColor ? CLUSTER_COLOR_MAP[activeCluster] || "text-[var(--color-cycling)]" : "";

  return <IconComp className={`${className} ${colorClass}`.trim()} {...rest} />;
}
