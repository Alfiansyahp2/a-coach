from datetime import datetime, timedelta
from typing import List, Optional, Set, Dict, Any
from .models import (
    ActivityInput,
    ScheduledWorkoutInput,
    FlameHeatTierModel,
    WeeklyStreakResponse,
)

MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]


def parse_date(date_input: Any) -> Optional[datetime]:
    if not date_input:
        return None
    if isinstance(date_input, datetime):
        return date_input
    if isinstance(date_input, str):
        # Handle ISO strings like 2026-11-08T01:33:00.000Z or 2026-11-08
        clean_str = date_input.replace("Z", "+00:00") if date_input.endswith("Z") else date_input
        try:
            return datetime.fromisoformat(clean_str)
        except ValueError:
            try:
                return datetime.strptime(clean_str.split("T")[0], "%Y-%m-%d")
            except ValueError:
                return None
    return None


def get_monday_of_week(d: datetime) -> datetime:
    # d.weekday(): Monday is 0, Sunday is 6
    diff = d.weekday()
    monday = d - timedelta(days=diff)
    return datetime(monday.year, monday.month, monday.day, 0, 0, 0, 0, tzinfo=d.tzinfo)


def get_sunday_of_week(monday: datetime) -> datetime:
    sunday = monday + timedelta(days=6)
    return datetime(sunday.year, sunday.month, sunday.day, 23, 59, 59, 999999, tzinfo=monday.tzinfo)


def format_local_date_key(d: datetime) -> str:
    return d.strftime("%Y-%m-%d")


def format_month_day(d: datetime) -> str:
    return f"{MONTH_NAMES[d.month - 1]} {d.day}"


def format_month_day_year(d: datetime) -> str:
    return f"{MONTH_NAMES[d.month - 1]} {d.day}, {d.year}"


def get_flame_heat_tier(streak_weeks: int, is_flame_burning: bool = True) -> FlameHeatTierModel:
    if streak_weeks <= 0 or not is_flame_burning:
        return FlameHeatTierModel(
            stage=0,
            name="Api Padam",
            minWeeks=0,
            maxWeeks=0,
            colorHex="#5A6272",
            glowRgba="rgba(90, 98, 114, 0.2)",
            temperatureText="0°C",
            description="Api padam — selesaikan 1 sesi minggu ini untuk menyalakan api",
            nextTierWeeks=1,
            weeksToNextTier=1,
        )

    # Stage 1 (1–9 Weeks): Api Merah (#EF4444, ~800°C)
    if streak_weeks < 10:
        return FlameHeatTierModel(
            stage=1,
            name="Api Merah",
            minWeeks=1,
            maxWeeks=9,
            colorHex="#EF4444",
            glowRgba="rgba(239, 68, 68, 0.5)",
            temperatureText="~800°C",
            description="Stage 1: Api Merah (~800°C) — Initial ember / least hot",
            nextTierWeeks=10,
            weeksToNextTier=10 - streak_weeks,
        )

    # Stage 2 (10–19 Weeks): Api Oranye (#F97316, ~1,100°C)
    if streak_weeks < 20:
        return FlameHeatTierModel(
            stage=2,
            name="Api Oranye",
            minWeeks=10,
            maxWeeks=19,
            colorHex="#F97316",
            glowRgba="rgba(249, 115, 22, 0.5)",
            temperatureText="~1,100°C",
            description="Stage 2: Api Oranye (~1,100°C) — Sustained flame / medium heat",
            nextTierWeeks=20,
            weeksToNextTier=20 - streak_weeks,
        )

    # Stage 3 (20–29 Weeks): Api Kuning Emas (#EAB308, ~1,300°C)
    if streak_weeks < 30:
        return FlameHeatTierModel(
            stage=3,
            name="Api Kuning Emas",
            minWeeks=20,
            maxWeeks=29,
            colorHex="#EAB308",
            glowRgba="rgba(234, 179, 8, 0.5)",
            temperatureText="~1,300°C",
            description="Stage 3: Api Kuning Emas (~1,300°C) — High heat consistency",
            nextTierWeeks=30,
            weeksToNextTier=30 - streak_weeks,
        )

    # Stage 4 (30–39 Weeks): Api Putih Terang (#F8FAFC, ~1,500°C)
    if streak_weeks < 40:
        return FlameHeatTierModel(
            stage=4,
            name="Api Putih Terang",
            minWeeks=30,
            maxWeeks=39,
            colorHex="#F8FAFC",
            glowRgba="rgba(248, 250, 252, 0.65)",
            temperatureText="~1,500°C",
            description="Stage 4: Api Putih Terang (~1,500°C) — White-hot intensity",
            nextTierWeeks=40,
            weeksToNextTier=40 - streak_weeks,
        )

    # Stage 5 (40–49 Weeks): Api Biru Cyan (#00F0FF, ~1,800°C)
    if streak_weeks < 50:
        return FlameHeatTierModel(
            stage=5,
            name="Api Biru Cyan",
            minWeeks=40,
            maxWeeks=49,
            colorHex="#00F0FF",
            glowRgba="rgba(0, 240, 255, 0.65)",
            temperatureText="~1,800°C",
            description="Stage 5: Api Biru Cyan (~1,800°C) — Pure gas combustion / hottest flame",
            nextTierWeeks=50,
            weeksToNextTier=50 - streak_weeks,
        )

    # Stage 6 (50+ Weeks): Api Ungu Plasma (#C084FC, >2,200°C)
    return FlameHeatTierModel(
        stage=6,
        name="Api Ungu Plasma",
        minWeeks=50,
        maxWeeks=None,
        colorHex="#C084FC",
        glowRgba="rgba(192, 132, 252, 0.7)",
        temperatureText=">2,200°C",
        description="Stage 6: Api Ungu Plasma (>2,200°C) — Cosmic plasma peak",
        nextTierWeeks=None,
        weeksToNextTier=None,
    )


