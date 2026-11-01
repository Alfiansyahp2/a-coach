import os
import shutil
import json
import uuid
import datetime
import numpy as np
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FROM_STRAVA = os.path.join(BASE_DIR, 'data', 'from_strava')
PUBLIC_TRACKS_DIR = os.path.join(BASE_DIR, 'public', 'tracks')
OUTPUT_JSON = os.path.join(BASE_DIR, 'data', 'imported_activities.json')

DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'

# Activity Names Pool
RUN_NAMES = [
    "Morning Aerobic Base Run",
    "Track Interval Repeats",
    "Zone 2 Endurance Run",
    "Tempo Threshold Run",
    "City Circuit Aerobic Run",
    "Fartlek Speed Play",
    "Easy Recovery Run",
    "Progressive Long Run",
    "Evening Aerobic Stride",
    "Sunday Endurance Long Run"
]

RIDE_NAMES = [
    "Morning Coffee Spin",
    "Zone 2 Aerobic Base Ride",
    "Fast Pace Loop Ride",
    "Weekend Long Ride",
    "Cadence & Power Intervals",
    "City Circuit Cycling",
    "Recovery Spin & Mobility",
    "Endurance Threshold Ride",
    "Highway Rolling Hills Ride",
    "Morning Aerobic Peloton",
    "Midweek Tempo Cycling",
    "Sweet Spot Power Ride",
    "Weekend Century Prep Ride",
    "Aerobic Endurance Spin",
    "Afternoon Recovery Ride",
    "Interval Sprint Cycling",
    "Zone 2 Highway Cruise",
    "Morning Threshold Push",
    "Loop Circuit Power Spin",
    "Evening Commute Spin",
    "Endurance Mileage Builder",
    "Rolling Terrain Ride",
    "Zone 3 Aerobic Sustained",
    "Sunday Gran Fondo Ride"
]

def analyze_track_image(file_path):
    """Analyze PNG transparency and pixel density to estimate route complexity."""
    try:
        im = Image.open(file_path).convert('RGBA')
        arr = np.array(im)
        alpha = arr[:, :, 3]
        orange_mask = (alpha > 50) & (arr[:, :, 0] > 180) & (arr[:, :, 2] < 100)
        pixel_count = int(np.sum(orange_mask))
        
        # Bounding box of route
        y_indices, x_indices = np.where(orange_mask)
        if len(y_indices) > 0 and len(x_indices) > 0:
            height = int(np.max(y_indices) - np.min(y_indices))
            width = int(np.max(x_indices) - np.min(x_indices))
            perimeter_est = (height + width) * 2
        else:
            perimeter_est = 1000
            
        return {
            'pixel_count': pixel_count,
            'perimeter': perimeter_est
        }
    except Exception as e:
        print(f"Warning analyzing {file_path}: {e}")
        return {'pixel_count': 5000, 'perimeter': 1000}

