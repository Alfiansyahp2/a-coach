import React from "react";
import { MapPin, Navigation } from "lucide-react";
import { Activity } from "@/types";

interface ActivityGpsTrackMapProps {
  activity: Activity;
}

export function ActivityGpsTrackMap({ activity }: ActivityGpsTrackMapProps) {
  if (!activity.raw_summary_polyline) return null;

  return (
    <section className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden font-mono shadow-xs">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
          <Navigation className="w-4 h-4 text-[var(--color-cycling)]" />
          <span>GPS Telemetry Route Track</span>
        </div>
        <span className="text-[11px] font-mono text-[var(--color-text-secondary)] px-2.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          Real Strava Track Visual
        </span>
      </div>

      <div className="relative bg-[var(--color-surface-muted)] h-80 sm:h-96 w-full flex items-center justify-center overflow-hidden p-6">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Route Visual */}
        <img
          src={activity.raw_summary_polyline}
          alt="GPS Route Track"
          className="relative z-10 max-h-full max-w-full object-contain filter contrast-125 hover:scale-105 transition-transform duration-300"
        />

        {/* Bottom Telemetry Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[var(--color-surface-card)]/95 backdrop-blur-md border border-[var(--color-border)] text-xs font-mono shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              <span>Polyline Path Vector</span>
            </div>
            <span className="text-[var(--color-border)]">•</span>
            <span className="text-[var(--color-text-secondary)]">
              Sensor Track: <strong className="text-[var(--color-text-primary)]">{activity.sport_type}</strong>
            </span>
          </div>

          <div className="text-[11px] text-[var(--color-text-muted)]">
            Source: <code className="text-[var(--color-cycling)]">{activity.raw_summary_polyline}</code>
          </div>
        </div>
      </div>
    </section>
  );
}
