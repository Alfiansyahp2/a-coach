"use client";

import React, { useRef } from "react";
import { Camera, Sparkles, RefreshCw, FileText, CheckCircle2, ChevronDown, ChevronUp, Paperclip } from "lucide-react";

interface ActivityImageUploaderProps {
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
  isParsingImage: boolean;
  setIsParsingImage: (v: boolean) => void;
  ocrSuccessMsg: string | null;
  setOcrSuccessMsg: (msg: string | null) => void;
  ocrRawText: string | null;
  setOcrRawText: (text: string | null) => void;
  setErrorMsg: (msg: string | null) => void;
  onTelemetryExtracted: (telemetry: {
    sport_type?: string;
    name?: string;
    distance_km?: number;
    moving_time_seconds?: number;
    elevation_gain_meters?: number;
    average_speed_kmh?: number;
  }) => void;
}

export function ActivityImageUploader({
  imagePreview,
  setImagePreview,
  isParsingImage,
  setIsParsingImage,
  ocrSuccessMsg,
  setOcrSuccessMsg,
  ocrRawText,
  setOcrRawText,
  setErrorMsg,
  onTelemetryExtracted,
}: ActivityImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRawText, setShowRawText] = React.useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setIsParsingImage(true);
    setOcrSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/activities/parse-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memproses gambar telemetri");
      }

      const tel = data.telemetry;
      if (tel) {
        onTelemetryExtracted(tel);
        if (tel.raw_text) {
          setOcrRawText(tel.raw_text);
        }

        const statsBadge = `${tel.distance_km} km • ${tel.formatted_duration} • ${
          tel.average_speed_kmh ? `${tel.average_speed_kmh} km/j` : ""
        } • Elev ${tel.elevation_gain_meters || 0}m`;

        setOcrSuccessMsg(`Telemetri Terdeteksi: ${statsBadge}`);
      }
    } catch (err: any) {
      console.error("OCR parse error:", err);
      setErrorMsg(`OCR Parser: ${err.message}. Anda tetap dapat mengisi formulir secara manual.`);
    } finally {
      setIsParsingImage(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 font-mono shadow-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-cycling)] font-bold flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 rotate-45" />
          LAMPIRAN BUKTI TELEMETRI (OCR SCANNER)
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          Format: PNG, JPG, WEBP (Strava / Garmin)
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Upload Zone */}
      <div
        onClick={() => !isParsingImage && fileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          isParsingImage
            ? "border-[var(--color-cycling)] bg-[var(--color-surface-muted)]"
            : imagePreview
            ? "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-cycling)]"
            : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-[var(--color-cycling)] hover:bg-[var(--color-surface-card)]"
        }`}
      >
        {isParsingImage ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <RefreshCw className="w-6 h-6 text-[var(--color-cycling)] animate-spin" />
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              Mengekstrak Kinematika dari Tangkapan Layar...
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              AI Vision memindai jarak, waktu tempuh, elevasi, dan pace
            </span>
          </div>
        ) : imagePreview ? (
          <div className="flex flex-col items-center gap-2">
            <div className="p-1.5 bg-[var(--color-surface-card)] rounded-lg border border-[var(--color-border)] shadow-md">
              <img
                src={imagePreview}
                alt="Screenshot Telemetri"
                className="max-h-36 rounded-md object-contain"
              />
            </div>
            <span className="text-[10px] text-[var(--color-cycling)] underline font-semibold flex items-center gap-1">
              <Camera className="w-3 h-3" /> Rekatkan Tangkapan Layar Lain
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Klik untuk Merekatkan Foto / Screenshot Aktivitas
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] text-center max-w-sm">
              Sistem akan membaca angka telemetri secara instan dan memasukkannya ke formulir buku
            </span>
          </div>
        )}
      </div>

      {/* OCR Success Feedback Banner */}
      {ocrSuccessMsg && (
        <div className="p-3 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 text-xs text-[var(--color-cycling)] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Ekstraksi Selesai &amp; Ditempelkan ke Formulir!</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-primary)] font-tabular pl-5.5">
            {ocrSuccessMsg}
          </p>
        </div>
      )}

      {/* OCR Raw Text Toggle */}
      {ocrRawText && (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            <span>Transkrip Teks Mentah (Raw OCR)</span>
            {showRawText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showRawText && (
            <pre className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[9.5px] text-[var(--color-text-secondary)] whitespace-pre-wrap max-h-24 overflow-y-auto">
              {ocrRawText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
