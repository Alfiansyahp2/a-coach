"use client";

import React, { useRef } from "react";
import { Camera, Sparkles, RefreshCw, FileText, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#F0F2F5] font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
          IMAGE TELEMETRY PARSER (OCR)
        </span>
        <span className="text-[10px] text-[#5A6272]">
          Format: PNG, JPG, WEBP (Strava / Garmin / Apple Watch)
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Dropzone / Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-sm p-4 text-center transition-all flex flex-col items-center justify-center gap-2 ${
          isParsingImage
            ? "border-[#00F0FF] bg-[#00F0FF]/5"
            : imagePreview
            ? "border-[#1F2430] hover:border-[#00F0FF]/50 bg-[#090A0F]"
            : "border-[#1F2430] hover:border-[#D4FF00]/50 hover:bg-[#161922] bg-[#090A0F]"
        }`}
      >
        {isParsingImage ? (
          <div className="py-4 flex flex-col items-center gap-2 text-xs text-[#00F0FF]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00F0FF]" />
            <span className="font-bold">Membaca dan mengekstrak telemetri gambar...</span>
            <span className="text-[10px] text-[#9BA3AF]">
              Memproses watermark rute, jarak, durasi, elevasi & kecepatan
            </span>
          </div>
        ) : imagePreview ? (
          <div className="flex items-center gap-4 w-full">
            <img
              src={imagePreview}
              alt="Screenshot Pratinjau"
              className="w-20 h-20 object-cover rounded-xs border border-[#1F2430] bg-black"
            />
            <div className="flex-1 text-left">
              <span className="text-xs text-[#F0F2F5] font-bold block">
                Gambar Berhasil Dimuat
              </span>
              <span className="text-[10px] text-[#9BA3AF] block mt-0.5">
                Klik untuk mengganti gambar atau periksa field hasil ekstraksi di bawah.
              </span>
            </div>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-1.5 text-xs text-[#9BA3AF]">
            <Camera className="w-7 h-7 text-[#5A6272]" />
            <span className="font-bold text-[#F0F2F5]">
              Klik untuk unggah screenshot aktivitas
            </span>
            <span className="text-[10px] text-[#5A6272]">
              Sistem akan otomatis mengekstrak jarak, durasi, elevasi, dan kategori olahraga
            </span>
          </div>
        )}
      </div>

      {/* OCR Success Banner */}
      {ocrSuccessMsg && (
        <div className="p-2.5 rounded-sm bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-between text-xs text-[#00F0FF]">
          <span className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {ocrSuccessMsg}
          </span>
          {ocrRawText && (
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="text-[10px] text-[#9BA3AF] hover:text-white underline flex items-center gap-0.5"
            >
              <span>{showRawText ? "Tutup Teks Mentah" : "Lihat Teks Mentah"}</span>
              {showRawText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      )}

      {/* Raw OCR Text Drawer */}
      {showRawText && ocrRawText && (
        <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[10px] text-[#5A6272] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
          {ocrRawText}
        </div>
      )}
    </div>
  );
}

