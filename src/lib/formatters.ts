/**
 * Athlete & Sports Performance Formatters
 */

export function formatDistance(meters: number): string {
  if (!meters || isNaN(meters)) return '0.00 km';
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDurationHuman(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${mins}m`;
}

/**
 * Convert meters per second (mps) to Running Pace (mm:ss /km).
 */
export function speedMpsToPace(mps: number): string {
  if (!mps || mps <= 0) return '--:-- /km';
  const secondsPerKm = 1000 / mps;
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
}

/**
 * Convert pace in seconds per km to readable string (e.g., 330 => '05:30 /km').
 */
export function formatPaceSeconds(secondsPerKm: number | null | undefined): string {
  if (!secondsPerKm || secondsPerKm <= 0) return '--:-- /km';
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
}

/**
 * Parse pace string (e.g. '5:30' or '05:30') to seconds per km.
 */
export function parsePaceToSeconds(paceStr: string): number | null {
  if (!paceStr) return null;
  const clean = paceStr.replace('/km', '').trim();
  const parts = clean.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (!isNaN(mins) && !isNaN(secs)) {
      return mins * 60 + secs;
    }
  }
  return null;
}


/**
 * Convert meters per second (mps) to kilometers per hour (km/h) for cycling.
 */
export function speedMpsToKmh(mps: number): string {
  if (!mps || mps <= 0) return '0.0 km/h';
  const kmh = mps * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

export function formatHeartRate(bpm: number | null | undefined): string {
  if (!bpm || isNaN(bpm)) return '-- bpm';
  return `${Math.round(bpm)} bpm`;
}

export function formatCadence(cadence: number | null | undefined, sportType: string = 'Run'): string {
  if (!cadence || isNaN(cadence)) return '--';
  const unit = sportType.toLowerCase().includes('run') ? 'spm' : 'rpm';
  return `${Math.round(cadence)} ${unit}`;
}

export function formatPower(watts: number | null | undefined): string {
  if (!watts || isNaN(watts)) return '-- W';
  return `${Math.round(watts)} W`;
}

export function formatCalories(cal: number | null | undefined): string {
  if (!cal || isNaN(cal)) return '-- kcal';
  return `${Math.round(cal).toLocaleString()} kcal`;
}

/**
 * Estimate percentage time in 5 standard heart rate zones given average HR and max HR
 */
export function estimateHeartRateZones(avgHr: number, maxHr?: number | null) {
  const peak = maxHr || Math.round(avgHr * 1.15);
  const z2Threshold = peak * 0.70;
  const z3Threshold = peak * 0.80;
  const z4Threshold = peak * 0.90;

  if (avgHr < z2Threshold) {
    return [
      { zone: 'Z1 Active Recovery', range: `< ${Math.round(peak * 0.6)} bpm`, pct: 30, color: '#38bdf8' },
      { zone: 'Z2 Aerobic Base', range: `${Math.round(peak * 0.6)} - ${Math.round(z2Threshold)} bpm`, pct: 55, color: '#10b981' },
      { zone: 'Z3 Tempo Sustained', range: `${Math.round(z2Threshold)} - ${Math.round(z3Threshold)} bpm`, pct: 12, color: '#f59e0b' },
      { zone: 'Z4 Lactate Threshold', range: `${Math.round(z3Threshold)} - ${Math.round(z4Threshold)} bpm`, pct: 3, color: '#f97316' },
      { zone: 'Z5 Neuromuscular VO2', range: `> ${Math.round(z4Threshold)} bpm`, pct: 0, color: '#ef4444' },
    ];
  } else if (avgHr < z3Threshold) {
    return [
      { zone: 'Z1 Active Recovery', range: `< ${Math.round(peak * 0.6)} bpm`, pct: 10, color: '#38bdf8' },
      { zone: 'Z2 Aerobic Base', range: `${Math.round(peak * 0.6)} - ${Math.round(z2Threshold)} bpm`, pct: 60, color: '#10b981' },
      { zone: 'Z3 Tempo Sustained', range: `${Math.round(z2Threshold)} - ${Math.round(z3Threshold)} bpm`, pct: 22, color: '#f59e0b' },
      { zone: 'Z4 Lactate Threshold', range: `${Math.round(z3Threshold)} - ${Math.round(z4Threshold)} bpm`, pct: 7, color: '#f97316' },
      { zone: 'Z5 Neuromuscular VO2', range: `> ${Math.round(z4Threshold)} bpm`, pct: 1, color: '#ef4444' },
    ];
  } else {
    return [
      { zone: 'Z1 Active Recovery', range: `< ${Math.round(peak * 0.6)} bpm`, pct: 5, color: '#38bdf8' },
      { zone: 'Z2 Aerobic Base', range: `${Math.round(peak * 0.6)} - ${Math.round(z2Threshold)} bpm`, pct: 25, color: '#10b981' },
      { zone: 'Z3 Tempo Sustained', range: `${Math.round(z2Threshold)} - ${Math.round(z3Threshold)} bpm`, pct: 40, color: '#f59e0b' },
      { zone: 'Z4 Lactate Threshold', range: `${Math.round(z3Threshold)} - ${Math.round(z4Threshold)} bpm`, pct: 24, color: '#f97316' },
      { zone: 'Z5 Neuromuscular VO2', range: `> ${Math.round(z4Threshold)} bpm`, pct: 6, color: '#ef4444' },
    ];
  }
}

export function formatElevation(meters: number): string {
  if (meters === undefined || meters === null || isNaN(meters)) return '0 m';
  return `${Math.round(meters)} m`;
}

  export function formatDate(dateVal: string | Date): string {
    if (!dateVal) return '';
    const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

    export function formatDayOfWeek(dateVal: string | Date): string {
      if (!dateVal) return '';
      const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
