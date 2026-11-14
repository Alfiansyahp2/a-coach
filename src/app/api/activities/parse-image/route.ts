import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { verifyUserAuthorization } from "@/lib/auth/authGuard";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  try {
    const auth = verifyUserAuthorization(req);
    if (!auth.authorized) return auth.response!;

    const formData = await req.formData();
    const file = (formData.get("image") || formData.get("file")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File gambar tidak ditemukan. Pastikan field berlabel 'image' atau 'file'." },
        { status: 400 }
      );
    }

    // Convert file to buffer and write to temporary file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempDir = path.join(process.cwd(), ".data", "tmp_uploads");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const ext = path.extname(file.name || "image.png") || ".png";
    tempFilePath = path.join(tempDir, `ocr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
    fs.writeFileSync(tempFilePath, buffer);

    const candidatePaths = [
      path.join(process.cwd(), "scripts", "parsers", "parse_activity_image.py"),
      path.join(process.cwd(), "scripts", "parse_activity_image.py"),
    ];
    const scriptPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
    const pyBin = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");

    let parsedResult: any = null;

    // Primary Attempt: Python Subprocess
    try {
      const { stdout, stderr } = await execFileAsync(pyBin, [scriptPath, tempFilePath], {
        timeout: 30000,
      });

      if (stderr && stderr.trim().length > 0) {
        console.warn("Python parser stderr:", stderr);
      }

      parsedResult = JSON.parse(stdout.trim());
    } catch (pyErr) {
      console.warn("Python OCR unavailable or failed, falling back to portable tesseract.js:", pyErr);
    }

    // Fallback Attempt: Pure Node.js tesseract.js
    if (!parsedResult || !parsedResult.success) {
      try {
        const Tesseract = await import("tesseract.js");
        const { data: { text } } = await Tesseract.recognize(tempFilePath, "eng");

        let distanceKm = 0;
        const distMatch = text.match(/(\d+[.,]\d+)\s*(?:km|k\s*m)/i) || text.match(/distance\s*[:\s]*(\d+[.,]?\d*)/i);
        if (distMatch) {
          distanceKm = parseFloat(distMatch[1].replace(",", "."));
        }

        let movingTimeSec = 0;
        const timeMatch = text.match(/(\d+)\s*h(?:our)?s?\s*(\d+)\s*m/i) || text.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          if (timeMatch[3]) {
            movingTimeSec = parseInt(timeMatch[1], 10) * 3600 + parseInt(timeMatch[2], 10) * 60 + parseInt(timeMatch[3], 10);
          } else {
            movingTimeSec = parseInt(timeMatch[1], 10) * 3600 + parseInt(timeMatch[2], 10) * 60;
          }
        } else {
          const minSecMatch = text.match(/(\d+)\s*m(?:in)?s?\s*(\d+)\s*s/i) || text.match(/(\d{1,2}):(\d{2})/);
          if (minSecMatch) {
            movingTimeSec = parseInt(minSecMatch[1], 10) * 60 + parseInt(minSecMatch[2], 10);
          }
        }

        let elevM = 0;
        const elevMatch = text.match(/elev(?:ation)?(?:\s*gain)?\s*[:\s]*(\d+)/i) || text.match(/(\d+)\s*m\s*(?:elev|gain)/i);
        if (elevMatch) {
          elevM = parseInt(elevMatch[1], 10);
        }

        let avgSpeedKmh = 0;
        const speedMatch = text.match(/(\d+[.,]\d+)\s*km\/h/i) || text.match(/speed\s*[:\s]*(\d+[.,]?\d*)/i);
        if (speedMatch) {
          avgSpeedKmh = parseFloat(speedMatch[1].replace(",", "."));
        } else if (distanceKm > 0 && movingTimeSec > 0) {
          avgSpeedKmh = parseFloat(((distanceKm / movingTimeSec) * 3600).toFixed(1));
        }

        parsedResult = {
          success: true,
          sport_type: "Ride",
          name: `Parsed Session (${distanceKm} km)`,
          distance_km: distanceKm,
          distance_meters: Math.round(distanceKm * 1000),
          moving_time_seconds: movingTimeSec,
          elevation_gain_meters: elevM,
          average_speed_kmh: avgSpeedKmh,
          raw_text: text,
        };
      } catch (tessErr) {
        console.error("Both Python OCR and Tesseract.js failed:", tessErr);
        return NextResponse.json(
          { error: "Gagal memproses hasil OCR gambar", details: String(tessErr) },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      telemetry: parsedResult,
    });
  } catch (err: any) {
    console.error("Error in parse-image API:", err);
    return NextResponse.json(
      { error: "Gagal membaca telemetri gambar aktivitas", message: err.message },
      { status: 500 }
    );
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupErr) {
        console.warn("Could not delete temporary image file:", cleanupErr);
      }
    }
  }
}

