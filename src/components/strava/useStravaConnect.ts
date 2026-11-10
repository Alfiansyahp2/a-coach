"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface StravaAthlete {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
  scopes: string[];
  connectedAt: string;
}

export interface StravaStatusResponse {
  isConfigured: boolean;
  isConnected: boolean;
  athlete: StravaAthlete | null;
  message?: string;
}

export function useStravaConnect() {
  const router = useRouter();
  const [status, setStatus] = useState<StravaStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncTelemetry, setSyncTelemetry] = useState<{
    lastSync: any;
    latestActivityDate: string | null;
  } | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/strava/status");
      const data = await res.json();
      setStatus(data);

      if (data.isConnected) {
        try {
          const syncRes = await fetch("/api/strava/sync");
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            setSyncTelemetry(syncData);
          }
        } catch (syncErr) {
          console.error("Failed to load sync telemetry:", syncErr);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch Strava status:", err);
      setStatus({
        isConfigured: false,
        isConnected: false,
        athlete: null,
        message: err.message || "Failed to query status",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setBanner(null);
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        const added = data.addedCount || 0;
        const updated = data.updatedCount || 0;
        const skipped = data.skippedCount || 0;
        setBanner({
          type: "success",
          message: `Sinkronisasi Strava tuntas: ${added} sesi baru, ${updated} diperbarui, ${skipped} tanpa perubahan.`,
        });
        await fetchStatus();
        router.refresh();
      } else {
        setBanner({
          type: "error",
          message: data.message || "Gagal menyinkronkan aktivitas dari Strava.",
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        message: err.message || "Terjadi kesalahan tak terduga saat sinkronisasi.",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Apakah Anda yakin ingin memutuskan integrasi akun Strava? Token lokal akan dicabut.")) {
      return;
    }
    try {
      setDisconnecting(true);
      const res = await fetch("/api/auth/strava/disconnect", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setBanner({ type: "success", message: "Akun Strava berhasil diputuskan dan token dicabut." });
        await fetchStatus();
      } else {
        setBanner({ type: "error", message: data.message || "Gagal memutuskan akun Strava." });
      }
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "Terjadi kesalahan saat memutus koneksi." });
    } finally {
      setDisconnecting(false);
    }
  };

  return {
    status,
    loading,
    disconnecting,
    syncing,
    syncTelemetry,
    banner,
    setBanner,
    isGuideOpen,
    setIsGuideOpen,
    fetchStatus,
    handleSync,
    handleDisconnect,
  };
}

