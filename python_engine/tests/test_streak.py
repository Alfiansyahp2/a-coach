from datetime import datetime
from python_engine.domain.streak.models import ActivityInput, ScheduledWorkoutInput
from python_engine.domain.streak.streak_engine import (
    calculate_weekly_streak,
    get_flame_heat_tier,
)


def test_empty_activity_stream():
    res = calculate_weekly_streak([], [])
    assert res.totalContributions == 0
    assert res.currentStreakWeeks == 0
    assert res.heatTier.stage == 0
    assert res.heatTier.name == "Api Padam"
    assert res.heatTier.colorHex == "#5A6272"
    assert res.heatTier.temperatureText == "0°C"


def test_single_active_session():
    ref = datetime(2026, 11, 4, 10, 0, 0)
    acts = [ActivityInput(start_date="2026-11-02T08:00:00Z")]
    res = calculate_weekly_streak(acts, [], ref)
    assert res.totalContributions == 1
    assert res.currentStreakWeeks == 1
    assert res.heatTier.stage == 1
    assert res.heatTier.name == "Api Merah"
    assert res.heatTier.colorHex == "#EF4444"
    assert res.heatTier.temperatureText == "~800°C"


def test_thermodynamic_combustion_spectrum():
    # Stage 1: 1-9 Weeks
    t1 = get_flame_heat_tier(8, True)
    assert t1.stage == 1
    assert t1.name == "Api Merah"
    assert t1.colorHex == "#EF4444"
    assert t1.temperatureText == "~800°C"
    assert t1.weeksToNextTier == 2

    # Stage 2: 10-19 Weeks
    t2 = get_flame_heat_tier(10, True)
    assert t2.stage == 2
    assert t2.name == "Api Oranye"
    assert t2.colorHex == "#F97316"
    assert t2.temperatureText == "~1,100°C"
    assert t2.weeksToNextTier == 10

    # Stage 3: 20-29 Weeks
    t3 = get_flame_heat_tier(25, True)
    assert t3.stage == 3
    assert t3.name == "Api Kuning Emas"
    assert t3.colorHex == "#EAB308"
    assert t3.temperatureText == "~1,300°C"
    assert t3.weeksToNextTier == 5

    # Stage 4: 30-39 Weeks
    t4 = get_flame_heat_tier(35, True)
    assert t4.stage == 4
    assert t4.name == "Api Putih Terang"
    assert t4.colorHex == "#F8FAFC"
    assert t4.temperatureText == "~1,500°C"
    assert t4.weeksToNextTier == 5

    # Stage 5: 40-49 Weeks
    t5 = get_flame_heat_tier(45, True)
    assert t5.stage == 5
    assert t5.name == "Api Biru Cyan"
    assert t5.colorHex == "#00F0FF"
    assert t5.temperatureText == "~1,800°C"
    assert t5.weeksToNextTier == 5

    # Stage 6: 50+ Weeks
    t6 = get_flame_heat_tier(52, True)
    assert t6.stage == 6
    assert t6.name == "Api Ungu Plasma"
    assert t6.colorHex == "#C084FC"
    assert t6.temperatureText == ">2,200°C"
    assert t6.weeksToNextTier is None


def test_ten_weeks_continuity():
    # Generate 10 consecutive weeks of activities leading up to Sunday Nov 8, 2026
    acts = []
    # Week 1: Sep 6, ..., Week 10: Nov 8, 2026
    start_dates = [
        "2026-09-06T10:00:00Z",
        "2026-09-13T10:00:00Z",
        "2026-09-20T10:00:00Z",
        "2026-09-27T10:00:00Z",
        "2026-10-04T10:00:00Z",
        "2026-10-11T10:00:00Z",
        "2026-10-18T10:00:00Z",
        "2026-10-25T10:00:00Z",
        "2026-11-01T10:00:00Z",
        "2026-11-08T10:00:00Z",
    ]
    for d in start_dates:
        acts.append(ActivityInput(start_date=d))

    ref = datetime(2026, 11, 10, 12, 0, 0) # Tuesday Nov 10
    res = calculate_weekly_streak(acts, [], ref)

    assert res.totalContributions == 10
    assert res.currentStreakWeeks == 10
    assert res.heatTier.stage == 2
    assert res.heatTier.name == "Api Oranye"
    assert res.heatTier.colorHex == "#F97316"
    assert res.isFlameBurning is False
    assert res.isFlameAtRisk is True

