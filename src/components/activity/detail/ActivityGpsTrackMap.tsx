import React from "react";
import { MapPin, Navigation } from "lucide-react";
import { Activity } from "@/types";

interface ActivityGpsTrackMapProps {
  activity: Activity;
}

export function ActivityGpsTrackMap({ activity }: ActivityGpsTrackMapProps) {
  if (!activity.raw_summary_polyline) return null;

  return (
    <section className="bg-[#12151D] border border-[#1F2430] rounded-sm overflow-hidden">
      <div className="p-4 border-b border-[#1F2430] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
          <Navigation className="w-4 h-4 text-[#FC4C02]" />
          <span>GPS Telemetry Route Track</span>
        </div>
        <span className="text-[11px] font-mono text-[#9BA3AF] px-2.5 py-0.5 rounded bg-[#161922] border border-[#1F2430]">
          Real Strava Track Visual
        </span>
      </div>

      <div className="relative bg-[#090A0F] h-80 sm:h-96 w-full flex items-center justify-center overflow-hidden p-6">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #2B3245 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glowing Route Visual */}
        <img
          src={activity.raw_summary_polyline}
          alt="GPS Route Track"
          className="relative z-10 max-h-full max-w-full object-contain filter brightness-110 hover:scale-105 transition-transform duration-300"
        />

        {/* Bottom Telemetry Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 p-3 rounded-sm bg-[#12151D]/90 backdrop-blur-md border border-[#1F2430] text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white">
              <MapPin className="w-3.5 h-3.5 text-[#FC4C02]" />
              <span>Polyline Path Vector</span>
            </div>
            <span className="text-[#5A6272]">•</span>
            <span className="text-[#9BA3AF]">
              Sensor Track: <strong className="text-white">{activity.sport_type}</strong>
            </span>
          </div>

          <div className="text-[11px] text-[#9BA3AF]">
            Source: <code className="text-[#00F0FF]">{activity.raw_summary_polyline}</code>
          </div>
        </div>
      </div>
    </section>
  );
}

