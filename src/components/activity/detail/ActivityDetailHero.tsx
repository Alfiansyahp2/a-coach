import React from "react";
import { EditActivityModal } from "@/components/EditActivityModal";
import { formatDistance, formatDate } from "@/lib/formatters";
import { Calendar, Clock } from "lucide-react";
import { Activity } from "@/types";

interface ActivityDetailHeroProps {
  activity: Activity;
  isRun: boolean;
  paceStr: string;
  speedKmhStr: string;
}

export function ActivityDetailHero({
  activity,
  isRun,
  paceStr,
  speedKmhStr,
}: ActivityDetailHeroProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {activity.name}
            </h1>
            <EditActivityModal activity={activity} variant="button" />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#9BA3AF] font-mono">
            <span className="flex items-center gap-1.5 text-[#F0F2F5]">
              <Calendar className="w-3.5 h-3.5 text-[#FC4C02]" />
              {formatDate(activity.start_date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#5A6272]" />
              {new Date(activity.start_date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-[#3A404D]">|</span>
            <EditActivityModal activity={activity} variant="inline" />
            {activity.description && (
              <>
                <span>•</span>
                <span className="text-[#9BA3AF] italic">
                  {activity.description}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick KPI Pill Group */}
        <div className="flex items-center gap-3 bg-[#12151D] border border-[#1F2430] px-4 py-2.5 rounded-sm">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-[#9BA3AF]">
              Distance
            </div>
            <div className="text-lg font-black font-mono font-tabular text-white">
              {formatDistance(activity.distance_meters)}
            </div>
          </div>
          <div className="h-8 w-px bg-[#232838]" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-[#9BA3AF]">
              {isRun ? "Avg Pace" : "Avg Speed"}
            </div>
            <div
              className={`text-lg font-black font-mono font-tabular ${
                isRun ? "text-[#D4FF00]" : "text-[#00F0FF]"
              }`}
            >
              {isRun ? paceStr : speedKmhStr}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

