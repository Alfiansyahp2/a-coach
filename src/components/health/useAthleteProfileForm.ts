import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, AthleteProfile, AuthoritativeAthleteHealthContext } from "@/types";

interface UseAthleteProfileFormProps {
  user?: User | null;
  profile?: AthleteProfile | null;
  healthContext?: AuthoritativeAthleteHealthContext | null;
}

export function useAthleteProfileForm({
  user,
  profile,
  healthContext,
}: UseAthleteProfileFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"biometrics" | "medical">("biometrics");

  // Form states - Biometrics
  const [name, setName] = useState<string>(user?.name || "Apex Athlete");
  const [age, setAge] = useState<string>(String(profile?.age || 22));
  const [restingHr, setRestingHr] = useState<string>(
    String(user?.resting_heart_rate || profile?.resting_heart_rate || 68)
  );
  const [heightCm, setHeightCm] = useState<string>(
    String(user?.height_cm || profile?.height_cm || 170)
  );
  const [weightKg, setWeightKg] = useState<string>(
    String(user?.weight_kg || profile?.weight_kg || 65)
  );
  const [trainingDays, setTrainingDays] = useState<number>(
    profile?.training_days_per_week || 3
  );

  // Form states - Medical Procedures & Assessments
  const ankleInjury = healthContext?.injuries.find((i) =>
    i.body_region.toLowerCase().includes("ankle")
  );
  const kneeInjury = healthContext?.injuries.find((i) =>
    i.body_region.toLowerCase().includes("knee")
  );

  const [ankleStatus, setAnkleStatus] = useState<string>(
    ankleInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT"
  );
  const [kneeStatus, setKneeStatus] = useState<string>(
    kneeInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT"
  );

  // New procedure form states
  const [hasNewProcedure, setHasNewProcedure] = useState<boolean>(false);
  const [procedureDate, setProcedureDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [providerType, setProviderType] = useState<string>("Physiotherapist");
  const [providerName, setProviderName] = useState<string>("");
  const [procedureDetails, setProcedureDetails] = useState<string>("");
  const [clinicalFindings, setClinicalFindings] = useState<string>("");
  const [clearanceGranted, setClearanceGranted] = useState<boolean>(false);

  // Submission feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live BMI calculation
  const numericWeight = parseFloat(weightKg) || 0;
  const numericHeight = parseFloat(heightCm) || 0;
  const calculatedBmi =
    numericHeight > 0 && numericWeight > 0
      ? (numericWeight / ((numericHeight / 100) * (numericHeight / 100))).toFixed(1)
      : "22.5";

  const handleOpen = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Submit Biometric Updates
      const bioPayload = {
        name: name.trim() || undefined,
        age: parseInt(age, 10) || undefined,
        resting_heart_rate: parseInt(restingHr, 10) || undefined,
        height_cm: parseFloat(heightCm) || undefined,
        weight_kg: parseFloat(weightKg) || undefined,
        training_days_per_week: trainingDays,
      };

      const bioRes = await fetch("/api/athlete/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bioPayload),
      });

      const bioText = await bioRes.text();
      let bioData: any = {};
      try {
        bioData = bioText ? JSON.parse(bioText) : {};
      } catch {
        throw new Error(`Respon server tidak valid (${bioRes.status})`);
      }

      if (!bioRes.ok || !bioData.success) {
        throw new Error(bioData.error || bioData.message || "Gagal memperbarui biometrik atlet.");
      }

      // 2. Submit Medical Procedure if updated or recorded
      let medUpdated = false;
      if (
        hasNewProcedure ||
        ankleStatus !== (ankleInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT") ||
        kneeStatus !== (kneeInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT")
      ) {
        const medPayload = {
          injury_id: ankleInjury?.id || kneeInjury?.id || null,
          assessment_date: procedureDate,
          healthcare_provider_type: providerType,
          provider_name: providerName.trim() || null,
          clinical_findings: clinicalFindings.trim() || "Pemeriksaan klinis berkala & monitoring toleransi sendi.",
          rehabilitation_protocol: procedureDetails.trim() || null,
          clearance_granted: clearanceGranted,
          ankle_status: ankleStatus,
          knee_status: kneeStatus,
        };

        const medRes = await fetch("/api/athlete/medical-procedure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medPayload),
        });

        const medText = await medRes.text();
        let medData: any = {};
        try {
          medData = medText ? JSON.parse(medText) : {};
        } catch {
          throw new Error(`Respon server medis tidak valid (${medRes.status})`);
        }

        if (!medRes.ok || !medData.success) {
          throw new Error(medData.error || medData.message || "Gagal menyimpan prosedur medis.");
        }
        medUpdated = true;
      }

      setSuccessMsg(
        medUpdated
          ? "Biometrik & prosedur medis atlet berhasil diperbarui secara authoritative!"
          : "Biometrik dasar atlet berhasil diperbarui!"
      );

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    handleOpen,
    handleClose,
    activeTab,
    setActiveTab,
    name,
    setName,
    age,
    setAge,
    restingHr,
    setRestingHr,
    heightCm,
    setHeightCm,
    weightKg,
    setWeightKg,
    trainingDays,
    setTrainingDays,
    calculatedBmi,
    ankleStatus,
    setAnkleStatus,
    kneeStatus,
    setKneeStatus,
    hasNewProcedure,
    setHasNewProcedure,
    procedureDate,
    setProcedureDate,
    providerType,
    setProviderType,
    providerName,
    setProviderName,
    procedureDetails,
    setProcedureDetails,
    clinicalFindings,
    setClinicalFindings,
    clearanceGranted,
    setClearanceGranted,
    isSubmitting,
    errorMsg,
    successMsg,
    handleSubmit,
  };
}

