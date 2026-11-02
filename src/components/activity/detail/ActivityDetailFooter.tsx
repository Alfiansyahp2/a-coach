import React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, formatDistance } from "@/lib/formatters";
import { Activity } from "@/types";

interface ActivityDetailFooterProps {
  activity: Activity;
  prev: Activity | null;
  next: Activity | null;
}

export function ActivityDetailFooter({
  activity,
  prev,
  next,
}: ActivityDetailFooterProps) {
  return (
    <div className="pt-6 border-t border-[#1F2430] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#FC4C02] hover:text-[#ff6b2b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Athletic Telemetry Dashboard</span>
        </Link>

        <span className="text-[11px] font-mono text-[#5A6272]">
          Activity UUID: {activity.id}
        </span>
      </div>

      {(prev || next) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {prev ? (
            <Link
              href={`/activities/${prev.id}`}
              className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#FC4C02] transition-all flex items-center gap-3 group"
            >
              <ChevronLeft className="w-5 h-5 text-[#5A6272] group-hover:text-white group-hover:-translate-x-0.5 transition-all shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono text-[#9BA3AF] block">
                  ← Newer Activity
                </span>
                <span className="text-xs font-semibold text-white truncate block group-hover:text-[#FC4C02] transition-colors">
                  {prev.name}
                </span>
                <span className="text-[11px] font-mono text-[#5A6272]">
                  {formatDate(prev.start_date)} •{" "}
                  {formatDistance(prev.distance_meters)}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/activities/${next.id}`}
              className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#FC4C02] transition-all flex items-center justify-between gap-3 group text-right"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono text-[#9BA3AF] block">
                  Older Activity →
                </span>
                <span className="text-xs font-semibold text-white truncate block group-hover:text-[#FC4C02] transition-colors">
                  {next.name}
                </span>
                <span className="text-[11px] font-mono text-[#5A6272]">
                  {formatDate(next.start_date)} •{" "}
                  {formatDistance(next.distance_meters)}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#5A6272] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}

