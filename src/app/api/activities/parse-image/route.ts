import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  try {
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

    // Execute Python OCR Script
    const { stdout, stderr } = await execFileAsync("python", [scriptPath, tempFilePath], {
      timeout: 30000,
    });

    if (stderr && stderr.trim().length > 0) {
      console.warn("Python parser stderr:", stderr);
    }

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(stdout.trim());
    } catch (parseErr) {
      console.error("Failed to parse Python OCR output:", stdout);
      return NextResponse.json(
        { error: "Gagal memproses hasil OCR gambar", details: stdout },
        { status: 500 }
      );
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

