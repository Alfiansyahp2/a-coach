from datetime import datetime, timedelta
from typing import Optional, Any

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
    diff = d.weekday()  # Monday is 0, Sunday is 6
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

