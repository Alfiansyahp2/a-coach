from datetime import datetime, timedelta
from typing import List, Optional, Set, Dict, Any
from .models import (
    ActivityInput,
    ScheduledWorkoutInput,
    FlameHeatTierModel,
    WeeklyStreakResponse,
)
from .date_utils import (
    MONTH_NAMES,
    parse_date,
    get_monday_of_week,
    get_sunday_of_week,
    format_local_date_key,
    format_month_day,
    format_month_day_year,
)
from .tiers import get_flame_heat_tier

# Re-exports for backwards compatibility
__all__ = [
    "MONTH_NAMES",
    "parse_date",
    "get_monday_of_week",
    "get_sunday_of_week",
    "format_local_date_key",
    "format_month_day",
    "format_month_day_year",
    "get_flame_heat_tier",
    "calculate_weekly_streak",
]


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
