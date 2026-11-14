-- Migration 005: Sport Types Table Persistence
CREATE TABLE IF NOT EXISTS sport_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    color_key VARCHAR(50) NOT NULL,
    accent_hex VARCHAR(20) NOT NULL,
    badge_class VARCHAR(150) NOT NULL,
    is_pace_format BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sport_types (id, name, label, icon_name, color_key, accent_hex, badge_class, is_pace_format)
VALUES
    ('Ride', 'Sepeda', 'Sepeda (Ride)', 'bike', 'cycling', '#4D947B', 'bg-[#4D947B]/15 text-[#4D947B] border-[#4D947B]/30', FALSE),
    ('Run', 'Lari', 'Lari (Run)', 'footprints', 'running', '#D98757', 'bg-[#D98757]/15 text-[#D98757] border-[#D98757]/30', TRUE),
    ('Swim', 'Renang', 'Renang (Swim)', 'waves', 'sky', '#38BDF8', 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30', FALSE),
    ('Walk', 'Jalan Kaki', 'Jalan Kaki (Walk)', 'compass', 'amber', '#E5A84B', 'bg-[#E5A84B]/15 text-[#E5A84B] border-[#E5A84B]/30', TRUE),
    ('Hike', 'Hiking', 'Hiking (Hike)', 'compass', 'amber', '#E5A84B', 'bg-[#E5A84B]/15 text-[#E5A84B] border-[#E5A84B]/30', TRUE),
    ('WeightTraining', 'Gym & Beban', 'Gym / Beban (WeightTraining)', 'dumbbell', 'rose', '#D65F58', 'bg-[#D65F58]/15 text-[#D65F58] border-[#D65F58]/30', FALSE),
    ('Workout', 'Latihan Umum', 'Workout / Kondisioning', 'activity', 'endurance', '#B9DC72', 'bg-[#B9DC72]/20 text-[#55781a] dark:text-[#B9DC72] border-[#B9DC72]/40', FALSE)
ON CONFLICT (id) DO NOTHING;

