CREATE TABLE IF NOT EXISTS sober_days (
 id BIGSERIAL PRIMARY KEY,
 member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 sober_date DATE NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE (member_id, sober_date)
);

CREATE INDEX IF NOT EXISTS idx_sober_days_member_date
ON sober_days (member_id, sober_date);