def calculate_weekly_streak(
    activities: List[ActivityInput],
    workouts: List[ScheduledWorkoutInput],
    reference_date: Optional[Any] = None,
) -> WeeklyStreakResponse:
    ref_dt = parse_date(reference_date) or datetime.now()

    # 1. Gather all activity dates with deduplication against completed workout slots
    timestamps: List[datetime] = []
    logged_date_set: Set[str] = set()

    for act in activities:
        if act.start_date:
            d = parse_date(act.start_date)
            if d:
                timestamps.append(d)
                logged_date_set.add(format_local_date_key(d))

    # Include COMPLETED workouts from schedule ONLY if no activity was already logged on that calendar day
    for w in workouts:
        if w.status == "COMPLETED" and w.scheduled_date:
            w_dt = parse_date(w.scheduled_date)
            if w_dt:
                w_key = format_local_date_key(w_dt)
                if w_key not in logged_date_set:
                    timestamps.append(w_dt)
                    logged_date_set.add(w_key)

    timestamps.sort()
    total_contributions = len(timestamps)

    if total_contributions == 0:
        heat_tier = get_flame_heat_tier(0, False)
        return WeeklyStreakResponse(
            totalContributions=0,
            totalDateRange="No recorded sessions",
            currentStreakWeeks=0,
            currentStreakDateRange="None",
            longestStreakWeeks=0,
            longestStreakDateRange="None",
            isFlameBurning=False,
            isFlameAtRisk=False,
            daysRemainingThisWeek=7,
            flameStatusTitle="Api Belum Menyala",
            flameStatusDescription="Selesaikan 1 sesi latihan minggu ini untuk menyalakan api rentetan!",
            activeWeeksCount=0,
            heatTier=heat_tier,
        )

    # 2. Map timestamps into unique active weeks (keyed by Monday YYYY-MM-DD)
    active_weeks_map: Dict[str, Dict[str, Any]] = {}

    for act_date in timestamps:
        mon = get_monday_of_week(act_date)
        key = format_local_date_key(mon)

        if key not in active_weeks_map:
            active_weeks_map[key] = {
                "monday": mon,
                "sunday": get_sunday_of_week(mon),
                "earliestDate": act_date,
                "latestDate": act_date,
                "count": 1,
            }
        else:
            w = active_weeks_map[key]
            w["count"] += 1
            if act_date < w["earliestDate"]:
                w["earliestDate"] = act_date
            if act_date > w["latestDate"]:
                w["latestDate"] = act_date

    sorted_week_keys = sorted(active_weeks_map.keys())
    active_weeks_count = len(sorted_week_keys)

    # 3. Current week & Previous week relative to ref_dt
    current_week_mon = get_monday_of_week(ref_dt)
    current_week_key = format_local_date_key(current_week_mon)

    prev_week_mon = current_week_mon - timedelta(days=7)
    prev_week_key = format_local_date_key(prev_week_mon)

    is_flame_burning = current_week_key in active_weeks_map
    is_flame_at_risk = not is_flame_burning and prev_week_key in active_weeks_map

    # Days remaining in current week until Sunday 23:59:59
    # Python weekday(): Monday is 0, Sunday is 6
    ref_weekday = ref_dt.weekday()
    days_remaining = 0 if ref_weekday == 6 else 6 - ref_weekday

    # 4. Calculate Current Streak
    current_streak_weeks = 0
    current_start_date: Optional[datetime] = None
    current_end_date: Optional[datetime] = None

    start_check_key = current_week_key if is_flame_burning else prev_week_key if is_flame_at_risk else None

    if start_check_key and start_check_key in active_weeks_map:
        end_week_data = active_weeks_map[start_check_key]
        current_end_date = end_week_data["latestDate"]

        cursor_monday = end_week_data["monday"]
        while True:
            k = format_local_date_key(cursor_monday)
            if k in active_weeks_map:
                current_streak_weeks += 1
                current_start_date = active_weeks_map[k]["earliestDate"]
                cursor_monday = cursor_monday - timedelta(days=7)
            else:
                break

    # 5. Calculate Longest Streak Across History
    longest_streak_weeks = 0
    longest_start_date: Optional[datetime] = None
    longest_end_date: Optional[datetime] = None

    for i in range(len(sorted_week_keys)):
        start_key = sorted_week_keys[i]
        start_w_data = active_weeks_map[start_key]

        streak_len = 1
        earliest = start_w_data["earliestDate"]
        latest = start_w_data["latestDate"]
        cursor_monday = start_w_data["monday"]

        for j in range(i + 1, len(sorted_week_keys)):
            next_monday = cursor_monday + timedelta(days=7)
            next_key = format_local_date_key(next_monday)

            if sorted_week_keys[j] == next_key:
                streak_len += 1
                latest = active_weeks_map[next_key]["latestDate"]
                cursor_monday = next_monday
            else:
                break

        if streak_len > longest_streak_weeks:
            longest_streak_weeks = streak_len
            longest_start_date = earliest
            longest_end_date = latest

    # 6. Format Display Date Ranges
    first_overall_date = timestamps[0]
    total_date_range = f"{format_month_day_year(first_overall_date)} - Present"

    current_streak_date_range = (
        f"{format_month_day(current_start_date)} - {format_month_day(current_end_date)}"
        if current_start_date and current_end_date
        else "None"
    )

    longest_streak_date_range = (
        f"{format_month_day(longest_start_date)} - {format_month_day(longest_end_date)}"
        if longest_start_date and longest_end_date
        else "None"
    )

    # 7. Determine Flame Heat Progression Tier
    heat_tier = get_flame_heat_tier(current_streak_weeks, is_flame_burning or is_flame_at_risk)

    # 8. Status Titles and Descriptions
    if is_flame_burning:
        flame_title = f"{heat_tier.name} Menyala! ({heat_tier.temperatureText}) 🔥"
        flame_desc = (
            f"Rentetan {current_streak_weeks} minggu aktif. "
            + (
                f"{heat_tier.weeksToNextTier} minggu lagi menuju tahap {heat_tier.stage + 1}."
                if heat_tier.weeksToNextTier
                else "Tahap puncak tercapai!"
            )
        )
    elif is_flame_at_risk:
        flame_title = "Api Mode Siaga ⏳"
        flame_desc = f"Sisa {days_remaining} hari untuk latihan minggu ini agar {heat_tier.name} tidak padam!"
    else:
        flame_title = "Api Padam 💨"
        flame_desc = "Selesaikan 1 sesi latihan minggu ini untuk menyalakan kembali api rentetan mingguan."

    return WeeklyStreakResponse(
        totalContributions=total_contributions,
        totalDateRange=total_date_range,
        currentStreakWeeks=current_streak_weeks,
        currentStreakDateRange=current_streak_date_range,
        longestStreakWeeks=longest_streak_weeks,
        longestStreakDateRange=longest_streak_date_range,
        isFlameBurning=is_flame_burning,
        isFlameAtRisk=is_flame_at_risk,
        daysRemainingThisWeek=days_remaining,
        flameStatusTitle=flame_title,
        flameStatusDescription=flame_desc,
        activeWeeksCount=active_weeks_count,
        heatTier=heat_tier,
    )

