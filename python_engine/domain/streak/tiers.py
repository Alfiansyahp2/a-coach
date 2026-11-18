from .models import FlameHeatTierModel


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

