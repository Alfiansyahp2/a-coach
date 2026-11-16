import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScheduledWorkout } from "@/types";
import { submitActivityWithCheckinAndInjury } from "./activitySubmissionHelpers";

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
  const [step, setStep] = useState<1 | 2>(1);
  const [isOpen, setIsOpen] = useState(false);

  // Activity fields
  const [sportType, setSportType] = useState<string>(
    defaultWorkout
      ? defaultWorkout.workout_category.toLowerCase().includes("cycl") ||
        defaultWorkout.workout_category.toLowerCase().includes("ride")
        ? "Ride"
        : defaultWorkout.workout_category.toLowerCase().includes("run") ||
          defaultWorkout.workout_category.toLowerCase().includes("lari")
        ? "Run" : "CrossTraining"
      : defaultSportType
  );
  const [name, setName] = useState<string>(defaultWorkout ? `Sesi ${defaultWorkout.workout_category}` : "");
  const [startDate, setStartDate] = useState<string>(() => defaultDate ? `${defaultDate}T07:00` : toDateTimeLocal(new Date()));
  const [distanceKm, setDistanceKm] = useState<string>(
    defaultWorkout && defaultWorkout.target_distance_meters ? (defaultWorkout.target_distance_meters / 1000).toFixed(1) : ""
  );
  const [durationHours, setDurationHours] = useState<string>("0");
  const [durationMinutes, setDurationMinutes] = useState<string>(
    defaultWorkout && defaultWorkout.target_duration_seconds ? String(Math.floor(defaultWorkout.target_duration_seconds / 60)) : "45"
  );
  const [durationSeconds, setDurationSeconds] = useState<string>("0");
  const [elevationMeters, setElevationMeters] = useState<string>("35");
  const [description, setDescription] = useState<string>("");

  // Post-Activity Check-in (Image 2)
  const [painDuring, setPainDuring] = useState<number>(0);
  const [painAfter, setPainAfter] = useState<number>(0);
  const [painNextDay, setPainNextDay] = useState<number>(0);
  const [swellingObserved, setSwellingObserved] = useState<boolean>(false);
  const [instabilityObserved, setInstabilityObserved] = useState<boolean>(false);
  const [rpeScore, setRpeScore] = useState<number>(3);
  const [subjectiveNotes, setSubjectiveNotes] = useState<string>("");

  // New Injury Screening
  const [hasNewInjury, setHasNewInjury] = useState<boolean>(false);
  const [injuryRegion, setInjuryRegion] = useState<string>("Engkel Kanan (ATFL)");
  const [injurySide, setInjurySide] = useState<"RIGHT" | "LEFT" | "BILATERAL" | "AXIAL">("RIGHT");
  const [injurySeverity, setInjurySeverity] = useState<"MILD" | "MODERATE" | "SEVERE">("MODERATE");
  const [injuryMechanism, setInjuryMechanism] = useState<string>("Terkilir / Twisting");
  const [injuryNotes, setInjuryNotes] = useState<string>("");

  // OCR state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isParsingImage, setIsParsingImage] = useState<boolean>(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrRawText, setOcrRawText] = useState<string | null>(null);

  // Status state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpen = () => {
    setErrorMsg(null); setSuccessMsg(null); setOcrSuccessMsg(null);
    setImagePreview(null); setOcrRawText(null); setStep(1);
    if (!name) setName(sportType === "Ride" ? "Latihan MTB Zone 2" : "Latihan Lari Rekondisi");
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isSubmitting && !isParsingImage) {
      setIsOpen(false);
      setStep(1);
    }
  };

  const handleTelemetryExtracted = (tel: {
    sport_type?: string; name?: string; distance_km?: number;
    moving_time_seconds?: number; elevation_gain_meters?: number;
  }) => {
    if (tel.sport_type) setSportType(tel.sport_type);
    if (tel.name) setName(tel.name);
    if (tel.distance_km != null) setDistanceKm(String(tel.distance_km));
    if (tel.moving_time_seconds != null) {
      const totalSec = Number(tel.moving_time_seconds);
      setDurationHours(String(Math.floor(totalSec / 3600)));
      setDurationMinutes(String(Math.floor((totalSec % 3600) / 60)));
      setDurationSeconds(String(totalSec % 60));
    }
    if (tel.elevation_gain_meters != null) setElevationMeters(String(tel.elevation_gain_meters));
  };

  const totalDurationSeconds =
    (parseInt(durationHours || "0", 10) || 0) * 3600 +
    (parseInt(durationMinutes || "0", 10) || 0) * 60 +
    (parseInt(durationSeconds || "0", 10) || 0);

  const numericDistanceKm = parseFloat(distanceKm || "0") || 0;
  const calculatedSpeedKmh = totalDurationSeconds > 0 && numericDistanceKm > 0
    ? ((numericDistanceKm / totalDurationSeconds) * 3600).toFixed(1) : "0.0";
  const calculatedPaceMinKm = numericDistanceKm > 0 && totalDurationSeconds > 0 ? (() => {
    const secPerKm = totalDurationSeconds / numericDistanceKm;
    return `${Math.floor(secPerKm / 60)}:${String(Math.floor(secPerKm % 60)).padStart(2, "0")}`;
  })() : "--:--";

  const handleNextStep = () => {
    if (!name.trim()) { setErrorMsg("Nama aktivitas wajib diisi."); return; }
    if (numericDistanceKm <= 0 && totalDurationSeconds <= 0) {
      setErrorMsg("Masukkan jarak tempuh atau durasi aktivitas yang valid."); return;
    }
    setErrorMsg(null); setStep(2);
  };

  const handlePrevStep = () => { setErrorMsg(null); setStep(1); };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) { setErrorMsg("Nama aktivitas wajib diisi."); return; }
    try {
      setIsSubmitting(true); setErrorMsg(null);
      const res = await submitActivityWithCheckinAndInjury({
        name, sportType, startDate, numericDistanceKm, totalDurationSeconds,
        elevationMeters, description, workoutId: defaultWorkout?.id,
        painDuring, painAfter, painNextDay, swellingObserved, instabilityObserved,
        rpeScore, subjectiveNotes, hasNewInjury, injuryRegion, injurySide,
        injurySeverity, injuryMechanism, injuryNotes,
      });
      setSuccessMsg(res.message);
      setTimeout(() => {
        setIsOpen(false); setStep(1); router.refresh(); onSuccess?.();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan aktivitas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step, setStep, isOpen, setIsOpen, handleOpen, handleClose, sportType, setSportType,
    name, setName, startDate, setStartDate, distanceKm, setDistanceKm, durationHours,
    setDurationHours, durationMinutes, setDurationMinutes, durationSeconds, setDurationSeconds,
    elevationMeters, setElevationMeters, description, setDescription, painDuring, setPainDuring,
    painAfter, setPainAfter, painNextDay, setPainNextDay, swellingObserved, setSwellingObserved,
    instabilityObserved, setInstabilityObserved, rpeScore, setRpeScore, subjectiveNotes,
    setSubjectiveNotes, hasNewInjury, setHasNewInjury, injuryRegion, setInjuryRegion,
    injurySide, setInjurySide, injurySeverity, setInjurySeverity, injuryMechanism,
    setInjuryMechanism, injuryNotes, setInjuryNotes, imagePreview, setImagePreview,
    isParsingImage, setIsParsingImage, ocrSuccessMsg, setOcrSuccessMsg, ocrRawText,
    setOcrRawText, isSubmitting, errorMsg, setErrorMsg, successMsg, handleTelemetryExtracted,
    numericDistanceKm, totalDurationSeconds, calculatedSpeedKmh, calculatedPaceMinKm,
    handleNextStep, handlePrevStep, handleSubmit,
  };
}
