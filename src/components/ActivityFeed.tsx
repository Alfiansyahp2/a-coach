"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Activity } from '@/types';
import {
  formatDistance,
  formatDuration,
  formatDate,
  speedMpsToPace,
  speedMpsToKmh,
} from '@/lib/formatters';
import {
  Activity as ActivityIcon,
  ChevronRight,
  Filter,
  Flame,
  Gauge,
  Heart,
  Navigation,
  Search,
} from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [selectedSport, setSelectedSport] = useState<'All' | 'Run' | 'Ride'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(8);

  const runsCount = useMemo(
    () => activities.filter((a) => a.sport_type.toLowerCase().includes('run')).length,
    [activities]
  );
  const ridesCount = useMemo(
    () => activities.filter((a) => a.sport_type.toLowerCase().includes('ride') || a.sport_type.toLowerCase().includes('cycl')).length,
    [activities]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSport =
        selectedSport === 'All'
          ? true
          : selectedSport === 'Run'
          ? act.sport_type.toLowerCase().includes('run')
          : act.sport_type.toLowerCase().includes('ride') || act.sport_type.toLowerCase().includes('cycl');

      const matchesSearch =
        searchQuery.trim() === ''
          ? true
          : act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            act.sport_type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSport && matchesSearch;
    });
  }, [activities, selectedSport, searchQuery]);

  const visibleActivities = filteredActivities.slice(0, displayCount);

  return (
    <div className="bg-[#12151D] border border-[#232838] rounded-xl p-5 space-y-4">
      {/* Feed Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#232838]">
        <div>
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-[#FC4C02]" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Ingested Activity Stream
            </h3>
          </div>
          <p className="text-[11px] text-[#9BA3AF] font-mono pt-0.5">
            Synchronized Strava Telemetry • {activities.length} Recorded Sessions
          </p>
        </div>

        {/* Sport Type Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#090A0F] border border-[#232838] self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setSelectedSport('All')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              selectedSport === 'All'
                ? 'bg-[#1A1E28] text-white shadow-sm'
                : 'text-[#9BA3AF] hover:text-white'
            }`}
          >
            All ({activities.length})
          </button>
          <button
            onClick={() => setSelectedSport('Run')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedSport === 'Run'
                ? 'bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30'
                : 'text-[#9BA3AF] hover:text-[#D4FF00]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
            Run ({runsCount})
          </button>
          <button
            onClick={() => setSelectedSport('Ride')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedSport === 'Ride'
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                : 'text-[#9BA3AF] hover:text-[#00F0FF]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
            Ride ({ridesCount})
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6272]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by activity name (e.g. Tempo, Long Run, Base)..."
          className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#0E1118] border border-[#232838] text-xs text-white placeholder-[#5A6272] focus:outline-none focus:border-[#FC4C02] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9BA3AF] hover:text-white uppercase font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* Activity Cards List */}
      {visibleActivities.length === 0 ? (
        <div className="py-10 text-center text-xs text-[#5A6272] font-mono border border-dashed border-[#232838] rounded-lg">
          No activities match your filter query.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleActivities.map((act) => {
            const isRun = act.sport_type.toLowerCase().includes('run');
            const velocity = isRun
              ? speedMpsToPace(act.average_speed_mps)
              : speedMpsToKmh(act.average_speed_mps);

            return (
              <Link
                key={act.id}
                href={`/activities/${act.id}`}
                className="group p-3 rounded-lg bg-[#161922] border border-[#232838] hover:border-[#FC4C02]/60 hover:bg-[#1A1E28] transition-all flex items-center justify-between"
              >
                {/* Left: Track Visual & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {act.raw_summary_polyline ? (
                    <div className="w-12 h-12 rounded-lg bg-[#090A0F] border border-[#232838] flex items-center justify-center p-1 shrink-0 overflow-hidden group-hover:border-[#FC4C02] transition-colors">
                      <img
                        src={act.raw_summary_polyline}
                        alt="GPS Track Route"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(252,76,2,0.6)] group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#12151D] border border-[#232838] flex items-center justify-center shrink-0">
                      <Navigation className="w-5 h-5 text-[#5A6272]" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                          isRun
                            ? 'bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30'
                            : 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                        }`}
                      >
                        {act.sport_type}
                      </span>
                      <h4 className="text-xs font-semibold text-white group-hover:text-[#FC4C02] transition-colors truncate">
                        {act.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#9BA3AF] font-mono">
                      <span>{formatDate(act.start_date)}</span>
                      <span>•</span>
                      <span>{formatDuration(act.moving_time_seconds)}</span>
                      {act.average_heartrate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#f43f5e]">
                            <Heart className="w-3 h-3 fill-current" />
                            <span className="font-tabular">{Math.round(act.average_heartrate)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Distance, Pace & Chevron */}
                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <div className="text-right">
                    <div className="text-sm font-bold font-tabular text-white tracking-tight">
                      {formatDistance(act.distance_meters)}
                    </div>
                    <div className="text-[11px] text-[#FC4C02] font-semibold font-tabular">
                      {velocity}
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded bg-[#12151D] border border-[#232838] flex items-center justify-center text-[#5A6272] group-hover:text-white group-hover:border-[#FC4C02]/50 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer: Pagination / View Count Toggle */}
      {filteredActivities.length > 8 && (
        <div className="pt-2 border-t border-[#232838] flex items-center justify-between text-xs font-mono text-[#9BA3AF]">
          <span>
            Showing <strong className="text-white font-tabular">{visibleActivities.length}</strong> of{' '}
            <strong className="text-white font-tabular">{filteredActivities.length}</strong> sessions
          </span>

          {displayCount < filteredActivities.length ? (
            <button
              onClick={() => setDisplayCount(filteredActivities.length)}
              className="px-3 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1A1E28] text-white border border-[#232838] hover:border-[#FC4C02]/40 transition-colors font-medium text-xs"
            >
              Show All {filteredActivities.length} Activities
            </button>
          ) : (
            <button
              onClick={() => setDisplayCount(8)}
              className="px-3 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1A1E28] text-[#9BA3AF] hover:text-white border border-[#232838] transition-colors font-medium text-xs"
            >
              Collapse to 8 Recent
            </button>
          )}
        </div>
      )}
    </div>
  );
}

