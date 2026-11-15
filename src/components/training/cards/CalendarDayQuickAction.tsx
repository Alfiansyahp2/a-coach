"use client";

import React from "react";
import { AddActivityModal } from "@/components/AddActivityModal";
import { ScheduledWorkout } from "@/types";

interface CalendarDayQuickActionProps {
  dateStr: string;
  defaultWorkout?: ScheduledWorkout | null;
}

export function CalendarDayQuickAction({
  dateStr,
  defaultWorkout,
}: CalendarDayQuickActionProps) {
  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <AddActivityModal
        variant="compact"
        defaultDate={dateStr}
        defaultWorkout={defaultWorkout}
      />
    </div>
  );
}

