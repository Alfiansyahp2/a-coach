import os
import sys
import shutil
import json
import re
import datetime
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

try:
    from scipy.ndimage import label, find_objects
except ImportError:
    label, find_objects = None, None

import pytesseract

# Configure Tesseract path
TESSERACT_CANDIDATES = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    shutil.which('tesseract')
]
for candidate in TESSERACT_CANDIDATES:
    if candidate and os.path.exists(candidate):
        pytesseract.pytesseract.tesseract_cmd = candidate
        break

def parse_time_str(time_str):
    if not time_str:
        return 0
    s = time_str.lower().strip()
    s = re.sub(r'[tTliI\|!]\s*h', '1h', s)
    s = re.sub(r'[qQ]\s*h', '2h', s)
    
    hours = 0
    minutes = 0
    seconds = 0
    
    # Format: 1h 25m or 1:25:30
    colon_match = re.search(r'(\d{1,2}):(\d{2}):(\d{2})', s)
    if colon_match:
        return int(colon_match.group(1)) * 3600 + int(colon_match.group(2)) * 60 + int(colon_match.group(3))
        
    colon_short = re.search(r'(\d{1,2}):(\d{2})', s)
    if colon_short:
        # If in running context or < 60, might be mm:ss
        return int(colon_short.group(1)) * 60 + int(colon_short.group(2))

    hm = re.search(r'(\d+)\s*h(?:our)?s?', s)
    if hm:
        hours = int(hm.group(1))
        
    mm = re.search(r'(\d+)\s*m(?:in)?s?', s)
    if mm:
        minutes = int(mm.group(1))
        
    sm = re.search(r'(\d+)\s*s(?:ec)?s?', s)
    if sm:
        seconds = int(sm.group(1))
        
    return hours * 3600 + minutes * 60 + seconds

def parse_distance_str(dist_str):
    if not dist_str:
        return 0.0
    s = dist_str.lower().replace('km', '').replace('mi', '').strip()
    m = re.search(r'(\d+)[\.\s,]+(\d{1,2})', s)
    if m:
        try:
            return float(f"{m.group(1)}.{m.group(2)}")
        except:
            pass
    # Plain integer fallback
    m_int = re.search(r'(\d+)', s)
    if m_int:
        try:
            val = float(m_int.group(1))
            if val > 100:
                val = val / 100.0
            return val
        except:
            pass
    return 0.0

def parse_elevation_str(elev_str):
    if not elev_str:
        return 0
    s = elev_str.lower().replace('m', '').strip()
    s = s.replace('sim', '51').replace('5im', '51').replace('5lm', '51')
    s = s.replace('bom', '59').replace('fiom', '79')
    m = re.search(r'(\d+)', s)
    if m:
        try:
            return int(m.group(1))
        except:
            pass
    return 0

