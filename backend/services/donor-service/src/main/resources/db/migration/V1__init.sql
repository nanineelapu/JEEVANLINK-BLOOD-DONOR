CREATE TABLE IF NOT EXISTS donors (
    user_id            UUID PRIMARY KEY,
    blood_group        VARCHAR(16) NOT NULL,
    age                INTEGER,
    latitude           DOUBLE PRECISION,
    longitude          DOUBLE PRECISION,
    city               VARCHAR(120),
    last_donation_date TIMESTAMPTZ,
    available          BOOLEAN NOT NULL DEFAULT TRUE,
    total_donations    INTEGER NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_city ON donors(city);
CREATE INDEX IF NOT EXISTS idx_donors_available ON donors(available);

CREATE TABLE IF NOT EXISTS donations (
    id           UUID PRIMARY KEY,
    donor_id     UUID NOT NULL,
    hospital_id  UUID NOT NULL,
    request_id   UUID,
    blood_group  VARCHAR(16) NOT NULL,
    donated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
