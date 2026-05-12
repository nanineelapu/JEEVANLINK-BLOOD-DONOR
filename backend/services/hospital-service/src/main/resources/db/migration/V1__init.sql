CREATE TABLE IF NOT EXISTS hospitals (
    user_id        UUID PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    address        VARCHAR(500),
    city           VARCHAR(120),
    latitude       DOUBLE PRECISION,
    longitude      DOUBLE PRECISION,
    contact_phone  VARCHAR(50),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blood_inventory (
    id               UUID PRIMARY KEY,
    hospital_id      UUID NOT NULL,
    blood_group      VARCHAR(16) NOT NULL,
    units_available  INTEGER NOT NULL DEFAULT 0,
    last_updated     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (hospital_id, blood_group)
);

CREATE INDEX IF NOT EXISTS idx_inv_hospital ON blood_inventory(hospital_id);