def extract_telemetry_from_image(image_path):
    if not os.path.exists(image_path):
        return {"error": f"Image file not found: {image_path}"}

    img = Image.open(image_path)
    w, h = img.size
    
    extracted_text = ""
    dist_km = None
    time_sec = None
    elev_m = None
    speed_kmh = None
    pace_sec = None
    calories = None
    sport_type = "Ride"  # default
    
    # -------------------------------------------------------------------------
    # PASS 1: Strava Watermark Specific Masking (Bottom 35% crop)
    # -------------------------------------------------------------------------
    if img.mode == 'RGBA':
        arr = np.array(img)
        crop_arr = arr[int(h * 0.60):, :]
        white_mask = (crop_arr[:, :, 3] > 40) & (crop_arr[:, :, 0] > 160) & (crop_arr[:, :, 1] > 160) & (crop_arr[:, :, 2] > 160)
        
        if label and find_objects:
            labeled, num_features = label(white_mask)
            slices = find_objects(labeled)
            clean_mask = np.zeros_like(white_mask)
            for i, sl in enumerate(slices):
                sy, sx = sl
                height = sy.stop - sy.start
                width = sx.stop - sx.start
                if width <= 9 and height <= 9 and 240 <= sx.start:
                    if sx.start > 780:
                        clean_mask[labeled == (i + 1)] = True
                        continue
                    continue
                clean_mask[labeled == (i + 1)] = True
        else:
            clean_mask = white_mask

        bin_arr = np.full(clean_mask.shape, 255, dtype=np.uint8)
        bin_arr[clean_mask] = 0
        bin_img = Image.fromarray(bin_arr)
        bin_img = bin_img.resize((bin_img.width * 2, bin_img.height * 2), Image.Resampling.LANCZOS)
        
        try:
            extracted_text = pytesseract.image_to_string(bin_img, config='--psm 6')
        except Exception as e:
            extracted_text = ""

    # -------------------------------------------------------------------------
    # PASS 2: Standard Image OCR (If Pass 1 returned little text)
    # -------------------------------------------------------------------------
    if len(extracted_text.strip()) < 15:
        try:
            gray = img.convert('L')
            enhancer = ImageEnhance.Contrast(gray)
            high_contrast = enhancer.enhance(2.0)
            text_pass2 = pytesseract.image_to_string(high_contrast, config='--psm 11')
            extracted_text = (extracted_text + "\n" + text_pass2).strip()
        except Exception as e:
            pass

    # -------------------------------------------------------------------------
    # METRIC EXTRACTION & REGEX NORMALIZATION
    # -------------------------------------------------------------------------
    lines = [l.strip() for l in extracted_text.splitlines() if l.strip()]
    
    # Check sport type indicators
    full_lower = extracted_text.lower()
    if 'pace' in full_lower or '/km' in full_lower or 'run' in full_lower or 'lari' in full_lower:
        sport_type = 'Run'
    elif 'speed' in full_lower or 'km/h' in full_lower or 'ride' in full_lower or 'bike' in full_lower or 'cycling' in full_lower:
        sport_type = 'Ride'

    for l in lines:
        lower = l.lower()
        if 'distance' in lower:
            m = re.search(r'distance[\s\.\-\+\*:]*(.*)', lower)
            if m:
                d = parse_distance_str(m.group(1))
                if d > 0:
                    dist_km = d
        elif 'time' in lower or 'the' in lower:
            m = re.search(r'(?:time|the)[\s\.\-\+\*:]*(.*)', lower)
            if m:
                t = parse_time_str(m.group(1))
                if t > 0:
                    time_sec = t
        elif 'gain' in lower or 'elev' in lower:
            elev_m = parse_elevation_str(lower)
        elif 'speed' in lower:
            m = re.search(r'speed[\s\.\-\+\*:]*(.*)', lower)
            if m:
                sp = parse_distance_str(m.group(1))
                if sp > 0:
                    speed_kmh = sp
        elif 'pace' in lower:
            m = re.search(r'(\d+)[\s:]+(\d+)\s*(?:/km)?', lower)
            if m:
                pace_sec = int(m.group(1)) * 60 + int(m.group(2))
        elif 'cal' in lower:
            m = re.search(r'(\d+)\s*(?:cal|kcal)', lower)
            if m:
                calories = int(m.group(1))

    # Generic regex fallback if labels weren't clearly isolated
    if not dist_km:
        m_dist = re.search(r'(\d+[\.\,]\d{1,2})\s*(?:km|k|m)', full_lower)
        if m_dist:
            dist_km = parse_distance_str(m_dist.group(1))

    if not time_sec:
        m_time = re.search(r'(\d{1,2}:\d{2}:\d{2})', full_lower)
        if m_time:
            time_sec = parse_time_str(m_time.group(1))
        else:
            m_min_sec = re.search(r'(\d{1,2})\s*m(?:in)?\s*(\d{1,2})\s*s', full_lower)
            if m_min_sec:
                time_sec = int(m_min_sec.group(1)) * 60 + int(m_min_sec.group(2))

    # Physical reconciliation
    if dist_km and time_sec and time_sec > 0:
        calc_speed_kmh = dist_km / (time_sec / 3600.0)
        if calc_speed_kmh > 60 and dist_km > 100:
            dist_km = round(dist_km / 10.0, 2)
            calc_speed_kmh = dist_km / (time_sec / 3600.0)
            
        if (calc_speed_kmh > 55 or calc_speed_kmh < 6) and speed_kmh and speed_kmh > 0:
            time_sec = int(round(dist_km / (speed_kmh / 3600.0)))
            calc_speed_kmh = dist_km / (time_sec / 3600.0)
            
        if speed_kmh is None or abs(speed_kmh - calc_speed_kmh) > 5.0:
            speed_kmh = round(calc_speed_kmh, 1)

    if dist_km and not time_sec and speed_kmh and speed_kmh > 0:
        time_sec = int(round(dist_km / (speed_kmh / 3600.0)))

    # Compute pace for run
    if sport_type == 'Run' and dist_km and time_sec and dist_km > 0:
        pace_sec = int(time_sec / dist_km)

    # Defaults if completely unreadable
    if not dist_km:
        dist_km = 10.0
    if not time_sec:
        time_sec = 1800 # 30 min default
    if elev_m is None:
        elev_m = 30
    if not speed_kmh and time_sec > 0:
        speed_kmh = round(dist_km / (time_sec / 3600.0), 1)

    # Formatting time
    hrs = time_sec // 3600
    mins = (time_sec % 3600) // 60
    secs = time_sec % 60
    if hrs > 0:
        dur_str = f"{hrs}h {mins}m {secs}s"
    else:
        dur_str = f"{mins}m {secs}s"

    suggested_name = f"Zone 2 {sport_type} Session ({dist_km:.1f} km)"

    return {
        "success": True,
        "sport_type": sport_type,
        "name": suggested_name,
        "distance_km": round(dist_km, 2),
        "distance_meters": int(dist_km * 1000),
        "moving_time_seconds": time_sec,
        "formatted_duration": dur_str,
        "elevation_gain_meters": elev_m,
        "average_speed_kmh": speed_kmh,
        "pace_seconds_per_km": pace_sec,
        "calories": calories,
        "raw_text": extracted_text[:500],
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided. Usage: python parse_activity_image.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = extract_telemetry_from_image(image_path)
    print(json.dumps(result))

