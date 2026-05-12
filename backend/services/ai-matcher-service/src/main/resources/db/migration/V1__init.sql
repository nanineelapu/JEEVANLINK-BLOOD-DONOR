CREATE TABLE IF NOT EXISTS ai_logs (
    id          UUID PRIMARY KEY,
    operation   VARCHAR(64) NOT NULL,
    prompt      TEXT,
    response    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_op ON ai_logs(operation);
