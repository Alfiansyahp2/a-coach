"use client";

import React, { useState } from "react";
import { User, AthleteProfile, AuthoritativeAthleteHealthContext, AthleteEquipment, Activity, ScheduledWorkout } from "@/types";
import { calculatePhysiologicalCapacities } from "@/lib/domain/physiology/heartRateZones";
import { AthleteProfileHeader } from "./AthleteProfileHeader";
import { BiometricsCardGrid } from "./BiometricsCardGrid";
import { HeartRateZonesCard } from "./HeartRateZonesCard";
import { PhysiologicalTelemetryCard } from "./PhysiologicalTelemetryCard";
import { AthleteEquipmentCard } from "./AthleteEquipmentCard";
import { KinematicGateSummaryCard } from "./KinematicGateSummaryCard";
import { EditProfileModal } from "./EditProfileModal";

interface AthleteProfileHubProps {
  initialUser: User;
  initialProfile: AthleteProfile | null;
  healthContext: AuthoritativeAthleteHealthContext | null;
  initialEquipment: AthleteEquipment[];
  activities?: Activity[];
  workouts?: ScheduledWorkout[];
  streakWeeks?: number;
}

export function AthleteProfileHub({
  initialUser,
  initialProfile,
  healthContext,
  initialEquipment,
  activities = [],
  workouts = [],
  streakWeeks = 10,
}: AthleteProfileHubProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [profile, setProfile] = useState<AthleteProfile | null>(initialProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Calculate Physiological Capacities & Karvonen Zones
  const capacities = calculatePhysiologicalCapacities({
    age: profile?.age ?? 22,
    height_cm: user.height_cm ?? profile?.height_cm ?? 170.0,
    weight_kg: user.weight_kg ?? profile?.weight_kg ?? 65.0,
    resting_heart_rate: user.resting_heart_rate ?? profile?.resting_heart_rate ?? 68,
    max_heart_rate: user.max_heart_rate ?? 188,
    ftp_watts: profile?.physiological_measurements?.ftp_watts ?? null,
    vo2_max: profile?.physiological_measurements?.vo2_max ?? null,
    running_threshold_pace_sec: profile?.physiological_measurements?.running_threshold_pace_sec ?? null,
  });

  const handleProfileUpdated = (updated: { user: User; profile: AthleteProfile }) => {
    setUser(updated.user);
    setProfile(updated.profile);
  };

  return (
    <div className="space-y-6">
      {/* 1. Athlete Hero Header & Status Banner */}
      <AthleteProfileHeader
        user={user}
        profile={profile}
        healthContext={healthContext}
        streakWeeks={streakWeeks}
        onOpenEdit={() => setIsEditModalOpen(true)}
      />

      {/* 2. Precision Biometrics & Anthropometric Baseline */}
      <BiometricsCardGrid
        user={user}
        profile={profile}
        bmi={capacities.bmi}
        bmiCategoryLabel={capacities.bmiCategoryLabel}
      />

      {/* 3. Physiological Capabilities & 5-Zone Cardiac Spectrum Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 5-Zone Heart Rate Matrix (7 cols) */}
        <div className="lg:col-span-7">
          <HeartRateZonesCard
            zones={capacities.zones}
            rhr={user.resting_heart_rate || 68}
            maxHr={user.max_heart_rate || 188}
          />
        </div>

        {/* Right Column: Physiological Capacities & Power Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <PhysiologicalTelemetryCard
            profile={profile}
            ftpWatts={capacities.ftpWatts}
            wattsPerKg={capacities.wattsPerKg}
            wattsPerKgCategory={capacities.wattsPerKgCategory}
            vo2Max={capacities.vo2MaxEstimate}
          />

          <KinematicGateSummaryCard healthContext={healthContext} />
        </div>
      </div>

      {/* 4. Equipment & Gear Locker (Sepatu & Sepeda) */}
      <AthleteEquipmentCard initialEquipment={initialEquipment} />

      {/* 5. Interactive Edit Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}

