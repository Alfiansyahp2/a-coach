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
 * Compute BMI and category given weight in kg and height in cm.
 */
export function calculateBMI(weightKg: number = 65, heightCm: number = 170): { bmi: number; classification: string } {
  if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, classification: 'Unknown' };
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  let classification = 'Optimal / Athletic';
  if (bmi < 18.5) classification = 'Underweight';
  else if (bmi < 24.9) classification = 'Optimal / Athletic';
  else if (bmi < 29.9) classification = 'Overweight';
  else classification = 'High';
  return { bmi, classification };
}

/**
 * Return Karvonen zones boundaries given resting HR (default 68) and max HR (default 188).
 */
export function getKarvonenZones(restingHr: number = 68, maxHr: number = 188) {
  const peak = Math.max(maxHr, restingHr + 30);
  const hrr = peak - restingHr;
  return {
    restingHr,
    maxHr: peak,
    hrr,
    z1: { min: Math.round(restingHr + hrr * 0.50), max: Math.round(restingHr + hrr * 0.60) },
    z2: { min: Math.round(restingHr + hrr * 0.60), max: Math.round(restingHr + hrr * 0.70) },
    z3: { min: Math.round(restingHr + hrr * 0.70), max: Math.round(restingHr + hrr * 0.80) },
    z4: { min: Math.round(restingHr + hrr * 0.80), max: Math.round(restingHr + hrr * 0.90) },
    z5: { min: Math.round(restingHr + hrr * 0.90), max: peak },
  };
}

/**
 * Estimate percentage time in 5 physiological heart rate zones given average HR, max HR, and resting HR (Karvonen method).
 */
export function estimateHeartRateZones(avgHr: number, maxHr?: number | null, restingHr: number = 68) {
  const peak = maxHr || 188;
  const zones = getKarvonenZones(restingHr, peak);

  if (avgHr < zones.z2.min) {
    return [
      { zone: 'Z1 Active Recovery', range: `< ${zones.z1.max} bpm`, pct: 35, color: '#38bdf8' },
      { zone: 'Z2 Aerobic Base', range: `${zones.z2.min} - ${zones.z2.max} bpm`, pct: 50, color: '#10b981' },
      { zone: 'Z3 Tempo Sustained', range: `${zones.z3.min} - ${zones.z3.max} bpm`, pct: 12, color: '#f59e0b' },
      { zone: 'Z4 Lactate Threshold', range: `${zones.z4.min} - ${zones.z4.max} bpm`, pct: 3, color: '#f97316' },
      { zone: 'Z5 Neuromuscular VO2', range: `> ${zones.z5.min} bpm`, pct: 0, color: '#ef4444' },
    ];
  } else if (avgHr < zones.z3.min) {
    return [
      { zone: 'Z1 Active Recovery', range: `< ${zones.z1.max} bpm`, pct: 10, color: '#38bdf8' },
      { zone: 'Z2 Aerobic Base', range: `${zones.z2.min} - ${zones.z2.max} bpm`, pct: 60, color: '#10b981' },
      { zone: 'Z3 Tempo Sustained', range: `${zones.z3.min} - ${zones.z3.max} bpm`, pct: 22, color: '#f59e0b' },
      { zone: 'Z4 Lactate Threshold', range: `${zones.z4.min} - ${zones.z4.max} bpm`, pct: 7, color: '#f97316' },
      { zone: 'Z5 Neuromuscular VO2', range: `> ${zones.z5.min} bpm`, pct: 1, color: '#ef4444' },
    ];
  } else if (avgHr < zones.z4.min) {
    return [
      { zone: 'Z1 Active Recovery', range: `< ${zones.z1.max} bpm`, pct: 5, color: '#38bdf8' },
      { zone: 'Z2 Aerobic Base', range: `${zones.z2.min} - ${zones.z2.max} bpm`, pct: 25, color: '#10b981' },
      { zone: 'Z3 Tempo Sustained', range: `${zones.z3.min} - ${zones.z3.max} bpm`, pct: 45, color: '#f59e0b' },
      { zone: 'Z4 Lactate Threshold', range: `${zones.z4.min} - ${zones.z4.max} bpm`, pct: 20, color: '#f97316' },
      { zone: 'Z5 Neuromuscular VO2', range: `> ${zones.z5.min} bpm`, pct: 5, color: '#ef4444' },
    ];
  } else {
    return [
      { zone: 'Z1 Active Recovery', range: `< ${zones.z1.max} bpm`, pct: 3, color: '#38bdf8' },
      { zone: 'Z2 Aerobic Base', range: `${zones.z2.min} - ${zones.z2.max} bpm`, pct: 15, color: '#10b981' },
      { zone: 'Z3 Tempo Sustained', range: `${zones.z3.min} - ${zones.z3.max} bpm`, pct: 30, color: '#f59e0b' },
      { zone: 'Z4 Lactate Threshold', range: `${zones.z4.min} - ${zones.z4.max} bpm`, pct: 37, color: '#f97316' },
      { zone: 'Z5 Neuromuscular VO2', range: `> ${zones.z5.min} bpm`, pct: 15, color: '#ef4444' },
    ];
  }
}

export function formatElevation(meters: number): string {
  if (meters === undefined || meters === null || isNaN(meters)) return '0 m';
  return `${Math.round(meters)} m`;
}

export function formatDateOnly(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return val.split('T')[0];
  }
  return String(val);
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
