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
    <div className="p-4 rounded-xl bg-[#141b17] border border-[#27362d] space-y-3 font-mono">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#25332a]">
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-[var(--color-cycling)] rotate-45" />
          LAMPIRAN BUKTI TELEMETRI (OCR SCANNER)
        </span>
        <span className="text-[10px] text-stone-400">
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

      {/* Upload Zone — Styled as a Polaroid / Clip-on photo box */}
      <div
        onClick={() => !isParsingImage && fileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          isParsingImage
            ? "border-emerald-500 bg-[#16221b]"
            : imagePreview
            ? "border-[#384c3f] bg-[#101713] hover:border-emerald-500"
            : "border-[#2b3a31] bg-[#101713] hover:border-emerald-500 hover:bg-[#131b16]"
        }`}
      >
        {isParsingImage ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
            <span className="text-xs font-bold text-stone-200">
              Mengekstrak Kinematika dari Tangkapan Layar...
            </span>
            <span className="text-[10px] text-stone-400">
              AI Vision memindai jarak, waktu tempuh, elevasi, dan pace
            </span>
          </div>
        ) : imagePreview ? (
          <div className="flex flex-col items-center gap-2">
            <div className="p-1.5 bg-[#1b2520] rounded-lg border border-[#3b4e41] shadow-md">
              <img
                src={imagePreview}
                alt="Screenshot Telemetri"
                className="max-h-36 rounded-md object-contain"
              />
            </div>
            <span className="text-[10px] text-emerald-400 underline font-semibold flex items-center gap-1">
              <Camera className="w-3 h-3" /> Rekatkan Tangkapan Layar Lain
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-3">
            <div className="w-10 h-10 rounded-xl bg-[#1b2520] border border-[#2f4035] flex items-center justify-center text-emerald-400 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-200">
              Klik untuk Merekatkan Foto / Screenshot Aktivitas
            </span>
            <span className="text-[10px] text-stone-400 text-center max-w-sm">
              Sistem akan membaca angka telemetri secara instan dan memasukkannya ke formulir buku
            </span>
          </div>
        )}
      </div>

      {/* OCR Success Feedback Banner */}
      {ocrSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-600/50 text-xs text-emerald-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Ekstraksi Selesai &amp; Ditempelkan ke Formulir!</span>
          </div>
          <p className="text-[11px] text-stone-300 font-tabular pl-5.5">
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
            className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            <span>Transkrip Teks Mentah (Raw OCR)</span>
            {showRawText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showRawText && (
            <pre className="p-2.5 rounded-lg bg-[#0e1411] border border-[#28382e] text-[9.5px] text-stone-400 whitespace-pre-wrap max-h-24 overflow-y-auto">
              {ocrRawText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