def main():
    print("Processing Strava activity images from data/from_strava/ ...")
    
    # 1. Ensure target public directories exist
    os.makedirs(os.path.join(PUBLIC_TRACKS_DIR, 'running'), exist_ok=True)
    os.makedirs(os.path.join(PUBLIC_TRACKS_DIR, 'ride'), exist_ok=True)
    
    running_dir = os.path.join(DATA_FROM_STRAVA, 'running')
    ride_dir = os.path.join(DATA_FROM_STRAVA, 'ride')
    
    running_files = sorted([f for f in os.listdir(running_dir) if f.upper().endswith('.PNG')])
    ride_files = sorted([f for f in os.listdir(ride_dir) if f.upper().endswith('.PNG')])
    
    print(f"Found {len(running_files)} running images and {len(ride_files)} ride images.")
    
    # 2. Copy images to public/tracks/
    for f in running_files:
        src = os.path.join(running_dir, f)
        dst = os.path.join(PUBLIC_TRACKS_DIR, 'running', f)
        shutil.copy2(src, dst)
        
    for f in ride_files:
        src = os.path.join(ride_dir, f)
        dst = os.path.join(PUBLIC_TRACKS_DIR, 'ride', f)
        shutil.copy2(src, dst)
        
    print("All track images copied to public/tracks/")
    
    # 3. Generate distributed dates over the last 60 days
    now = datetime.datetime.now(datetime.timezone.utc)
    total_activities = len(running_files) + len(ride_files)
    
    # Create alternating schedule
    all_items = []
    for idx, f in enumerate(running_files):
        all_items.append({'sport': 'Run', 'file': f, 'rel_path': f'/tracks/running/{f}'})
    for idx, f in enumerate(ride_files):
        all_items.append({'sport': 'Ride', 'file': f, 'rel_path': f'/tracks/ride/{f}'})
        
    # Interleave to create realistic training mix (e.g. 2 rides, 1 run, 1 ride...)
    import random
    random.seed(42) # deterministic
    random.shuffle(all_items)
    
    # Sort with spaced dates over last 60 days (approx every 1.7 days)
    activities = []
    base_strava_id = 12001001
    
    run_name_idx = 0
    ride_name_idx = 0
    
    for i, item in enumerate(all_items):
        # Calculate date from 58 days ago to 1 day ago
        days_ago = 58 - int((i / len(all_items)) * 57)
        hour = 6 if i % 2 == 0 else 16 # morning or afternoon
        minute = (i * 17) % 60
        act_date = now - datetime.timedelta(days=days_ago, hours=now.hour - hour, minutes=now.minute - minute)
        start_date_str = act_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        full_path = os.path.join(
            DATA_FROM_STRAVA,
            'running' if item['sport'] == 'Run' else 'ride',
            item['file']
        )
        metrics = analyze_track_image(full_path)
        pixel_count = metrics['pixel_count']
        
        if item['sport'] == 'Run':
            # Distance: 5,000m to 14,000m
            dist_factor = (pixel_count % 9000)
            distance = round(5200 + dist_factor, -1)
            # Pace: 4:45/km to 5:35/km (approx 3.0 m/s to 3.5 m/s)
            pace_sec_km = 290 + (pixel_count % 50) # 290-340s = 4:50-5:40/km
            speed_mps = round(1000.0 / pace_sec_km, 2)
            moving_sec = int(distance / speed_mps)
            elapsed_sec = moving_sec + random.randint(60, 240)
            elev = round(40 + (pixel_count % 80), 1)
            avg_hr = random.randint(146, 168)
            max_hr = avg_hr + random.randint(14, 24)
            cadence = random.randint(168, 178)
            watts = None
            calories = int(distance * 0.075 * (avg_hr / 150))
            name = RUN_NAMES[run_name_idx % len(RUN_NAMES)]
            run_name_idx += 1
        else:
            # Distance: 20,000m to 62,000m
            dist_factor = (pixel_count % 35000)
            distance = round(21000 + dist_factor, -2)
            # Speed: 23 km/h to 31 km/h (approx 6.4 m/s to 8.6 m/s)
            speed_mps = round(6.5 + ((pixel_count % 200) / 100.0), 2)
            moving_sec = int(distance / speed_mps)
            elapsed_sec = moving_sec + random.randint(180, 600)
            elev = round(110 + (pixel_count % 280), 1)
            avg_hr = random.randint(132, 155)
            max_hr = avg_hr + random.randint(15, 28)
            cadence = random.randint(78, 88) # cycling rpm
            watts = random.randint(165, 230)
            calories = int(moving_sec * (watts * 0.95) / 1000 * 3.6 * 0.239) + 200
            name = RIDE_NAMES[ride_name_idx % len(RIDE_NAMES)]
            ride_name_idx += 1
            
        activity = {
            "id": str(uuid.uuid4()),
            "user_id": DEFAULT_USER_ID,
            "strava_activity_id": base_strava_id + i,
            "name": name,
            "sport_type": item['sport'],
            "start_date": start_date_str,
            "distance_meters": distance,
            "moving_time_seconds": moving_sec,
            "elapsed_time_seconds": elapsed_sec,
            "elevation_gain_meters": elev,
            "average_speed_mps": speed_mps,
            "max_speed_mps": round(speed_mps * 1.35, 2),
            "average_heartrate": avg_hr,
            "max_heartrate": max_hr,
            "average_cadence": cadence,
            "average_watts": watts,
            "calories": calories,
            "raw_summary_polyline": item['rel_path'],
            "description": f"Imported GPS track from {item['file']}",
            "created_at": start_date_str,
            "updated_at": start_date_str
        }
        activities.append(activity)
        
    # Sort activities chronologically (newest first for standard display)
    activities.sort(key=lambda x: x['start_date'], reverse=True)
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(activities, f, indent=2)
        
    print(f"Successfully generated {len(activities)} activities in {OUTPUT_JSON}!")
    print(f"  - {len([a for a in activities if a['sport_type'] == 'Run'])} Running activities")
    print(f"  - {len([a for a in activities if a['sport_type'] == 'Ride'])} Cycling activities")

if __name__ == '__main__':
    main()
