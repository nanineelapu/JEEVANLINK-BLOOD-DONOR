CREATE TABLE IF NOT EXISTS blood_requests (
    id              UUID PRIMARY KEY,
    hospital_id     UUID NOT NULL,
    blood_group     VARCHAR(16) NOT NULL,
    units_required  INTEGER NOT NULL,
    priority        VARCHAR(16) NOT NULL,
    patient_name    VARCHAR(255),
    reason          VARCHAR(500),
    status          VARCHAR(16) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fulfilled_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_requests_hospital ON blood_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_requests_status   ON blood_requests(status);

CREATE TABLE IF NOT EXISTS donor_matches (
    id            UUID PRIMARY KEY,
    request_id    UUID NOT NULL,
    donor_id      UUID NOT NULL,
    match_score   DOUBLE PRECISION,
    distance_km   DOUBLE PRECISION,
    ai_reasoning  TEXT,
    status        VARCHAR(16) NOT NULL,
    matched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_request ON donor_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_matches_donor   ON donor_matches(donor_id);
