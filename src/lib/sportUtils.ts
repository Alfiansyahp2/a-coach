/**
 * Unified Sport Type Utilities & Domain Extensibility Engine
 * Endurance Performance Lab Design System
 */

import {
  Bike,
  Footprints,
  Waves,
  Dumbbell,
  Compass,
  Activity as ActivityIcon,
} from "lucide-react";
import React from "react";
import { Activity } from "@/types";

export interface SportMeta {
  id: string;
  name: string;
  label: string;
  iconName: "bike" | "footprints" | "waves" | "dumbbell" | "compass" | "activity";
  colorKey: "cycling" | "running" | "sky" | "amber" | "rose" | "endurance";
  accentHex: string;
  badgeClass: string;
  isPaceFormat: boolean; // true = mm:ss /km, false = km/h
}

export const PRESET_SPORTS: SportMeta[] = [
  {
    id: "Ride",
    name: "Sepeda",
    label: "Sepeda (Ride)",
    iconName: "bike",
    colorKey: "cycling",
    accentHex: "#4D947B",
    badgeClass: "bg-[#4D947B]/15 text-[#4D947B] border-[#4D947B]/30",
    isPaceFormat: false,
  },
  {
    id: "Run",
    name: "Lari",
    label: "Lari (Run)",
    iconName: "footprints",
    colorKey: "running",
    accentHex: "#D98757",
    badgeClass: "bg-[#D98757]/15 text-[#D98757] border-[#D98757]/30",
    isPaceFormat: true,
  },
  {
    id: "Swim",
    name: "Renang",
    label: "Renang (Swim)",
    iconName: "waves",
    colorKey: "sky",
    accentHex: "#38BDF8",
    badgeClass: "bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30",
    isPaceFormat: false,
  },
  {
    id: "Walk",
    name: "Jalan Kaki",
    label: "Jalan Kaki (Walk)",
    iconName: "compass",
    colorKey: "amber",
    accentHex: "#E5A84B",
    badgeClass: "bg-[#E5A84B]/15 text-[#E5A84B] border-[#E5A84B]/30",
    isPaceFormat: true,
  },
  {
    id: "Hike",
    name: "Hiking",
    label: "Hiking (Hike)",
    iconName: "compass",
    colorKey: "amber",
    accentHex: "#E5A84B",
    badgeClass: "bg-[#E5A84B]/15 text-[#E5A84B] border-[#E5A84B]/30",
    isPaceFormat: true,
  },
  {
    id: "WeightTraining",
    name: "Gym & Beban",
    label: "Gym / Beban (WeightTraining)",
    iconName: "dumbbell",
    colorKey: "rose",
    accentHex: "#D65F58",
    badgeClass: "bg-[#D65F58]/15 text-[#D65F58] border-[#D65F58]/30",
    isPaceFormat: false,
  },
  {
    id: "Workout",
    name: "Latihan Umum",
    label: "Workout / Kondisioning",
    iconName: "activity",
    colorKey: "endurance",
    accentHex: "#B9DC72",
    badgeClass: "bg-[#B9DC72]/20 text-[#55781a] dark:text-[#B9DC72] border-[#B9DC72]/40",
    isPaceFormat: false,
  },
];

/**
 * Returns metadata and styling for any sport type, including custom dynamic ones.
 */
export function getSportMeta(sportType: string): SportMeta {
  const norm = (sportType || "").toLowerCase().trim();

  // Cycling variants
  if (norm.includes("ride") || norm.includes("cycl") || norm.includes("bike")) {
    return PRESET_SPORTS[0];
  }
  // Running variants
  if (norm.includes("run") || norm.includes("jog") || norm.includes("fartlek")) {
    return PRESET_SPORTS[1];
  }
  // Swimming variants
  if (norm.includes("swim") || norm.includes("renang")) {
    return PRESET_SPORTS[2];
  }
  // Walk variants
  if (norm.includes("walk") || norm.includes("jalan")) {
    return PRESET_SPORTS[3];
  }
  // Hike variants
  if (norm.includes("hike") || norm.includes("gunung")) {
    return PRESET_SPORTS[4];
  }
  // Gym / Strength variants
  if (norm.includes("weight") || norm.includes("gym") || norm.includes("strength") || norm.includes("beban")) {
    return PRESET_SPORTS[5];
  }
  // Workout
  if (norm.includes("workout") || norm.includes("training") || norm.includes("cross")) {
    return PRESET_SPORTS[6];
  }

  // Dynamic / Custom Sport Fallback
  const cleanTitle = sportType ? sportType.charAt(0).toUpperCase() + sportType.slice(1) : "Olahraga";
  return {
    id: sportType || "Custom",
    name: cleanTitle,
    label: `${cleanTitle} (Kustom)`,
    iconName: "activity",
    colorKey: "cycling",
    accentHex: "#4D947B",
    badgeClass: "bg-[#4D947B]/15 text-[#4D947B] border-[#4D947B]/30",
    isPaceFormat: false,
  };
}

/**
 * Extract all distinct sport types from an array of activities.
 * Preserves high-priority sports (Ride, Run) first, then adds any custom sports.
 */
export function getDistinctSports(activities: Activity[]): string[] {
  const set = new Set<string>();

  // Extract from real activities
  for (const a of activities) {
    if (a.sport_type && a.sport_type.trim()) {
      set.add(a.sport_type.trim());
    }
  }

  // Ensure Ride & Run are included as baseline if activities exist
  const list = Array.from(set);
  
  // Sort with Ride and Run first, then others alphabetically
  return list.sort((a, b) => {
    const isARide = a.toLowerCase().includes("ride");
    const isBRide = b.toLowerCase().includes("ride");
    if (isARide && !isBRide) return -1;
    if (!isARide && isBRide) return 1;

    const isARun = a.toLowerCase().includes("run");
    const isBRun = b.toLowerCase().includes("run");
    if (isARun && !isBRun) return -1;
    if (!isARun && isBRun) return 1;

    return a.localeCompare(b);
  });
}
