import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScheduledWorkout } from "@/types";

interface UseAddActivityFormProps {
  defaultSportType?: string;
  defaultDate?: string;
  defaultWorkout?: ScheduledWorkout | null;
  onSuccess?: () => void;
}

function toDateTimeLocal(d: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function useAddActivityForm({
  defaultSportType = "Ride",
  defaultDate,
  defaultWorkout = null,
  onSuccess,
}: UseAddActivityFormProps) {
  const router = useRouter();

  // Modal Visibility
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [sportType, setSportType] = useState<string>(
    defaultWorkout
      ? defaultWorkout.workout_category.toLowerCase().includes("cycl") ||
        defaultWorkout.workout_category.toLowerCase().includes("ride")
        ? "Ride"
        : defaultWorkout.workout_category.toLowerCase().includes("run") ||
          defaultWorkout.workout_category.toLowerCase().includes("lari")
        ? "Run"
        : "CrossTraining"
      : defaultSportType
  );
  const [name, setName] = useState<string>(
    defaultWorkout ? `Sesi ${defaultWorkout.workout_category}` : ""
  );
  const [startDate, setStartDate] = useState<string>(() => {
    if (defaultDate) {
      return `${defaultDate}T07:00`;
    }
    return toDateTimeLocal(new Date());
  });
  const [distanceKm, setDistanceKm] = useState<string>(
    defaultWorkout && defaultWorkout.target_distance_meters
      ? (defaultWorkout.target_distance_meters / 1000).toFixed(1)
      : ""
  );
  const [durationHours, setDurationHours] = useState<string>("0");
  const [durationMinutes, setDurationMinutes] = useState<string>(
    defaultWorkout && defaultWorkout.target_duration_seconds
      ? String(Math.floor(defaultWorkout.target_duration_seconds / 60))
      : "45"
  );
  const [durationSeconds, setDurationSeconds] = useState<string>("0");
  const [elevationMeters, setElevationMeters] = useState<string>("35");
  const [description, setDescription] = useState<string>("");

  // Health & Zone 2 metrics
  const [rpeScore, setRpeScore] = useState<number>(3);
  const [painScale, setPainScale] = useState<number>(0);
  const [swellingObserved, setSwellingObserved] = useState<boolean>(false);
  const [instabilityObserved, setInstabilityObserved] = useState<boolean>(false);

  // OCR state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isParsingImage, setIsParsingImage] = useState<boolean>(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrRawText, setOcrRawText] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpen = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOcrSuccessMsg(null);
    setImagePreview(null);
    setOcrRawText(null);
    if (!name) {
      setName(sportType === "Ride" ? "Latihan MTB Zone 2" : "Latihan Lari Rekondisi");
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isSubmitting && !isParsingImage) {
      setIsOpen(false);
    }
  };

  const handleTelemetryExtracted = (tel: {
    sport_type?: string;
    name?: string;
    distance_km?: number;
    moving_time_seconds?: number;
    elevation_gain_meters?: number;
    average_speed_kmh?: number;
  }) => {
    if (tel.sport_type) setSportType(tel.sport_type);
    if (tel.name) setName(tel.name);
    if (tel.distance_km != null) setDistanceKm(String(tel.distance_km));
    if (tel.moving_time_seconds != null) {
      const totalSec = Number(tel.moving_time_seconds);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setDurationHours(String(h));
      setDurationMinutes(String(m));
      setDurationSeconds(String(s));
    }
    if (tel.elevation_gain_meters != null) {
      setElevationMeters(String(tel.elevation_gain_meters));
    }
  };

  const totalDurationSeconds =
    (parseInt(durationHours || "0", 10) || 0) * 3600 +
    (parseInt(durationMinutes || "0", 10) || 0) * 60 +
    (parseInt(durationSeconds || "0", 10) || 0);

  const numericDistanceKm = parseFloat(distanceKm || "0") || 0;

  const calculatedSpeedKmh =
    totalDurationSeconds > 0 && numericDistanceKm > 0
      ? ((numericDistanceKm / totalDurationSeconds) * 3600).toFixed(1)
      : "0.0";

  const calculatedPaceMinKm =
    numericDistanceKm > 0 && totalDurationSeconds > 0
      ? (() => {
          const secPerKm = totalDurationSeconds / numericDistanceKm;
          const mins = Math.floor(secPerKm / 60);
          const secs = Math.floor(secPerKm % 60);
          return `${mins}:${String(secs).padStart(2, "0")}`;
        })()
      : "--:--";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama aktivitas wajib diisi.");
      return;
    }
    if (numericDistanceKm <= 0 && totalDurationSeconds <= 0) {
      setErrorMsg("Masukkan jarak tempuh atau durasi aktivitas yang valid.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const distanceMeters = Math.round(numericDistanceKm * 1000);
      const avgSpeedMps =
        totalDurationSeconds > 0 && distanceMeters > 0
          ? Number((distanceMeters / totalDurationSeconds).toFixed(2))
          : 0;

      const payload = {
        name: name.trim(),
        sport_type: sportType,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        distance_meters: distanceMeters,
        moving_time_seconds: totalDurationSeconds,
        elapsed_time_seconds: totalDurationSeconds,
        elevation_gain_meters: parseInt(elevationMeters || "0", 10) || 0,
        average_speed_mps: avgSpeedMps,
        description: description.trim() || undefined,
        workout_id: defaultWorkout?.id || undefined,
        rpe_score: rpeScore,
        pain_during_activity: painScale,
        pain_after_activity: painScale,
        swelling_observed: swellingObserved,
        instability_observed: instabilityObserved,
        athlete_comments: description.trim() || undefined,
      };

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan aktivitas.");
      }

      setSuccessMsg(
        data.matchedWorkout
          ? `Sesi tercatat di buku jurnal & tersinkronisasi ke: ${data.matchedWorkout.workout_category}!`
          : "Catatan sesi berhasil ditulis ke buku jurnal telemetri!"
      );

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
        onSuccess?.();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan aktivitas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    handleOpen,
    handleClose,
    sportType,
    setSportType,
    name,
    setName,
    startDate,
    setStartDate,
    distanceKm,
    setDistanceKm,
    durationHours,
    setDurationHours,
    durationMinutes,
    setDurationMinutes,
    durationSeconds,
    setDurationSeconds,
    elevationMeters,
    setElevationMeters,
    description,
    setDescription,
    rpeScore,
    setRpeScore,
    painScale,
    setPainScale,
    swellingObserved,
    setSwellingObserved,
    instabilityObserved,
    setInstabilityObserved,
    imagePreview,
    setImagePreview,
    isParsingImage,
    setIsParsingImage,
    ocrSuccessMsg,
    setOcrSuccessMsg,
    ocrRawText,
    setOcrRawText,
    isSubmitting,
    errorMsg,
    setErrorMsg,
    successMsg,
    handleTelemetryExtracted,
    numericDistanceKm,
    totalDurationSeconds,
    calculatedSpeedKmh,
    calculatedPaceMinKm,
    handleSubmit,
  };
}

